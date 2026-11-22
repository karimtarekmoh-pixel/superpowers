// core.js — shared helpers: timing, easing, colour, primitives, text, boards, camera, blur layers .
'use strict';
// Starter sizes (landscape). For a vertical Short set W=1080, H=1920, BAR=0 and lay shots out for the tall frame.
const W = 1920, H = 1080, BAR = 60, FPS = 30, DURATION = 45.6;

const COL = {
  navyEdge: '#222b49', navyMid: '#2f3d63',
  coral: '#e8574e', coralSoft: '#f08a80', pink: '#f4a9b8', pinkDeep: '#e47b93',
  white: '#ffffff', dim: 'rgba(255,255,255,0.28)', ice: '#bfe4f5', iceDeep: '#7cc3e6',
  gold: '#f5c26b',
  ink: '#16161a', rim: '#f7cf9f',
  jacket: '#ef8a33', jacketDark: '#c96a1f', trousers: '#3d4049', sneaker: '#f4f4f2',
};

// ---------- math / timing ----------
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, t) => a + (b - a) * t;
const inv = (a, b, x) => clamp((x - a) / (b - a));
const E = {
  lin: t => t,
  inQ: t => t * t,
  outQ: t => 1 - (1 - t) * (1 - t),
  ioQ: t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
  outC: t => 1 - Math.pow(1 - t, 3),
  inC: t => t * t * t,
  ioC: t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  ioS: t => -(Math.cos(Math.PI * t) - 1) / 2,
  outE: t => t >= 1 ? 1 : 1 - Math.pow(2, -10 * t),
  ioE: t => t <= 0 ? 0 : t >= 1 ? 1 : t < .5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2,
  outB: t => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
  outB2: t => { const c1 = 2.6, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
};
// eased progress of x between a and b
const k = (x, a, b, ease = E.ioC) => ease(inv(a, b, x));
// pop-in scale with a small bounce (BRAND: objects pop in with a small bounce)
const pop = (x, a, d = 0.38) => x <= a ? 0 : E.outB(inv(a, a + d, x));
const fadeIn = (x, a, d = 0.25) => k(x, a, a + d, E.outQ);
const fadeOut = (x, a, d = 0.25) => 1 - k(x, a, a + d, E.inQ);
const wobble = (x, f = 1, ph = 0) => Math.sin(x * f * Math.PI * 2 + ph);

function rng(seed) { // mulberry32
  let a = seed >>> 0;
  return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
// smooth 1D value noise for drifting things
function noise1(x, seed = 0) {
  const h = n => { const s = Math.sin(n * 127.1 + seed * 311.7) * 43758.5453; return s - Math.floor(s); };
  const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f);
  return lerp(h(i), h(i + 1), u) * 2 - 1;
}

// ---------- colour ----------
function hex2rgb(h) { h = h.replace('#', ''); if (h.length === 3) h = h.split('').map(c => c + c).join(''); const n = parseInt(h, 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
function rgba(h, a) { const [r, g, b] = hex2rgb(h); return `rgba(${r},${g},${b},${a})`; }
function mix(h1, h2, t) { const a = hex2rgb(h1), b = hex2rgb(h2); return '#' + a.map((v, i) => Math.round(lerp(v, b[i], t)).toString(16).padStart(2, '0')).join(''); }
const shade = (h, t) => t >= 0 ? mix(h, '#ffffff', t) : mix(h, '#000000', -t);

// ---------- primitives ----------
function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
function circ(ctx, x, y, r) { ctx.beginPath(); ctx.arc(x, y, Math.max(0, r), 0, Math.PI * 2); }
function ell(ctx, x, y, rx, ry, rot = 0) { ctx.beginPath(); ctx.ellipse(x, y, Math.max(0, rx), Math.max(0, ry), rot, 0, Math.PI * 2); }
function fillC(ctx, x, y, r, c) { circ(ctx, x, y, r); ctx.fillStyle = c; ctx.fill(); }
function fillE(ctx, x, y, rx, ry, c, rot = 0) { ell(ctx, x, y, rx, ry, rot); ctx.fillStyle = c; ctx.fill(); }
function fillRR(ctx, x, y, w, h, r, c) { rr(ctx, x, y, w, h, r); ctx.fillStyle = c; ctx.fill(); }
function poly(ctx, pts, close = true) { ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); if (close) ctx.closePath(); }
function fillPoly(ctx, pts, c) { poly(ctx, pts); ctx.fillStyle = c; ctx.fill(); }
// smooth closed blob through points (Catmull-Rom -> bezier)
function smoothPath(ctx, pts, closed = true, tension = 0.5) {
  const n = pts.length; ctx.beginPath();
  const P = i => closed ? pts[(i + n) % n] : pts[clamp(i, 0, n - 1)];
  ctx.moveTo(pts[0][0], pts[0][1]);
  const segs = closed ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
    const c1 = [p1[0] + (p2[0] - p0[0]) * tension / 3, p1[1] + (p2[1] - p0[1]) * tension / 3];
    const c2 = [p2[0] - (p3[0] - p1[0]) * tension / 3, p2[1] - (p3[1] - p1[1]) * tension / 3];
    ctx.bezierCurveTo(c1[0], c1[1], c2[0], c2[1], p2[0], p2[1]);
  }
  if (closed) ctx.closePath();
}
function line(ctx, x1, y1, x2, y2) { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); }
function stroke(ctx, c, w, cap = 'round') { ctx.strokeStyle = c; ctx.lineWidth = w; ctx.lineCap = cap; ctx.lineJoin = 'round'; ctx.stroke(); }

