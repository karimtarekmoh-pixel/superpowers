// Phone: a 9:19 device frame with a notch. Screens are HTML strings; each new
// screen slides in and its .sec children animate in one after another.
window.Phone = (container, start, opts = {}) => {
  const { x, y, h, screens = [], firstAt = 0.45, stepEvery = 1.6, enter = "up", rotate = 0 } = opts;
  const w = (h * 9) / 19;
  const phone = R.el(container, "phone");
  Object.assign(phone.style, { left: `${x}rem`, top: `${y}rem`, width: `${w}rem`, height: `${h}rem`, fontSize: `${w / (opts.scale || 24)}rem` });
  const screen = R.el(phone, "phone-screen");
  R.el(screen, "phone-notch");
  const tl = gsap.timeline();
  gsap.set(phone, { rotation: rotate });
  tl.from(phone, { y: enter === "up" ? "14rem" : 0, x: enter === "right" ? "30rem" : 0, autoAlpha: 0, rotation: rotate + 6, duration: 0.5, ease: "power3.out" }, start);
  const pages = screens.map((html) => R.el(screen, "phone-page", html));
  pages.forEach((pg, i) => {
    const at = start + firstAt + i * stepEvery;
    gsap.set(pg, { xPercent: i === 0 ? 0 : 100, autoAlpha: i === 0 ? 1 : 0 });
    if (i > 0) {
      tl.set(pg, { autoAlpha: 1 }, at)
        .to(pg, { xPercent: 0, duration: 0.45, ease: "power3.out" }, at)
        .to(pages[i - 1], { xPercent: -30, autoAlpha: 0, duration: 0.45, ease: "power3.out" }, at);
    }
    const secs = pg.querySelectorAll(".sec");
    if (secs.length) tl.from(secs, { y: "1.6em", autoAlpha: 0, duration: 0.35, ease: "power3.out", stagger: 0.09 }, at + 0.1);
  });
  return R.log("phone", tl);
};
