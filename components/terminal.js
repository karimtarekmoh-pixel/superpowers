// Terminal: a dark card with a title bar, prompt lines typed one character
// every 35ms with a blinking block cursor, optional highlighted tokens and an
// optional checklist that ticks one item at a time.
window.Terminal = (container, start, { x, y, w, h, title = "terminal", lines = [], charTime = 0.035, checklist = null, checkAt = 0, checkStagger = 0.8, fontSize = null, enter = true, life = 4 } = {}) => {
  const card = R.el(container, "term");
  Object.assign(card.style, { left: `${x}rem`, top: `${y}rem`, width: `${w}rem`, height: `${h}rem` });
  R.el(card, "term-bar", `<i></i><i></i><i></i><span>${title}</span>`);
  const body = R.el(card, "term-body");
  if (fontSize) body.style.fontSize = `${fontSize}rem`;
  const tl = gsap.timeline();
  if (enter) tl.from(card, { y: "12rem", autoAlpha: 0, duration: 0.45, ease: "power3.out" }, start);

  let t = start + 0.5;
  const cursors = [];
  lines.forEach((line) => {
    const row = R.el(body, "term-line");
    const typed = R.el(row, "", "", "span");
    const cursor = R.el(row, "term-cursor", "", "span");
    cursors.push(cursor);
    // Split into segments so highlighted words keep their style while typing.
    const hl = new Set(line.highlight || []);
    const segs = line.text.split(/(\s+)/).map((s) => ({ s, hl: hl.has(s) }));
    const prompt = line.prompt === false ? "" : '<span class="term-prompt">›</span> ';
    const render = (k) => {
      let out = prompt;
      let left = k;
      for (const g of segs) {
        if (left <= 0) break;
        const part = g.s.slice(0, left);
        left -= g.s.length;
        out += g.hl ? `<span class="term-hl">${part}</span>` : part;
      }
      typed.innerHTML = out;
    };
    render(0);
    const at = line.at != null ? start + line.at : t;
    const n = line.text.length;
    const proxy = { k: 0 };
    gsap.set(row, { autoAlpha: 0 });
    tl.set(row, { autoAlpha: 1 }, at);
    tl.to(proxy, { k: n, duration: n * charTime, ease: "none", onUpdate: () => render(Math.floor(proxy.k)) }, at);
    // Only the line being typed (or the last line) shows a cursor.
    gsap.set(cursor, { autoAlpha: 0 });
    tl.set(cursor, { autoAlpha: 1 }, at);
    if (cursors.length > 1) tl.set(cursors[cursors.length - 2], { autoAlpha: 0 }, at);
    t = at + n * charTime + 0.3;
  });

  if (checklist) {
    const box = R.el(body, "term-check");
    checklist.forEach((label, i) => {
      const item = R.el(box, "term-item", `<div class="box"></div><span>${label}</span>`);
      const tick = R.el(item.querySelector(".box"), "tick", '<svg viewBox="0 0 24 24" width="62%"><path d="M5 12.5l4.2 4.2L19 7" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg>');
      const at = start + checkAt + i * checkStagger;
      gsap.set(item, { autoAlpha: 0.35 });
      gsap.set(tick, { scale: 0 });
      tl.to(item, { autoAlpha: 1, duration: 0.2 }, at).to(tick, { scale: 1, duration: 0.35, ease: "back.out(2.2)" }, at);
    });
    t = Math.max(t, start + checkAt + checklist.length * checkStagger);
  }

  // Blink every cursor for the life of the terminal (finite repeats keep the timeline length fixed).
  // `life` = seconds the terminal stays on screen.
  cursors.forEach((c) => tl.to(c, { opacity: 0, duration: 0.45, ease: "steps(1)", repeat: Math.max(1, Math.floor(life / 0.45) - 1), yoyo: true }, start));
  return R.log("terminal", tl);
};
