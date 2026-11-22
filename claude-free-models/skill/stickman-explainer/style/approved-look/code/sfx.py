#!/usr/bin/env python3
"""Synthesises the quiet sound-effects bed for broll.mp4 (no samples, no music, no voice, no game audio).

Every effect is generated from sine waves and filtered noise, placed on the voice beats,
and the whole bed is normalised to a low peak (-20 dBFS, about a fifth of a normal SFX level)
so the voiceover stays clear.  Usage: python3 sfx.py out.wav
"""
import math, random, struct, sys, wave

SR = 48000
DUR = 86.3
N = int(round(DUR * SR))
L = [0.0] * N
R = [0.0] * N
rnd = random.Random(7)


def add(sig, t, gain=1.0, pan=0.0):
    """Mix a mono signal into the stereo bed at time t (seconds); pan -1..1."""
    i0 = int(t * SR)
    gl = gain * math.cos((pan + 1) * math.pi / 4)
    gr = gain * math.sin((pan + 1) * math.pi / 4)
    for j, v in enumerate(sig):
        i = i0 + j
        if 0 <= i < N:
            L[i] += v * gl
            R[i] += v * gr


def env(n, a, d, shape=4.0):
    """attack seconds a, exponential-ish decay over remaining length."""
    na = max(1, int(a * SR))
    out = []
    for i in range(n):
        if i < na:
            out.append(i / na)
        else:
            x = (i - na) / max(1, n - na)
            out.append(math.exp(-shape * x) * (1 - x))
    return out


def lowpass(sig, fc):
    a = 1 - math.exp(-2 * math.pi * fc / SR)
    y, out = 0.0, []
    for v in sig:
        y += a * (v - y)
        out.append(y)
    return out


def lowpass_sweep(sig, f0, f1):
    y, out, n = 0.0, [], len(sig)
    for i, v in enumerate(sig):
        fc = f0 * (f1 / f0) ** (i / max(1, n - 1))
        a = 1 - math.exp(-2 * math.pi * fc / SR)
        y += a * (v - y)
        out.append(y)
    return out


def highpass(sig, fc):
    lp = lowpass(sig, fc)
    return [a - b for a, b in zip(sig, lp)]


def noise(dur):
    return [rnd.uniform(-1, 1) for _ in range(int(dur * SR))]


def tone(dur, f0, f1=None, kind='sine'):
    f1 = f1 or f0
    n, ph, out = int(dur * SR), 0.0, []
    for i in range(n):
        f = f0 * (f1 / f0) ** (i / max(1, n - 1))
        ph += 2 * math.pi * f / SR
        if kind == 'sine':
            out.append(math.sin(ph))
        else:  # soft triangle
            out.append(2 / math.pi * math.asin(math.sin(ph)))
    return out


def mul(a, b):
    return [x * y for x, y in zip(a, b)]


# ---------------------------------------------------------------- effect recipes
def pop(pitch=1.0):
    d = 0.09
    s = mul(tone(d, 700 * pitch, 260 * pitch), env(int(d * SR), 0.003, d, 5))
    return s


def tick(pitch=1.0):
    d = 0.035
    s = mul(tone(d, 2600 * pitch, 2200 * pitch), env(int(d * SR), 0.001, d, 7))
    n = mul(highpass(noise(d), 3000), env(int(d * SR), 0.0005, d, 12))
    return [a * 0.6 + b * 0.25 for a, b in zip(s, n)]


def whoosh(d=0.45, f0=300, f1=2500, f2=None):
    n = noise(d)
    half = len(n) // 2
    a = lowpass_sweep(n[:half], f0, f1)
    b = lowpass_sweep(n[half:], f1, f2 or f0)
    s = a + b
    e = [math.sin(math.pi * i / len(s)) ** 2 for i in range(len(s))]
    return mul(s, e)


def chime(f=1320, d=1.1):
    n = int(d * SR)
    e = env(n, 0.004, d, 5)
    out = []
    for i in range(n):
        t = i / SR
        out.append((math.sin(2 * math.pi * f * t) + 0.45 * math.sin(2 * math.pi * f * 2.01 * t) + 0.25 * math.sin(2 * math.pi * f * 3.0 * t)) * e[i] / 1.7)
    return out


