"""Generate the voiceover with Kokoro (open-source, Apache-2.0) and word timings.

    python voice.py [--voice af_heart] [--target 71]
    python voice.py --voice bm_george:0.6,bm_lewis:0.4 --lang en-gb --fx ai --speed 0.95   # British "AI assistant" style

Writes:
  audio/voiceover.mp3   the full voiceover, scenes placed back to back
  audio/alignment.json  scene start/end + per-word start/end, used by timeline.js

How timings are found (Kokoro has no timestamp output):
  * each sentence is synthesised separately -> exact sentence boundaries
  * pauses inside a sentence are detected and matched to its commas/colons
  * words between pauses are timed by their phoneme count
Speech speed is adjusted so the whole reel lands near --target seconds.
Model files are downloaded once into models/ from the kokoro-onnx GitHub release.
"""
import argparse
import json
import os
import re
import subprocess
import urllib.request

import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

ROOT = os.path.dirname(os.path.abspath(__file__))
MODELS = os.path.join(ROOT, "models")
URLS = {
    "kokoro-v1.0.onnx": "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx",
    "voices-v1.0.bin": "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin",
}

LEAD = 0.25        # silence before a scene's first word (visuals enter first)
FIRST_LEAD = 0.12  # hook starts almost immediately
SENT_GAP = 0.22    # pause between sentences
TAIL = 0.32        # after a scene's last word, before the cut
END_HOLD = 1.6     # CTA end card stays up after the last word
MIN_FRACTION = 0.85  # a scene keeps at least this share of its designed length (scenes.json)
MIN_SPEED, MAX_SPEED = 0.9, 1.25

# Optional voice treatment. "ai": calm digital-assistant feel (subtle room echo,
# faint chorus shimmer, a little presence) — not a copy of any real person.
FX = {
    "none": "",
    "ai": "highpass=f=70,equalizer=f=250:t=q:w=1:g=-2,equalizer=f=3500:t=q:w=1.2:g=2.5,aecho=0.85:0.5:23|41:0.14|0.08,chorus=0.7:0.9:22:0.18:0.25:1.6,",
}


def resolve_voice(k, spec):
    """'am_michael' or a blend like 'bm_george:0.6,bm_lewis:0.4'."""
    if ":" not in spec:
        return spec
    parts = [p.split(":") for p in spec.split(",")]
    return sum(float(w) * k.get_voice_style(n) for n, w in parts)


def ensure_models():
    os.makedirs(MODELS, exist_ok=True)
    for name, url in URLS.items():
        path = os.path.join(MODELS, name)
        if not os.path.exists(path):
            print(f"downloading {name} ...")
            urllib.request.urlretrieve(url, path)


def frames_rms(x, sr, hop=0.01):
    n = int(sr * hop)
    m = len(x) // n
    return np.sqrt(np.mean(x[: m * n].reshape(m, n) ** 2, axis=1)), hop


def trim(x, sr):
    rms, hop = frames_rms(x, sr)
    thr = max(rms.max() * 0.03, 1e-4)
    idx = np.where(rms > thr)[0]
    if len(idx) == 0:
        return x
    a = max(0, int((idx[0] - 2) * hop * sr))
    b = min(len(x), int((idx[-1] + 4) * hop * sr))
    return x[a:b]


def pauses(x, sr, min_len=0.07):
    """Internal low-energy stretches: [(start, end), ...] in seconds."""
    rms, hop = frames_rms(x, sr)
    thr = max(rms.max() * 0.04, 1e-4)
    quiet = rms < thr
    out, start = [], None
    for i, q in enumerate(quiet):
        if q and start is None:
            start = i
        if not q and start is not None:
            if (i - start) * hop >= min_len and start > 3:
                out.append((start * hop, i * hop))
            start = None
    return out


def split_sentences(text):
    return [s for s in re.split(r"(?<=[.?!])\s+", text.strip()) if s]


def time_words(k, sentence, x, sr, t0, lang="en-us"):
    """Return [(word, start, end)] for one sentence clip starting at t0."""
    words = sentence.split()
    dur = len(x) / sr
    weight = [max(1, len(k.tokenizer.phonemize(re.sub(r"[^\w'$]", " ", w), lang).replace(" ", ""))) + 1 for w in words]
    # Sub-phrases split at commas/colons. For each comma, estimate where it falls
    # (by phoneme share) and snap to the nearest detected pause, keeping order.
    breaks = [i for i, w in enumerate(words[:-1]) if re.search(r"[,:;]$", w)]
    found = pauses(x, sr)
    total_w = sum(weight)
    cuts = []  # (pause_start, pause_end) per comma
    last = 0.0
    for bi in breaks:
        expect = dur * sum(weight[: bi + 1]) / total_w
        cands = [p for p in found if p[0] > last + 0.05 and abs((p[0] + p[1]) / 2 - expect) < max(0.35, dur * 0.18)]
        if cands:
            p = min(cands, key=lambda q: abs((q[0] + q[1]) / 2 - expect))
        else:
            p = (expect, expect)
        cuts.append(p)
        last = p[1]
    groups, prev = [], 0
    for bnd in breaks + [len(words) - 1]:
        groups.append(list(range(prev, bnd + 1)))
        prev = bnd + 1
    starts = [0.0] + [c[1] for c in cuts]
    ends = [c[0] for c in cuts] + [dur]
    spans = list(zip(starts, ends))
    out = [None] * len(words)
    for g, (a, b) in zip(groups, spans):
        tot = sum(weight[i] for i in g)
        t = a
        for i in g:
            d = (b - a) * weight[i] / tot
            out[i] = (words[i], round(t0 + t, 3), round(t0 + t + d * 0.95, 3))
            t += d
    return out


