"""Mix: VO + original generated music + SFX -> public/mix.wav
- S1-S3: light marimba pluck bed only; at S4 a deep minimal groove (108 BPM) kicks in with a sub-bass hit
- music ducked ~9 dB under the VO; ends on a beat drop + bass ring-out on the end card (no fade-out)
- SFX: phone ring, paper rustle, stamp thuds, pager beeps, glitch, slide clicks, ascending dings, radar blips, keys, scratch, click
- master: -14 LUFS integrated, true peak under -1.5 dBTP
usage: python tools/mix.py"""
import json, os, subprocess
import numpy as np, soundfile as sf
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 48000; rng = np.random.default_rng(3)
t_ = lambda d: np.arange(int(d * SR)) / SR
env = lambda d, k: np.exp(-t_(d) * k)
def bp(x, lo, hi):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); X[(f < lo) | (f > hi)] = 0; return np.fft.irfft(X, len(x))
def lp1(x, fc):
    a = np.exp(-2 * np.pi * fc / SR); y = np.empty_like(x); s = 0.0
    for i, v in enumerate(x): s = (1 - a) * v + a * s; y[i] = s
    return y
def nrm(x, db=-1): return x / (np.abs(x).max() + 1e-12) * 10 ** (db / 20)
def place(buf, x, at, g=1.0):
    i = int(at * SR); x = x[: max(0, len(buf) - i)]; buf[i:i + len(x)] += x * g
# ---------------- sfx
def key():   # soft mechanical keyboard tick
    a = bp(rng.standard_normal(int(.018 * SR)), 1800, 9000) * env(.018, 320); b = np.sin(2 * np.pi * 180 * t_(.018)) * env(.018, 200) * .4
    return nrm(a + b, -6)
def pop(): return nrm(np.sin(2 * np.pi * np.cumsum(np.geomspace(1100, 420, int(.05 * SR))) / SR) * env(.05, 70), -4)
def whoosh():
    n = rng.standard_normal(int(.35 * SR)); y = np.zeros_like(n); seg = len(n) // 8
    for k in range(8): c = 400 * (2 ** (k / 2.4)); y[k * seg:(k + 1) * seg] = bp(n, c, c * 2)[k * seg:(k + 1) * seg]
    return nrm(y * np.sin(np.pi * np.linspace(0, 1, len(y))) ** 1.6, -6)
def snap():  # slightly heavier click for the step tracker
    a = bp(rng.standard_normal(int(.025 * SR)), 1500, 7000) * env(.025, 220); b = np.sin(2 * np.pi * np.cumsum(np.geomspace(200, 80, int(.12 * SR))) / SR) * env(.12, 30)
    y = np.zeros(int(.13 * SR)); y[:len(a)] += a; y[:len(b)] += .8 * b; return nrm(y, -3)
def click(): return nrm(bp(rng.standard_normal(int(.02 * SR)), 2000, 8000) * env(.02, 250) + .4 * np.sin(2 * np.pi * 2400 * t_(.02)) * env(.02, 300), -6)
def chime(): return nrm((np.sin(2 * np.pi * 1318.5 * t_(.6)) + .6 * np.sin(2 * np.pi * 1975.5 * t_(.6)) * (t_(.6) > .07)) * env(.6, 6), -6)
def tick(): return nrm(np.sin(2 * np.pi * 3200 * t_(.012)) * env(.012, 400) + .3 * bp(rng.standard_normal(int(.012 * SR)), 4000, 12000) * env(.012, 500), -8)
def sparkle():   # quick rising shimmer of high partials
    y = np.zeros(int(.45 * SR))
    for k, f in enumerate([2093, 2637, 3136, 3951, 4186]): place(y, np.sin(2 * np.pi * f * t_(.25)) * env(.25, 14), k * .05, .6)
    return nrm(y, -8)
def riser(d=0.8):   # filtered noise + rising tone into a reveal
    n = rng.standard_normal(int(d * SR)); y = np.zeros_like(n); seg = len(n) // 10
    for k in range(10): c = 300 * (2 ** (k / 2.2)); y[k * seg:(k + 1) * seg] = bp(n, c, c * 1.8)[k * seg:(k + 1) * seg]
    tone = np.sin(2 * np.pi * np.cumsum(np.geomspace(180, 900, len(n))) / SR) * .25
    return nrm((y + tone) * np.linspace(0, 1, len(n)) ** 2.2, -6)
def impact():    # soft hit: low thump + click
    b = np.sin(2 * np.pi * np.cumsum(np.geomspace(140, 55, int(.35 * SR))) / SR) * env(.35, 9)
    a = np.pad(bp(rng.standard_normal(int(.02 * SR)), 1500, 8000) * env(.02, 200), (0, int(.33 * SR)))
    return nrm(b + .5 * a[:len(b)], -3)
def boom():      # bigger sub drop for the crack / stamp
    return nrm(np.sin(2 * np.pi * np.cumsum(np.geomspace(90, 32, int(.8 * SR))) / SR) * env(.8, 4.5) + .3 * bp(rng.standard_normal(int(.8 * SR)), 60, 400) * env(.8, 8), -2)
def buzz():      # small error buzz
    return nrm(np.sign(np.sin(2 * np.pi * 160 * t_(.18))) * env(.18, 9) * .6 + .4 * np.sin(2 * np.pi * 320 * t_(.18)) * env(.18, 12), -8)
def shutter():   # camera shutter: two clicks + air
    y = np.zeros(int(.22 * SR)); c = bp(rng.standard_normal(int(.02 * SR)), 1000, 9000) * env(.02, 250)
    place(y, c, 0); place(y, c * .8, .09); place(y, bp(rng.standard_normal(int(.12 * SR)), 2000, 8000) * env(.12, 30) * .3, .01); return nrm(y, -4)
