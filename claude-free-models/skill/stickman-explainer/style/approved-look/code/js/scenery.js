// scenery.js — flat vector world pieces: no outlines, soft gradients, rounded shapes.
'use strict';

function cloud(ctx, x, y, s, a = 1, col = '#ffffff') {
  ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = col;
  ctx.beginPath(); ctx.arc(-50, 0, 34, Math.PI * 0.5, Math.PI * 1.5); ctx.arc(-12, -26, 42, Math.PI, Math.PI * 1.9); ctx.arc(40, -10, 34, Math.PI * 1.3, Math.PI * 0.5); ctx.closePath(); ctx.fill();
  ctx.restore();
}

// big round blob tree like the reference (two-tone canopy, darker underside)
function blobTree(ctx, x, y, s, o = {}) {
  const c = o.col || '#5f9e4f', d = shade(c, -0.16), l = shade(c, 0.12), tr = o.trunk || '#7a5236', sway = o.sway || 0;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  rr(ctx, -11, -150, 22, 150, 6); ctx.fillStyle = tr; ctx.fill();
  ctx.beginPath(); ctx.moveTo(0, -95); ctx.lineTo(28, -128); stroke(ctx, tr, 9);
  ctx.rotate(sway * 0.02);
  const blobs = o.blobs || [[0, -220, 92], [-70, -170, 66], [72, -172, 70], [-30, -150, 58], [36, -145, 60]];
  blobs.forEach(([bx, by, br]) => fillC(ctx, bx, by, br, d));
  blobs.forEach(([bx, by, br]) => fillC(ctx, bx - br * 0.08, by - br * 0.12, br * 0.9, c));
  fillC(ctx, blobs[0][0] - 26, blobs[0][1] - 30, blobs[0][2] * 0.45, l);
  ctx.restore();
}
function conifer(ctx, x, y, s, col = '#3f6b52') {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  rr(ctx, -6, -40, 12, 40, 3); ctx.fillStyle = '#5b3f2c'; ctx.fill();
  const d = shade(col, -0.15);
  for (let i = 0; i < 3; i++) { const w = 62 - i * 14, yy = -30 - i * 44; ctx.beginPath(); ctx.moveTo(-w, yy); ctx.quadraticCurveTo(0, yy - 6, w, yy); ctx.lineTo(0, yy - 76); ctx.closePath(); ctx.fillStyle = i % 2 ? col : d; ctx.fill(); ctx.beginPath(); ctx.moveTo(0, yy - 76); ctx.lineTo(w, yy); ctx.lineTo(0, yy + 2); ctx.closePath(); ctx.fillStyle = rgba('#000000', 0.08); ctx.fill(); }
  ctx.restore();
}
function palm(ctx, x, y, s, sway = 0, col = '#4f9a58') {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.beginPath(); ctx.moveTo(-10, 0); ctx.quadraticCurveTo(-20 + sway * 4, -150, 10 + sway * 8, -300); ctx.lineTo(22 + sway * 8, -298); ctx.quadraticCurveTo(-2 + sway * 4, -150, 10, 0); ctx.closePath(); ctx.fillStyle = '#8a6a48'; ctx.fill();
  ctx.translate(16 + sway * 8, -300);
  const fr = [[-2.6, 150], [-2.1, 170], [-1.4, 150], [-0.7, 160], [-0.2, 140], [0.4, 130], [-3.1, 120]];
  fr.forEach(([a, L], i) => {
    const aa = a + Math.sin(sway * 2 + i) * 0.05;
    ctx.save(); ctx.rotate(aa);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(L * 0.5, -36, L, 18); ctx.quadraticCurveTo(L * 0.5, -6, 0, 10); ctx.closePath();
    ctx.fillStyle = i % 2 ? col : shade(col, -0.15); ctx.fill(); ctx.restore();
  });
  fillC(ctx, 0, 6, 14, '#6b4e33');
  ctx.restore();
}
function fern(ctx, x, y, s, col = '#5c9a4a', sway = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  for (let i = -3; i <= 3; i++) {
    ctx.save(); ctx.rotate(i * 0.32 + sway * 0.05);
    ctx.beginPath(); ctx.moveTo(-6, 0); ctx.quadraticCurveTo(-18, -70, 0, -130 + Math.abs(i) * 12); ctx.quadraticCurveTo(18, -70, 6, 0); ctx.closePath();
    ctx.fillStyle = i % 2 ? col : shade(col, -0.12); ctx.fill(); ctx.restore();
  }
  ctx.restore();
}
function bush(ctx, x, y, s, col = '#6aa85a') {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  [[-40, -26, 34], [0, -40, 44], [42, -24, 32]].forEach(([a, b, r]) => fillC(ctx, a, b, r, shade(col, -0.12)));
  [[-42, -30, 30], [-2, -46, 38], [40, -28, 28]].forEach(([a, b, r]) => fillC(ctx, a, b, r, col));
  ctx.restore();
}
function mountainRange(ctx, pts, base, col, snow = null, snowLine = 0.75) {
  const top = Math.min(...pts.map(p => p[1]));
  poly(ctx, [[pts[0][0], base], ...pts, [pts[pts.length - 1][0], base]]); ctx.fillStyle = col; ctx.fill();
  // shaded right faces
  for (let i = 1; i < pts.length - 1; i++) {
    const [px, py] = pts[i]; if (py > pts[i - 1][1] || py > pts[i + 1][1]) continue;
    poly(ctx, [[px, py], [pts[i + 1][0], pts[i + 1][1]], [px + (pts[i + 1][0] - px) * 0.3, base]]); ctx.fillStyle = rgba('#000000', 0.07); ctx.fill();
    if (snow) {
      const h = (base - py) * (1 - snowLine);
      const l = pts[i - 1], r = pts[i + 1];
      const fl = h / (l[1] - py || 1), fr = h / (r[1] - py || 1);
      poly(ctx, [[px, py], [lerp(px, r[0], clamp(fr)), lerp(py, r[1], clamp(fr))], [px + 6, py + h * 0.75], [px - 8, py + h * 0.9], [lerp(px, l[0], clamp(fl)), lerp(py, l[1], clamp(fl))]]); ctx.fillStyle = snow; ctx.fill();
    }
  }
}