def thud(f=90, d=0.35):
    return mul(tone(d, f * 1.6, f), env(int(d * SR), 0.004, d, 6))


def puff(d=0.3):
    return mul(lowpass(noise(d), 1400), env(int(d * SR), 0.01, d, 5))


def swipe(d=0.35, fc=3500):
    s = highpass(lowpass(noise(d), fc * 1.6), fc * 0.5)
    e = [math.sin(math.pi * i / len(s)) for i in range(len(s))]
    return mul(s, e)


def rumble(d=2.0, fc=140):
    s = lowpass(lowpass(noise(d), fc), fc)
    e = [math.sin(math.pi * i / len(s)) ** 1.5 for i in range(len(s))]
    m = max(abs(x) for x in s) or 1
    return [x / m * y for x, y in zip(s, e)]


def wind(d=3.0, fc=900, lfo=0.6):
    s = highpass(lowpass(noise(d), fc), fc * 0.25)
    n = len(s)
    m = max(abs(x) for x in s) or 1
    out = []
    for i in range(n):
        t = i / SR
        fade = min(1, t / 0.6, (d - t) / 0.6)
        out.append(s[i] / m * fade * (0.6 + 0.4 * math.sin(2 * math.pi * lfo * t)))
    return out


def bubble(f=500):
    d = 0.06
    return mul(tone(d, f, f * 2.2), env(int(d * SR), 0.002, d, 4))


def crackle(d=0.5, dens=60):
    out = [0.0] * int(d * SR)
    for _ in range(int(dens * d)):
        i = rnd.randrange(len(out) - 200)
        a = rnd.uniform(0.3, 1)
        for j in range(120):
            out[i + j] += a * rnd.uniform(-1, 1) * math.exp(-j / 18)
    return highpass(out, 2000)


def zip_(d=0.4, f0=400, f1=1600):
    s = tone(d, f0, f1, 'tri')
    e = [math.sin(math.pi * i / len(s)) ** 0.7 for i in range(len(s))]
    return [a * b * 0.6 for a, b in zip(s, e)]


def shimmer(d=0.8, f0=1800, f1=3600):
    out = [0.0] * int(d * SR)
    for k in range(5):
        st = int(k * d / 6 * SR)
        c = chime(f0 * (f1 / f0) ** (k / 4), 0.5)
        for j, v in enumerate(c):
            if st + j < len(out):
                out[st + j] += v * 0.5
    return out



def hit(f=70, d=0.45):
    """soft low impact for words slammed over footage"""
    a = thud(f, d)
    n = mul(lowpass(noise(d), 900), env(int(d * SR), 0.002, d, 9))
    return [x * 0.8 + y * 0.35 for x, y in zip(a, n)]


def click(pitch=1.0):
    d = 0.03
    s = mul(highpass(noise(d), 2500 * pitch), env(int(d * SR), 0.0005, d, 14))
    return [x * 0.8 for x in s]


def buzz(d=0.35):
    """gentle 'nope' two-tone for FULL"""
    a = mul(tone(d / 2, 330, 300, 'tri'), env(int(d / 2 * SR), 0.005, d / 2, 2))
    b = mul(tone(d / 2, 262, 240, 'tri'), env(int(d / 2 * SR), 0.005, d / 2, 3))
    return [x * 0.5 for x in a + b]


def blip(f0=500, f1=1400, d=0.18):
    return mul(tone(d, f0, f1), env(int(d * SR), 0.004, d, 4))


# ---------------------------------------------------------------- the cue sheet (seconds, from words.srt)
# 1-2 hook
add(rumble(1.6, 90), 0.0, 0.35)
add(whoosh(0.35, 400, 2400), 1.66, 0.25)
add(tick(0.9), 1.88, 0.3)
add(hit(80), 2.32, 0.55); add(pop(1.0), 2.32, 0.3)
# 3 couch: a decade of page flips
add(whoosh(0.4, 300, 1800), 3.06, 0.25)
for i in range(13):
    add(swipe(0.08, 3800), 4.1 + i * 1.2 / 13, 0.18, 0.4)
    add(tick(1.3 + i * 0.03), 4.12 + i * 1.2 / 13, 0.12, 0.4)