def ring():      # old-school phone bell burst
    tt = t_(.5); y = (np.sin(2 * np.pi * 1250 * tt) + .6 * np.sin(2 * np.pi * 1610 * tt)) * (np.sin(2 * np.pi * 22 * tt) > 0) * np.minimum(1, (0.5 - tt) * 20)
    return nrm(y, -6)
def rustle():    # paper rustle
    n = bp(rng.standard_normal(int(.45 * SR)), 1500, 9000); a = np.abs(np.convolve(rng.standard_normal(len(n)), np.ones(400) / 400, "same")); return nrm(n * a * np.sin(np.pi * np.linspace(0, 1, len(n))), -8)
def stamp():     # rubber stamp thud
    b = np.sin(2 * np.pi * np.cumsum(np.geomspace(160, 70, int(.18 * SR))) / SR) * env(.18, 22); a = np.pad(bp(rng.standard_normal(int(.03 * SR)), 300, 3000) * env(.03, 120), (0, int(.15 * SR)))
    return nrm(b + .7 * a[:len(b)], -3)
def crack():
    y = np.zeros(int(.3 * SR))
    for k in range(5): place(y, bp(rng.standard_normal(int(.015 * SR)), 2000, 10000) * env(.015, 300), k * .035, 1 - k * .15)
    return nrm(y, -5)
def coins():
    y = np.zeros(int(.6 * SR))
    for k in range(7): f = 3000 + 900 * rng.random(); place(y, np.sin(2 * np.pi * f * t_(.2)) * env(.2, 30), k * .06, .7)
    return nrm(y, -8)
def thud(): return nrm(np.sin(2 * np.pi * np.cumsum(np.geomspace(120, 50, int(.3 * SR))) / SR) * env(.3, 14), -3)
def beep(): return nrm(np.sin(2 * np.pi * 2900 * t_(.09)) * (t_(.09) < .08), -8)
def blip(): return nrm(np.sin(2 * np.pi * np.cumsum(np.geomspace(900, 1500, int(.06 * SR))) / SR) * env(.06, 40), -8)
def glitch():
    y = np.sign(np.sin(2 * np.pi * 90 * t_(.18))) * .4 + bp(rng.standard_normal(int(.18 * SR)), 500, 8000)
    y *= np.repeat(rng.random(18) > .35, int(.01 * SR))[:len(y)]
    return nrm(y * env(.18, 6), -6)
def sub(): return nrm(np.sin(2 * np.pi * np.cumsum(np.geomspace(70, 38, int(1.4 * SR))) / SR) * env(1.4, 2.6) * (1 - np.exp(-t_(1.4) * 80)), -2)
def slide(): y = bp(rng.standard_normal(int(.08 * SR)), 2500, 9000) * np.sin(np.pi * np.linspace(0, 1, int(.08 * SR))); return nrm(y, -10) * .6 + np.pad(click(), (0, int(.06 * SR)))[:int(.08 * SR)]
def ding(): return nrm((np.sin(2 * np.pi * 1568 * t_(.5)) + .4 * np.sin(2 * np.pi * 3136 * t_(.5))) * env(.5, 9), -6)
def radar(): return nrm(np.sin(2 * np.pi * 1180 * t_(.35)) * env(.35, 10) * (1 + .5 * np.sin(2 * np.pi * 30 * t_(.35))), -8)
def scratch():
    n = rng.standard_normal(int(.3 * SR)); y = np.zeros_like(n); seg = len(n) // 6
    for k in range(6): c = 3000 / (1.4 ** k); y[k * seg:(k + 1) * seg] = bp(n, c, c * 2.5)[k * seg:(k + 1) * seg]
    return nrm(y * np.sin(np.pi * np.linspace(0, 1, len(y))) ** .7, -6)
FX = {"key": key, "pop": pop, "whoosh": whoosh, "click": click, "chime": chime, "tick": tick, "sparkle": sparkle, "riser": riser, "impact": impact, "buzz": buzz,
      "ring": ring, "rustle": rustle, "stamp": stamp, "crack": crack, "coins": coins, "thud": thud, "beep": beep, "blip": blip, "glitch": glitch, "sub": sub, "slide": slide, "ding": ding, "radar": radar, "scratch": scratch}
LEVEL = {"key": -27, "pop": -23, "whoosh": -26, "click": -23, "chime": -23, "tick": -29, "sparkle": -27, "riser": -27, "impact": -20, "buzz": -27,
         "ring": -25, "rustle": -24, "stamp": -19, "crack": -23, "coins": -25, "thud": -20, "beep": -27, "blip": -27, "glitch": -21, "sub": -15, "slide": -24, "ding": -24, "radar": -25, "scratch": -22}   # dBFS peaks, under the VO

# ---------------- 20 more unique effects (added in round 2)
def _sw(d, f0, f1): return np.cumsum(np.geomspace(f0, f1, int(d * SR))) / SR
def swoosh_up():
    n = rng.standard_normal(int(.4 * SR)); y = np.zeros_like(n); seg = len(n) // 8
    for k in range(8): c = 500 * (2 ** (k / 2)); y[k * seg:(k + 1) * seg] = bp(n, c, c * 1.6)[k * seg:(k + 1) * seg]
    return nrm(y * np.linspace(0, 1, len(y)) ** 1.5 * np.linspace(1, .2, len(y)) ** .3, -6)
def boing():
    tt = t_(.45); ph = np.cumsum(150 + 260 * np.exp(-tt * 9) * (1 + .35 * np.sin(2 * np.pi * 17 * tt))) / SR
    return nrm(np.sin(2 * np.pi * ph) * np.exp(-tt * 6) * (1 - np.exp(-tt * 200)), -5)
