// main.js: picks the shot for time t, draws it, adds the letterbox (if BAR > 0).
// shots.js (written for each video) must define: const SHOTS = [{name, t0, t1, draw(ctx, t)}, ...]
'use strict';
const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
SHOTS.sort((a, b) => a.t0 - b.t0);
function renderAt(t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.filter = 'none'; ctx.globalCompositeOperation = 'source-over';
  ctx.clearRect(0, 0, W, H);
  const shot = SHOTS.find(s => t >= s.t0 && t < s.t1) || SHOTS[SHOTS.length - 1];
  ctx.save(); shot.draw(ctx, t); ctx.restore();
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.filter = 'none';
  if (BAR > 0) letterbox(ctx);
  return shot.name;
}
window.renderAt = renderAt;
window.frameData = async (t, fmt = 'image/png') => { renderAt(t); return canvas.toDataURL(fmt, 0.95); };
window.shotList = () => SHOTS.map(s => [s.name, s.t0, s.t1]);
window.ready = Promise.all([
  document.fonts.load('800 40px Mont'), document.fonts.load('700 40px Mont'), document.fonts.load('600 40px Mont'),
  (typeof EXTRA_IMAGES !== 'undefined' ? loadImages(EXTRA_IMAGES) : Promise.resolve()),
]);
