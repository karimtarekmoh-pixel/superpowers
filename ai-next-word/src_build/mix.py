import json, numpy as np, subprocess, wave
SR = 48000
W = json.load(open('audio/words.json')); t = {i: w['s'] for i, w in enumerate(W)}
N = int(33.7 * SR); sfx = np.zeros(N)
rng = np.random.default_rng(7)
def put(at, sig, g=1.0):
    i = int(at * SR); j = min(N, i + len(sig))
    if i < N: sfx[i:j] += sig[:j - i] * g
def env(n, a=0.004, d=0.1):
    x = np.arange(n) / SR; return np.minimum(1, x / a) * np.exp(-x / d)
def pop(f0=720, f1=300, dur=.14):
    n = int(dur * SR); x = np.arange(n) / SR; f = f0 + (f1 - f0) * (x / dur); ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * env(n, .003, .05)
def tick():
    n = int(.05 * SR); x = np.arange(n) / SR; return np.sin(2 * np.pi * 1700 * x) * env(n, .001, .012)
def whoosh(dur=.42):
    n = int(dur * SR); x = np.arange(n) / SR; nz = rng.standard_normal(n)
    k = np.linspace(.02, .35, n); y = np.zeros(n); lp = 0
    for i in range(n): lp += k[i] * (nz[i] - lp); y[i] = lp
    return y * np.sin(np.pi * x / dur) ** 2 * 1.6
def thud():
    n = int(.3 * SR); x = np.arange(n) / SR; return (np.sin(2 * np.pi * 85 * x * (1 - .3 * x)) * np.exp(-x / .09) + .25 * rng.standard_normal(n) * np.exp(-x / .02))
for c in [3.45, 8.7, 11.4, 18.0, 22.3, 24.3, 27.9, 31.8]: put(c - .2, whoosh(), .5)
for i in [0, 1, 2, 3]: put(t[i], pop(), .5)
put(1.15, pop(900, 400), .5); put(1.35, pop(1000, 450), .5)
for i in [11, 13]: put(t[i] - .05, pop(), .5)
for tt in [t[15] - .1, t[25] - .15, t[31], t[38], t[41], t[52], t[62] - .2, t[75], t[85] + .05, t[87], t[89] - .3]: put(tt, pop(640, 280), .45)
for tt in [t[69] - .35, t[71] - .35, t[74] - .35]: put(tt, pop(500, 250, .1), .35)
for tt in [t[75] - .5, t[75] - .15, t[75] + .2]: put(tt, tick(), .6)
for i in range(8): put(t[78] + i * .15, tick(), .25)
put(t[57] - .02, thud(), .9)
put(31.85, pop(500, 900, .25), .6)
sfx *= 0.28
v = subprocess.run(['ffmpeg', '-v', 'error', '-i', 'audio/voice_raw.wav', '-ar', str(SR), '-ac', '1', '-f', 'f32le', '-'], capture_output=True).stdout
v = np.frombuffer(v, dtype=np.float32).astype(np.float64); voice = np.zeros(N); voice[:min(N, len(v))] = v[:N]
duck = np.ones(N)
mix = voice + sfx
mix /= max(1, np.abs(mix).max() / 0.89)
w = wave.open('audio/mix_raw.wav', 'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix * 32767).astype('<i2').tobytes()); w.close()
