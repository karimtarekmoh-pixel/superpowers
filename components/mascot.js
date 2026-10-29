// Mascot "Pixel": an original round-headed robot courier with a red cap, two
// dot eyes, square pixel cheeks and a tiny backpack. Four states:
// idle (blink + bob), point (arm toward the card), celebrate (arms up, hop,
// confetti) and think (hand to chin, thought dots). Each state method returns
// a GSAP timeline placed at `start` and lasting `dur` seconds.
window.Mascot = (container) => {
  const root = R.el(container, "pixel");
  root.innerHTML = `
  <svg viewBox="0 0 200 220" width="100%" height="100%" overflow="visible">
    <g class="px-confetti"></g>
    <g class="px-think" opacity="0">
      <circle cx="150" cy="40" r="5" fill="#111"/><circle cx="166" cy="26" r="7" fill="#111"/>
      <g class="px-bubble"><rect x="160" y="-16" width="56" height="30" rx="15" fill="#fff" stroke="#111" stroke-width="4"/>
        <circle class="d1" cx="176" cy="-1" r="3.4" fill="#111"/><circle class="d2" cx="188" cy="-1" r="3.4" fill="#111"/><circle class="d3" cx="200" cy="-1" r="3.4" fill="#111"/></g>
    </g>
    <ellipse cx="100" cy="212" rx="44" ry="6" fill="rgba(0,0,0,.12)" class="px-shadow"/>
    <g class="px-body">
      <rect x="80" y="168" width="14" height="34" rx="6" fill="#111"/>
      <rect x="106" y="168" width="14" height="34" rx="6" fill="#111"/>
      <rect x="122" y="112" width="34" height="48" rx="10" fill="#E2342D" stroke="#111" stroke-width="5"/>
      <rect x="128" y="124" width="22" height="6" rx="3" fill="#111" opacity=".35"/>
      <rect x="66" y="104" width="68" height="70" rx="22" fill="#111"/>
      <rect x="88" y="124" width="24" height="22" rx="4" fill="#E7E3DA"/>
      <rect x="98" y="124" width="4" height="22" fill="#E2342D"/>
      <g class="px-armL"><path d="M72 120 L48 150" stroke="#111" stroke-width="12" stroke-linecap="round"/><circle cx="46" cy="152" r="9" fill="#E7E3DA" stroke="#111" stroke-width="4"/></g>
      <g class="px-armR"><path d="M128 120 L152 150" stroke="#111" stroke-width="12" stroke-linecap="round"/><circle cx="154" cy="152" r="9" fill="#E7E3DA" stroke="#111" stroke-width="4"/></g>
      <g class="px-head">
        <rect x="50" y="58" width="10" height="18" rx="4" fill="#111"/><rect x="140" y="58" width="10" height="18" rx="4" fill="#111"/>
        <circle cx="100" cy="66" r="44" fill="#D9D6CF" stroke="#111" stroke-width="6"/>
        <rect x="70" y="58" width="60" height="26" rx="13" fill="#111"/>
        <g class="px-eyes"><circle cx="86" cy="71" r="6" fill="#F3F1EC"/><circle cx="114" cy="71" r="6" fill="#F3F1EC"/></g>
        <rect x="64" y="88" width="8" height="8" fill="#E2342D" opacity=".75"/><rect x="128" y="88" width="8" height="8" fill="#E2342D" opacity=".75"/>
        <g class="px-mouth"><rect x="88" y="92" width="24" height="9" rx="3" fill="#F3F1EC" stroke="#111" stroke-width="3"/><path d="M96 92v9M104 92v9" stroke="#111" stroke-width="2.4"/></g>
        <path d="M58 52 Q60 18 100 18 Q140 18 142 52 Z" fill="#E2342D" stroke="#111" stroke-width="5" stroke-linejoin="round"/>
        <path d="M134 50 Q160 48 170 56 Q150 60 134 58 Z" fill="#111"/>
        <rect x="92" y="26" width="16" height="12" rx="3" fill="#F3F1EC" stroke="#111" stroke-width="3"/>
      </g>
    </g>
  </svg>`;
  const q = (s) => root.querySelector(s);
  const body = q(".px-body");
  const head = q(".px-head");
  const eyes = q(".px-eyes");
  const armL = q(".px-armL");
  const armR = q(".px-armR");
  const think = q(".px-think");
  const confetti = q(".px-confetti");
  gsap.set(armL, { svgOrigin: "72 120" });
  gsap.set(armR, { svgOrigin: "128 120" });
  gsap.set(eyes, { svgOrigin: "100 71" });
  gsap.set(head, { svgOrigin: "100 104" });

  // Confetti pieces for the celebrate state (hidden until used).
  const rand = R.rng(5);
  const bits = Array.from({ length: 14 }, (_, i) => {
    const r = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    r.setAttribute("width", 8);
    r.setAttribute("height", 8);
    r.setAttribute("x", 96);
    r.setAttribute("y", 40);
    r.setAttribute("fill", ["#E2342D", "#111", "#2FB36B"][i % 3]);
    r.setAttribute("opacity", 0);
    confetti.appendChild(r);
    return { r, dx: (rand() - 0.5) * 220, dy: -30 - rand() * 45, rot: rand() * 360 };
  });

  // Idle: gentle bob for the whole video and a blink every ~2.6s.
  const idle = (start, dur) => {
    const tl = gsap.timeline();
    const bobs = Math.max(1, Math.floor(dur / 1.2));
    tl.to(body, { y: -4, duration: 0.6, ease: "sine.inOut", yoyo: true, repeat: bobs * 2 - 1 }, start);
    for (let t = start + 1.1; t < start + dur - 0.3; t += 2.6) tl.to(eyes, { scaleY: 0.1, duration: 0.07, yoyo: true, repeat: 1, ease: "power1.inOut" }, t);
    return R.log("mascot idle", tl);
  };

  // Point: right arm swings up toward the scene card, head tilts.
  const point = (start, dur) => {
    const tl = gsap.timeline();
    tl.to(armR, { rotation: -128, duration: 0.35, ease: "back.out(1.6)" }, start)
      .to(head, { rotation: 6, duration: 0.35, ease: "power3.out" }, start)
      .to(armR, { rotation: -118, duration: 0.25, yoyo: true, repeat: 3, ease: "sine.inOut" }, start + 0.4)
      .to([armR, head], { rotation: 0, duration: 0.35, ease: "power3.inOut" }, start + dur - 0.35);
    return R.log("mascot point", tl);
  };

  // Celebrate: both arms up, two hops, confetti burst.
  const celebrate = (start, dur) => {
    const tl = gsap.timeline();
    tl.to(armL, { rotation: 125, duration: 0.3, ease: "back.out(1.8)" }, start)
      .to(armR, { rotation: -125, duration: 0.3, ease: "back.out(1.8)" }, start)
      .to(root, { y: "-2rem", duration: 0.22, ease: "power2.out", yoyo: true, repeat: 3 }, start + 0.05);
    bits.forEach((b) => {
      tl.set(b.r, { opacity: 1, x: 0, y: 0, rotation: 0 }, start + 0.1)
        .to(b.r, { x: b.dx, y: b.dy, rotation: b.rot, duration: 0.6, ease: "power2.out", svgOrigin: "100 44" }, start + 0.1)
        .to(b.r, { y: b.dy + 120, opacity: 0, duration: 0.6, ease: "power1.in" }, start + 0.7);
    });
    tl.to([armL, armR], { rotation: 0, duration: 0.35, ease: "power3.inOut" }, start + dur - 0.35);
    return R.log("mascot celebrate", tl);
  };

  // Think: left hand to chin, eyes look up, animated thought dots.
  const thinkState = (start, dur) => {
    const tl = gsap.timeline();
    tl.to(armL, { rotation: 70, duration: 0.35, ease: "power3.out" }, start)
      .to(eyes, { y: -5, x: 4, duration: 0.3, ease: "power2.out" }, start)
      .to(think, { opacity: 1, duration: 0.25 }, start + 0.15);
    const dots = root.querySelectorAll(".px-bubble circle");
    const cycles = Math.max(1, Math.floor((dur - 0.6) / 0.9));
    for (let k = 0; k < cycles; k++) tl.fromTo(dots, { y: 0 }, { y: -5, duration: 0.15, stagger: 0.12, yoyo: true, repeat: 1, ease: "sine.inOut", immediateRender: false }, start + 0.4 + k * 0.9);
    tl.to(armL, { rotation: 0, duration: 0.35, ease: "power3.inOut" }, start + dur - 0.35)
      .to(eyes, { x: 0, y: 0, duration: 0.3 }, start + dur - 0.35)
      .to(think, { opacity: 0, duration: 0.2 }, start + dur - 0.3);
    return R.log("mascot think", tl);
  };

  // Entrance: Pixel hops into the strip.
  const enter = (start) => {
    const tl = gsap.timeline();
    tl.from(root, { y: "12rem", autoAlpha: 0, duration: 0.5, ease: "back.out(1.4)" }, start);
    return tl;
  };

  return { el: root, idle, point, celebrate, think: thinkState, enter };
};
