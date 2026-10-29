// Builds one paused GSAP master timeline from scenes.json.
// render.mjs seeks it frame by frame; opening index.html in a browser plays it live.
(async () => {
  const q = new URLSearchParams(location.search);
  const data = await (await fetch("scenes.json")).json();
  const { meta, scenes } = data;
  const master = gsap.timeline({ paused: true });

  if (!q.has("audio")) document.getElementById("draft").hidden = false;
  if (q.has("guides")) document.getElementById("guides").hidden = false;

  // Subtle parallax: the dot background drifts slowly for the whole video.
  master.fromTo("#bg", { x: 0, y: 0 }, { x: "-3rem", y: "-8rem", duration: meta.duration, ease: "none" }, 0);

  const root = document.getElementById("scenes");
  for (const sc of scenes) {
    const node = R.el(root, `scene scene-${sc.id}`);
    const len = sc.end - sc.start;
    const build = Visuals[sc.visual] || Visuals.placeholder;
    const tl = gsap.timeline();
    tl.set(node, { autoAlpha: 1 }, 0);
    tl.add(build(node, sc, len, meta), 0);
    tl.set(node, { autoAlpha: 0 }, len);
    master.add(R.log(`${sc.id} ${sc.visual}`, tl), sc.start);
  }
  master.set({}, {}, meta.duration); // pin total length

  window.__meta = meta;
  window.__scenes = scenes;
  window.__seek = (t) => {
    master.seek(t, false);
  };
  window.__ready = true;

  if (q.has("t")) master.seek(parseFloat(q.get("t")));
  else if (!q.has("render")) master.play();
})();
