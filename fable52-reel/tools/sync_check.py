"""Frame-level sync check: when does each caption chunk actually appear in the rendered (silent) video vs its timestamp?
Caption chunks are tl.set() at chunk.start, so the first changed frame in the pill band should land on chunk.start (+-1 frame).
usage: python tools/sync_check.py out/video_silent.mp4"""
import json, subprocess, sys, numpy as np
V = sys.argv[1]; CROP_Y = int(sys.argv[2]) if len(sys.argv) > 2 else 1596   # y of the 140 px caption band (1596 bottom pill, 240 top editorial captions)
starts = json.loads(subprocess.run(["node", "-e", """import("./src/timeline.js").then(async({buildTimeline})=>{const fs=await import("node:fs");const T=buildTimeline(JSON.parse(fs.readFileSync("src/script.json")),JSON.parse(fs.readFileSync("audio/timestamps.json")));console.log(JSON.stringify((process.env.MODE==="words"?T.words.map(w=>[w.start-0.03,w.end]):T.chunks.map(c=>[c.start,c.end]))))})"""], capture_output=True, text=True, env={**__import__("os").environ, "MODE": sys.argv[3] if len(sys.argv) > 3 else ""}).stdout)
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", V, "-vf", "crop=1080:140:0:%d" % CROP_Y + ",scale=216:28,format=gray", "-f", "rawvideo", "-"], capture_output=True).stdout
F = np.frombuffer(raw, np.uint8).reshape(-1, 28, 216).astype(np.float32)
d = np.abs(np.diff(F, axis=0)).mean(axis=(1, 2))          # d[i] = change between frame i and i+1
offs = []
for s, e in starts[1:-1]:
    k = int(round(s * 30)); lo, hi = max(0, k - 6), min(len(d), k + 6)
    j = lo + int(np.argmax(d[lo:hi])) + 1                   # frame where the change shows up
    offs.append((j - k) * 1000 / 30)
offs = np.array(offs)
print(f"{len(offs)} caption onsets: mean offset {offs.mean():+.0f} ms, median {np.median(offs):+.0f} ms, max |offset| {np.abs(offs).max():.0f} ms (1 frame = 33 ms)")
print("first 3 / middle 3 / last 3 offsets (ms):", offs[:3].round().tolist(), offs[len(offs)//2 - 1:len(offs)//2 + 2].round().tolist(), offs[-3:].round().tolist())
