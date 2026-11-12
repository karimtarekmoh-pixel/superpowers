"""Procedural space assets (original, numpy + PIL): parallax star layers, nebula/milky-way, a lit Earth with clouds + night-side city lights, a cratered Moon."""
import numpy as np
from PIL import Image, ImageFilter
rng = np.random.default_rng(7)
OUT = "hf/assets/"

def fbm(h, w, octaves=6, base=4, persistence=0.5, seed=0):
    r = np.random.default_rng(seed); out = np.zeros((h, w), np.float32); amp = 1.0; tot = 0
    for o in range(octaves):
        gh, gw = base * 2 ** o + 1, int((base * 2 ** o + 1) * w / h) + 1
        g = r.random((gh, gw)).astype(np.float32)
        im = Image.fromarray((g * 255).astype(np.uint8)).resize((w, h), Image.BICUBIC)
        out += amp * (np.asarray(im, np.float32) / 255); tot += amp; amp *= persistence
    out /= tot; out = (out - out.min()) / (out.max() - out.min() + 1e-9); return out

def bilinear(tex, u, v):  # u,v in [0,1), wraps in u
    h, w = tex.shape[:2]; x = (u % 1.0) * w; y = np.clip(v, 0, 1) * (h - 1)
    x0 = np.floor(x).astype(int) % w; x1 = (x0 + 1) % w; y0 = np.floor(y).astype(int); y1 = np.minimum(y0 + 1, h - 1)
    fx = (x - np.floor(x))[..., None] if tex.ndim == 3 else (x - np.floor(x)); fy = (y - y0)[..., None] if tex.ndim == 3 else (y - y0)
    return (tex[y0, x0] * (1 - fx) + tex[y0, x1] * fx) * (1 - fy) + (tex[y1, x0] * (1 - fx) + tex[y1, x1] * fx) * fy

def stars(w, h, n, smin, smax, bright_spikes, seed):
    r = np.random.default_rng(seed); img = np.zeros((h, w, 3), np.float32)
    ys, xs = np.mgrid[0:h, 0:w].astype(np.float32)
    cols = np.array([[1, .86, .72], [1, 1, 1], [.78, .86, 1], [1, .95, .85], [.7, .8, 1]], np.float32)
    big = []
    for i in range(n):
        x, y = r.uniform(0, w), r.uniform(0, h); s = r.uniform(smin, smax); b = r.uniform(.25, 1.0) ** 2.2 * (2.2 if i < bright_spikes else 1.0); c = cols[r.integers(0, len(cols))]
        R = int(max(3, s * 4)); x0, x1, y0, y1 = int(max(0, x - R)), int(min(w, x + R + 1)), int(max(0, y - R)), int(min(h, y + R + 1))
        gx = xs[y0:y1, x0:x1] - x; gy = ys[y0:y1, x0:x1] - y; g = np.exp(-(gx ** 2 + gy ** 2) / (2 * s ** 2)) * b
        img[y0:y1, x0:x1] += g[..., None] * c
        if i < bright_spikes: big.append((x, y, s, b, c))
    for x, y, s, b, c in big:   # diffraction spikes on the brightest few
        L = int(60 + 40 * s); y0, y1, x0, x1 = int(max(0, y - L)), int(min(h, y + L + 1)), int(max(0, x - L)), int(min(w, x + L + 1))
        gx = xs[y0:y1, x0:x1] - x; gy = ys[y0:y1, x0:x1] - y
        sp = (np.exp(-np.abs(gy) / .9) * np.exp(-np.abs(gx) / (L * .35)) + np.exp(-np.abs(gx) / .9) * np.exp(-np.abs(gy) / (L * .35))) * 0.55 * b
        img[y0:y1, x0:x1] += sp[..., None] * c
    a = np.clip(img.max(axis=2), 0, 1); rgb = np.clip(img, 0, 1)
    return Image.fromarray(np.dstack([(rgb * 255), (a * 255)]).astype(np.uint8), "RGBA")

# --- star layers
stars(2800, 1600, 2600, .55, 1.15, 0, 1).save(OUT + "stars_far.png")
stars(3400, 1900, 320, 1.2, 2.6, 16, 2).save(OUT + "stars_near.png")

