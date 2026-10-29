// Scene builders. Each takes (sceneElement, scene, length, meta) and returns a
// GSAP timeline where 0 = scene start. All beat times come from scene.params.
window.Visuals = (() => {
  // Shared entrance/exit for a card: 0.45s rise-in, 0.35s clean exit before the scene ends.
  const cardIn = (tl, card, at = 0) => tl.from(card, { y: "8rem", autoAlpha: 0, scale: 0.96, duration: 0.45, ease: "power3.out" }, at);
  const cardOut = (tl, card, len) => tl.to(card, { y: "-5rem", autoAlpha: 0, duration: 0.35, ease: "power2.in" }, len - 0.4);
  // Micro-motion so no frame is ever static: slow 1.00 -> 1.04 drift.
  const drift = (tl, target, len, amount = 0.04) => tl.fromTo(target, { scale: 1 }, { scale: 1 + amount, duration: len, ease: "none", immediateRender: false }, 0);

  // S1: hero card, headline with a red italic "$0", coins drop and stack, "3 STEPS" stamp.
  const hook = (node, sc, len) => {
    const p = sc.params;
    const tl = gsap.timeline();
    const card = R.el(node, "card hero");
    const inner = R.el(card, "hero-inner");
    Object.assign(inner.style, { position: "absolute", inset: 0 });
    const kicker = R.el(inner, "kicker", "The $0 business plan");
    Object.assign(kicker.style, { position: "absolute", left: "8rem", top: "8rem" });
    const h = R.el(inner, "headline", R.headlineHTML(p.headline), "h1");
    Object.assign(h.style, { position: "absolute", left: "8rem", right: "8rem", top: "13rem", fontSize: "15.5rem" });
    const red = h.querySelector("em");
    if (red) red.style.fontSize = "1.45em";

    cardIn(tl, card, 0);
    drift(tl, inner, len, 0.03);
    tl.from(kicker, { y: "2rem", autoAlpha: 0, duration: 0.4, ease: "power3.out" }, 0.2);
    tl.from(h.querySelectorAll(".w"), { y: "6rem", autoAlpha: 0, duration: 0.45, ease: "power3.out", stagger: 0.09 }, 0.25);
    if (red) tl.from(red, { scale: 0.6, rotation: -8, duration: 0.5, ease: "back.out(1.6)", transformOrigin: "50% 60%" }, 0.85);

    tl.add(Coins(inner, p.coinsAt, { x: 34, y: 79, stacks: [4, 7, 5], stagger: p.coinStagger, spread: 19 }), 0);
    tl.add(Stamp(inner, p.stampAt, { text: p.stampText, x: 70, y: 50, rotate: -7, shake: card }), 0);
    cardOut(tl, card, len);
    return tl;
  };

  // Placeholder for scenes that are not built yet (stage 1 only).
  const placeholder = (node, sc, len) => {
    const tl = gsap.timeline();
    const card = R.el(node, `card todo ${sc.layout === "dark" ? "dark" : ""}`);
    R.el(card, "kicker", `${sc.id} · ${sc.name}`);
    const h = R.el(card, "headline", "Coming in stage 2", "h2");
    if (sc.layout === "dark") h.style.color = "#fff";
    cardIn(tl, card, 0);
    drift(tl, card, len, 0.02);
    cardOut(tl, card, len);
    return tl;
  };

  return { hook, placeholder };
})();
