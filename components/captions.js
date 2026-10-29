// Captions: burned-in kinetic captions, 2-4 words at a time on an ink pill.
// The spoken word turns red; each word pops in (0.8 -> 1.0 scale, 0.12s).
// Word timing comes from audio alignment when available, otherwise it is
// spread across each scene's window by word length and punctuation.
window.Captions = (host, scenes, { align = null, wps = 2.7 } = {}) => {
  const tokens = (vo) => vo.trim().split(/\s+/);

  // 1) Word timings
  const words = [];
  if (align) {
    // align: [{ word, start, end }] in order, one per spoken token.
    let k = 0;
    scenes.forEach((sc) => tokens(sc.vo).forEach((w) => {
      const a = align[k++] || {};
      words.push({ text: w, start: a.start, end: a.end, scene: sc.id, sceneEnd: sc.end });
    }));
  } else {
    scenes.forEach((sc) => {
      const ts = tokens(sc.vo);
      const weight = (w) => 1 + 0.07 * w.replace(/[^\w$]/g, "").length + (/[.?!]$/.test(w) ? 1.4 : /[,:;]$/.test(w) ? 0.7 : 0);
      const total = ts.reduce((a, w) => a + weight(w), 0);
      const t0 = sc.start + 0.2;
      const t1 = sc.end - 0.45;
      // Natural pace is `wps`; if the scene is too short for that, compress to fit.
      const span = Math.min(t1 - t0, ts.length / wps + 0.25 * (ts.join(" ").match(/[.?!,]/g) || []).length);
      let t = t0;
      ts.forEach((w) => {
        const d = (weight(w) / total) * span;
        words.push({ text: w, start: t, end: t + d * 0.92, scene: sc.id, sceneEnd: sc.end });
        t += d;
      });
    });
  }

  // 2) Group into 2-4 words, max ~18 characters, breaking after punctuation.
  const groups = [];
  let cur = [];
  const len = (g) => g.map((w) => w.text).join(" ").length;
  words.forEach((w, i) => {
    const prev = words[i - 1];
    const brk = cur.length && (prev.scene !== w.scene || /[.?!,:;]$/.test(prev.text) || cur.length >= 4 || (cur.length >= 2 && len([...cur, w]) > 18));
    if (brk) { groups.push(cur); cur = []; }
    cur.push(w);
  });
  if (cur.length) groups.push(cur);
  // Fold a lone word into the previous group of the same scene when it fits.
  for (let i = groups.length - 1; i > 0; i--) {
    const g = groups[i];
    const p = groups[i - 1];
    if (g.length === 1 && p.length < 4 && p[0].scene === g[0].scene && len([...p, ...g]) <= 20 && !/[.?!]$/.test(p[p.length - 1].text)) {
      p.push(...g);
      groups.splice(i, 1);
    }
  }

  // 3) Build DOM + timeline
  const tl = gsap.timeline();
  const out = [];
  groups.forEach((g, gi) => {
    const pill = R.el(host, "cap-group");
    const spans = g.map((w) => R.el(pill, "cap-word", w.text.toUpperCase(), "span"));
    gsap.set(pill, { xPercent: -50, yPercent: -50 });
    gsap.set(spans, { scale: 0.8 });
    const start = g[0].start;
    const next = groups[gi + 1];
    const end = Math.min(next && next[0].scene === g[0].scene ? next[0].start : g[g.length - 1].end + 0.35, g[0].sceneEnd - 0.12);
    tl.set(pill, { visibility: "visible" }, start)
      .fromTo(pill, { scale: 0.92 }, { scale: 1, duration: 0.12, ease: "power2.out", immediateRender: false }, start)
      .set(pill, { visibility: "hidden" }, end);
    tl.to(spans, { scale: 1, duration: 0.12, ease: "power2.out" }, start);
    g.forEach((w, i) => {
      const s = spans[i];
      const wEnd = i + 1 < g.length ? g[i + 1].start : end;
      tl.set(s, { color: "#E2342D" }, w.start).set(s, { color: "#FFFFFF" }, wEnd);
    });
    out.push({ start, end, text: g.map((w) => w.text).join(" ") });
  });
  return { tl: R.log("captions", tl), groups: out, words };
};