# --- nebula + milky way band
W, H = 2600, 1600
n1 = fbm(H, W, 7, 3, .55, 11); n2 = fbm(H, W, 6, 5, .5, 12); n3 = fbm(H, W, 5, 8, .5, 13)
ys, xs = np.mgrid[0:H, 0:W].astype(np.float32); ang = np.deg2rad(-24)
d = ((xs - W / 2) * np.sin(ang) + (ys - H / 2) * np.cos(ang)) / H   # distance from the band axis
band = np.exp(-(d / .20) ** 2) * (.55 + .8 * n1)
dust = np.clip((n2 - .5) * 3.0, 0, 1) * np.exp(-(d / .26) ** 2)         # dark lanes
glow = np.clip(band * (1 - .75 * dust), 0, 1.2)
col_a = np.array([.20, .26, .62], np.float32); col_b = np.array([.62, .30, .58], np.float32); col_c = np.array([.16, .52, .62], np.float32)
mix = np.clip((n3 - .3) * 2.2, 0, 1)[..., None]
rgb = (col_a * (1 - mix) + col_b * mix * .8 + col_c * np.clip(n1 - .5, 0, 1)[..., None] * 1.2) * glow[..., None]
extra = (np.clip(n2 - .55, 0, 1) ** 1.3 * 1.4)[..., None] * (col_a * .5 + col_c * .5) * .55   # faint nebulosity off-band
rgb = np.clip(rgb * .9 + extra, 0, 1); alpha = np.clip(rgb.max(axis=2) * 1.1, 0, .85)
Image.fromarray(np.dstack([rgb * 255, alpha * 255]).astype(np.uint8), "RGBA").filter(ImageFilter.GaussianBlur(1.2)).save(OUT + "nebula.png")

# --- Earth (lit sphere, terrain, clouds, night lights, atmosphere)
S = 1800; Rr = S / 2 / 1.1
tex_h, tex_w = 1024, 2048
elev = fbm(tex_h, tex_w, 7, 3, .55, 21); elev = (elev - elev.min()) / (elev.max() - elev.min())
elev = elev * .75 + .25 * fbm(tex_h, tex_w, 4, 2, .5, 22)
cloud = fbm(tex_h, tex_w, 7, 4, .55, 23); city = fbm(tex_h, tex_w, 6, 12, .5, 24)
yy, xx = np.mgrid[0:S, 0:S].astype(np.float32); px = (xx - S / 2) / Rr; py = (yy - S / 2) / Rr; rr = np.sqrt(px ** 2 + py ** 2)
inside = rr <= 1.0; z = np.sqrt(np.clip(1 - rr ** 2, 0, 1))
tilt = np.deg2rad(30); y2 = py * np.cos(tilt) - z * np.sin(tilt); z2 = py * np.sin(tilt) + z * np.cos(tilt)   # tilt the globe
lat = np.arcsin(np.clip(y2, -1, 1)); lon = np.arctan2(px, z2) + np.deg2rad(-28)
u = lon / (2 * np.pi) + .5; v = lat / np.pi + .5
e = bilinear(elev, u, v); cl = bilinear(cloud, u, v * 1.0); ct = bilinear(city, u, v)
alat0 = np.abs(lat) / (np.pi / 2); wpole = np.clip((alat0 - .74) / .2, 0, 1)
e = e * (1 - wpole) + .72 * wpole; cl = cl * (1 - wpole) + .42 * wpole; ct = ct * (1 - wpole)
sea = .54; land = e > sea
L = np.array([-.62, -.42, .66], np.float32); L /= np.linalg.norm(L); N = np.stack([px, py, z], -1)
diff = np.clip((N * L).sum(-1), 0, 1); wrap = np.clip((N * L).sum(-1) * .5 + .5, 0, 1)
depth = np.clip((sea - e) / sea, 0, 1)
ocean = np.stack([.03 + .10 * (1 - depth), .17 + .27 * (1 - depth), .38 + .34 * (1 - depth)], -1)
lt = np.clip((e - sea) / (1 - sea), 0, 1); alat = np.abs(lat) / (np.pi / 2)
veg = np.stack([.16 + .22 * lt, .36 - .10 * lt, .14 + .05 * lt], -1); des = np.stack([.50, .44, .31], -1) * np.ones_like(veg)
dm = np.clip((np.abs(lat) < np.deg2rad(32)) * np.clip((cl - .5) * -4, 0, 1) * (lt > .12), 0, 1)[..., None]
landc = veg * (1 - dm * .65) + des * dm * .65
ice = np.clip((alat - .72) * 5, 0, 1)[..., None]; landc = landc * (1 - ice) + np.array([.9, .93, .97]) * ice
base = np.where(land[..., None], landc, ocean)
V = np.array([0, 0, 1], np.float32); Hh = (L + V); Hh /= np.linalg.norm(Hh); spec = np.clip((N * Hh).sum(-1), 0, 1) ** 55 * (~land) * .65
lit = base * (.05 + 1.05 * diff[..., None]) + spec[..., None] * np.array([1, .98, .9])
cloud_a = np.clip((cl - .46) * 3.0, 0, 1) * (.35 + .65 * wrap)
cloud_c = np.array([.96, .97, 1.0]) * (.12 + .95 * diff[..., None] + .05)
col = lit * (1 - cloud_a[..., None] * .8) + cloud_c * cloud_a[..., None] * .8
night = np.clip(1 - diff * 5.5, 0, 1) * land * np.clip((ct - .5) * 4.5, 0, 1) * (1 - cloud_a * .8)
col += night[..., None] * np.array([1.0, .72, .32]) * .85
rim = np.clip(1 - z, 0, 1) ** 2.6; col += rim[..., None] * np.array([.22, .5, 1.0]) * (.25 + .9 * diff[..., None]) * 1.3
col = np.clip(col, 0, 1)
halo = np.exp(-(np.clip(rr - 1, 0, None)) * 26) * (rr > 1) * (.15 + .75 * np.clip((px * L[0] + py * L[1]) * -.9 * -1 + .5, 0, 1)) * .75
halo_c = np.array([.35, .62, 1.0])
rgb = np.where(inside[..., None], col, halo_c * np.ones((S, S, 3))); alpha = np.where(inside, 1.0, np.clip(halo, 0, .8))
img = Image.fromarray(np.dstack([rgb * 255, alpha * 255]).astype(np.uint8), "RGBA"); img.save(OUT + "earth.png")

