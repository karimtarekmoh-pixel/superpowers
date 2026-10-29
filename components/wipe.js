// Wipe: halftone-dot transition. A grid of black circles grows across the
// screen in the chosen direction, then shrinks away in the same order (~0.6s).
// The midpoint (fully covered) is start + duration/2, so place it on the cut.
window.Wipe = (host, start, { direction = "diag", duration = 0.6, color = "#111111" } = {}) => {
  const c = R.el(host, "wipe-canvas", "", "canvas");
  const W = (c.width = host.clientWidth);
  const H = (c.height = host.clientHeight);
  const ctx = c.getContext("2d");
  const step = W / 12;
  const cols = Math.ceil(W / step) + 1;
  const rows = Math.ceil(H / step) + 1;
  const dist = (x, y) =>
    direction === "up" ? 1 - y / H : direction === "down" ? y / H : direction === "left" ? 1 - x / W : direction === "right" ? x / W : (x / W + y / H) / 2;
  const rMax = step * 0.75; // big enough for neighbours to overlap = full cover
  const clamp = (v) => Math.max(0, Math.min(1, v));
  const draw = (p) => {
    ctx.clearRect(0, 0, W, H);
    if (p <= 0 || p >= 1) return;
    ctx.fillStyle = color;
    const cover = p < 0.5;
    const q = cover ? p / 0.5 : (p - 0.5) / 0.5;
    for (let i = 0; i < cols; i++)
      for (let j = 0; j < rows; j++) {
        const x = i * step;
        const y = j * step;
        const s = clamp((q * 1.6 - dist(x, y)) / 0.6);
        const r = rMax * (cover ? s : 1 - s);
        if (r < 0.5) continue;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
  };
  const o = { p: 0 };
  const tl = gsap.timeline();
  tl.to(o, { p: 1, duration, ease: "none", onUpdate: () => draw(o.p) }, start);
  return R.log("wipe", tl);
};