def squeak():
    tt = t_(.16); ph = _sw(.16, 1700, 2700); return nrm(np.sin(2 * np.pi * ph) * (1 + .6 * np.sin(2 * np.pi * 45 * tt)) * np.sin(np.pi * tt / .16), -8)
def scribble():
    tt = t_(.4); am = np.abs(np.sin(2 * np.pi * 11 * tt + 3 * np.sin(2 * np.pi * 3 * tt))); return nrm(bp(rng.standard_normal(len(tt)), 3000, 8500) * am * np.sin(np.pi * tt / .4), -8)
def creak():
    tt = t_(.7); f = 80 + 70 * np.sin(np.pi * tt / .7) ** 2; saw = ((np.cumsum(f) / SR) % 1) * 2 - 1
    return nrm(lp1(saw, 700) * (1 + .5 * bp(rng.standard_normal(len(tt)), 8, 40)) * np.sin(np.pi * tt / .7), -8)
def ekg():
    tt = t_(.14); return nrm(np.sin(2 * np.pi * 1040 * tt) * np.exp(-tt * 18) * (1 - np.exp(-tt * 900)), -8)
def drumroll():
    d = .8; tt = t_(d); am = np.abs(np.sin(2 * np.pi * (22 + 35 * tt / d) * tt)); y = bp(rng.standard_normal(len(tt)), 180, 1800) * am * (.25 + .75 * tt / d) ** 1.5
    return nrm(y * np.minimum(1, (d - tt) * 25), -6)
def womp():
    d = .75; tt = t_(d); ph = _sw(d, 440, 170) + .012 * np.sin(2 * np.pi * 7 * tt); y = sum(np.sin(2 * np.pi * k * ph) / k for k in (1, 2, 3))
    return nrm(lp1(y, 1400) * np.exp(-tt * 2.2) * (1 - np.exp(-tt * 60)), -5)
def drip():
    tt = t_(.14); return nrm(np.sin(2 * np.pi * _sw(.14, 1900, 650)) * np.exp(-tt * 38), -7)
def kaching():
    tt = t_(.75); y = np.sin(2 * np.pi * 2093 * tt) * np.exp(-tt * 7) + .7 * np.sin(2 * np.pi * 3136 * tt) * np.exp(-tt * 6) * (tt > .07)
    y[:int(.02 * SR)] += bp(rng.standard_normal(int(.02 * SR)), 1500, 9000) * 1.2; return nrm(y, -6)
def clank():
    tt = t_(.5); return nrm(sum(a * np.sin(2 * np.pi * f * tt) * np.exp(-tt * r) for f, a, r in [(520, 1, 12), (1330, .6, 16), (2210, .4, 20), (3480, .25, 26)]), -5)
def static():
    d = .25; tt = t_(d); gate = np.repeat(rng.random(25) > .3, int(.01 * SR))[:len(tt)]; return nrm(bp(rng.standard_normal(len(tt)), 800, 9000) * gate * np.minimum(1, (d - tt) * 30), -7)
def dataprint():
    y = np.zeros(int(.34 * SR))
    for k in range(7): place(y, np.sin(2 * np.pi * (1200 + 1400 * rng.random()) * t_(.025)) * env(.025, 80), k * .045, .8)
    return nrm(y, -8)
def siren():
    d = .75; tt = t_(d); f = 800 + 220 * np.sin(2 * np.pi * 3 * tt); ph = np.cumsum(f) / SR; y = lp1(np.sign(np.sin(2 * np.pi * ph)) * .6 + np.sin(2 * np.pi * ph), 2500)
    return nrm(y * np.sin(np.pi * tt / d) ** .5, -8)
def powerup():
    d = .65; tt = t_(d); ph = _sw(d, 150, 1500); y = np.sin(2 * np.pi * ph) + .4 * np.sin(4 * np.pi * ph); return nrm(y * np.sin(np.pi * (tt / d) ** .8) ** 1.2, -6)
def latch():
    y = np.zeros(int(.16 * SR)); place(y, bp(rng.standard_normal(int(.012 * SR)), 600, 4000) * env(.012, 250) + .5 * np.sin(2 * np.pi * 420 * t_(.012)), 0)
    place(y, bp(rng.standard_normal(int(.01 * SR)), 2500, 9000) * env(.01, 300) + .4 * np.sin(2 * np.pi * 1700 * t_(.01)), .075, .9); return nrm(y, -5)
def flap():
    tt = t_(.1); return nrm(bp(rng.standard_normal(len(tt)), 900, 5500) * env(.1, 45) * (1 + np.sin(2 * np.pi * 60 * tt)) + .5 * np.sin(2 * np.pi * 180 * tt) * env(.1, 60), -8)
def fanfare():
    y = np.zeros(int(.9 * SR))
    for k, f in enumerate([523.3, 659.3, 784, 1046.5]): place(y, (np.sin(2 * np.pi * f * t_(.5)) + .3 * np.sin(4 * np.pi * f * t_(.5))) * env(.5, 4 if k == 3 else 14), k * .08)
    return nrm(y, -6)
def zip_():
    d = .26; tt = t_(d); y = np.sin(2 * np.pi * _sw(d, 400, 3200)) * .5 + bp(rng.standard_normal(len(tt)), 1000, 8000) * .6; return nrm(y * np.sin(np.pi * tt / d) ** .8, -7)
def unlock():
    y = np.zeros(int(.5 * SR)); place(y, np.sin(2 * np.pi * 880 * t_(.1)) * env(.1, 30), 0, .7); place(y, (np.sin(2 * np.pi * 1320 * t_(.4)) + .3 * np.sin(2 * np.pi * 2640 * t_(.4))) * env(.4, 9), .09)
    return nrm(y, -6)
