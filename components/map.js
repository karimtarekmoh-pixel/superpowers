// Map: a pale grid of blocks and streets, drop-in pins, and an animated
// dashed route line drawn with stroke-dashoffset (through a mask).
window.MapView = (container, start, { x, y, w, h, cols = 6, rows = 7, pins = [], route = null, routeAt = 1, routeDur = 2, enter = true } = {}) => {
  const box = R.el(container, "map");
  Object.assign(box.style, { left: `${x}rem`, top: `${y}rem`, width: `${w}rem`, height: `${h}rem` });
  const VW = 100;
  const VH = (h / w) * 100;
  const street = 2.6;
  const bw = (VW - street * (cols + 1)) / cols;
  const bh = (VH - street * (rows + 1)) / rows;
  const rand = R.rng(11);
  let blocks = "";
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      const park = rand() < 0.1;
      blocks += `<rect x="${street + c * (bw + street)}" y="${street + r * (bh + street)}" width="${bw}" height="${bh}" rx="1.4" fill="${park ? "rgba(47,179,107,.22)" : "#DCD6CA"}"/>`;
    }
  // Grid coordinates (col, row) of street intersections -> SVG points.
  const pt = ([c, r]) => [street / 2 + c * (bw + street), street / 2 + r * (bh + street)];
  const d = route ? "M" + route.map((p) => pt(p).map((v) => v.toFixed(2)).join(" ")).join(" L") : "";
  const id = `m${Math.floor(rand() * 1e6)}`;
  box.innerHTML = `
    <svg viewBox="0 0 ${VW} ${VH.toFixed(2)}" width="100%" height="100%" preserveAspectRatio="none">
      <rect width="100%" height="100%" fill="#F1EEE7"/>
      ${blocks}
      ${route ? `<mask id="${id}"><path class="reveal" d="${d}" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></mask>
      <path d="${d}" fill="none" stroke="#E2342D" stroke-width="1.1" stroke-dasharray="2.2 1.6" stroke-linecap="round" stroke-linejoin="round" mask="url(#${id})"/>` : ""}
    </svg>`;
  const tl = gsap.timeline();
  if (enter) tl.from(box, { autoAlpha: 0, scale: 0.94, duration: 0.45, ease: "power3.out" }, start);
  if (route) {
    const rev = box.querySelector(".reveal");
    const len = rev.getTotalLength();
    gsap.set(rev, { strokeDasharray: len, strokeDashoffset: len });
    tl.to(rev, { strokeDashoffset: 0, duration: routeDur, ease: "power1.inOut" }, start + routeAt);
  }
  // Pins are HTML so they stay round regardless of the SVG aspect ratio.
  pins.forEach((p) => {
    const [px, py] = pt(p.at);
    const pin = R.el(box, "pin", `<svg viewBox="0 0 40 52" width="100%" height="100%"><ellipse cx="20" cy="49" rx="8" ry="2.6" fill="rgba(0,0,0,.18)"/><path d="M20 2C10.6 2 3 9.4 3 18.6 3 31 20 47 20 47S37 31 37 18.6C37 9.4 29.4 2 20 2z" fill="${p.color || "#E2342D"}" stroke="#111" stroke-width="2.4"/><circle cx="20" cy="18" r="6.4" fill="#fff"/></svg>`);
    const size = p.size || 6;
    Object.assign(pin.style, { position: "absolute", width: `${size}rem`, height: `${size * 1.3}rem`, left: `calc(${(px / VW) * 100}% - ${size / 2}rem)`, top: `calc(${(py / VH) * 100}% - ${size * 1.22}rem)` });
    gsap.set(pin, { autoAlpha: 0, y: "-16rem" });
    tl.to(pin, { autoAlpha: 1, duration: 0.05 }, start + p.t).to(pin, { y: 0, duration: 0.5, ease: "bounce.out" }, start + p.t);
  });
  return R.log("map", tl);
};