// polyline with draw-on progress p (0..1)
function polyLen(pts) { let L = 0; for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); return L; }
function partial(pts, p) {
  if (p >= 1) return pts.slice(); if (p <= 0) return [pts[0]];
  const L = polyLen(pts) * p; let acc = 0; const out = [pts[0]];
  for (let i = 1; i < pts.length; i++) {
    const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    if (acc + d >= L) { const f = (L - acc) / d; out.push([lerp(pts[i - 1][0], pts[i][0], f), lerp(pts[i - 1][1], pts[i][1], f)]); return out; }
    acc += d; out.push(pts[i]);
  }
  return out;
}
function drawOn(ctx, pts, p, c = '#fff', w = 3.5, close = false) {
  if (p <= 0) return; const q = partial(close && p >= 1 ? pts.concat([pts[0]]) : (close ? pts.concat([pts[0]]) : pts), p);
  poly(ctx, q, false); stroke(ctx, c, w);
}
// sample a quadratic / cubic curve into points
function bez(p0, p1, p2, p3, n = 24) { const o = []; for (let i = 0; i <= n; i++) { const t = i / n, u = 1 - t; o.push([u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0], u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1]]); } return o; }
function arcPts(cx, cy, r, a0, a1, n = 48) { const o = []; for (let i = 0; i <= n; i++) { const a = lerp(a0, a1, i / n); o.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } return o; }

// ---------- text ----------
// Bold uppercase geometric sans with letter spacing (BRAND text rules)
function label(ctx, text, x, y, o = {}) {
  const size = o.size || 40, a = o.alpha ?? 1; if (a <= 0) return;
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.font = `${o.weight || 800} ${size}px Mont`;
  ctx.letterSpacing = `${(o.spacing ?? 0.07) * size}px`;
  ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'middle';
  let tx = x;
  // canvas letterSpacing adds trailing space; compensate when centred
  if ((o.align || 'center') === 'center') tx += (o.spacing ?? 0.07) * size / 2;
  if ((o.align) === 'right') tx += (o.spacing ?? 0.07) * size;
  if (o.scale && o.scale !== 1) { ctx.translate(x, y); ctx.scale(o.scale, o.scale); ctx.translate(-x, -y); }
  if (o.glow) { ctx.shadowColor = o.glowColor || rgba(o.color || '#fff', .55); ctx.shadowBlur = o.glow; }
  ctx.fillStyle = o.color || '#fff';
  ctx.fillText(text, tx, y + size * 0.04);
  ctx.restore();
}
function textW(ctx, text, size, spacing = 0.07, weight = 800) { ctx.save(); ctx.font = `${weight} ${size}px Mont`; ctx.letterSpacing = `${spacing * size}px`; const w = ctx.measureText(text).width; ctx.restore(); return w; }
// label that slides up + fades in at time a (reference: labels fade/rise in one by one)
function labelIn(ctx, text, x, y, t, a, o = {}) {
  const p = k(t, a, a + (o.dur || 0.35), E.outC);
  if (p <= 0) return;
  label(ctx, text, x, y + (1 - p) * (o.rise ?? 14), { ...o, alpha: (o.alpha ?? 1) * p });
}

// ---------- backgrounds ----------
function boardBG(ctx, cx = W / 2, cy = H / 2) {
  const g = ctx.createRadialGradient(cx, cy, 40, cx, cy, 1150);
  g.addColorStop(0, COL.navyMid); g.addColorStop(0.55, '#29355a'); g.addColorStop(1, COL.navyEdge);
  ctx.fillStyle = g; ctx.fillRect(-W, -H, W * 3, H * 3);
}
function vignette(ctx, s = 0.35, col = '0,0,0') {
  const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.45, W / 2, H / 2, H * 1.1);
  g.addColorStop(0, `rgba(${col},0)`); g.addColorStop(1, `rgba(${col},${s})`);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}