FX.update({"swoosh_up": swoosh_up, "boing": boing, "squeak": squeak, "scribble": scribble, "creak": creak, "ekg": ekg, "drumroll": drumroll, "womp": womp, "drip": drip, "kaching": kaching,
           "clank": clank, "static": static, "dataprint": dataprint, "siren": siren, "powerup": powerup, "latch": latch, "flap": flap, "fanfare": fanfare, "zip": zip_, "unlock": unlock})
LEVEL.update({"swoosh_up": -25, "boing": -23, "squeak": -26, "scribble": -27, "creak": -26, "ekg": -29, "drumroll": -26, "womp": -22, "drip": -26, "kaching": -24,
              "clank": -22, "static": -26, "dataprint": -27, "siren": -28, "powerup": -23, "latch": -23, "flap": -25, "fanfare": -24, "zip": -25, "unlock": -23})
# ---------------- v2: layering, shared room reverb, stereo, humanize
def trans():   # transition sweep: rising filtered noise + a soft low thump on the cut (thump at ~0.2 s)
    d = .34; n = rng.standard_normal(int(d * SR)); y = np.zeros_like(n); seg = len(n) // 10
    for k in range(10): c = 350 * (2 ** (k / 2.0)); y[k * seg:(k + 1) * seg] = bp(n, c, c * 1.9)[k * seg:(k + 1) * seg]
    y *= np.sin(np.pi * np.linspace(0, 1, len(y)) ** 0.7) ** 1.4
    th = np.zeros(len(y)); b = np.sin(2 * np.pi * np.cumsum(np.geomspace(110, 48, int(.22 * SR))) / SR) * env(.22, 12); place(th, b, .17, .9)
    return nrm(y * .8 + th, -4)
def air(d=.012, lo=3500, hi=12000, k=300):   # tiny bright transient that makes a hit sound "real"
    return bp(rng.standard_normal(int(d * SR)), lo, hi) * env(d, k)
def body_low(f0=170, f1=70, d=.09, k=40): return np.sin(2 * np.pi * np.cumsum(np.geomspace(f0, f1, int(d * SR))) / SR) * env(d, k)
def mixl(*layers):   # sum layers of different length, normalise
    n = max(len(l[0]) for l in layers); y = np.zeros(n)
    for x, g in layers: y[:len(x)] += x * g
    return y
# layer recipes: type -> extra layers added under the original sound (transient / low body / detuned shimmer)
LAYERS = {
  "pop":     lambda x: mixl((x, 1.0), (air(.010, 3000, 11000, 400), .35), (body_low(220, 90, .07, 55), .30)),
  "click":   lambda x: mixl((x, 1.0), (air(.008, 4000, 12000, 500), .30), (body_low(260, 110, .05, 70), .25)),
  "tick":    lambda x: mixl((x, 1.0), (air(.006, 5000, 13000, 600), .25)),
  "blip":    lambda x: mixl((x, 1.0), (rate(x, 2.0)[:len(x)], .28), (air(.008, 4000, 12000, 450), .2)),
  "ding":    lambda x: mixl((x, 1.0), (rate(x, 2.0), .30), (rate(x, 1.004)[:len(x)], .45), (air(.012, 3000, 11000, 250), .25)),
  "unlock":  lambda x: mixl((x, 1.0), (rate(x, 1.5)[:len(x)], .25), (air(.012, 3000, 11000, 250), .25)),
  "sparkle": lambda x: mixl((x, 1.0), (rate(x, 1.5)[:len(x)], .35)),
  "impact":  lambda x: mixl((x, 1.0), (air(.02, 1500, 9000, 150), .4), (body_low(70, 36, .5, 6), .55)),
  "stamp":   lambda x: mixl((x, 1.0), (air(.02, 1200, 8000, 160), .45), (body_low(90, 40, .45, 7), .5)),
  "sub":     lambda x: x,
  "zip":     lambda x: mixl((x, 1.0), (air(.02, 4000, 12000, 120), .3)),
  "buzz":    lambda x: mixl((x, 1.0), (body_low(120, 80, .15, 18), .35)),
}
WET = {"ding": .34, "unlock": .34, "sparkle": .40, "impact": .22, "stamp": .22, "sub": .10, "trans": .22, "whoosh": .18, "zip": .14, "blip": .12,
       "pop": .09, "click": .07, "tick": .05, "buzz": .08}
def make_ir(d=.5):   # synthetic small-room/plate: decaying noise, dull highs, slight L/R difference
    n = int(d * SR); tt = np.arange(n) / SR; out = []
    for ch in range(2):
        g = np.random.default_rng(11 + ch); x = g.standard_normal(n) * np.exp(-tt * 9.5)
        for dt_, a in [(.011, .7), (.019, .5), (.029, .4), (.041, .3)]: x[int(dt_ * SR * (1 + .12 * ch))] += a * 3
        X = np.fft.rfft(x); f = np.fft.rfftfreq(n, 1 / SR); X *= 1 / (1 + (f / 5500) ** 2); X[f < 180] *= .2; x = np.fft.irfft(X, n)
        out.append(x / (np.abs(x).max() + 1e-9))
    return out
def fconv(x, ir):
    n = len(x) + len(ir) - 1; N = 1 << (n - 1).bit_length(); return np.fft.irfft(np.fft.rfft(x, N) * np.fft.rfft(ir, N), N)[:len(x)]
def pan_gains(p): a = (p + 1) * np.pi / 4; return np.cos(a), np.sin(a)   # equal power
def wipe():   # short bright noise swipe for the mock-up wipe-in (0.15 s)
    n = rng.standard_normal(int(.15 * SR)); y = bp(n, 700, 7500) * np.sin(np.pi * np.linspace(0, 1, len(n))) ** 1.2
    return nrm(y, -6)