add(pop(1.3), 5.86, 0.3, 0.1)
# 4-7 danger, killed, arrested, broke
add(rumble(2.2, 70), 6.45, 0.45)
add(hit(70), 8.66, 0.8); add(swipe(0.25, 2500), 8.64, 0.2)
add(hit(62), 9.44, 0.8); add(swipe(0.25, 2500), 9.44, 0.2)
add(hit(55), 10.30, 0.8); add(swipe(0.25, 2500), 10.29, 0.2)
# 8 research board
add(whoosh(0.4, 400, 2800), 10.90, 0.3)
for i in range(3):
    add(zip_(0.3, 500 + i * 120, 1400 + i * 200), 10.98 + i * 0.14, 0.12, -0.5 + i * 0.5)
for at, pan in ((12.26, -0.5), (13.34, 0.0), (14.48, 0.5)):
    add(pop(1.0), at, 0.4, pan); add(whoosh(0.25, 800, 3000), at - 0.05, 0.12, pan)
for i in range(3):
    add(chime(1568 + i * 200, 0.6), 15.27 + i * 0.16, 0.14, -0.5 + i * 0.5); add(tick(1.2), 15.25 + i * 0.16, 0.3, -0.5 + i * 0.5)
# 9 squeeze: thumps on the lid, the latch, the stopwatch
add(whoosh(0.35, 400, 1600), 16.2, 0.2)
for i in range(9):
    add(thud(110 + i * 4, 0.18), 16.8 + i * 0.1923, 0.35, -0.1)
    add(click(0.6), 16.81 + i * 0.1923, 0.15)
add(click(1.2), 18.47, 0.6); add(thud(140, 0.15), 18.47, 0.4)
add(puff(0.35), 18.52, 0.4)
add(pop(1.1), 18.52, 0.4, 0.5); add(chime(1318, 0.8), 18.56, 0.18, 0.5)
for i in range(3):
    add(tick(1.6), 18.8 + i * 0.16, 0.18, 0.5)
# 10 secret
add(whoosh(0.4, 300, 1300), 19.26, 0.25)
for i, at in enumerate((20.0, 20.14, 20.3)):
    add(pop(1.2 + i * 0.12), at, 0.33, -0.4)
add(swipe(0.12, 4500), 21.04, 0.18, -0.5); add(swipe(0.12, 4500), 21.32, 0.18, 0.5)
# 11-12 date card + calendar
add(whoosh(0.4, 300, 1500), 22.40, 0.2)
add(whoosh(0.35, 500, 3000), 24.0, 0.25); add(zip_(0.3, 400, 1200), 24.06, 0.15)
add(tick(1.1), 24.14, 0.3); add(tick(1.2), 24.58, 0.3)
add(pop(1.15), 25.06, 0.35); add(chime(1760, 0.9), 25.06, 0.2); add(zip_(0.35, 600, 1600), 25.05, 0.12)
# 13-14 platforms
add(whoosh(0.35, 400, 2000), 25.84, 0.2)
add(whoosh(0.3, 500, 2500), 27.38, 0.2)
add(pop(1.0), 28.10, 0.35, -0.2); add(tick(1.2), 28.48, 0.25, -0.2)
add(pop(1.1), 28.99, 0.35, 0.0)
add(whoosh(0.7, 300, 1400, 500), 29.48, 0.25)
add(pop(0.8), 29.68, 0.25, 0.4)
add(swipe(0.12, 2600), 30.03, 0.35, 0.4); add(swipe(0.12, 2600), 30.16, 0.35, 0.4); add(thud(90, 0.25), 30.04, 0.3, 0.4)
add(pop(0.8), 31.08, 0.25, 0.7)
for at in (31.37, 31.49):
    add(swipe(0.1, 2600), at, 0.32, 0.7)
add(thud(85, 0.25), 31.4, 0.3, 0.7)
# 15 prices
add(whoosh(0.35, 400, 2600), 32.06, 0.25); add(pop(1.0), 32.16, 0.4)
add(whoosh(0.35, 600, 2000), 32.6, 0.2, -0.6)
for i in range(14):
    add(tick(1.4 + i * 0.02), 33.46 + 0.8 * (i / 14) ** 1.6, 0.16, -0.6)