function lampPost(ctx, x, y, s, lit = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const c = '#2e3a37';
  rr(ctx, -14, -18, 28, 18, 4); ctx.fillStyle = c; ctx.fill();
  rr(ctx, -5, -300, 10, 290, 4); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-22, -300); ctx.lineTo(22, -300); ctx.lineTo(14, -350); ctx.lineTo(-14, -350); ctx.closePath(); ctx.fillStyle = lit ? '#ffe2a0' : '#dfe8e4'; ctx.fill();
  ctx.beginPath(); ctx.moveTo(-26, -350); ctx.lineTo(26, -350); ctx.lineTo(0, -372); ctx.closePath(); ctx.fillStyle = c; ctx.fill();
  rr(ctx, -24, -304, 48, 8, 3); ctx.fill();
  ctx.restore();
}

// Swiss flag on a pole; u = unfurl 0..1, t = time for waving
function swissFlag(ctx, x, y, s, u, t) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  rr(ctx, -3, -200, 6, 200, 3); ctx.fillStyle = '#d9d4cc'; ctx.fill(); fillC(ctx, 0, -202, 6, '#e8c770');
  if (u > 0) {
    const fw = 92 * u, fh = 92, n = 16;
    for (let i = 0; i < n; i++) {
      const x0 = i / n * fw, x1 = (i + 1) / n * fw;
      const w0 = Math.sin(t * 6 - i * 0.5) * 5 * (i / n) * u, w1 = Math.sin(t * 6 - (i + 1) * 0.5) * 5 * ((i + 1) / n) * u;
      const lit = 0.06 * Math.cos(t * 6 - i * 0.5);
      poly(ctx, [[x0, -196 + w0], [x1 + 0.6, -196 + w1], [x1 + 0.6, -196 + fh + w1], [x0, -196 + fh + w0]]);
      ctx.fillStyle = shade('#d52b1e', lit); ctx.fill();
    }
    // white cross (follows the wave at mid-columns)
    const cx = fw / 2, wv = Math.sin(t * 6 - n / 2 * 0.5) * 2.5 * u;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(cx - 9 * u, -196 + 18 + wv, 18 * u, 56);
    ctx.fillRect(cx - 28 * u, -196 + 37 + wv, 56 * u, 18);
  }
  ctx.restore();
}

// top-down black glove hand (reference style), pointing up (-y), fingers spread f 0..1, grip g 0..1
function topHand(ctx, x, y, s, rot, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s * (o.mirror ? -1 : 1), s);
  const sleeve = o.sleeve || '#dccdb0';
  // sleeve
  rr(ctx, -46, 40, 92, 600, 30); ctx.fillStyle = shade(sleeve, -0.1); ctx.fill();
  rr(ctx, -44, 40, 84, 600, 28); ctx.fillStyle = sleeve; ctx.fill();
  rr(ctx, -46, 40, 92, 22, 10); ctx.fillStyle = shade(sleeve, -0.18); ctx.fill();
  const ink = '#17171b', g = o.grip || 0, sp = o.spread ?? 0.4;
  // palm
  rr(ctx, -40, -40, 80, 92, 30); ctx.fillStyle = ink; ctx.fill();
  // fingers
  for (let i = 0; i < 4; i++) {
    const fx = -30 + i * 20, a = (i - 1.5) * 0.09 * sp, L = (i === 1 || i === 2 ? 74 : 62) * (1 - g * 0.55);
    ctx.save(); ctx.translate(fx, -34); ctx.rotate(a); rr(ctx, -9.5, -L, 19, L + 10, 9.5); ctx.fillStyle = ink; ctx.fill();
    if (i > 0) { line(ctx, -9.5, -L * 0.6, -9.5, 0); stroke(ctx, 'rgba(255,255,255,0.06)', 2); }
    ctx.restore();
  }
  // thumb
  ctx.save(); ctx.translate(-36, 10); ctx.rotate(-0.9 + g * 0.6); rr(ctx, -10, -58, 20, 62, 10); ctx.fillStyle = ink; ctx.fill(); ctx.restore();
  // rim
  ctx.beginPath(); ctx.moveTo(40, 30); ctx.lineTo(40, -30); stroke(ctx, rgba(COL.rim, 0.55), 3);
  ctx.restore();
}