# --- Moon
M = 900; Rm = M / 2 / 1.04
mel = fbm(512, 1024, 7, 3, .55, 31); yy, xx = np.mgrid[0:M, 0:M].astype(np.float32); px = (xx - M / 2) / Rm; py = (yy - M / 2) / Rm; rr = np.sqrt(px ** 2 + py ** 2)
inside = rr <= 1; z = np.sqrt(np.clip(1 - rr ** 2, 0, 1)); lat = np.arcsin(np.clip(py, -1, 1)); lon = np.arctan2(px, z) + .6
t = bilinear(mel, lon / (2 * np.pi) + .5, lat / np.pi + .5)
crat = np.zeros((M, M), np.float32)
r2 = np.random.default_rng(5)
for i in range(150):
    cx, cy = r2.uniform(-.9, .9, 2); rad = r2.uniform(.02, .12) ** 1.1 * (1.5 if i < 10 else 1); dd = np.sqrt((px - cx) ** 2 + (py - cy) ** 2) / rad
    crat += (-.10 * np.exp(-(dd / .8) ** 2) + .09 * np.exp(-((dd - 1.0) / .18) ** 2)) * (rr < .98)
mare = np.clip((bilinear(fbm(256, 512, 3, 2, .5, 41), lon / (2 * np.pi) + .5, lat / np.pi + .5) - .5) * 3.5, 0, 1)
alb = .52 + .32 * t - .22 * mare + crat
Ls = np.array([-.55, -.45, .70], np.float32); Ls /= np.linalg.norm(Ls); dif = np.clip((np.stack([px, py, z], -1) * Ls).sum(-1), 0, 1)
shade = np.clip(alb * (.04 + 1.1 * dif ** .9), 0, 1); rgbm = np.stack([shade * 1.0, shade * .98, shade * .94], -1)
Image.fromarray(np.dstack([rgbm * 255, np.where(inside, 255, 0)]).astype(np.uint8), "RGBA").filter(ImageFilter.GaussianBlur(.6)).save(OUT + "moon.png")
print("assets ok")
