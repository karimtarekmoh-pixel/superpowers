// Counter: a rolling number with tabular figures that eases to its final value.
window.Counter = (el, start, { from = 0, to, decimals = 0, duration = 1.2, prefix = "", suffix = "" } = {}) => {
  el.classList.add("counter");
  const o = { v: from };
  const render = () => (el.textContent = `${prefix}${o.v.toFixed(decimals)}${suffix}`);
  render();
  const tl = gsap.timeline();
  tl.to(o, { v: to, duration, ease: "power2.out", onUpdate: render }, start);
  return R.log("counter", tl);
};
