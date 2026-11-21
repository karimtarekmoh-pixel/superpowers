// ui.js — labels over footage, navy pills, board marks (cross, tick, bubble, stamp) and the white line icons used on the boards.
'use strict';

const NAVY_PILL = '#2b3656';

// navy pill tag (approved look: the ANTARCTICA tag)
function pill(ctx, text, x, y, o = {}) {
  const size = o.size || 36, sc = o.scale ?? 1, a = o.alpha ?? 1; if (sc <= 0 || a <= 0) return;
  const w = textW(ctx, text, size, o.spacing ?? 0.07) + size * 1.9, h = size * 1.9;
  ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.scale(sc, sc);
  ctx.shadowColor = 'rgba(0,0,0,.3)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 6;
  fillRR(ctx, -w / 2, -h / 2, w, h, h / 2, o.bg || NAVY_PILL); ctx.shadowColor = 'transparent';
  if (o.ring) { rr(ctx, -w / 2, -h / 2, w, h, h / 2); stroke(ctx, o.ring, 3); }
  label(ctx, text, 0, 0, { size, color: o.color || '#fff', spacing: o.spacing });
  ctx.restore();
}
function pillIn(ctx, text, x, y, t, at, o = {}) { const p = pop(t, at, 0.4); if (p > 0) pill(ctx, text, x, y, { ...o, scale: p * (o.scale ?? 1), alpha: (o.alpha ?? 1) * clamp(p * 2) }); }