function letterbox(ctx) { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, BAR); ctx.fillRect(0, H - BAR, W, BAR); }
function vgrad(ctx, y0, y1, stops) { const g = ctx.createLinearGradient(0, y0, 0, y1); stops.forEach(([o, c]) => g.addColorStop(o, c)); return g; }

// ---------- camera ----------
// cam = {x, y, z, r}: point (x,y) of the world appears at screen centre, zoom z.
function applyCam(ctx, cam, depth = 1) {
  const z = 1 + (cam.z - 1) * depth;
  const x = W / 2 + (cam.x - W / 2) * depth, y = H / 2 + (cam.y - H / 2) * depth;
  ctx.translate(W / 2, H / 2); if (cam.r) ctx.rotate(cam.r * depth); ctx.scale(z, z); ctx.translate(-x, -y);
}
// gentle hand-held drift used on most shots
function drift(t, amt = 4, seed = 1) { return [noise1(t * 0.35, seed) * amt, noise1(t * 0.3, seed + 9) * amt]; }

// ---------- offscreen layers (depth-of-field blur, outlines) ----------
const _pool = {};
function layerCanvas(name, w = W, h = H) {
  let c = _pool[name];
  if (!c || c.width !== w || c.height !== h) { c = document.createElement('canvas'); c.width = w; c.height = h; _pool[name] = c; }
  const x = c.getContext('2d'); x.setTransform(1, 0, 0, 1, 0, 0); x.globalAlpha = 1; x.globalCompositeOperation = 'source-over'; x.filter = 'none'; x.clearRect(0, 0, w, h);
  return [c, x];
}
// draw fn into an offscreen canvas, then composite it blurred
function blurred(ctx, px, fn, name = 'blur') {
  if (px < 0.3) { ctx.save(); fn(ctx); ctx.restore(); return; }
  const [c, x] = layerCanvas(name); x.save(); fn(x); x.restore();
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.filter = `blur(${px}px)`; ctx.drawImage(c, 0, 0); ctx.restore();
}
// union outline of a group of shapes: fn(ctx) must build+fill shapes. Draws only the outer contour.
function outlineGroup(ctx, lw, color, fn, alpha = 1, fillCol = null) {
  const [c, x] = layerCanvas('outline');
  const m = ctx.getTransform(); x.setTransform(m);
  // fat silhouette in colour
  x.save(); x.fillStyle = color; x.strokeStyle = color; x.lineWidth = lw * 2; x.lineJoin = 'round'; x.lineCap = 'round'; fn(x, true); x.restore();
  // punch out the interior
  x.save(); x.globalCompositeOperation = 'destination-out'; x.fillStyle = '#000'; x.strokeStyle = '#000'; x.lineWidth = 0.01; fn(x, false); x.restore();
  if (fillCol) { x.save(); x.globalCompositeOperation = 'destination-over'; x.fillStyle = fillCol; x.strokeStyle = fillCol; x.lineWidth = 0.01; fn(x, false); x.restore(); }
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha *= alpha; ctx.drawImage(c, 0, 0); ctx.restore();
}

// soft glow dot / sparkle used on boards
function glowDot(ctx, x, y, r, c, a = 1) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, rgba(c, 0.55 * a)); g.addColorStop(1, rgba(c, 0));
  ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
}
function sparkle(ctx, x, y, s, a = 1, c = '#fff') {
  if (a <= 0 || s <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = c; ctx.beginPath();
  ctx.moveTo(x, y - s); ctx.quadraticCurveTo(x, y, x + s, y); ctx.quadraticCurveTo(x, y, x, y + s); ctx.quadraticCurveTo(x, y, x - s, y); ctx.quadraticCurveTo(x, y, x, y - s); ctx.fill(); ctx.restore();
}
// white "poof" puff used when things vanish
function puff(ctx, x, y, r, p, seed = 3, c = '#ffffff') {
  if (p <= 0 || p >= 1) return; const R = rng(seed);
  ctx.save();
  for (let i = 0; i < 9; i++) {
    const a = R() * Math.PI * 2, d = r * (0.3 + 0.9 * E.outC(p)) * (0.6 + R() * 0.5);
    const rr_ = r * 0.32 * (1 - p) * (0.6 + R() * 0.6);
    ctx.globalAlpha = (1 - p) * 0.9; fillC(ctx, x + Math.cos(a) * d, y + Math.sin(a) * d * 0.7, rr_, c);
  }
  ctx.restore();
}

// images
const IMG = {};
function loadImages(list) { return Promise.all(Object.entries(list).map(([k_, src]) => new Promise((res, rej) => { const i = new Image(); i.onload = () => { IMG[k_] = i; res(); }; i.onerror = rej; i.src = src; }))); }
