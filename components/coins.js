// Coins: flat editorial coins that drop from above and stack with a small bounce.
// Builds `count` coins into stacks; returns the timeline.
window.Coins = (container, start, { x, y, stacks = [5, 7, 4], stagger = 0.16, spread = 18 } = {}) => {
  const wrap = R.el(container, "coins");
  Object.assign(wrap.style, { left: `${x}rem`, top: `${y}rem` });
  const coinSVG = (dollar) => `
    <svg viewBox="0 0 140 64" width="100%" height="100%">
      <ellipse cx="70" cy="40" rx="64" ry="20" fill="#111"/>
      <rect x="6" y="26" width="128" height="14" fill="#111"/>
      <ellipse cx="70" cy="26" rx="64" ry="20" fill="#E7E3DA" stroke="#111" stroke-width="4"/>
      <ellipse cx="70" cy="26" rx="46" ry="13" fill="none" stroke="#111" stroke-width="2.5" opacity=".35"/>
      ${dollar ? '<text x="70" y="33" text-anchor="middle" font-family="Instrument Serif, Georgia, serif" font-style="italic" font-size="26" fill="#E2342D">$</text>' : ""}
    </svg>`;
  const tl = gsap.timeline();
  const rand = R.rng(7);
  let i = 0;
  const order = [];
  stacks.forEach((n, s) => { for (let k = 0; k < n; k++) order.push({ s, k, top: k === n - 1 }); });
  // Interleave stacks so coins land left/right/centre rather than one stack at a time.
  order.sort((a, b) => a.k - b.k || a.s - b.s);
  order.forEach(({ s, k, top }) => {
    const c = R.el(wrap, "coin", coinSVG(top));
    const cx = (s - (stacks.length - 1) / 2) * spread;
    Object.assign(c.style, { width: "17rem", height: "7.8rem", left: `${cx - 8.5}rem`, top: `${-k * 1.9 - 7.8}rem`, zIndex: 10 + k });
    gsap.set(c, { y: "-42rem", rotation: (rand() - 0.5) * 30, autoAlpha: 0 });
    const t = start + i * stagger;
    tl.to(c, { autoAlpha: 1, duration: 0.05 }, t)
      .to(c, { y: 0, rotation: (rand() - 0.5) * 4, duration: 0.45, ease: "bounce.out" }, t);
    i++;
  });
  return R.log("coins", tl);
};