FX["trans"] = trans; LEVEL["trans"] = -22; FX["wipe"] = wipe; LEVEL["wipe"] = -24; WET["wipe"] = .08

# ---------------- CLEAN mode (user: "there is an air sound"): tones only. No noise bursts, no noise reverb, no hi-hat hiss, no room tone.
CLEAN = os.environ.get("CLEAN") == "1"
def _glide(d, f0, f1, shape=1.5):
    ph = np.cumsum(np.geomspace(f0, f1, int(d * SR))) / SR; return np.sin(2 * np.pi * ph) * np.sin(np.pi * np.linspace(0, 1, int(d * SR))) ** shape
def _dec(f, d, k, f1=None):
    ph = (np.cumsum(np.geomspace(f, f1 or f, int(d * SR))) / SR) if f1 else f * t_(d); return np.sin(2 * np.pi * ph) * env(d, k)
if CLEAN:
    FX["whoosh"] = lambda: nrm(mixl((_glide(.26, 220, 900), .8), (_glide(.26, 330, 1350), .3)), -8)
    FX["wipe"] = lambda: nrm(_glide(.11, 600, 1500), -9)
    FX["zip"] = lambda: nrm(_glide(.1, 450, 2000, 1.0) * .9, -9)
    FX["click"] = lambda: nrm(mixl((_dec(1900, .012, 330), .6), (_dec(520, .016, 180), .4)), -7)
    FX["tick"] = lambda: nrm(_dec(2700, .009, 450), -9)
    FX["key"] = lambda: nrm(mixl((_dec(1400, .012, 280), .5), (_dec(190, .04, 90), .6)), -9)
    FX["impact"] = lambda: nrm(mixl((_dec(150, .38, 9, 55), 1.0), (_dec(1100, .006, 600), .2)), -3)
    FX["stamp"] = lambda: nrm(mixl((_dec(125, .32, 10, 50), 1.0), (_dec(780, .008, 500), .25)), -3)
    def _trans():
        y = np.zeros(int(.34 * SR)); y[:int(.17 * SR)] += _glide(.17, 260, 1100) * .55; place(y, _dec(112, .22, 12, 48), .13, 1.0); return nrm(y, -4)
    FX["trans"] = _trans
    LAYERS = {"pop": lambda x: mixl((x, 1.0), (body_low(220, 90, .07, 55), .30)), "blip": lambda x: mixl((x, 1.0), (rate(x, 2.0)[:len(x)], .28)),
              "ding": lambda x: mixl((x, 1.0), (rate(x, 2.0), .30), (rate(x, 1.004)[:len(x)], .45)), "unlock": lambda x: mixl((x, 1.0), (rate(x, 1.5)[:len(x)], .25)),
              "sparkle": lambda x: mixl((x, 1.0), (rate(x, 1.5)[:len(x)], .35)), "buzz": lambda x: mixl((x, 1.0), (body_low(120, 80, .15, 18), .35))}
    WET = {}

# ---------------- 20 unique tonal effects (no noise anywhere): used by the levels reel; every one is sine/FM/additive
def _e(d, k, att=.003): return np.exp(-t_(d) * k) * np.minimum(1, t_(d) / att)
def _tn(f, d, k, att=.003): return np.sin(2 * np.pi * f * t_(d)) * _e(d, k, att)
def _gl(d, f0, f1, k=8, att=.003): ph = np.cumsum(np.geomspace(f0, f1, int(d * SR))) / SR; return np.sin(2 * np.pi * ph) * _e(d, k, att)
def _win(y): return y * np.sin(np.pi * np.linspace(0, 1, len(y))) ** .8
def _at(parts, d=None):
    n = max(int((a + len(x) / SR) * SR) for a, x, g in parts) + 1; y = np.zeros(n)
    for a, x, g in parts: i = int(a * SR); y[i:i + len(x)] += x * g
    return y
def fx_bloop(): return nrm(_gl(.14, 280, 820, 22), -7)
def fx_chirp(): return nrm(_at([(0, _gl(.07, 1500, 2400, 28), 1), (.075, _gl(.07, 1800, 2900, 28), .8)]), -9)
def fx_marimba(): return nrm(_at([(0, _tn(523.25, .55, 7), 1), (0, _tn(523.25 * 3.9, .3, 38), .3)]), -7)
def fx_bell(): return nrm(_at([(0, _tn(880 * r, .8, k), a) for r, k, a in ((1, 4, 1), (2.76, 6, .6), (5.4, 9, .35), (8.9, 13, .2))]), -8)
def fx_glass(): return nrm(_at([(0, _tn(2093, .5, 9), 1), (0, _tn(3136, .4, 12), .5), (0, _tn(4186, .3, 18), .25)]), -9)
def fx_coin(): return nrm(_at([(0, _tn(988, .09, 26), 1), (.07, _tn(1319, .4, 9), 1)]), -8)
def fx_zap(): return nrm(_gl(.15, 2400, 220, 13), -7)
def fx_boing():
    tt = t_(.55); f = 250 + 190 * np.exp(-5 * tt) * np.cos(2 * np.pi * 10 * tt); return nrm(np.sin(2 * np.pi * np.cumsum(f) / SR) * _e(.55, 5), -7)
def fx_pluck(): return nrm(sum(_tn(330 * h, .4, 6 + 4 * h) / h for h in range(1, 7)), -8)
def fx_heartbeat(): return nrm(_at([(0, _gl(.17, 95, 45, 13), 1), (.22, _gl(.15, 85, 42, 14), .8)]), -5)
def fx_sonar(): return nrm(_at([(0, _tn(1300, 1.0, 5), 1), (.38, _tn(1300, .8, 6), .4), (.74, _tn(1300, .6, 8), .18)]), -9)
def fx_swell():
    d = .55; tt = np.linspace(0, 1, int(d * SR)); f = 200 * (3.2 ** tt); y = np.sin(2 * np.pi * np.cumsum(f) / SR) * tt ** 2 * np.minimum(1, (1 - tt) * 14 + .0); return nrm(y, -8)