def build(k, scenes, voice, speed, lang="en-us"):
    sr = 24000
    clips, words, layout = [], [], []
    cursor = 0.0
    for si, sc in enumerate(scenes):
        start = cursor
        t = start + (FIRST_LEAD if si == 0 else LEAD)
        scene_audio = []
        for sent in split_sentences(sc["vo"]):
            x, sr = k.create(sent, voice=voice, speed=speed, lang=lang)
            x = trim(np.asarray(x, dtype=np.float32), sr)
            words += time_words(k, sent, x, sr, t, lang)
            scene_audio.append((t, x))
            t += len(x) / sr + SENT_GAP
        end = t - SENT_GAP + (END_HOLD if si == len(scenes) - 1 else TAIL)
        end = max(end, start + MIN_FRACTION * (sc["end"] - sc["start"]))
        layout.append({"id": sc["id"], "start": round(start, 3), "end": round(end, 3)})
        clips += scene_audio
        cursor = end
    total = cursor
    mix = np.zeros(int(total * sr) + sr, dtype=np.float32)
    for t, x in clips:
        i = int(t * sr)
        mix[i : i + len(x)] += x
    return mix[: int(total * sr)], sr, words, layout, total


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--voice", default="af_heart")
    ap.add_argument("--target", type=float, default=71.0)
    ap.add_argument("--speed", type=float, default=None)
    ap.add_argument("--lang", default="en-us", help="en-us or en-gb")
    ap.add_argument("--fx", default="none", choices=list(FX))
    a = ap.parse_args()
    ensure_models()
    k = Kokoro(os.path.join(MODELS, "kokoro-v1.0.onnx"), os.path.join(MODELS, "voices-v1.0.bin"))
    scenes = json.load(open(os.path.join(ROOT, "scenes.json")))["scenes"]

    # Natural speed unless the reel falls outside 65-75s; then nudge toward --target.
    voice = resolve_voice(k, a.voice)
    speed = a.speed or 1.0
    for attempt in range(4):
        mix, sr, words, layout, total = build(k, scenes, voice, speed, a.lang)
        print(f"speed {speed:.3f} -> {total:.2f}s")
        if 65.5 <= total <= 74.5:  # --speed is the starting pace; still kept inside 65-75s
            break
        fixed = 0.22 * 20 + 0.25 * 8 + 1.6  # pauses don't scale with speed
        speech = total - fixed
        speed = min(MAX_SPEED, max(MIN_SPEED, speed * speech / (speech + a.target - total)))
        if speed in (MIN_SPEED, MAX_SPEED) and attempt:
            break

    peak = np.abs(mix).max() or 1.0
    mix = mix / peak * 0.89  # about -1 dBFS
    os.makedirs(os.path.join(ROOT, "audio"), exist_ok=True)
    wav = os.path.join(ROOT, "audio", "voiceover.wav")
    sf.write(wav, mix, sr)
    mp3 = os.path.join(ROOT, "audio", "voiceover.mp3")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", wav, "-af", FX[a.fx] + "loudnorm=I=-14:TP=-1.5:LRA=9", "-ar", "48000", "-ac", "2", "-b:a", "192k", mp3], check=True)

    tokens = [w for sc in scenes for w in sc["vo"].split()]
    assert [w[0] for w in words] == tokens, "word list does not match scenes.json"
    json.dump(
        {
            "voice": a.voice,
            "lang": a.lang,
            "fx": a.fx,
            "speed": round(speed, 3),
            "duration": round(total, 3),
            "scenes": layout,
            "words": [{"word": w, "start": s, "end": e} for w, s, e in words],
        },
        open(os.path.join(ROOT, "audio", "alignment.json"), "w"),
        indent=1,
    )
    print(f"audio/voiceover.mp3  {total:.2f}s  voice={a.voice} speed={speed:.3f}")
    for s in layout:
        print(f"  {s['id']}  {s['start']:6.2f} - {s['end']:6.2f}")


if __name__ == "__main__":
    main()