// mixed-colour line of bold uppercase: parts = [[text, colour, size], ...], centred on x
function richLabel(ctx, parts, x, y, o = {}) {
  const sp = o.spacing ?? 0.07, ws = parts.map(([s, , z]) => textW(ctx, s, z, sp));
  const tot = ws.reduce((a, b) => a + b, 0) - sp * parts[parts.length - 1][2];
  let cx = o.align === 'left' ? x : x - tot / 2;
  parts.forEach(([s, c, z], i) => { label(ctx, s, cx, y + (o.base ? (parts[0][2] - z) * 0.32 : 0), { size: z, color: c, align: 'left', alpha: o.alpha, glow: o.glow, glowColor: o.glowColor, spacing: sp }); cx += ws[i]; });
}
// a word over footage: pops in with a small bounce, soft dark halo for readability
function overWord(ctx, parts, x, y, t, at, o = {}) {
  const p = pop(t, at, o.dur || 0.42); if (p <= 0) return;
  if (typeof parts === 'string') parts = [[parts, o.color || '#fff', o.size || 96]];
  ctx.save(); ctx.translate(x, y); const s = lerp(0.72, 1, p) * (o.scale || 1); ctx.scale(s, s);
  richLabel(ctx, parts, 0, 0, { alpha: clamp(p * 2.2) * (o.alpha ?? 1), glow: 34, glowColor: 'rgba(8,10,28,.85)', base: true });
  ctx.restore();
}
// dark gradient band so labels read on bright footage
function scrim(ctx, y0, y1, a = 0.5, up = false) {
  const g = ctx.createLinearGradient(0, y0, 0, y1);
  g.addColorStop(up ? 1 : 0, 'rgba(10,12,30,0)'); g.addColorStop(up ? 0 : 1, `rgba(10,12,30,${a})`);
  ctx.fillStyle = g; ctx.fillRect(0, y0, W, y1 - y0);
}
function radialScrim(ctx, x, y, r, a = 0.45) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(10,12,30,${a})`); g.addColorStop(1, 'rgba(10,12,30,0)');
  ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
}

// ---------- board marks ----------
function crossMark(ctx, x, y, s, p, col = COL.coral, lw = 7) {
  if (p <= 0) return; ctx.save(); ctx.shadowColor = rgba(col, .7); ctx.shadowBlur = 14;
  const a = clamp(p * 2), b = clamp(p * 2 - 1);
  line(ctx, x - s, y - s, lerp(x - s, x + s, a), lerp(y - s, y + s, a)); stroke(ctx, col, lw);
  if (b > 0) { line(ctx, x + s, y - s, lerp(x + s, x - s, b), lerp(y - s, y + s, b)); stroke(ctx, col, lw); }
  ctx.restore();
}
function tickMark(ctx, x, y, s, p, col = COL.coral, lw = 6) {
  drawOn(ctx, [[x - s, y], [x - s * 0.3, y + s * 0.7], [x + s, y - s * 0.75]], p, col, lw);
}
// speech bubble outline, tail at bottom-left (dir 1) or bottom-right (dir -1)
function bubblePath(ctx, x, y, w, h, dir = 1) {
  const r = Math.min(26, h / 2), tx = x - dir * w * 0.22;
  ctx.beginPath(); ctx.moveTo(x - w / 2 + r, y - h / 2); ctx.lineTo(x + w / 2 - r, y - h / 2); ctx.arcTo(x + w / 2, y - h / 2, x + w / 2, y - h / 2 + r, r);
  ctx.lineTo(x + w / 2, y + h / 2 - r); ctx.arcTo(x + w / 2, y + h / 2, x + w / 2 - r, y + h / 2, r);
  if (dir > 0) { ctx.lineTo(tx + 22, y + h / 2); ctx.lineTo(tx - 16, y + h / 2 + 36); ctx.lineTo(tx - 4, y + h / 2); }
  else { ctx.lineTo(tx + 4, y + h / 2); ctx.lineTo(tx + 16, y + h / 2 + 36); ctx.lineTo(tx - 22, y + h / 2); }
  ctx.lineTo(x - w / 2 + r, y + h / 2); ctx.arcTo(x - w / 2, y + h / 2, x - w / 2, y + h / 2 - r, r);
  ctx.lineTo(x - w / 2, y - h / 2 + r); ctx.arcTo(x - w / 2, y - h / 2, x - w / 2 + r, y - h / 2, r); ctx.closePath();
}
function stamp(ctx, text, x, y, t, at, o = {}) {
  const p = k(t, at, at + 0.22, E.outC); if (p <= 0) return;
  const s = lerp(1.8, 1, p) * (o.scale || 1), size = o.size || 46, col = o.color || COL.coral;
  const w = textW(ctx, text, size) + size * 1.2, h = size * 1.7;
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot ?? -0.12); ctx.scale(s, s); ctx.globalAlpha *= clamp(p * 1.5);
  rr(ctx, -w / 2, -h / 2, w, h, 10); stroke(ctx, col, 6);
  rr(ctx, -w / 2 + 9, -h / 2 + 9, w - 18, h - 18, 6); stroke(ctx, rgba(col, 0.6), 2.5);
  label(ctx, text, 0, 0, { size, color: col });
  ctx.restore();
}
// white video frame with rounded corners: footage (or anything) drawn by fn inside, clipped
function videoFrame(ctx, x, y, w, h, fn, o = {}) {
  ctx.save();
  if (o.shadow !== false) { ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.45)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 16; fillRR(ctx, x - w / 2, y - h / 2, w, h, o.r ?? 12, '#0d1020'); ctx.restore(); }
  ctx.save(); rr(ctx, x - w / 2, y - h / 2, w, h, o.r ?? 12); ctx.clip(); fn(ctx, x - w / 2, y - h / 2, w, h); ctx.restore();
  rr(ctx, x - w / 2, y - h / 2, w, h, o.r ?? 12); stroke(ctx, o.border || '#fff', o.lw ?? 3.5);
  ctx.restore();
}

// ---------- white line icons for the boards (origin = bottom centre, h = height) ----------
function iconPS5(ctx, x, y, h, o = {}) {
  ctx.save(); ctx.translate(x, y); const lw = o.lw || 3.5, c = o.col || '#fff';
  const bw = h * 0.15, tw = h * 0.25, cw = h * 0.07;
  // side shells flare out towards the top
  const shell = d => { ctx.beginPath(); ctx.moveTo(d * cw, -h * 0.04); ctx.quadraticCurveTo(d * (bw + h * 0.02), -h * 0.05, d * bw, -h * 0.25); ctx.quadraticCurveTo(d * (bw - h * 0.03), -h * 0.75, d * tw, -h); ctx.quadraticCurveTo(d * h * 0.12, -h * 0.97, d * cw, -h * 0.94); ctx.closePath(); };
  if (o.fill) { [-1, 1].forEach(d => { shell(d); ctx.fillStyle = o.fill; ctx.fill(); }); }
  [-1, 1].forEach(d => { shell(d); stroke(ctx, c, lw); });
  rr(ctx, -cw, -h * 0.94, cw * 2, h * 0.9, 4); stroke(ctx, c, lw);
  line(ctx, -h * 0.13, 0, h * 0.13, 0); stroke(ctx, c, lw);
  fillC(ctx, 0, -h * 0.86, 3.5, c);
  ctx.restore();
}
function iconSeriesX(ctx, x, y, h, o = {}) {
  ctx.save(); ctx.translate(x, y); const lw = o.lw || 3.5, c = o.col || '#fff', w = h * 0.5;
  if (o.fill) fillRR(ctx, -w / 2, -h, w, h, 8, o.fill);
  rr(ctx, -w / 2, -h, w, h, 8); stroke(ctx, c, lw);
  ell(ctx, 0, -h + h * 0.13, w * 0.36, h * 0.07); stroke(ctx, c, lw);
  for (let i = 1; i < 4; i++) { ell(ctx, 0, -h + h * 0.13, w * 0.36 * i / 4, h * 0.07 * i / 4); stroke(ctx, rgba(c, .5), 2); }
  fillC(ctx, -w / 2 + 16, -h + h * 0.3, 4, c);
  line(ctx, -w / 2 + 10, -8, w / 2 - 10, -8); stroke(ctx, rgba(c, .5), 2);
  ctx.restore();
}
function iconSeriesS(ctx, x, y, h, o = {}) {
  ctx.save(); ctx.translate(x, y); const lw = o.lw || 3.5, c = o.col || '#fff', hh = h * 0.86, w = hh * 0.55;
  if (o.fill) fillRR(ctx, -w / 2, -hh, w, hh, 8, o.fill);
  rr(ctx, -w / 2, -hh, w, hh, 8); stroke(ctx, c, lw);
  circ(ctx, 0, -hh + w * 0.42, w * 0.3); stroke(ctx, c, lw);
  for (let i = 0; i < 3; i++) { circ(ctx, 0, -hh + w * 0.42, w * 0.3 * (0.25 + i * 0.22)); stroke(ctx, rgba(c, .45), 2); }
  ctx.restore();
}
function iconPC(ctx, x, y, h, o = {}) {
  ctx.save(); ctx.translate(x, y); const lw = o.lw || 3.5, c = o.col || '#fff';
  const mw = h * 0.95, mh = h * 0.6;
  rr(ctx, -mw / 2 - h * 0.12, -h, mw, mh, 8); stroke(ctx, c, lw);
  line(ctx, -h * 0.12, -h + mh, -h * 0.12, -h * 0.12); stroke(ctx, c, lw);
  line(ctx, -h * 0.3, -h * 0.1, h * 0.06, -h * 0.1); stroke(ctx, c, lw);
  rr(ctx, mw / 2 - h * 0.04, -h * 0.72, h * 0.26, h * 0.72, 6); stroke(ctx, c, lw);
  line(ctx, mw / 2 + h * 0.02, -h * 0.6, mw / 2 + h * 0.16, -h * 0.6); stroke(ctx, rgba(c, .6), 2.5);
  fillC(ctx, mw / 2 + h * 0.09, -h * 0.12, 4, c);
  ctx.restore();
}
function iconPS4(ctx, x, y, h, o = {}) {
  ctx.save(); ctx.translate(x, y); const lw = o.lw || 3.5, c = o.col || '#fff', w = h * 1.05, t = h * 0.22;
  poly(ctx, [[-w / 2, 0], [w / 2 - t * 0.5, 0], [w / 2, -t * 2], [-w / 2 + t * 0.5, -t * 2]]); stroke(ctx, c, lw);
  line(ctx, -w / 2 + t * 0.25, -t, w / 2 - t * 0.25, -t); stroke(ctx, rgba(c, .6), 2.5);
  ctx.restore();
}
function iconXOne(ctx, x, y, h, o = {}) {
  ctx.save(); ctx.translate(x, y); const lw = o.lw || 3.5, c = o.col || '#fff', w = h * 1.1, t = h * 0.32;
  rr(ctx, -w / 2, -t, w, t, 6); stroke(ctx, c, lw);
  line(ctx, -w / 2 + w * 0.38, -t, -w / 2 + w * 0.38, 0); stroke(ctx, rgba(c, .6), 2.5);
  for (let i = 0; i < 5; i++) { line(ctx, -w / 2 + w * 0.48 + i * w * 0.09, -t + 8, -w / 2 + w * 0.48 + i * w * 0.09, -8); stroke(ctx, rgba(c, .35), 2); }
  ctx.restore();
}
// padlock: open 0..1 lifts and swings the shackle
function iconPadlock(ctx, x, y, s, open = 0, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); const c = o.col || '#fff', lw = (o.lw || 3.5) / s;
  ctx.save(); ctx.translate(26, -40 - open * 26); ctx.rotate(-open * 0.5); ctx.translate(-26, 0);
  ctx.beginPath(); ctx.moveTo(-26, 0); ctx.lineTo(-26, -24); ctx.arc(0, -24, 26, Math.PI, 0); ctx.lineTo(26, 0); stroke(ctx, c, lw * 1.2);
  ctx.restore();
  if (o.fill) fillRR(ctx, -44, -44, 88, 76, 12, o.fill);
  rr(ctx, -44, -44, 88, 76, 12); stroke(ctx, c, lw);
  fillC(ctx, 0, -12, 8, c); fillRR(ctx, -3.5, -12, 7, 22, 3, c);
  ctx.restore();
}
function iconDownload(ctx, x, y, s, p = 1, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); const c = o.col || '#fff', lw = (o.lw || 4) / s;
  const dy = (1 - p) * -18;
  line(ctx, 0, -40 + dy, 0, 10 + dy); stroke(ctx, c, lw);
  poly(ctx, [[-18, -8 + dy], [0, 12 + dy], [18, -8 + dy]], false); stroke(ctx, c, lw);
  poly(ctx, [[-36, 6], [-36, 32], [36, 32], [36, 6]], false); stroke(ctx, c, lw);
  ctx.restore();
}
function iconMic(ctx, x, y, s, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); const c = o.col || '#fff', lw = (o.lw || 3.5) / s;
  rr(ctx, -30, -150, 60, 104, 30); stroke(ctx, c, lw);
  for (let i = 0; i < 3; i++) { line(ctx, -18, -126 + i * 18, 18, -126 + i * 18); stroke(ctx, rgba(c, .5), 2 / s); }
  ctx.beginPath(); ctx.arc(0, -84, 48, 0.05 * Math.PI, 0.95 * Math.PI); stroke(ctx, c, lw);
  line(ctx, 0, -36, 0, 0); stroke(ctx, c, lw); line(ctx, -32, 0, 32, 0); stroke(ctx, c, lw);
  ctx.restore();
}
// article page (line drawing) with a coral headline bar; img(x,y,w,h) fills the picture box
function iconPage(ctx, x, y, w, h, o = {}) {
  const c = o.col || '#fff', lw = o.lw || 3, f = 26;
  ctx.save(); ctx.translate(x, y);
  poly(ctx, [[-w / 2, -h / 2], [w / 2 - f, -h / 2], [w / 2, -h / 2 + f], [w / 2, h / 2], [-w / 2, h / 2]]);
  ctx.fillStyle = o.fill || '#28345a'; ctx.fill(); stroke(ctx, c, lw);
  poly(ctx, [[w / 2 - f, -h / 2], [w / 2 - f, -h / 2 + f], [w / 2, -h / 2 + f]], false); stroke(ctx, c, lw * 0.8);
  fillRR(ctx, -w / 2 + 22, -h / 2 + 24, w * 0.62, 14, 7, o.head || COL.coral);
  fillRR(ctx, -w / 2 + 22, -h / 2 + 48, w * 0.42, 10, 5, 'rgba(255,255,255,.55)');
  const ih = h * 0.36, iy = -h / 2 + 72;
  if (o.img) { ctx.save(); rr(ctx, -w / 2 + 22, iy, w - 44, ih, 6); ctx.clip(); o.img(ctx, -w / 2 + 22, iy, w - 44, ih); ctx.restore(); rr(ctx, -w / 2 + 22, iy, w - 44, ih, 6); stroke(ctx, rgba(c, .8), 2); }
  else { rr(ctx, -w / 2 + 22, iy, w - 44, ih, 6); stroke(ctx, rgba(c, .5), 2); }
  for (let i = 0; i < 5; i++) { const ly = iy + ih + 24 + i * 22; if (ly > h / 2 - 16) break; fillRR(ctx, -w / 2 + 22, ly, (w - 44) * (i === 4 ? 0.55 : 0.95 - (i % 2) * 0.12), 8, 4, 'rgba(255,255,255,.3)'); }
  ctx.restore();
}
function iconTrash(ctx, x, y, s, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); const c = o.col || '#fff', lw = (o.lw || 3.5) / s;
  ctx.save(); ctx.translate(-34, -78); ctx.rotate(-(o.lid || 0)); ctx.translate(34, 0);
  line(ctx, -40, 0, 40, 0); stroke(ctx, c, lw); rr(ctx, -12, -12, 24, 12, 4); stroke(ctx, c, lw);
  ctx.restore();
  poly(ctx, [[-32, -70], [-26, 0], [26, 0], [32, -70]], false); stroke(ctx, c, lw);
  [-12, 0, 12].forEach(dx => { line(ctx, dx, -56, dx * 0.85, -14); stroke(ctx, rgba(c, .6), lw * 0.7); });
  ctx.restore();
}
function iconClock(ctx, x, y, r, hh, mm, o = {}) {
  const c = o.col || '#fff', lw = o.lw || 3.5;
  circ(ctx, x, y, r); if (o.fill) { ctx.fillStyle = o.fill; ctx.fill(); } stroke(ctx, c, lw);
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; line(ctx, x + Math.cos(a) * r * 0.8, y + Math.sin(a) * r * 0.8, x + Math.cos(a) * r * 0.9, y + Math.sin(a) * r * 0.9); stroke(ctx, rgba(c, .6), 2); }
  const ha = (hh % 12 + mm / 60) / 12 * Math.PI * 2 - Math.PI / 2, ma = mm / 60 * Math.PI * 2 - Math.PI / 2;
  line(ctx, x, y, x + Math.cos(ha) * r * 0.5, y + Math.sin(ha) * r * 0.5); stroke(ctx, o.hand || c, lw * 1.2);
  line(ctx, x, y, x + Math.cos(ma) * r * 0.75, y + Math.sin(ma) * r * 0.75); stroke(ctx, o.hand || c, lw);
  fillC(ctx, x, y, lw * 1.4, o.hand || c);
}