def fx_stinger(): return nrm(_at([(0, _tn(f, .45, 7), 1) for f in (523.25, 659.25, 783.99)]), -7)
def fx_countdown(): return nrm(_win(_tn(880, .1, 0.1, .004)), -9)
def fx_error2(): return nrm(_at([(0, _win(_tn(440, .11, 0, .004)), 1), (.13, _win(_tn(330, .17, 0, .004)), 1)]), -8)
def fx_success3(): return nrm(_at([(i * .07, _tn(f, .3, 11), 1) for i, f in enumerate((523.25, 659.25, 783.99, 1046.5))]), -8)
def fx_wobble():
    tt = t_(.36); f = 330 + 26 * np.sin(2 * np.pi * 8 * tt); return nrm(_win(np.sin(2 * np.pi * np.cumsum(f) / SR)), -8)
def fx_whistle():
    a = np.geomspace(900, 1700, int(.2 * SR)); b = np.geomspace(1700, 1300, int(.2 * SR)); return nrm(_win(np.sin(2 * np.pi * np.cumsum(np.concatenate([a, b])) / SR)), -9)
def fx_tap(): return nrm(_at([(0, _tn(820, .03, 240), 1), (0, _tn(1250, .02, 330), .6)]), -9)
def fx_drop(): return nrm(_at([(0, _gl(.55, 190, 38, 4.5), 1), (0, _gl(.2, 95, 40, 14), .6)]), -3)
NEW20 = {"bloop": (fx_bloop, -24), "chirp": (fx_chirp, -26), "marimba": (fx_marimba, -24), "bell": (fx_bell, -27), "glass": (fx_glass, -28), "coin": (fx_coin, -26),
         "zap": (fx_zap, -26), "boing": (fx_boing, -25), "pluck": (fx_pluck, -25), "heartbeat": (fx_heartbeat, -21), "sonar": (fx_sonar, -28), "swell": (fx_swell, -25),
         "stinger": (fx_stinger, -25), "countdown": (fx_countdown, -27), "error2": (fx_error2, -26), "success3": (fx_success3, -25), "wobble": (fx_wobble, -26),
         "whistle": (fx_whistle, -27), "tap": (fx_tap, -27), "drop": (fx_drop, -20)}
for _k, (_f, _l) in NEW20.items(): FX[_k] = _f; LEVEL[_k] = _l

def fx_riser_t():
    d = 5.1; tt = np.linspace(0, 1, int(d * SR)); f = 110 * (8 ** tt); ph = np.cumsum(f) / SR
    y = (np.sin(2 * np.pi * ph) + .45 * np.sin(2 * np.pi * 2 * ph) * tt) * (tt ** 2.2) * (1 + .12 * np.sin(2 * np.pi * 6 * np.linspace(0, d, len(tt))))
    y[-int(.03 * SR):] *= np.linspace(1, 0, int(.03 * SR)); return nrm(y, -6)
FX["riser_t"] = fx_riser_t; LEVEL["riser_t"] = -24
def rate(x, r):  # pitch/speed change by resampling
    if r == 1: return x
    return np.interp(np.arange(0, len(x) - 1, r), np.arange(len(x)), x)
# ---------------- music (original, generated here)
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
def marimba(f, d=.5):
    tt = t_(d); return (np.sin(2 * np.pi * f * tt) + .35 * np.sin(2 * np.pi * f * 3.9 * tt) * np.exp(-tt * 30)) * np.exp(-tt * 7)
