// Builds one paused GSAP master timeline from scenes.json.
// render.mjs seeks it frame by frame; opening index.html in a browser plays it live.
(async () => {
  const q = new URLSearchParams(location.search);
  const data = await (await fetch("scenes.json")).json();
  const { meta, scenes } = data;
  window.__meta = meta;
  const master = gsap.timeline({ paused: true });
  const hasAudio = q.has("audio");
  if (!hasAudio) document.getElementById("draft").hidden = false;
  if (q.has("guides")) document.getElementById("guides").hidden = false;

  // Word timings from audio alignment, if render.mjs produced one.
  let align = null;
  if (hasAudio) {
    try {
      const r = await fetch("audio/alignment.json");
      if (r.ok) align = await r.json();
    } catch {}
  }

  // Subtle parallax: the dot background drifts slowly for the whole video.
  master.fromTo("#bg", { x: 0, y: 0 }, { x: "-3rem", y: "-8rem", duration: meta.duration, ease: "none" }, 0);

  // Scenes
  const root = document.getElementById("scenes");
  for (const sc of scenes) {
    const node = R.el(root, `scene scene-${sc.id}`);
    const len = sc.end - sc.start;
    const build = Visuals[sc.visual] || Visuals.placeholder;
    const tl = gsap.timeline();
    tl.set(node, { autoAlpha: 1 }, 0);
    tl.add(build(node, sc, len), 0);
    tl.set(node, { autoAlpha: 0 }, len);
    master.add(R.log(`${sc.id} ${sc.visual}`, tl), sc.start);
    // Halftone wipe centred on the cut (half covers the old scene, half reveals the new).
    if (sc.params && sc.params.wipe) master.add(Wipe(document.getElementById("wipe"), 0, { direction: sc.params.wipe, duration: 0.6 }), sc.start - 0.3);
  }

  // Mascot strip: Pixel plus a 3-step tracker.
  const strip = document.getElementById("mascot-strip");
  const pixel = Mascot(strip);
  master.add(pixel.enter(0.3), 0);
  master.add(pixel.idle(0.3, meta.duration - 0.3), 0);
  for (const sc of scenes) for (const m of sc.mascot || []) master.add(pixel[m.state](sc.start + m.at, m.dur), 0);
  const tracker = R.el(strip, "tracker", `<span class="lbl">STEP</span>${'<div class="seg"><i></i></div>'.repeat(3)}`);
  master.from(tracker, { autoAlpha: 0, x: "6rem", duration: 0.45, ease: "power3.out" }, 0.6);
  const segs = tracker.querySelectorAll(".seg i");
  for (const sc of scenes) if (sc.params && sc.params.step) master.to(segs[sc.params.step - 1], { scaleX: 1, duration: 0.6, ease: "power3.out" }, sc.start + 0.4);

  // Captions
  const caps = Captions(document.getElementById("captions"), scenes, { align, wps: meta.wordsPerSecond });
  master.add(caps.tl, 0);
  window.__captions = caps.groups;

  master.set({}, {}, meta.duration); // pin total length
  window.__scenes = scenes;
  window.__seek = (t) => {
    master.seek(t, false);
  };
  window.__ready = true;

  if (q.has("t")) master.seek(parseFloat(q.get("t")));
  else if (!q.has("render")) master.play();
})();