add(chime(1568, 0.7), 34.3, 0.18, -0.6)
add(whoosh(0.35, 600, 2000), 36.12, 0.2, 0.6)
for i in range(14):
    add(tick(1.5 + i * 0.02), 36.64 + 0.8 * (i / 14) ** 1.6, 0.16, 0.6)
add(chime(1760, 0.8), 37.48, 0.2, 0.6)
# 16-18 store, the empty case, $80
add(whoosh(0.4, 300, 1500), 38.68, 0.2)
add(swipe(0.2, 2200), 39.24, 0.3, -0.3)
add(shimmer(0.6, 2000, 3600), 39.76, 0.16, 0.2)
add(click(0.8), 41.18, 0.5); add(swipe(0.35, 1800), 41.22, 0.35)
add(zip_(0.42, 300, 900), 41.52, 0.25, 0.3)
add(pop(0.7), 41.74, 0.35, 0.3); add(tone(0.16, 300, 220), 41.76, 0.08, 0.3)
add(swipe(0.45, 2400), 42.68, 0.35, -0.2)
add(whoosh(0.5, 500, 2500), 43.05, 0.25)
add(whoosh(0.25, 800, 3000), 44.05, 0.15)
add(thud(120, 0.2), 46.15, 0.5, 0.4); add(swipe(0.15, 3000), 46.12, 0.3, 0.4)
# 19 pre-load over footage
add(whoosh(0.35, 400, 1800), 46.9, 0.2)
add(pop(1.0), 48.3, 0.35); add(blip(500, 1100), 48.5, 0.12)
# 20 storage board
add(whoosh(0.35, 400, 2600), 50.08, 0.25); add(pop(0.9), 50.2, 0.35, -0.6)
for i in range(15):
    add(tick(1.0 + i * 0.02), 50.55 + i * 0.03, 0.08, -0.3 + i * 0.03)
for i in range(17):
    add(tick(1.25 + i * 0.03), 51.7 + 1.4 * (i / 17) ** 0.9, 0.11, 0.2 + i * 0.03)
add(pop(1.15), 52.46, 0.35, 0.3)
add(buzz(0.36), 53.1, 0.35, 0.6); add(thud(100, 0.2), 53.1, 0.3, 0.6)
# 21 deleting games
add(whoosh(0.3, 400, 1600), 53.42, 0.2)
for i, at in enumerate((54.2, 54.5, 54.8, 55.1)):
    add(tick(1.5), at - 0.28, 0.12, 0.5)
    add(swipe(0.25, 2400), at, 0.25, 0.55)
    add(puff(0.3), at + 0.28, 0.35, 0.6); add(pop(0.75 - i * 0.03), at + 0.28, 0.22, 0.6)
# 22-23 midnight, the world map
add(whoosh(0.4, 300, 1500), 55.56, 0.2)
add(pop(0.9), 55.72, 0.25)
add(click(0.7), 56.03, 0.6); add(click(1.1), 56.07, 0.4); add(chime(1175, 1.0), 56.06, 0.22)
add(hit(90), 56.76, 0.4); add(tick(1.3), 56.97, 0.25)
add(whoosh(0.35, 400, 2600), 57.08, 0.25)
for i in range(6):
    add(tick(1.1 + i * 0.05), 57.3 + i * 0.07, 0.2, -0.7 + i * 0.28)
add(zip_(0.35, 300, 1400), 57.96, 0.2, 0.8)
add(chime(1568, 1.1), 58.32, 0.25, 0.7); add(thud(110, 0.3), 58.32, 0.25, 0.7)
add(tick(1.2), 58.5, 0.25, 0.5)
add(pop(1.2), 59.40, 0.4, 0.6); add(chime(2093, 0.9), 59.42, 0.2, 0.6)
# 24-26 friends, the region menu, a day early
add(whoosh(0.35, 300, 1400), 59.68, 0.2)
add(blip(300, 900, 0.3), 60.3, 0.2, 0.6)
add(pop(1.05), 61.92, 0.35, -0.3); add(zip_(0.35, 500, 1300), 62.0, 0.12, -0.3)
add(whoosh(0.3, 500, 2500), 62.32, 0.2)
for i in range(9):
    add(tick(1.6 - i * 0.03), 62.64 + 0.72 * (i / 9) ** 1.4, 0.18)
