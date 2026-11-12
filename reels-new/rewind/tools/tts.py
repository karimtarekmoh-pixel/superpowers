import json, numpy as np, soundfile as sf, sys
from kokoro_onnx import Kokoro
speed = float(sys.argv[1]) if len(sys.argv) > 1 else 0.95
k = Kokoro("/home/user/superpowers/zero-dollar-reel/models/kokoro-v1.0.onnx", "/home/user/superpowers/zero-dollar-reel/models/voices-v1.0.bin")
S = json.load(open("src/script.json")); parts = []; sr = 24000
for s in S["sections"]:
    y, sr = k.create(s["text"], voice="am_michael", speed=speed, lang="en-us"); parts += [y, np.zeros(int(.6 * sr))]
y = np.concatenate(parts); sf.write("audio/vo_full_raw.wav", y, sr); print(f"voice {len(y)/sr:.1f}s")
