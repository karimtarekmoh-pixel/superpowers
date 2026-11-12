"""Voiceover pipeline: one take -> 9 section clips -> tightened, slightly sped-up VO + word timestamps.
1. force-align the raw take against the script (PocketSphinx: real timestamps from the audio)
2. cut at the pauses between sections -> audio/vo_<section>.wav
3. trim each clip's silence, apply a gentle tempo change (pitch unchanged), join with short gaps
4. re-align every clip -> audio/timestamps.json (global word times + section starts/ends)
usage: python tools/build_vo.py audio/vo_full_raw.mp3 [tempo=1.07] [gap=0.35]"""
import json, os, re, subprocess, sys
import numpy as np, soundfile as sf

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 48000
raw = sys.argv[1]; TEMPO = float(sys.argv[2]) if len(sys.argv) > 2 else 1.07; GAP = float(sys.argv[3]) if len(sys.argv) > 3 else 0.35
S = json.load(open(f"{ROOT}/src/script.json"))
SECTIONS = S["sections"]
norm = lambda s: re.sub(r"[^a-z0-9']", "", s.lower())
EXTRA = {"fable": "F EY B AH L", "workflows": "W ER K F L OW Z", "alias": "EY L IY AH S", "agentic": "EY JH EH N T IH K", "classifier": "K L AE S AH F AY ER", "subagent": "S AH B EY JH AH N T", "anthropic": "AE N TH R AA P IH K", "osmani": "AA Z M AA N IY", "devtools": "D EH V T UW L Z", "mcp": "EH M S IY P IY",
         "ponytail": "P OW N IY T EY L", "addy": "AE D IY", "frontend": "F R AH N T EH N D", "overbuilding": "OW V ER B IH L D IH NG",
         "screenshots": "S K R IY N SH AA T S", "claude": "K L AO D", "sonnet": "S AA N AH T", "opus": "OW P AH S", "mcp": "EH M S IY P IY", "subagents": "S AH B EY JH AH N T S", "linting": "L IH N T IH NG", "slack": "S L AE K", "claude": "K L AO D", "isn't": "IH Z AH N T", "what's": "W AH T S"}

def load(path):
    b = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(b, np.float32).astype(np.float64)

def align(x, words):
    from pocketsphinx import Decoder
    y = np.interp(np.arange(int(len(x) * 16000 / SR)) * SR / 16000, np.arange(len(x)), x)
    raw16 = (np.clip(y, -1, 1) * 32767).astype("<i2").tobytes()
    d = Decoder(samprate=16000, bestpath=False, loglevel="FATAL")
    for w in {norm(t) for t in words}:
        if d.lookup_word(w) is None:
            if w not in EXTRA: raise SystemExit(f"no pronunciation for '{w}' (add it to EXTRA)")
            d.add_word(w, EXTRA[w], True)
    d.set_align_text(" ".join(norm(w) for w in words))
    for k in range(2):
        d.start_utt(); d.process_raw(raw16, full_utt=True); d.end_utt()
        if k == 0: d.set_alignment()
    al = [s for s in d.get_alignment() if s.name not in ("<sil>", "<s>", "</s>", "[NOISE]")]
    if len(al) != len(words): raise SystemExit(f"alignment mismatch {len(al)} vs {len(words)}")
    return [{"text": w, "start": s.start / 100, "end": (s.start + s.duration) / 100} for w, s in zip(words, al)]

x = load(raw)
ORIG = {}
allw = [w for s in SECTIONS for w in ORIG.get(s["id"], s["text"]).split()]
A = align(x, allw)
# section boundaries: cut halfway through the pause between sections
k = 0; bounds = []
for s in SECTIONS:
    n = len(ORIG.get(s["id"], s["text"]).split()); bounds.append((A[k]["start"], A[k + n - 1]["end"])); k += n
cuts = [0.0] + [(bounds[i][1] + bounds[i + 1][0]) / 2 for i in range(len(bounds) - 1)] + [len(x) / SR]
os.makedirs(f"{ROOT}/audio", exist_ok=True)
clips = []
for i, s in enumerate(SECTIONS):
    ov = f"{ROOT}/audio/vo_override_{s['id']}.mp3"     # a re-recorded section replaces its cut from the full take
    seg = load(ov) if os.path.exists(ov) else x[int(cuts[i] * SR):int(cuts[i + 1] * SR)]
    nz = np.where(np.abs(seg) > 10 ** (-42 / 20))[0]
    seg = seg[max(0, nz[0] - int(0.04 * SR)):nz[-1] + int(0.06 * SR)]
    tmp = f"{ROOT}/audio/_seg.wav"; sf.write(tmp, seg.astype(np.float32), SR)
    out = f"{ROOT}/audio/vo_{s['id']}.wav"
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", tmp, "-af", f"highpass=f=70,atempo={TEMPO}", "-ar", str(SR), "-ac", "1", out], check=True)
    clips.append(load(out))
# join + re-align each clip for exact global word times
t = 0.06; full = [np.zeros(int(t * SR))]; words = []; secs = []
for s, c in zip(SECTIONS, clips):
    W = align(c, s["text"].split())
    for w in W: words.append({"text": w["text"], "start": round(t + w["start"], 3), "end": round(t + w["end"], 3), "section": s["id"]})
    secs.append({"id": s["id"], "start": round(t, 3), "end": round(t + len(c) / SR, 3), "first": round(t + W[0]["start"], 3), "last": round(t + W[-1]["end"], 3)})
    full += [c, np.zeros(int(GAP * SR))]; t += len(c) / SR + GAP
y = np.concatenate(full)
sf.write(f"{ROOT}/audio/_vo.wav", y.astype(np.float32), SR)
subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", f"{ROOT}/audio/_vo.wav", "-af", "loudnorm=I=-14.5:TP=-1.5:LRA=9", "-ar", str(SR), "-ac", "1", f"{ROOT}/audio/vo.wav"], check=True)
json.dump({"source": os.path.basename(raw), "method": "PocketSphinx forced alignment per section clip", "tempo": TEMPO, "gap": GAP,
           "duration": round(len(y) / SR, 3), "sections": secs, "words": words}, open(f"{ROOT}/audio/timestamps.json", "w"), indent=1)
print(f"vo.wav {len(y) / SR:.2f}s, {len(words)} words, tempo {TEMPO}, raw alignment {len(A)} words")
for s in secs: print(f"  {s['id']:5s} {s['start']:6.2f}-{s['end']:6.2f}")
