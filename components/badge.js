// Badge: a rounded black square with a big white serif numeral and a row of
// five dots (the step's dot is red). Bounces in with a slight tilt.
window.Badge = (container, start, { num, x, y, size = 26, rotate = -4, active = null } = {}) => {
  const dots = Array.from({ length: 5 }, (_, i) => `<i class="${active === i + 1 ? "on" : ""}"></i>`).join("");
  const b = R.el(container, "badge", `<div class="badge-num">${num}</div><div class="badge-dots">${dots}</div>`);
  Object.assign(b.style, { left: `${x}rem`, top: `${y}rem`, width: `${size}rem`, height: `${size}rem`, fontSize: `${size}rem` });
  gsap.set(b, { autoAlpha: 0, scale: 0.3, rotation: rotate - 16, transformOrigin: "50% 85%" });
  const tl = gsap.timeline();
  tl.to(b, { autoAlpha: 1, duration: 0.08 }, start)
    .to(b, { scale: 1, rotation: rotate, duration: 0.5, ease: "back.out(1.4)" }, start)
    .from(b.querySelectorAll(".badge-dots i"), { scale: 0, duration: 0.25, stagger: 0.05, ease: "back.out(2)" }, start + 0.25);
  return R.log("badge", tl);
};
