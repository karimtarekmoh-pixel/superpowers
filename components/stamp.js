// Stamp: bold uppercase text in a red outlined box, rotated 4-8 degrees.
// Slams in over 0.2s (scale down + slight overshoot) and shakes the target element.
window.Stamp = (container, start, { text, x, y, rotate = -6, shake = null, size } = {}) => {
  const s = R.el(container, "stamp", text);
  if (size) s.style.fontSize = size;
  // x/y (rem) are the stamp's centre point.
  Object.assign(s.style, { left: `${x}rem`, top: `${y}rem` });
  gsap.set(s, { xPercent: -50, yPercent: -50, rotation: rotate, autoAlpha: 0, scale: 2.2 });
  const tl = gsap.timeline();
  tl.to(s, { autoAlpha: 1, duration: 0.06, ease: "none" }, start)
    .to(s, { scale: 1, duration: 0.2, ease: "back.out(1.4)" }, start);
  if (shake) {
    // Small screen shake: a few quick offsets that settle back to zero.
    tl.to(shake, { keyframes: [{ x: "1.2rem", y: "-0.8rem" }, { x: "-1rem", y: "0.7rem" }, { x: "0.6rem", y: "-0.4rem" }, { x: 0, y: 0 }], duration: 0.28, ease: "none" }, start + 0.16);
  }
  return R.log("stamp", tl);
};
