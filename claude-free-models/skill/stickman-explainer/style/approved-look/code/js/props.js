// props.js — flat drawn objects for this video's scenes: couch, TV, controller, game case, suitcase,
// stopwatch, wallet, code card, consoles, lamp, plant. No outlines, soft shading, rounded shapes.
'use strict';

// our own generic cover art: a sunset over the sea with palms (no game logo)
function coverArt(ctx, x, y, w, h) {
  ctx.save(); rr(ctx, x, y, w, h, Math.min(w, h) * 0.04); ctx.clip();
  ctx.fillStyle = vgrad(ctx, y, y + h, [[0, '#4b2a7b'], [0.45, '#e2577f'], [0.7, '#f7a35c'], [1, '#2f2253']]); ctx.fillRect(x, y, w, h);
  fillC(ctx, x + w * 0.5, y + h * 0.62, w * 0.2, '#ffd38a');
  ctx.fillStyle = '#2f2253'; ctx.fillRect(x, y + h * 0.66, w, h * 0.34);
  for (let i = 0; i < 4; i++) fillRR(ctx, x + w * (0.3 + i * 0.03), y + h * (0.7 + i * 0.05), w * (0.4 - i * 0.06), h * 0.012, 2, 'rgba(255,211,138,.6)');
  // skyline + palms
  ctx.fillStyle = '#3a2459';[[0.06, 0.5, 0.08], [0.15, 0.42, 0.07], [0.72, 0.46, 0.09], [0.83, 0.38, 0.07]].forEach(([a, b, c]) => ctx.fillRect(x + w * a, y + h * b, w * c, h * (0.66 - b)));
  const palmS = (px, py, s) => { ctx.save(); ctx.translate(px, py); ctx.scale(s, s); ctx.beginPath(); ctx.moveTo(-3, 0); ctx.quadraticCurveTo(-6, -40, 4, -80); ctx.lineTo(8, -80); ctx.quadraticCurveTo(-1, -40, 3, 0); ctx.fillStyle = '#1e1636'; ctx.fill(); for (let i = 0; i < 6; i++) { ctx.save(); ctx.translate(6, -80); ctx.rotate(-2.7 + i * 0.75); ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(18, -8, 36, 6); ctx.quadraticCurveTo(18, 0, 0, 3); ctx.fill(); ctx.restore(); } ctx.restore(); };
  palmS(x + w * 0.14, y + h * 0.9, w / 160); palmS(x + w * 0.86, y + h * 0.95, w / 140);
  fillRR(ctx, x, y, w, h * 0.09, 0, 'rgba(255,255,255,.92)');
  fillRR(ctx, x + w * 0.06, y + h * 0.03, w * 0.22, h * 0.03, 2, '#3f4a74');
  ctx.restore();
}
// a closed game case standing up (front), origin = centre
function gameCase(ctx, x, y, w, rot = 0) {
  const h = w * 1.27;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  fillRR(ctx, -w / 2, -h / 2, w, h, w * 0.05, '#1d4f9a');
  fillRR(ctx, -w / 2 + w * 0.05, -h / 2 + w * 0.05, w * 0.9, h - w * 0.1, w * 0.03, '#e9eef6');
  coverArt(ctx, -w / 2 + w * 0.06, -h / 2 + w * 0.06, w * 0.88, h - w * 0.12);
  ctx.fillStyle = 'rgba(255,255,255,.14)'; poly(ctx, [[-w / 2, -h / 2], [-w * 0.1, -h / 2], [-w / 2, h * 0.1]]); ctx.fill();
  ctx.restore();
}
// gamepad (generic), origin = centre, width ~ 120*s
function controller(ctx, x, y, s, rot = 0, col = '#f1f2f5') {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  const d = shade(col, -0.14);
  ctx.beginPath(); ctx.moveTo(-40, -22); ctx.lineTo(40, -22); ctx.quadraticCurveTo(60, -22, 64, 4); ctx.quadraticCurveTo(70, 40, 52, 42); ctx.quadraticCurveTo(38, 44, 30, 18); ctx.lineTo(-30, 18); ctx.quadraticCurveTo(-38, 44, -52, 42); ctx.quadraticCurveTo(-70, 40, -64, 4); ctx.quadraticCurveTo(-60, -22, -40, -22); ctx.closePath();
  ctx.fillStyle = col; ctx.fill();
  fillRR(ctx, -24, -20, 48, 22, 6, '#2b2f3a');
  fillC(ctx, -20, 10, 8, '#2b2f3a'); fillC(ctx, 20, 10, 8, '#2b2f3a');
  [[-44, -6], [-38, -6]].forEach(() => { }); fillRR(ctx, -50, -10, 18, 6, 2, d); fillRR(ctx, -44, -16, 6, 18, 2, d);
  [[44, -14, '#e8574e'], [52, -6, '#3aa59a'], [36, -6, '#f1bf2c'], [44, 2, '#5b8de0']].forEach(([a, b, c]) => fillC(ctx, a, b, 4, c));
  ctx.restore();
}
// flat-screen TV, origin = bottom centre of the stand; screen(ctx,x,y,w,h) draws the picture (clipped)
function tvSet(ctx, x, y, w, screen, o = {}) {
  const h = w * 0.58, sy = y - (o.stand ?? 40) - h;
  ctx.save();
  if (o.glow) glowDot(ctx, x, sy + h / 2, w * 0.9, o.glowCol || '#9fd3ff', o.glow);
  if (o.stand !== 0) { fillRR(ctx, x - w * 0.2, y - 10, w * 0.4, 10, 5, '#23252c'); fillRR(ctx, x - 9, y - (o.stand ?? 40), 18, (o.stand ?? 40), 4, '#2c2f37'); }
  fillRR(ctx, x - w / 2 - 10, sy - 10, w + 20, h + 20, 10, '#1b1d23');
  ctx.save(); rr(ctx, x - w / 2, sy, w, h, 4); ctx.clip();
  ctx.fillStyle = '#0d1424'; ctx.fillRect(x - w / 2, sy, w, h);
  if (screen) screen(ctx, x - w / 2, sy, w, h);
  const g = ctx.createLinearGradient(x - w / 2, sy, x + w / 2, sy + h); g.addColorStop(0, 'rgba(255,255,255,.10)'); g.addColorStop(0.5, 'rgba(255,255,255,0)'); ctx.fillStyle = g; ctx.fillRect(x - w / 2, sy, w, h);
  ctx.restore();
  ctx.restore();
  return [x - w / 2, sy, w, h];
}
// couch seen from the front: origin = floor centre
function couchFront(ctx, x, y, w, col = '#4f5f8f') {
  const d = shade(col, -0.18), l = shade(col, 0.08);
  ctx.save(); ctx.translate(x, y);
  fillRR(ctx, -w / 2 + 30, -330, w - 60, 230, 40, d);                 // back
  fillRR(ctx, -w / 2 + 50, -310, (w - 100) / 2 - 6, 200, 30, col);     // cushions
  fillRR(ctx, 6, -310, (w - 100) / 2 - 6, 200, 30, col);
  fillRR(ctx, -w / 2 + 40, -140, w - 80, 110, 26, l);                  // seat
  ctx.fillStyle = 'rgba(0,0,0,.12)'; ctx.fillRect(-w / 2 + 40, -60, w - 80, 30);
  fillRR(ctx, -w / 2, -230, 90, 200, 36, col); fillRR(ctx, w / 2 - 90, -230, 90, 200, 36, col);   // arms
  fillRR(ctx, -w / 2 + 14, -230, 60, 30, 15, l); fillRR(ctx, w / 2 - 74, -230, 60, 30, 15, l);
  fillRR(ctx, -w / 2 + 30, -32, 22, 32, 4, '#3a2b22'); fillRR(ctx, w / 2 - 52, -32, 22, 32, 4, '#3a2b22');
  ctx.restore();
}
// couch in side view facing right: origin = floor at the back of the couch
function couchSide(ctx, x, y, w, col = '#4f5f8f') {
  const d = shade(col, -0.18), l = shade(col, 0.08);
  ctx.save(); ctx.translate(x, y);
  fillRR(ctx, 0, -330, 80, 300, 36, d);
  fillRR(ctx, 20, -150, w - 20, 120, 28, l);
  fillRR(ctx, w - 70, -200, 80, 170, 30, col);
  ctx.fillStyle = 'rgba(0,0,0,.12)'; ctx.fillRect(30, -60, w - 40, 30);
  fillRR(ctx, 20, -32, 20, 32, 4, '#3a2b22'); fillRR(ctx, w - 30, -32, 20, 32, 4, '#3a2b22');
  ctx.restore();
}
function floorLamp(ctx, x, y, s, lit = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  if (lit > 0) glowDot(ctx, 0, -420, 420, '#ffc477', lit);
  fillRR(ctx, -40, -10, 80, 12, 6, '#2b2a2e'); fillRR(ctx, -4, -400, 8, 395, 4, '#2b2a2e');
  ctx.beginPath(); ctx.moveTo(-60, -380); ctx.lineTo(60, -380); ctx.lineTo(40, -480); ctx.lineTo(-40, -480); ctx.closePath(); ctx.fillStyle = lit ? '#ffd9a0' : '#e8dcc6'; ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fillRect(-30, -470, 14, 84);
  ctx.restore();
}
function plant(ctx, x, y, s, wilt = 0, col = '#5fa05a') {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const lc = mix(col, '#a08a4a', wilt);
  for (let i = -3; i <= 3; i++) {
    ctx.save(); ctx.translate(0, -70); ctx.rotate(i * 0.32 + wilt * i * 0.25);
    const L = 110 - Math.abs(i) * 8;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(-26, -L * 0.5, wilt * i * 30, -L * (1 - wilt * 0.6)); ctx.quadraticCurveTo(26, -L * 0.5, 0, 0);
    ctx.fillStyle = i % 2 ? lc : shade(lc, -0.12); ctx.fill(); ctx.restore();
  }
  ctx.beginPath(); ctx.moveTo(-44, -80); ctx.lineTo(44, -80); ctx.lineTo(34, 0); ctx.lineTo(-34, 0); ctx.closePath(); ctx.fillStyle = '#d0704f'; ctx.fill();
  fillRR(ctx, -48, -88, 96, 16, 5, '#e08262');
  ctx.restore();
}
function pizzaBox(ctx, x, y, w, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  fillRR(ctx, -w / 2, -w * 0.12, w, w * 0.12, 3, '#c9a477'); ctx.fillStyle = '#b58f62'; ctx.fillRect(-w / 2, -w * 0.035, w, w * 0.035);
  fillC(ctx, 0, -w * 0.06, w * 0.03, '#d9534a');
  ctx.restore();
}
// suitcase (side view), origin = floor centre; lid = 0 closed .. 1 bulging open, stuff = things poking out
function suitcase(ctx, x, y, w, lid, t) {
  const h = w * 0.36;
  ctx.save(); ctx.translate(x, y);
  fillE(ctx, 0, 4, w * 0.55, 14, 'rgba(60,30,20,.2)');
  // things squeezed out of the gap
  const gap = lid * 46;
  if (gap > 1) {
    const R = rng(4);
    const stuff = [[-0.36, '#f4efe6', 0.2], [-0.2, '#ffffff', -0.15], [-0.02, '#f4efe6', 0.3], [0.16, '#f6f1e7', -0.25], [0.32, '#ffffff', 0.1]];
    stuff.forEach(([fx, c, r], i) => {
      ctx.save(); ctx.translate(fx * w, -h - 4); ctx.rotate(r + Math.sin(t * 6 + i) * 0.04 * lid);
      fillRR(ctx, -46, -gap - 30, 92, 64, 4, c); fillRR(ctx, -34, -gap - 20, 52, 9, 4, COL.coral); fillRR(ctx, -34, -gap - 4, 64, 6, 3, '#c9c2b5'); fillRR(ctx, -34, -gap + 8, 48, 6, 3, '#c9c2b5');
      ctx.restore();
    });
    // a film reel and a microphone stuck in the gap
    ctx.save(); ctx.translate(-w * 0.1, -h - gap * 0.7); ctx.rotate(-0.4); fillC(ctx, 0, 0, 34, '#3d4352'); fillC(ctx, 0, 0, 10, '#9aa3b5');[0, 1, 2, 3, 4].forEach(i => fillC(ctx, Math.cos(i * 1.256) * 21, Math.sin(i * 1.256) * 21, 7, '#9aa3b5')); ctx.restore();
    ctx.save(); ctx.translate(w * 0.27, -h - gap * 0.6); ctx.rotate(0.7); fillRR(ctx, -9, -10, 18, 70, 8, '#2b2f3a'); fillRR(ctx, -18, -50, 36, 46, 18, '#8d95a6'); ctx.restore();
  }
  // bottom shell
  fillRR(ctx, -w / 2, -h, w, h, 18, '#c8553d');
  fillRR(ctx, -w / 2, -h, w, h * 0.18, [18, 18, 0, 0], '#b24a35');
  ctx.fillStyle = 'rgba(0,0,0,.1)'; ctx.fillRect(-w / 2 + 10, -h * 0.5, w - 20, 6);
  // lid
  ctx.save(); ctx.translate(-w / 2, -h - 2); ctx.rotate(-lid * 0.16); ctx.translate(0, -gap * 0.35);
  fillRR(ctx, 0, -h * 0.55, w, h * 0.6, [22, 22, 6, 6], '#d9654a');
  ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.fillRect(20, -h * 0.45, w - 40, 8);
  ctx.restore();
  // latches
  [-0.3, 0.3].forEach(fx => { fillRR(ctx, fx * w - 18, -h - 12 - gap * 0.5 * (1 - Math.abs(fx)), 36, 26, 6, '#e9c46a'); });
  fillRR(ctx, -w * 0.12, -h * 1.75 - gap * 0.6, w * 0.24, 22, 11, '#3a2b24');
  ctx.restore();
}
function stopwatch(ctx, x, y, r, txt, t, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0);
  fillRR(ctx, -r * 0.18, -r * 1.32, r * 0.36, r * 0.3, 6, COL.coral);
  fillRR(ctx, -r * 0.08, -r * 1.12, r * 0.16, r * 0.2, 3, '#3a3f4f');
  fillC(ctx, 0, 0, r * 1.06, '#3a3f4f'); fillC(ctx, 0, 0, r * 0.92, '#fbf8f2');
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; line(ctx, Math.cos(a) * r * 0.74, Math.sin(a) * r * 0.74, Math.cos(a) * r * 0.84, Math.sin(a) * r * 0.84); stroke(ctx, '#9aa0ad', 3); }
  if (txt) label(ctx, txt, 0, r * 0.28, { size: r * 0.42, color: '#2b3656' });
  const a = (o.hand ?? t * 2) - Math.PI / 2; line(ctx, 0, 0, Math.cos(a) * r * 0.66, Math.sin(a) * r * 0.66); stroke(ctx, COL.coral, 5); fillC(ctx, 0, 0, 6, COL.coral);
  ctx.restore();
}
function wallet(ctx, x, y, s, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  fillRR(ctx, -36, -10, 50, 20, 3, '#7fbf7a'); fillRR(ctx, -40, -2, 52, 20, 3, '#6aae66');
  fillRR(ctx, -44, -24, 88, 58, 10, '#6b4630'); fillRR(ctx, -44, -24, 88, 22, [10, 10, 4, 4], '#5a3a27');
  fillC(ctx, 30, -13, 5, '#e9c46a');
  ctx.restore();
}
// small download-code slip, origin = centre
function codeCard(ctx, x, y, w, rot = 0) {
  const h = w * 0.62;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.25)'; ctx.shadowBlur = w * 0.08; ctx.shadowOffsetY = w * 0.03; fillRR(ctx, -w / 2, -h / 2, w, h, w * 0.04, '#fbfaf6'); ctx.restore();
  fillRR(ctx, -w / 2, -h / 2, w, h * 0.22, [w * 0.04, w * 0.04, 0, 0], COL.coral);
  iconDownload(ctx, -w * 0.36, -h * 0.39, w * 0.0018 * 1.2, 1, { col: '#fff', lw: 2 });
  label(ctx, 'DOWNLOAD CODE', w * 0.04, -h * 0.39, { size: w * 0.06, color: '#fff' });
  for (let i = 0; i < 3; i++) { fillRR(ctx, -w * 0.42 + i * w * 0.29, -h * 0.04, w * 0.25, h * 0.2, w * 0.02, '#e6e3db'); label(ctx, 'XXXX', -w * 0.295 + i * w * 0.29, h * 0.06, { size: w * 0.055, color: '#4a4f5e', spacing: 0.12 }); }
  fillRR(ctx, -w * 0.42, h * 0.28, w * 0.5, h * 0.05, 3, '#d8d4ca'); fillRR(ctx, -w * 0.42, h * 0.38, w * 0.34, h * 0.05, 3, '#d8d4ca');
  ctx.restore();
}
// a console in flat colour (generic tall tower / slab), origin = floor centre
function consoleTower(ctx, x, y, h, col = '#24262d', o = {}) {
  const w = h * (o.w || 0.5);
  ctx.save(); ctx.translate(x, y);
  fillRR(ctx, -w / 2, -h, w, h, 8, col); ctx.fillStyle = 'rgba(255,255,255,.07)'; ctx.fillRect(-w / 2, -h, w * 0.3, h);
  fillE(ctx, 0, -h + 8, w * 0.36, 6, shade(col, 0.1));
  fillC(ctx, -w / 2 + 12, -h + 26, 4, o.led || '#f2f2f2');
  ctx.restore();
}
// a white console box (retail), origin = floor centre
function consoleBox(ctx, x, y, w, txt = 'PRO') {
  const h = w * 0.72;
  ctx.save(); ctx.translate(x, y);
  fillRR(ctx, -w / 2, -h, w, h, 8, '#f4f5f8'); ctx.fillStyle = 'rgba(0,0,0,.06)'; ctx.fillRect(w * 0.3, -h, w * 0.2, h);
  fillRR(ctx, -w / 2, -h, w, h * 0.2, [8, 8, 0, 0], '#1f2b5c');
  // console silhouette on the box
  ctx.save(); ctx.translate(-w * 0.12, -h * 0.12); iconPS5(ctx, 0, 0, h * 0.58, { col: '#9aa3b8', lw: 2.5, fill: '#ffffff' }); ctx.restore();
  label(ctx, txt, w * 0.24, -h * 0.45, { size: w * 0.13, color: '#1f2b5c' });
  ctx.restore();
}