def story_bed(dur, bpm=96):     # light playful pluck, sparse
    spb = 60 / bpm; out = np.zeros(int(dur * SR) + SR); pat = [72, None, 76, 79, None, 76, 74, None, 71, None, 74, 77, None, 74, 72, None]
    for k in range(int(dur / (spb / 2)) + 1):
        m = pat[k % 16]
        if m: place(out, marimba(hz(m)) * .5, k * spb / 2)
        if k % 8 == 0: place(out, marimba(hz(48 + (k // 8) % 2 * 5), .9) * .35, k * spb / 2)
    return out[:int(dur * SR)]
def groove(dur, bpm=108, drop_at=None):   # deep minimal electronic groove
    spb = 60 / bpm; out = np.zeros(int(dur * SR) + 2 * SR)
    kick = nrm(np.sin(2 * np.pi * np.cumsum(np.geomspace(120, 45, int(.35 * SR))) / SR) * env(.35, 9), -3)
    hat = nrm(bp(rng.standard_normal(int(.035 * SR)), 7000, 14000) * env(.035, 120), -14)
    rim = nrm(bp(rng.standard_normal(int(.05 * SR)), 1500, 4000) * env(.05, 60), -12)
    bassline = [33, 33, 36, 33, 31, 31, 28, 31]
    nb = int(dur / spb) + 2
    for b in range(nb):
        t0 = b * spb
        if drop_at is not None and t0 >= drop_at: break
        place(out, kick, t0, .7)
        if not CLEAN: place(out, hat, t0 + spb / 2, .35); place(out, hat, t0 + spb * .75, .18)
        if b % 4 == 2 and not CLEAN: place(out, rim, t0, .3)
        if os.environ.get("ARP") == "1":   # soft marimba arpeggio, one note per eighth, following the bass chords (Am, C, G, Em)
            arp = [57, 60, 64, 60, 60, 64, 67, 64, 55, 59, 62, 59, 52, 55, 59, 55]; ci = (b // 2) % 4
            for h in range(2):
                n = arp[(ci * 4 + (b % 2) * 2 + h) % 16]; place(out, marimba(hz(n + 12), .45) * .16, t0 + h * spb / 2)
        m = bassline[(b // 2) % 8]; tb = t_(spb * .9)
        place(out, lp1(np.sign(np.sin(2 * np.pi * hz(m) * tb)) * .5 + np.sin(2 * np.pi * hz(m) * tb), 420) * env(spb * .9, 3) * (1 - np.exp(-tb * 60)) * .32, t0 + (spb / 2 if b % 2 else 0))
        if b % 8 == 0:   # soft pad
            d = spb * 8; tt = t_(d); pad = sum(np.sin(2 * np.pi * hz(m2) * tt) for m2 in [57, 60, 64]) * (1 - np.exp(-tt * 2)) * np.exp(-tt * .3)
            place(out, lp1(pad, 1200) * .05, t0)
    if drop_at is not None:   # beat drop: one big kick + long bass ring-out
        tt = t_(2.5); ringout = np.sin(2 * np.pi * np.cumsum(np.geomspace(55, 41, len(tt))) / SR) * np.exp(-tt * 1.3) * (1 - np.exp(-tt * 90))
        place(out, kick, drop_at, 1.0); place(out, ringout * .9, drop_at)
    return out[:int(dur * SR)]
def lufs(x):
    p = f"{ROOT}/audio/_m.wav"; sf.write(p, x.astype(np.float32), SR)
    r = subprocess.run(["ffmpeg", "-nostats", "-i", p, "-af", "ebur128", "-f", "null", "-"], capture_output=True, text=True).stderr
    return float(r[r.rindex("Summary"):].split("I:")[1].split()[0])

def ambient_bed(n):
    """Very quiet space ambience + music: low drone (slow LFOs), slow chord pad (Am9, Fmaj7, Cadd9, G6), sparse high shimmer notes. Tones only, no noise."""
    t = np.arange(n) / SR; dur = n / SR
    drone = np.zeros(n)
    for f, a, lfo in ((55.0, 1.0, .031), (82.41, .6, .043), (110.0, .4, .057), (164.81, .18, .071)):
        drone += a * np.sin(2 * np.pi * f * t + .35 * np.sin(2 * np.pi * lfo * t)) * (.78 + .22 * np.sin(2 * np.pi * lfo * t + f))
    chords = [(110.0, 130.81, 164.81, 246.94), (87.31, 130.81, 164.81, 220.0), (130.81, 164.81, 196.0, 293.66), (98.0, 123.47, 146.83, 220.0)]
    pad = np.zeros(n); seg = 14.0; k = 0; t0 = -2.0
    while t0 < dur + 2:
        ch = chords[k % 4]; Ln = seg + 6.0; m0 = max(0, int(t0 * SR)); m1 = min(n, int((t0 + Ln) * SR))
        if m1 > m0:
            tt = np.arange(m0, m1) / SR - t0
            env = np.minimum(1.0, np.minimum(tt / 4.5, (Ln - tt) / 4.5)); env = np.sin(np.clip(env, 0, 1) * np.pi / 2) ** 2
            for f in ch:
                for det in (-1.6, 1.6):
                    ff = f * 2 ** (det / 1200)
                    for h, ha in ((1, 1.0), (2, .28), (3, .10)):
                        pad[m0:m1] += ha * env * np.sin(2 * np.pi * ff * h * (tt + t0) + h * (f % 7))
        k += 1; t0 += seg
    sh = np.zeros(n); r = np.random.default_rng(99); tn = 6.0
    for f in [880.0, 987.77, 1174.66, 1318.51, 1760.0]: pass
    scale = [880.0, 987.77, 1174.66, 1318.51, 1760.0, 1567.98]
    while tn < dur - 3:
        f = scale[int(r.integers(0, len(scale)))]; Ln = 7.0; tt = np.arange(int(Ln * SR)) / SR
        env = np.minimum(tt / 1.4, 1.0) ** 2 * np.exp(-np.maximum(tt - 1.4, 0) / 1.8)
        note = np.sin(2 * np.pi * f * tt) * env + .25 * np.sin(2 * np.pi * f * 2.0 * tt) * env
        for dly, g in ((0, 1.0), (.9, .45), (1.8, .22)): place(sh, note * g, tn + dly)
        tn += r.uniform(10, 22)
    d = drone * 10 ** ((-46 - lufs(drone)) / 20); p_ = pad * 10 ** ((-41 - lufs(pad)) / 20); s_ = sh * 10 ** ((-50 - lufs(sh + 1e-9)) / 20) if np.abs(sh).max() > 0 else sh
    out = d + p_ + s_; out *= np.clip(t / 5.0, 0, 1); out[-int(2 * SR):] *= np.linspace(1, 0, int(2 * SR))
    return out
if __name__ == "__main__":
    E = json.load(open(f"{ROOT}/audio/sfx_events.json")); dur = E["duration"]; n = int(dur * SR); s4 = E["s4"]
    v, _ = sf.read(f"{ROOT}/audio/vo.wav"); v = np.pad(v, (0, max(0, n - len(v))))[:n]
    v *= 10 ** ((-14.5 - lufs(v)) / 20)
    bed = story_bed(s4 + 0.3); bed[-int(.3 * SR):] *= np.linspace(1, 0, int(.3 * SR)); bed *= 10 ** ((-27.0 - lufs(bed)) / 20)
    g = groove(dur - s4, drop_at=E["end"] - s4); g *= 10 ** ((float(os.environ.get("BED_LUFS", -18.5)) - lufs(g[: int((E["end"] - s4) * SR)])) / 20)
    m = np.zeros(n); place(m, bed, 0); place(m, g, s4)
    if os.environ.get("BED_START"):   # keep the opening clean: music starts at BED_START seconds and fades in over 2 s
        tt0 = np.arange(n) / SR; m *= np.clip((tt0 - float(os.environ["BED_START"])) / 2.0, 0, 1)
    if os.environ.get("BED") == "none":   # ladder format: voice + effects only; a faint room-tone floor (-50 dBFS) so gaps are quiet, not digital silence
        rt = bp(rng.standard_normal(n), 80, 5000); m[:] = 0 if CLEAN else rt * (10 ** (-50 / 20) / (rt.std() + 1e-12))
        gd = groove(3.2, drop_at=0.0); gd = gd / (np.abs(gd).max() + 1e-9) * 10 ** (-13 / 20)
        if not os.environ.get("NOEND"): place(m, gd, E["end"])
    if os.environ.get("AMBIENT"): m = ambient_bed(n)   # MOH signature: one kick + bass ring-out on the end card; no steady music bed
    e = np.convolve(np.abs(v), np.ones(int(.12 * SR)) / int(.12 * SR), "same"); speaking = np.clip(e / (np.percentile(e, 90) * .35 + 1e-9), 0, 1)
    speaking = np.convolve(speaking, np.ones(int(.08 * SR)) / int(.08 * SR), "same")
    duck_db = np.full(n, 4.0 if os.environ.get("AMBIENT") else 9.0); hb = np.ones(n)
    if os.environ.get("HOOK_BOOST") == "1":   # the hook needs sound: music +6 dB and only 3 dB of ducking until just after the stamp, then eases back to normal over 1 s
        he = E.get("hook", 5.5); tt = np.arange(n) / SR; ramp = np.clip((he - tt) / 1.0, 0, 1); hb = 1 + (10 ** (10 / 20) - 1) * ramp; duck_db = 9.0 - 7.0 * ramp
    duck = 10 ** (-(duck_db * speaking) / 20)
    # ---- SFX bus (stereo): layered hits, per-event pitch/level humanize (never timing), equal-power pan, one shared room reverb send
    lib = {}
    for k, f in FX.items():
        x0 = f(); lib[k] = x0 if k not in LAYERS else LAYERS[k](x0) / (np.abs(LAYERS[k](x0)).max() + 1e-12) * np.abs(x0).max()   # layered, same peak as the original
    L = np.zeros(n); R = np.zeros(n); sL = np.zeros(n); sR = np.zeros(n); cnt = {}; hg = np.random.default_rng(21); side = 1
    for ev in E["events"]:
        ty = ev["type"]; r = ev.get("rate", 1) * (1 + hg.uniform(-.03, .03)) if ty not in ("sub", "trans", "whoosh", "impact", "stamp") else ev.get("rate", 1)
        x = rate(lib[ty], r) * 10 ** ((LEVEL[ty] + hg.uniform(-1.2, 1.2)) / 20) * ev.get("gain", 1)
        if ty in ("trans", "whoosh"):   # sweep L -> R across the sound
            ph = np.linspace(-.55, .55, len(x)); gl, gr = np.cos((ph + 1) * np.pi / 4), np.sin((ph + 1) * np.pi / 4)
            xl, xr = x * gl * 1.414, x * gr * 1.414
        else:
            pn = 0.0 if ty in ("sub", "impact", "stamp") else side * hg.uniform(.10, .28); side = -side
            gl, gr = pan_gains(pn); xl, xr = x * gl * 1.414, x * gr * 1.414
        place(L, xl, ev["t"]); place(R, xr, ev["t"]); w = 0.0 if CLEAN else WET.get(ty, .08); place(sL, xl, ev["t"], w); place(sR, xr, ev["t"], w); cnt[ty] = cnt.get(ty, 0) + 1
    irL, irR = make_ir(.55); wetL = fconv(sL, irL); wetR = fconv(sR, irR)
    fxL = L + wetL; fxR = R + wetR
    mono = v + m * hb * duck
    mixL = mono + fxL; mixR = mono + fxR
    mix = np.stack([mixL, mixR], 1)
    mix[-int(.01 * SR):] *= np.linspace(1, 0, int(.01 * SR))[:, None]   # 10 ms de-click only
    p = f"{ROOT}/audio/_mix.wav"; sf.write(p, mix.astype(np.float32), SR)
    g = -14.0 - lufs(mix)
    os.makedirs(f"{ROOT}/public", exist_ok=True)
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", p, "-af", f"volume={g:.2f}dB,aresample=192000,alimiter=limit=0.82:attack=1:release=50:level=false,aresample={SR}", "-ac", "2", f"{ROOT}/public/mix.wav"], check=True)
    for _ in range(3):   # exact correction on the stereo master
        r = subprocess.run(["ffmpeg", "-nostats", "-i", f"{ROOT}/public/mix.wav", "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr; r = r[r.rindex("Summary"):]
        I, TP = float(r.split("I:")[1].split()[0]), float(r.split("Peak:")[1].split()[0])
        if abs(I + 14) <= 0.2 and TP <= -1.5: break
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", f"{ROOT}/public/mix.wav", "-af", f"volume={-14 - I + 0.05:.2f}dB,aresample=192000,alimiter=limit=0.82:attack=1:release=50:level=false,aresample={SR}", f"{ROOT}/audio/_fix.wav"], check=True)
        os.replace(f"{ROOT}/audio/_fix.wav", f"{ROOT}/public/mix.wav")
    print(f"public/mix.wav {dur:.2f}s · events {cnt} · master {r.split('I:')[1].split()[0]} LUFS, TP {r.split('Peak:')[1].split()[0]} dBTP")
