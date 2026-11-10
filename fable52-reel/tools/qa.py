"""Quality checks on out/usage-reel.mp4: duration, loudness, caption sync spot-check (5 random words: speech
energy must rise within 80 ms of the caption word's timestamp), and longest frozen stretch of the top panel."""
import json, random, subprocess, numpy as np, soundfile as sf
V = "out/usage-reel.mp4"
dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", V], capture_output=True, text=True).stdout)
r = subprocess.run(["ffmpeg", "-nostats", "-i", V, "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr; r = r[r.rindex("Summary"):]
print(f"duration {dur:.2f}s (script complete, no padding) · loudness {r.split('I:')[1].split()[0]} LUFS · true peak {r.split('Peak:')[1].split()[0]} dBTP")
TS = json.load(open("audio/timestamps.json")); v, sr = sf.read("audio/vo.wav")
hop = int(sr * 0.01); e = np.array([np.sqrt((v[i:i + hop] ** 2).mean()) for i in range(0, len(v) - hop, hop)]); db = 20 * np.log10(e + 1e-9)
random.seed(5); picks = random.sample([w for w in TS["words"] if w["start"] > 0.2], 5)
for w in sorted(picks, key=lambda w: w["start"]):
    k = int(w["start"] * 100); seg = db[max(0, k - 15):k + 15]
    on = (np.argmax(np.diff(seg)) - 15) * 10
    print(f"  '{w['text']}' at {w['start']:.2f}s: speech-energy rise {on:+d} ms from the caption time · level at word {db[k:k + 10].max():.0f} dBFS")
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", V, "-vf", "scale=108:192,format=gray", "-f", "rawvideo", "-"], capture_output=True).stdout
F = np.frombuffer(raw, np.uint8).reshape(-1, 192, 108).astype(np.float32)
top = F[:, 8:88, :]; ref, st, runs = top[0], 0, []
for i in range(1, len(top)):
    if np.abs(top[i] - ref).mean() > 0.6: runs.append((i - st, st)); ref, st = top[i], i
runs.append((len(top) - st, st)); runs.sort(reverse=True)
print("longest still stretches of the top panel:", ", ".join(f"{n / 30:.2f}s at {s / 30:.1f}s" for n, s in runs[:4]))