add(chime(1318, 0.8), 63.37, 0.22); add(chime(1976, 0.7), 63.42, 0.12); add(tick(1.8), 63.46, 0.25)
add(whoosh(0.35, 400, 1800), 63.94, 0.2)
add(tick(1.2), 64.74, 0.25); add(hit(75), 65.17, 0.6)
# 27-28 footage cuts
add(whoosh(0.3, 500, 2000), 65.94, 0.15); add(whoosh(0.4, 400, 1600), 67.46, 0.15)
# 29 PlayStation Store page
add(whoosh(0.35, 400, 2600), 69.18, 0.25); add(pop(1.0), 69.28, 0.35)
add(whoosh(1.0, 200, 2000, 600), 70.3, 0.3)
add(zip_(0.45, 400, 1500), 71.3, 0.25); add(chime(1568, 0.9), 71.75, 0.2)
add(pop(1.1), 72.68, 0.3, 0.4)
# 30 nobody has said
add(whoosh(0.35, 400, 2600), 73.5, 0.25); add(pop(1.0), 73.62, 0.3)
add(pop(0.95), 74.42, 0.3, -0.6); add(pop(1.05), 75.38, 0.3, 0.6)
for i in range(4):
    add(tick(2.0), 74.6 + i * 0.3, 0.06, -0.6); add(tick(2.1), 75.5 + i * 0.1, 0.06, 0.6)
add(zip_(0.3, 400, 1000), 76.0, 0.12)
add(pop(0.85), 76.14, 0.4); add(thud(95, 0.35), 76.14, 0.35); add(tone(0.25, 500, 760), 76.2, 0.06)
# 31 30 FPS
add(whoosh(0.35, 300, 1600), 77.42, 0.2)
add(pop(1.0), 77.98, 0.3); add(hit(70), 79.16, 0.65)
# 32 30 vs 60
add(whoosh(0.35, 400, 2600), 80.28, 0.25); add(pop(0.95), 80.38, 0.35, -0.5)
for i in range(6):
    add(tick(1.1), 80.6 + i * 0.065, 0.14, -0.5)
add(pop(1.1), 81.64, 0.35, 0.5)
for i in range(12):
    add(tick(1.5), 82.92 + i * 0.033, 0.11, 0.5)
add(pop(1.2), 82.9, 0.25, 0.5)
add(thud(80, 0.4), 83.5, 0.6, 0.5); add(swipe(0.18, 1600), 83.48, 0.3, 0.5)
# 33 wait for tests
add(whoosh(0.3, 400, 1500), 84.0, 0.15)
add(swipe(0.22, 2200), 84.12, 0.3, -0.3)
add(pop(1.0), 84.32, 0.35); add(chime(1318, 0.9), 84.36, 0.12)
add(tick(1.6), 85.72, 0.3, 0.6); add(swipe(0.1, 4000), 85.74, 0.2, 0.6)

# ---------------------------------------------------------------- normalise quietly and write
# gentle fade at the very end so nothing clicks
for i in range(int(0.15 * SR)):
    g = i / (0.15 * SR)
    L[N - 1 - i] *= g
    R[N - 1 - i] *= g
peak = max(max(abs(x) for x in L), max(abs(x) for x in R)) or 1
target = 10 ** (-20 / 20)            # -20 dBFS peak: about a fifth of a usual SFX level
g = target / peak
out = sys.argv[1] if len(sys.argv) > 1 else 'sfx.wav'
with wave.open(out, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes(b''.join(struct.pack('<hh', int(max(-1, min(1, a * g)) * 32767), int(max(-1, min(1, b * g)) * 32767)) for a, b in zip(L, R)))
print(f'wrote {out}: {N} samples ({N / SR:.3f} s), peak gain {g:.3f}')