// magnifying glass, lens centre at origin
function magnifier(ctx, r, rot = 0.7) {
  ctx.save(); ctx.rotate(rot);
  rr(ctx, -9, r + 2, 18, r * 1.5, 7); ctx.fillStyle = '#5b3a26'; ctx.fill();
  rr(ctx, -10, r - 6, 20, 16, 4); ctx.fillStyle = '#b89a5e'; ctx.fill();
  ctx.restore();
  circ(ctx, 0, 0, r); stroke(ctx, '#b89a5e', 9);
}

// fossil jaw fragment (side view)
function fossilJaw(ctx, x, y, s, rot = 0, col = '#cdb894') {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  smoothPath(ctx, [[-70, -6], [-30, -14], [30, -16], [72, -10], [80, 8], [40, 22], [-20, 24], [-66, 16]]); ctx.fillStyle = col; ctx.fill();
  smoothPath(ctx, [[-60, 10], [0, 18], [60, 10], [40, 20], [-20, 22]]); ctx.fillStyle = shade(col, -0.15); ctx.fill();
  for (let i = 0; i < 6; i++) { const tx = -50 + i * 20; rr(ctx, tx - 8, -30, 17, 20, [7, 7, 2, 2]); ctx.fillStyle = shade(col, -0.32); ctx.fill(); rr(ctx, tx - 6, -28, 6, 6, 3); ctx.fillStyle = shade(col, -0.12); ctx.fill(); }
  ctx.restore();
}

// fossil items for top-down drawer
function fossilTooth(ctx, x, y, s, rot, col = '#bda27c') {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  rr(ctx, -16, -14, 32, 28, 10); ctx.fillStyle = shade(col, -0.28); ctx.fill();
  rr(ctx, -14, -16, 28, 26, 10); ctx.fillStyle = col; ctx.fill();
  [[-6, -7], [6, -7], [-6, 4], [6, 4]].forEach(([a, b]) => fillC(ctx, a, b, 4.5, shade(col, -0.16)));
  ctx.restore();
}
function fossilVertebra(ctx, x, y, s, rot, col = '#d4c3a3') {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  rr(ctx, -40, -8, 80, 16, 8); ctx.fillStyle = shade(col, -0.12); ctx.fill();
  fillC(ctx, 0, 0, 22, col); fillC(ctx, 0, 0, 9, shade(col, -0.3));
  rr(ctx, -6, -46, 12, 30, 5); ctx.fillStyle = col; ctx.fill();
  ctx.restore();
}
function fossilSkull(ctx, x, y, s, rot, col = '#cbb38c') {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  smoothPath(ctx, [[-60, 0], [-40, -30], [10, -34], [60, -20], [80, 0], [60, 14], [10, 26], [-44, 22]]); ctx.fillStyle = col; ctx.fill();
  fillE(ctx, -14, -6, 13, 11, shade(col, -0.35)); fillE(ctx, 36, -4, 12, 6, shade(col, -0.25));
  for (let i = 0; i < 5; i++) fillRR(ctx, 0 + i * 13, 14, 9, 10, 3, shade(col, -0.3));
  ctx.restore();
}

// distant birds (simple flat "m" shapes like the reference's seagulls)
function birds(ctx, t, list, col = '#4a5560') {
  list.forEach(([x0, y0, s, sp, ph]) => {
    const x = x0 + t * sp, y = y0 + Math.sin(t * 1.3 + ph) * 8, f = Math.sin(t * 9 + ph) * 0.6;
    ctx.beginPath(); ctx.moveTo(x - 14 * s, y - 4 * s * f); ctx.quadraticCurveTo(x - 6 * s, y - 8 * s * f - 3 * s, x, y); ctx.quadraticCurveTo(x + 6 * s, y - 8 * s * f - 3 * s, x + 14 * s, y - 4 * s * f);
    stroke(ctx, col, 2.6 * s);
  });
}
