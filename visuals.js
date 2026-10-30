// Scene builders. Each takes (sceneElement, scene, length) and returns a GSAP
// timeline where 0 = scene start. Beat times come from scene.params in scenes.json.
// Coordinates are rem inside the card (card = 96 x 86 rem, hero = 100 x 86).
window.Visuals = (() => {
  const P = Props;
  // Card entrance (0.45s rise) and clean exit 0.4s before the scene ends.
  const cardIn = (tl, card, at = 0) => tl.from(card, { y: "8rem", autoAlpha: 0, scale: 0.96, duration: 0.45, ease: "power3.out" }, at);
  let holdLast = false;
  const cardOut = (tl, card, len) => holdLast ? tl : tl.to(card, { y: "-1.5rem", autoAlpha: 0, duration: 0.35, ease: "power2.in" }, len - 0.4);
  // Micro-motion: slow 1.00 -> 1.04 drift so nothing is ever fully static.
  const drift = (tl, target, len, amount = 0.04) => tl.fromTo(target, { scale: 1 }, { scale: 1 + amount, duration: len, ease: "none", immediateRender: false }, 0);
  // Exit a group of elements together (used when a scene switches phase).
  const out = (tl, els, at, dir = -1) => tl.to(els, { y: `${dir * 2}rem`, autoAlpha: 0, duration: 0.3, ease: "power2.in", stagger: 0.03 }, at);

  // Headline with exactly one [red italic] word; words rise in one by one.
  const headline = (tl, parent, text, { x, y, w, size, at = 0.3, color = null }) => {
    const h = P.place(R.el(parent, "headline", R.headlineHTML(text), "h2"), x, y, w);
    h.style.fontSize = `${size}rem`;
    if (color) h.style.color = color;
    tl.from(h.querySelectorAll(".w"), { y: "4rem", autoAlpha: 0, duration: 0.42, ease: "power3.out", stagger: 0.07 }, at);
    return h;
  };

  // Standard card with an inner layer that drifts (parallax vs the background).
  const makeCard = (node, cls = "card") => {
    const card = R.el(node, cls);
    const inner = R.el(card, "inner");
    Object.assign(inner.style, { position: "absolute", inset: 0 });
    return { card, inner };
  };

  // ---------------- S1 Hook ----------------
  const hook = (node, sc, len) => {
    const p = sc.params;
    const tl = gsap.timeline();
    const { card, inner } = makeCard(node, "card hero");
    const kicker = P.place(R.el(inner, "kicker", "The $0 business plan"), 8, 8);
    const h = P.place(R.el(inner, "headline", R.headlineHTML(p.headline), "h1"), 8, 13);
    Object.assign(h.style, { right: "8rem", fontSize: "15.5rem" });
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

  // ---------------- S2 Step 1 title ----------------
  const step1Title = (node, sc, len) => {
    const p = sc.params;
    const tl = gsap.timeline();
    const { card, inner } = makeCard(node);
    cardIn(tl, card);
    drift(tl, inner, len, 0.03);
    tl.add(Badge(inner, p.badgeAt, { num: 1, x: 7, y: 8, size: 26, active: 1 }), 0);
    headline(tl, inner, "Find what people [already] pay for", { x: 7, y: 40, w: 50, size: 8.6, at: 0.45 });
    const apps = [
      ["BookIt", "Appointments", "#E2342D", "B"],
      ["TabTally", "Invoices", "#111", "T"],
      ["StampCard", "Loyalty", "#2FB36B", "S"],
      ["ShiftPad", "Staff rota", "#8A8A93", "P"],
      ["QueueUp", "Waitlist", "#111", "Q"],
    ];
    const rows = apps.map(([n, c, col, l], i) => `<div class="pp-row sec r${i}"><div class="pp-icon" style="background:${col}">${l}</div><div><div class="pp-name">${n}</div><div class="pp-meta">${c}</div></div><div class="pp-price">#${i + 1}</div></div>`).join("");
    tl.add(Phone(inner, p.phoneAt, { x: 57, y: 9, h: 68, rotate: 3, scale: 18, screens: [`<div class="pp-sub sec">Business apps</div><div class="pp-title sec">Top grossing</div>${rows}`] }), 0);
    const mag = P.magnifier(inner, { x: 62, y: 22, size: 17 });
    gsap.set(mag, { autoAlpha: 0, x: "-6rem" });
    tl.to(mag, { autoAlpha: 1, x: 0, duration: 0.35, ease: "power3.out" }, p.magnifierAt)
      .to(mag, { y: "34rem", x: "3rem", duration: 1.3, ease: "power1.inOut" }, p.magnifierAt + 0.3);
    inner.querySelectorAll(".pp-row").forEach((r, i) => tl.to(r, { backgroundColor: "rgba(226,52,45,.16)", duration: 0.2, yoyo: true, repeat: 1 }, p.magnifierAt + 0.35 + i * 0.24));
    cardOut(tl, card, len);
    return tl;
  };

  // ---------------- S3 Step 1 detail ----------------
  const step1Detail = (node, sc, len) => {
    const p = sc.params;
    const tl = gsap.timeline();
    const { card, inner } = makeCard(node);
    cardIn(tl, card);
    drift(tl, inner, len, 0.04);
    headline(tl, inner, "Tools businesses pay for [monthly]", { x: 7, y: 7, w: 82, size: 8, at: 0.2 });
    const defs = [
      { name: "BookIt", cat: "Booking", color: "#E2342D", icon: "calendar", price: 29 },
      { name: "TabTally", cat: "Invoicing", color: "#111", icon: "receipt", price: 19 },
      { name: "StampCard", cat: "Loyalty cards", color: "#2FB36B", icon: "star", price: 12 },
    ];
    const cards = defs.map((d, i) => {
      const c = P.appCard(inner, { x: 7 + i * 28, y: 26, w: 26, h: 30, ...d });
      const at = p.appsAt + i * p.appStagger;
      tl.from(c, { y: "10rem", autoAlpha: 0, rotation: i - 1, duration: 0.45, ease: "power3.out" }, at);
      tl.add(Counter(c.querySelector(".num"), at + 0.3, { from: 0, to: d.price, duration: 1.1, prefix: "$" }), 0);
      return c;
    });
    const cal = P.calendar(inner, { x: 7, y: 59, w: 54, h: 23 });
    tl.from(cal, { y: "8rem", autoAlpha: 0, duration: 0.45, ease: "power3.out" }, p.calendarAt);
    const mos = cal.querySelectorAll(".mo");
    const sqs = cal.querySelectorAll(".sq");
    gsap.set(mos, { autoAlpha: 0 });
    gsap.set(mos[0], { autoAlpha: 1 });
    mos.forEach((m, i) => {
      const at = p.calendarAt + 0.3 + i * 0.28;
      if (i > 0) tl.set(mos[i - 1], { autoAlpha: 0 }, at).set(m, { autoAlpha: 1 }, at).from(m, { scaleY: 0, transformOrigin: "50% 0%", duration: 0.22, ease: "power2.out" }, at);
      tl.to(sqs[i], { backgroundColor: "#111", duration: 0.15 }, at + 0.05);
    });
    const renew = P.place(R.el(inner, "chip", `<span style="width:3.4rem;height:3.4rem;border-radius:50%;background:var(--green);display:grid;place-items:center">${P.glyph.check()}</span>Demand is real`), 64, 67);
    renew.style.fontSize = "2.5rem";
    tl.from(renew, { scale: 0.6, autoAlpha: 0, duration: 0.4, ease: "back.out(1.6)" }, p.calendarAt + 2.2);
    tl.add(Stamp(inner, p.stampAt, { text: p.stampText, x: 48, y: 41, rotate: -6, shake: card }), 0);

    // Phase 2: the gap. Everything above leaves, two blocks appear, "YOU" fills the gap.
    const stampEl = inner.querySelector(".stamp");
    out(tl, [...cards, cal, renew, stampEl], p.gapAt - 0.5);
    const blockL = P.place(R.el(inner, "blk", "Businesses pay every month"), 7, 32, 30, 32);
    const blockR = P.place(R.el(inner, "blk", "Few people can build software"), 59, 32, 30, 32);
    [blockL, blockR].forEach((b) => Object.assign(b.style, { background: "#111", color: "#fff", borderRadius: "2.4rem", padding: "3rem", font: "800 3.6rem/1.15 var(--sans)", display: "flex", alignItems: "flex-end", boxShadow: "var(--shadow)" }));
    const gap = P.place(R.el(inner, "gap", '<span>the gap</span>'), 38, 32, 20, 32);
    Object.assign(gap.style, { border: ".5rem dashed var(--red)", borderRadius: "2.4rem", display: "grid", placeItems: "center", font: "italic 4.6rem/1 var(--serif)", color: "var(--red)" });
    const you = P.place(R.el(inner, "you", "YOU"), 38, 32, 20, 32);
    Object.assign(you.style, { background: "var(--red)", color: "#fff", borderRadius: "2.4rem", display: "grid", placeItems: "center", font: "800 5rem/1 var(--sans)", letterSpacing: ".06em" });
    tl.from(blockL, { x: "-14rem", autoAlpha: 0, duration: 0.45, ease: "power3.out" }, p.gapAt)
      .from(blockR, { x: "14rem", autoAlpha: 0, duration: 0.45, ease: "power3.out" }, p.gapAt)
      .from(gap, { scale: 0.7, autoAlpha: 0, duration: 0.4, ease: "back.out(1.6)" }, p.gapAt + 0.3);
    gsap.set(you, { autoAlpha: 0, y: "-30rem" });
    tl.to(you, { autoAlpha: 1, duration: 0.05 }, p.gapAt + 1.0)
      .to(you, { y: 0, duration: 0.35, ease: "power3.in" }, p.gapAt + 1.0)
      .to(blockL, { x: "1rem", duration: 0.08, yoyo: true, repeat: 1 }, p.gapAt + 1.35)
      .to(blockR, { x: "-1rem", duration: 0.08, yoyo: true, repeat: 1 }, p.gapAt + 1.35)
      .to(you, { scale: 1.06, duration: 0.08, yoyo: true, repeat: 1 }, p.gapAt + 1.35);
    cardOut(tl, card, len);
    return tl;
  };

  // ---------------- S4 Step 2 title ----------------
  const step2Title = (node, sc, len) => {
    const p = sc.params;
    const tl = gsap.timeline();
    const { card, inner } = makeCard(node);
    cardIn(tl, card, 0.2);
    drift(tl, inner, len, 0.03);
    tl.add(Badge(inner, p.badgeAt, { num: 2, x: 7, y: 8, size: 26, active: 2 }), 0);
    headline(tl, inner, "Build your [own] version", { x: 38, y: 10, w: 52, size: 9.6, at: p.badgeAt + 0.3 });
    tl.add(Terminal(inner, p.terminalAt, { x: 7, y: 42, w: 82, h: 36, title: "~/barber-app", fontSize: 3.6, life: len - p.terminalAt - 0.4, lines: [{ text: "claude", at: 0.45 }, { text: p.typeText, prompt: false, at: 0.9, highlight: ["Claude", "Code"] }] }), 0);
    cardOut(tl, card, len);
    return tl;
  };

  // ---------------- S5 Step 2 detail ----------------
  const step2Detail = (node, sc, len) => {
    const p = sc.params;
    const tl = gsap.timeline();
    const { card, inner } = makeCard(node);
    cardIn(tl, card);
    drift(tl, inner, len, 0.03);
    const h = headline(tl, inner, "Make it [original]", { x: 7, y: 5, w: 82, size: 7.4, at: 0.15 });
    const term = Terminal(inner, 0.1, { x: 4, y: 15, w: 88, h: 52, title: "claude", fontSize: 3.3, life: p.phoneAt - 0.6, lines: [{ text: p.prompt, at: p.promptAt, highlight: p.highlight }], checklist: p.checklist, checkAt: p.checklistAt - 0.1, checkStagger: p.checkStagger });
    tl.add(term, 0);
    const termEl = inner.querySelector(".term");
    const score = P.place(R.el(inner, "chip", '<span class="label-sm" style="color:rgba(17,17,17,.55)">Quality score</span><b class="sc" style="font-size:5rem">5.1</b><span style="font-size:2.6rem;color:rgba(17,17,17,.45)">/10</span>'), 4, 70);
    tl.from(score, { y: "6rem", autoAlpha: 0, duration: 0.4, ease: "power3.out" }, p.scoreAt - 0.2);
    tl.add(Counter(score.querySelector(".sc"), p.scoreAt, { from: p.scoreFrom, to: p.scoreTo, decimals: 1, duration: 1.6 }), 0);

    // Phase 2: the app assembles screen by screen.
    out(tl, [h, termEl, score], p.phoneAt - 0.5);
    const screens = [
      `<div class="pp-sub sec">Fade Booking</div><div class="pp-title sec">Choose a service</div>
       <div class="pp-row sec"><div><div class="pp-name">Skin fade</div><div class="pp-meta">30 min</div></div></div>
       <div class="pp-row sec"><div><div class="pp-name">Beard trim</div><div class="pp-meta">15 min</div></div></div>
       <div class="pp-row sec"><div><div class="pp-name">Kids cut</div><div class="pp-meta">20 min</div></div></div>
       <div class="pp-btn sec">Choose a time</div>`,
      `<div class="pp-sub sec">Saturday</div><div class="pp-title sec">Pick a time</div>
       <div class="pp-slots sec">${["9:00", "9:30", "10:00", "10:30", "11:00", "11:30", "12:00", "1:00", "1:30"].map((t) => `<div class="pp-slot ${t === "10:30" ? "on" : ""}">${t}</div>`).join("")}</div>
       <div class="pp-btn sec">Book 10:30</div>`,
      `<div class="pp-sub sec">Owner view</div><div class="pp-title sec">Dashboard</div>
       <div class="pp-bars sec">${[40, 65, 50, 80, 70, 95, 60].map((v, i) => `<i class="${i === 5 ? "r" : ""}" style="height:${v}%"></i>`).join("")}</div>
       <div class="pp-stat sec"><div><b>10:30</b><span>Next booking</span></div><div><b>On</b><span>Reminders</span></div></div>`,
      `<div class="pp-done"><div class="ok sec">${P.glyph.check()}</div><div class="pp-title sec">Booked</div><div class="pp-meta sec" style="font-size:.9em">Sat 10:30 · Skin fade</div><div class="pp-meta sec" style="font-size:.8em;margin-top:.6em">Reminder set</div></div>`,
    ];
    tl.add(Phone(inner, p.phoneAt, { x: 31, y: 5, h: 76, scale: 17, screens, stepEvery: p.phoneStepEvery }), 0);
    // Left: which screen we're on.
    const steps = ["Service", "Time", "Dashboard", "Confirm"].map((s, i) => {
      const e = P.place(R.el(inner, "label-sm", `${i + 1} · ${s}`), 4, 24 + i * 9);
      e.style.fontSize = "2.4rem";
      gsap.set(e, { autoAlpha: 0 });
      const at = p.phoneAt + 0.45 + i * p.phoneStepEvery;
      tl.to(e, { autoAlpha: 1, color: "#111", duration: 0.3 }, at);
      if (i > 0) tl.to(e.previousSibling, { color: "rgba(17,17,17,.35)", duration: 0.3 }, at);
      return e;
    });
    void steps;
    // Right: feature chips, then the ORIGINAL shield.
    [["Booking", 1.2], ["Dashboard", 3.6]].forEach(([label, dt], i) => {
      const c = P.place(R.el(inner, "chip", `<span style="width:3.2rem;height:3.2rem;border-radius:50%;background:var(--green);display:grid;place-items:center">${P.glyph.check()}</span>${label}`), 68, 50 + i * 10);
      c.style.fontSize = "2.4rem";
      tl.from(c, { x: "6rem", autoAlpha: 0, duration: 0.4, ease: "power3.out" }, p.phoneAt + dt);
    });
    const sh = P.shield(inner, { x: 71, y: 14, size: 19 });
    tl.from(sh, { scale: 0.3, rotation: -14, autoAlpha: 0, duration: 0.5, ease: "back.out(1.4)" }, p.shieldAt);
    cardOut(tl, card, len);
    return tl;
  };

  // ---------------- S6 Step 3 title ----------------
  const step3Title = (node, sc, len) => {
    const p = sc.params;
    const tl = gsap.timeline();
    const { card, inner } = makeCard(node);
    cardIn(tl, card, 0.2);
    drift(tl, inner, len, 0.03);
    tl.add(Badge(inner, p.badgeAt, { num: 3, x: 7, y: 8, size: 24, active: 3 }), 0);
    headline(tl, inner, "Sell it [locally]", { x: 36, y: 11, w: 54, size: 10.5, at: p.badgeAt + 0.3 });
    tl.add(MapView(inner, p.mapAt, { x: 7, y: 37, w: 82, h: 44, cols: 7, rows: 4, pins: [{ at: [3, 2], t: p.pinAt - p.mapAt, size: 7 }] }), 0);
    const store = P.storefront(inner, { x: 50, y: 39, w: 24 });
    tl.from(store, { scale: 0, transformOrigin: "50% 100%", duration: 0.5, ease: "back.out(1.6)" }, p.storeAt);
    cardOut(tl, card, len);
    return tl;
  };

  // ---------------- S7 Step 3 detail ----------------
  const step3Detail = (node, sc, len) => {
    const p = sc.params;
    const tl = gsap.timeline();
    const { card, inner } = makeCard(node);
    cardIn(tl, card);
    drift(tl, inner, len, 0.03);
    const h = headline(tl, inner, "Walk in or [call]", { x: 7, y: 5, w: 82, size: 7.4, at: 0.15 });
    const callScreen = `
      <div style="position:absolute;inset:0;background:#18181B;color:#fff;display:flex;flex-direction:column;align-items:center;padding-top:5em;font-family:var(--sans)">
        <div style="position:relative;width:6em;height:6em">
          <i class="ring" style="position:absolute;inset:0;border-radius:50%;border:.15em solid rgba(255,255,255,.5)"></i>
          <i class="ring" style="position:absolute;inset:0;border-radius:50%;border:.15em solid rgba(255,255,255,.5)"></i>
          <div style="position:absolute;inset:0;border-radius:50%;background:var(--red);display:grid;place-items:center">${P.glyph.scissors}</div>
        </div>
        <div style="margin-top:1.4em;font-weight:800;font-size:1.25em">Fade &amp; Co.</div>
        <div class="status" style="margin-top:.4em;font-weight:500;font-size:.85em;color:rgba(255,255,255,.6);position:relative;height:1.2em;width:8em;text-align:center"><span class="s1" style="position:absolute;inset:0">Calling…</span><span class="s2" style="position:absolute;inset:0;color:#2FB36B">Connected</span></div>
        <div style="margin-top:auto;margin-bottom:2.4em;width:3.6em;height:3.6em;border-radius:50%;background:#E2342D"></div>
      </div>`;
    tl.add(Phone(inner, p.callAt, { x: 7, y: 16, h: 62, scale: 16, screens: [callScreen], firstAt: 0 }), 0);
    const phoneEl = inner.querySelector(".phone");
    const rings = phoneEl.querySelectorAll(".ring");
    rings.forEach((r, i) => tl.fromTo(r, { scale: 1, opacity: 0.6 }, { scale: 1.7, opacity: 0, duration: 1.2, repeat: 5, ease: "power1.out", immediateRender: false }, p.callAt + 0.4 + i * 0.6));
    const s2 = phoneEl.querySelector(".s2");
    gsap.set(s2, { autoAlpha: 0 });
    tl.set(phoneEl.querySelector(".s1"), { autoAlpha: 0 }, p.yesAt - 0.4).set(s2, { autoAlpha: 1 }, p.yesAt - 0.4);

    // Price tag: old price gets struck through, lower example price pops in.
    const tag = P.place(R.el(inner, "tag"), 44, 17, 46, 30);
    Object.assign(tag.style, { background: "#fff", borderRadius: "2.4rem", boxShadow: "var(--shadow)", padding: "3rem 3.4rem" });
    tag.innerHTML = `<div class="label-sm">Their current tool</div>
      <div style="position:relative;display:inline-block;margin-top:1rem"><span style="font:800 7rem/1 var(--sans)" class="counter">${p.oldPrice}</span><i class="strike" style="position:absolute;left:-1rem;right:-1rem;top:52%;height:.8rem;background:var(--red);border-radius:1rem;transform-origin:left center"></i></div>
      <div class="newp" style="display:flex;align-items:baseline;gap:1.6rem;margin-top:1.6rem"><span style="font:800 7rem/1 var(--sans);color:var(--red)" class="counter">${p.newPrice}</span><span style="font:700 2rem/1 var(--sans);letter-spacing:.12em;text-transform:uppercase;color:rgba(17,17,17,.5);border:.25rem solid rgba(17,17,17,.25);border-radius:99rem;padding:.6rem 1.2rem">example</span></div>`;
    const strike = tag.querySelector(".strike");
    const newp = tag.querySelector(".newp");
    gsap.set(strike, { scaleX: 0 });
    tl.from(tag, { x: "10rem", autoAlpha: 0, duration: 0.45, ease: "power3.out" }, p.priceAt)
      .to(strike, { scaleX: 1, duration: 0.3, ease: "power2.out" }, p.priceAt + 0.8)
      .from(newp, { y: "3rem", autoAlpha: 0, duration: 0.4, ease: "back.out(1.6)" }, p.priceAt + 1.2);
    const chips = [["Setup handled", p.setupAt], ["One monthly fee", p.feeAt]].map(([label, at], i) => {
      const c = P.place(R.el(inner, "chip", `<span style="width:3.2rem;height:3.2rem;border-radius:50%;background:var(--green);display:grid;place-items:center">${P.glyph.check()}</span>${label}`), 44, 52 + i * 10);
      tl.from(c, { x: "6rem", autoAlpha: 0, duration: 0.4, ease: "power3.out" }, at);
      return c;
    });
    const yes = P.place(R.el(inner, "yes", "Yes!"), 28, 14);
    Object.assign(yes.style, { background: "var(--green)", color: "#fff", font: "800 5.4rem/1 var(--sans)", padding: "2rem 3.4rem", borderRadius: "3rem 3rem 3rem .6rem", boxShadow: "var(--shadow)" });
    tl.from(yes, { scale: 0, transformOrigin: "0% 100%", duration: 0.45, ease: "back.out(1.8)" }, p.yesAt);

    // Phase 2: repeat on the next street — pins multiply along a looping route.
    out(tl, [h, phoneEl, tag, ...chips, yes], p.pinsAt - 0.5);
    const loop = [[1, 1], [4, 1], [4, 3], [6, 3], [6, 5], [2, 5], [2, 3], [1, 3], [1, 1]];
    const pins = [[1, 1], [4, 1], [4, 3], [6, 5], [2, 5], [1, 3]].map((at, i) => ({ at, t: 0.25 + i * 0.32, size: 6.2 }));
    tl.add(MapView(inner, p.pinsAt, { x: 7, y: 7, w: 82, h: 68, cols: 7, rows: 6, route: loop, routeAt: 0.1, routeDur: 2.0, pins }), 0);
    const next = P.place(R.el(inner, "chip", "Next street →"), 58, 12);
    tl.from(next, { scale: 0.6, autoAlpha: 0, duration: 0.4, ease: "back.out(1.6)" }, p.pinsAt + 1.4);

    // Required disclaimer footer, from the first price onward.
    const foot = P.place(R.el(inner, "foot", p.footer), 7, 79);
    Object.assign(foot.style, { font: "600 2.2rem/1 var(--sans)", color: "rgba(17,17,17,.55)" });
    tl.from(foot, { autoAlpha: 0, duration: 0.4 }, p.priceAt + 0.3);
    cardOut(tl, card, len);
    return tl;
  };

  // ---------------- S8 CTA ----------------
  const cta = (node, sc, len) => {
    const p = sc.params;
    const tl = gsap.timeline();
    const { card, inner } = makeCard(node, "card dark");
    cardIn(tl, card);
    drift(tl, inner, len, 0.025);
    headline(tl, inner, "Want the exact [prompt]?", { x: 7, y: 9, w: 82, size: 10.5, at: 0.2, color: "#fff" });
    const sub = P.place(R.el(inner, "", "+ my free guide, sent to your DMs"), 7, 36);
    Object.assign(sub.style, { font: "700 3.4rem/1.2 var(--sans)", color: "rgba(255,255,255,.65)" });
    tl.from(sub, { y: "2rem", autoAlpha: 0, duration: 0.4, ease: "power3.out" }, 0.8);

    const box = P.place(R.el(inner, "cbox"), 7, 50, 82, 13);
    Object.assign(box.style, { background: "#fff", color: "var(--ink)", borderRadius: "99rem", display: "flex", alignItems: "center", gap: "2rem", padding: "0 2.4rem 0 1.8rem" });
    box.innerHTML = `<div style="width:8.4rem;height:8.4rem;border-radius:50%;background:var(--soft);flex:none"></div>
      <div style="position:relative;flex:1;font:800 4.6rem/1 var(--sans)"><span class="ph" style="position:absolute;top:50%;transform:translateY(-50%);color:rgba(17,17,17,.38);font-weight:500;font-size:3.6rem">Add a comment…</span><span class="typed"></span><i class="caret" style="display:inline-block;width:.35rem;height:4.6rem;background:var(--ink);vertical-align:middle;margin-left:.4rem"></i></div>
      <div class="post" style="font:800 3.8rem/1 var(--sans);color:var(--red);padding:1.4rem 2.2rem;border-radius:99rem">Post</div>`;
    tl.from(box, { y: "6rem", autoAlpha: 0, duration: 0.45, ease: "power3.out" }, p.boxAt + 1.0);
    const typed = box.querySelector(".typed");
    const ph = box.querySelector(".ph");
    const caret = box.querySelector(".caret");
    tl.to(caret, { opacity: 0, duration: 0.45, ease: "steps(1)", repeat: 13, yoyo: true }, p.boxAt + 1.0);
    tl.to(ph, { autoAlpha: 0, duration: 0.1 }, p.typeAt);
    const word = p.keyword;
    const tk = { k: 0 };
    tl.to(tk, { k: word.length, duration: word.length * 0.15, ease: "none", onUpdate: () => (typed.textContent = word.slice(0, Math.floor(tk.k))) }, p.typeAt);
    const post = box.querySelector(".post");
    tl.to(post, { backgroundColor: "rgba(226,52,45,.12)", duration: 0.2 }, p.pulseAt)
      .to(post, { scale: 1.12, duration: 0.3, ease: "sine.inOut", yoyo: true, repeat: 7 }, p.pulseAt);

    const handle = P.place(R.el(inner, "handle"), 7, 69);
    Object.assign(handle.style, { display: "flex", alignItems: "center", gap: "2rem" });
    handle.innerHTML = `<div style="width:7rem;height:7rem">${P.camera}</div><span style="font:800 4.2rem/1 var(--sans);color:#fff">${window.__meta?.handle || "@yourhandle"}</span><span style="font:800 2.6rem/1 var(--sans);color:#fff;background:var(--red);border-radius:99rem;padding:1.2rem 2.4rem">Follow</span>`;
    tl.from(handle, { y: "4rem", autoAlpha: 0, duration: 0.45, ease: "power3.out" }, p.handleAt + 1.2);
    return tl;
  };

  // Placeholder for any scene without a builder.
  const placeholder = (node, sc, len) => {
    const tl = gsap.timeline();
    const { card } = makeCard(node, "card todo");
    R.el(card, "kicker", `${sc.id} · ${sc.name}`);
    cardIn(tl, card);
    cardOut(tl, card, len);
    return tl;
  };

  const all = { hook, step1Title, step1Detail, step2Title, step2Detail, step3Title, step3Detail, cta, placeholder };
  // Wrap builders so the last enabled scene skips its exit animation.
  return Object.fromEntries(Object.entries(all).map(([k, fn]) => [k, (node, sc, len) => { holdLast = !!sc.isLast; const tl = fn(node, sc, len); holdLast = false; return tl; }]));
})();
