"""Equirectangular textures for Blender (original, procedural): Earth albedo / clouds / night lights / ocean mask, Moon albedo + height, star-sky environment."""
import numpy as np
from PIL import Image
OUT = "tex/"
def fbm(h, w, octaves=7, base=4, persistence=0.55, seed=0):
    r = np.random.default_rng(seed); out = np.zeros((h, w), np.float32); amp = 1.0; tot = 0
    for o in range(octaves):
        gh = base * 2 ** o + 1; gw = gh * 2 + 1
        g = r.random((gh, gw)).astype(np.float32); g[:, -1] = g[:, 0]          # wrap seam in longitude
        im = Image.fromarray((g * 65535).astype(np.uint16)).resize((w, h), Image.BICUBIC)
        out += amp * (np.asarray(im, np.float32) / 65535); tot += amp; amp *= persistence
    out /= tot; return (out - out.min()) / (out.max() - out.min() + 1e-9)
H, W = 2048, 4096
lat = (0.5 - (np.arange(H) + .5) / H)[:, None] * np.pi * np.ones((1, W)); alat = np.abs(lat) / (np.pi / 2)
e = fbm(H, W, 8, 3, .55, 21) * .78 + fbm(H, W, 5, 2, .5, 22) * .22
pole = np.clip((alat - .80) / .15, 0, 1); e = e * (1 - pole) + .62 * pole
cl = fbm(H, W, 8, 4, .56, 23); cl = cl * (1 - pole * .6) + .45 * pole * .6
ct = fbm(H, W, 6, 14, .5, 24)
sea = .54; land = e > sea; lt = np.clip((e - sea) / (1 - sea), 0, 1); depth = np.clip((sea - e) / sea, 0, 1)
ocean = np.stack([.02 + .06 * (1 - depth), .10 + .20 * (1 - depth), .26 + .28 * (1 - depth)], -1)
veg = np.stack([.13 + .18 * lt, .26 - .02 * lt, .10 + .06 * lt], -1)
des = np.stack([.52 + .1 * lt, .44 + .06 * lt, .30 + .04 * lt], -1)
dry = np.clip(1 - np.abs(np.abs(lat) - np.deg2rad(24)) / np.deg2rad(14), 0, 1) * np.clip((fbm(H, W, 5, 3, .5, 25) - .35) * 2.5, 0, 1)
landc = veg * (1 - dry[..., None]) + des * dry[..., None]
mount = np.clip((lt - .55) * 2.5, 0, 1)[..., None]; landc = landc * (1 - mount * .5) + np.array([.42, .38, .33]) * mount * .5
ice = np.clip((alat - .74) * 6, 0, 1)[..., None]; landc = landc * (1 - ice) + np.array([.88, .9, .94]) * ice
alb = np.where(land[..., None], landc, ocean * (1 - ice * .0) + 0)
alb = np.where((~land[..., None]) & (ice > .5), np.array([.8, .84, .9]) * np.ones_like(alb), alb)
Image.fromarray((np.clip(alb, 0, 1) ** (1 / 1.0) * 255).astype(np.uint8)).save(OUT + "earth_albedo.png")
Image.fromarray((np.clip((cl - .44) * 2.6, 0, 1) * 255).astype(np.uint8)).save(OUT + "earth_clouds.png")
night = land * np.clip((ct - .52) * 5, 0, 1) * (1 - ice[..., 0]) * np.clip(1 - alat * 1.3, 0, 1)
Image.fromarray((night * 255).astype(np.uint8)).save(OUT + "earth_night.png")
Image.fromarray(((~land) * 255).astype(np.uint8)).save(OUT + "earth_ocean.png")
# Moon: albedo + height with craters (cos(lat)-corrected circles)
mh, mw = 2048, 4096
base = fbm(mh, mw, 8, 3, .55, 31); mare = np.clip((fbm(mh, mw, 4, 2, .5, 41) - .52) * 3.2, 0, 1)
lat2 = (0.5 - (np.arange(mh) + .5) / mh)[:, None] * np.pi * np.ones((1, mw)); lon2 = ((np.arange(mw) + .5) / mw)[None, :] * 2 * np.pi * np.ones((mh, 1))
hgt = base * .25; r = np.random.default_rng(5)
for i in range(520):
    la = np.arcsin(r.uniform(-1, 1)); lo = r.uniform(0, 2 * np.pi); rad = (r.uniform(.006, .07) ** 1.25) * (2.2 if i < 14 else 1.0)
    # angular distance on the sphere
    cosd = np.sin(lat2) * np.sin(la) + np.cos(lat2) * np.cos(la) * np.cos(lon2 - lo)
    # restrict work to a box
    d = np.arccos(np.clip(cosd, -1, 1)) / rad
    m = d < 1.6
    if not m.any(): continue
    hgt[m] += (-.55 * np.exp(-(d[m] / .82) ** 4) + .32 * np.exp(-((d[m] - 1.0) / .16) ** 2)) * (.35 + .65 * min(1, rad * 18))
alb_m = np.clip(.50 + .30 * base - .20 * mare + .12 * np.clip(hgt, -1, 1), 0, 1)
Image.fromarray((alb_m * 255).astype(np.uint8)).save(OUT + "moon_albedo.png")
Image.fromarray((np.clip(hgt * .5 + .5, 0, 1) * 65535).astype(np.uint16)).save(OUT + "moon_height.png")
# star sky (equirect) with a milky-way band
sh, sw = 2048, 4096; sky = np.zeros((sh, sw, 3), np.float32)
r = np.random.default_rng(9); n = 26000
ys = r.integers(0, sh, n); xs = r.integers(0, sw, n); b = r.uniform(.15, 1, n) ** 3.2 * 2.2
cols = np.array([[1, .85, .7], [1, 1, 1], [.75, .85, 1], [1, .95, .85]], np.float32)[r.integers(0, 4, n)]
for dy, dx, w_ in ((0, 0, 1.0), (0, 1, .35), (1, 0, .35), (0, -1, .35), (-1, 0, .35)):
    np.add.at(sky, ((ys + dy) % sh, (xs + dx) % sw), (b * w_)[:, None] * cols)
latS = (0.5 - (np.arange(sh) + .5) / sh)[:, None] * np.pi; lonS = ((np.arange(sw) + .5) / sw)[None, :] * 2 * np.pi
bandlat = .35 * np.sin(lonS + .8)
d = (latS - bandlat) / .16; band = np.exp(-d ** 2) * (.4 + .9 * fbm(sh, sw, 7, 3, .55, 61)); dust = np.clip((fbm(sh, sw, 6, 6, .5, 62) - .5) * 3, 0, 1) * np.exp(-(d / 1.3) ** 2)
glow = np.clip(band * (1 - .8 * dust), 0, 1.5)[..., None] * np.array([.10, .11, .20]) + np.clip(fbm(sh, sw, 5, 4, .5, 63) - .6, 0, 1)[..., None] * np.array([.10, .04, .12]) * .6
sky = np.clip(sky + glow, 0, 1)
Image.fromarray((sky * 255).astype(np.uint8)).save(OUT + "stars_env.png")
print("textures ok")
