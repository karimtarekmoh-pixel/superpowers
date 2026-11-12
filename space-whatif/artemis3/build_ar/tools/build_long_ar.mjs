// Artemis III long-form (1920x1080): spec-in-code builder. All times come from audio/timestamps.json word times (W). Writes hf/index.html and audio/sfx_events.json.
import fs from "node:fs";
import { buildTimeline } from "../src/timeline.js";
const S = JSON.parse(fs.readFileSync("src/script.json")), TS = JSON.parse(fs.readFileSync("audio/timestamps.json"));
const T = buildTimeline(S, TS), W = T.W, sc = (id) => T.scene(id);
const DUR = Math.ceil(T.duration * 30) / 30;
const C = { bg: "#05070D", card: "#0E1422", line: "#26324A", txt: "#EAF0FF", grey: "#8FA0C0", cy: "#5CC8FF", am: "#FFB547", red: "#FF6B6B", gr: "#6BE3A4" };
const html = [], js = [], fx = [];
const AR_T = ["المقدمة", "أرتميس 3 بالظبط إيه", "تلات مركبات، تلات صواريخ", "التسلسل خطوة بخطوة", "التحامين، تصميمين", "لغز الجدول الزمني وسؤال لو", "السباق اللي محدش حسمه", "إزاي الهبوط المفروض يشتغل", "إيه اللي تتابعه"];
const e = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
const f3 = (x) => (+x).toFixed(3);
const sfx = (t, type, gain = 0.7, rate = 1) => { if (t > 0.9) fx.push({ t: +t.toFixed(3), type, gain, rate }); };
const AUTO = []; let ai = 0; const PENT = [1, 1.125, 1.25, 1.5, 1.667, 1.875, 2, 1.333];
const aut = (t, type, gain) => { if (t > 0.9) AUTO.push({ t: +(+t).toFixed(3), type, gain, rate: PENT[(ai++) % PENT.length] }); };
const show = (sel, t, y = 14, d = 0.35) => { aut(Math.max(0, t), ["tick", "pop", "pluck", "click"][ai % 4], 0.3); js.push(`tl.fromTo("${sel}",{opacity:0,y:${y}},{opacity:1,y:0,duration:${d},ease:"power2.out"},${f3(Math.max(0, t))});`); };
const popv = (sel, t) => { aut(Math.max(0, t), "pop", 0.36); js.push(`tl.fromTo("${sel}",{opacity:0,scale:.94},{opacity:1,scale:1,duration:.25,ease:"power2.out"},${f3(Math.max(0, t))});`); };
const hide = (sel, t, d = 0.3) => js.push(`tl.to("${sel}",{opacity:0,duration:${d}},${f3(t)});`);
const draw = (sel, t, d = 0.6) => { aut(t, "chirp", 0.3); js.push(`tl.to("${sel}",{strokeDashoffset:0,duration:${d},ease:"power2.out"},${f3(t)});`); };
const recolor = (sel, t, props) => { aut(t, "tick", 0.22); js.push(`tl.to("${sel}",{${props},duration:.2},${f3(t)});`); };
const MISS = []; const A = (id, w, o = 0) => { try { return W(id, w, o); } catch (e) { MISS.push(`${id}:${w}`); return T.scene(id).start + 1; } };
const scene = (id, a, b, fn) => { html.push(`<div class="scene" id="sc_${id}">`); fn(); html.push(`</div>`); js.push(`tl.set("#sc_${id}",{opacity:1},${f3(a)});${b != null ? `tl.set("#sc_${id}",{opacity:0},${f3(b)});` : ""}`); };
const card = (id, x, y, w, h, inner, cls = "") => html.push(`<div class="card ${cls}" id="${id}" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px">${inner}</div>`);
const tag = (t, cls = "", id = "") => `<span class="tag ${cls}" ${id ? `id="${id}"` : ""}>${e(t)}</span>`;
const text = (id, x, y, w, inner, cls = "") => html.push(`<div class="tx ${cls}" id="${id}" style="left:${x}px;top:${y}px;width:${w}px">${inner}</div>`);
const line = (id, d, col = C.cy, w = 5) => `<path id="${id}" d="${d}" pathLength="1" stroke="${col}" stroke-width="${w}" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1" stroke-dashoffset="1"/>`;
// ---- detailed original vehicle illustrations (shaded, panel lines, engines); ids reference gradients in the global defs
const DEFS = `<svg width="0" height="0" style="position:absolute"><defs>
<linearGradient id="gWhite" x1="0" x2="1"><stop offset="0" stop-color="#9AA8C0"/><stop offset=".35" stop-color="#FFFFFF"/><stop offset=".75" stop-color="#D5DEEE"/><stop offset="1" stop-color="#8795AF"/></linearGradient>
<linearGradient id="gOrange" x1="0" x2="1"><stop offset="0" stop-color="#9C4F18"/><stop offset=".35" stop-color="#F5A765"/><stop offset=".75" stop-color="#D9772F"/><stop offset="1" stop-color="#8A4413"/></linearGradient>
<linearGradient id="gGold" x1="0" x2="1"><stop offset="0" stop-color="#7C5C22"/><stop offset=".4" stop-color="#F0CC72"/><stop offset=".8" stop-color="#B08A38"/><stop offset="1" stop-color="#6E5019"/></linearGradient>
<linearGradient id="gSteel" x1="0" x2="1"><stop offset="0" stop-color="#5E6A7D"/><stop offset=".3" stop-color="#EEF3FB"/><stop offset=".6" stop-color="#B7C2D4"/><stop offset="1" stop-color="#5B6679"/></linearGradient>
<linearGradient id="gPanel" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2E78D8"/><stop offset="1" stop-color="#0B2A5B"/></linearGradient>
<linearGradient id="gDark" x1="0" x2="1"><stop offset="0" stop-color="#2A3140"/><stop offset=".5" stop-color="#5A6578"/><stop offset="1" stop-color="#2A3140"/></linearGradient>
<radialGradient id="gFlame" cx="50%" cy="0%" r="100%"><stop offset="0" stop-color="#FFF3C4"/><stop offset=".35" stop-color="#FFB547"/><stop offset="1" stop-color="rgba(255,120,40,0)"/></radialGradient>
<pattern id="pHex" width="10" height="8" patternUnits="userSpaceOnUse"><path d="M0 4 L5 0 L10 4 L5 8 Z" fill="none" stroke="rgba(30,38,52,.55)" stroke-width=".8"/></pattern>
<pattern id="pGrid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M10 0 H0 V10" fill="none" stroke="rgba(190,225,255,.55)" stroke-width=".7"/></pattern>
<filter id="blur6"><feGaussianBlur stdDeviation="6"/></filter><filter id="blur3"><feGaussianBlur stdDeviation="3"/></filter>
</defs></svg>`;
const flame = (x, y, w, h) => `<ellipse class="glow" cx="${x}" cy="${y + h / 2}" rx="${w}" ry="${h}" fill="url(#gFlame)" opacity=".85"/>`;
const orion = (s = 1) => `<g transform="scale(${s})">
 ${[-1, 1].map((k) => `<g transform="scale(${k} 1)"><rect x="22" y="-2" width="14" height="5" fill="url(#gDark)"/>${[0, 1, 2].map((i) => `<g transform="translate(${36 + i * 30} 0)"><rect x="0" y="-9" width="28" height="22" fill="url(#gPanel)" stroke="#CFE6FF" stroke-width=".8"/><rect x="0" y="-9" width="28" height="22" fill="url(#pGrid)"/></g>`).join("")}</g>`).join("")}
 <path d="M-9 -58 L9 -58 L13 -50 L26 -22 L-26 -22 L-13 -50 Z" fill="url(#gWhite)" stroke="#8795AF" stroke-width=".8"/>
 <rect x="-5" y="-60" width="10" height="4" rx="1" fill="url(#gDark)"/>
 <path d="M-8 -44 h4 v6 h-4 Z M4 -44 h4 v6 h-4 Z" fill="#1C2433"/>
 <rect x="-26" y="-22" width="52" height="5" fill="#2E3542"/>
 <rect x="-24" y="-17" width="48" height="40" rx="2" fill="url(#gGold)" stroke="#6E5019" stroke-width=".8"/>
 ${[-8, 0, 8, 16].map((y) => `<line x1="-24" y1="${y}" x2="24" y2="${y}" stroke="rgba(90,60,10,.55)" stroke-width="1"/>`).join("")}
 <path d="M-9 23 L9 23 L15 40 L-15 40 Z" fill="url(#gDark)"/>${flame(0, 40, 9, 18)}
</g>`;
const lander = (s = 1) => `<g transform="scale(${s})">
 <path d="M-26 34 L-52 70 M26 34 L52 70 M-14 36 L-24 70 M14 36 L24 70" stroke="#9AA8C0" stroke-width="5" stroke-linecap="round"/>
 ${[-52, 52, -24, 24].map((x) => `<ellipse cx="${x}" cy="71" rx="9" ry="3" fill="#6B7890"/>`).join("")}
 <path d="M-14 40 L14 40 L19 52 L-19 52 Z" fill="url(#gDark)"/>${flame(0, 52, 11, 16)}
 <rect x="-34" y="-20" width="68" height="62" rx="14" fill="url(#gWhite)" stroke="#8795AF" stroke-width=".9"/>
 <line x1="-34" y1="6" x2="34" y2="6" stroke="rgba(60,80,120,.5)"/><line x1="-34" y1="24" x2="34" y2="24" stroke="rgba(60,80,120,.5)"/>
 <rect x="-34" y="10" width="68" height="4" fill="#5CC8FF" opacity=".75"/>
 <path d="M-24 -20 C-24 -52 -14 -66 0 -66 C14 -66 24 -52 24 -20 Z" fill="url(#gSteel)" stroke="#8795AF" stroke-width=".9"/>
 <circle cx="0" cy="-42" r="9" fill="#18202E" stroke="#5CC8FF" stroke-width="1.4"/><circle cx="-3" cy="-45" r="3" fill="rgba(255,255,255,.35)"/>
 <rect x="24" y="-38" width="12" height="14" rx="2" fill="url(#gDark)"/>
</g>`;
const ship = (s = 1) => `<g transform="scale(${s})">
 <path d="M-17 56 L-36 74 L-17 66 Z M17 56 L36 74 L17 66 Z" fill="url(#gSteel)" stroke="#5B6679" stroke-width=".8"/>
 <path d="M-17 -16 L-31 -2 L-17 6 Z M17 -16 L31 -2 L17 6 Z" fill="url(#gSteel)" stroke="#5B6679" stroke-width=".8"/>
 <path d="M0 -84 C13 -76 18 -48 18 -20 L18 60 L-18 60 L-18 -20 C-18 -48 -13 -76 0 -84 Z" fill="url(#gSteel)" stroke="#5B6679" stroke-width=".9"/>
 <path d="M0 -84 C13 -76 18 -48 18 -20 L18 60 L-18 60 L-18 -20 C-18 -48 -13 -76 0 -84 Z" fill="url(#pHex)" opacity=".55"/>
 <rect x="-6" y="-88" width="12" height="6" rx="1.5" fill="url(#gDark)"/>
 <rect x="-18" y="-4" width="36" height="3" fill="rgba(30,38,52,.5)"/><rect x="-18" y="30" width="36" height="3" fill="rgba(30,38,52,.5)"/>
 <rect x="-18" y="60" width="36" height="8" fill="url(#gDark)"/>${[-10, 0, 10].map((x) => `<circle cx="${x}" cy="69" r="3.2" fill="#2A3140"/>`).join("")}${flame(0, 70, 14, 20)}
</g>`;
const sls = (s = 1) => `<g transform="scale(${s})">
 <path d="M-8 -100 L8 -100 L12 -84 L-12 -84 Z" fill="url(#gWhite)"/><path d="M-4 -108 L4 -108 L8 -100 L-8 -100 Z" fill="url(#gWhite)"/>
 <rect x="-12" y="-84" width="24" height="22" fill="url(#gWhite)"/><rect x="-14" y="-62" width="28" height="8" fill="url(#gOrange)"/>
 <rect x="-14" y="-54" width="28" height="118" fill="url(#gOrange)" stroke="#8A4413" stroke-width=".8"/>
 ${[-30, -6, 18, 42].map((y) => `<line x1="-14" y1="${y}" x2="14" y2="${y}" stroke="rgba(110,50,10,.55)" stroke-width="1.2"/>`).join("")}
 ${[-1, 1].map((k) => `<g transform="translate(${k * 24} 0)"><path d="M-9 -26 L0 -50 L9 -26 Z" fill="url(#gWhite)"/><rect x="-9" y="-26" width="18" height="96" fill="url(#gWhite)" stroke="#8795AF" stroke-width=".8"/><rect x="-9" y="14" width="18" height="7" fill="#262B36"/><path d="M-6 70 L6 70 L9 82 L-9 82 Z" fill="url(#gDark)"/>${flame(0, 82, 8, 26)}</g>`).join("")}
 ${[-8, -2.7, 2.7, 8].map((x) => `<path d="M${x - 2.4} 64 L${x + 2.4} 64 L${x + 3.4} 72 L${x - 3.4} 72 Z" fill="url(#gDark)"/>`).join("")}${flame(0, 72, 11, 28)}
</g>`;
const svgWrap = (inner, extra = "") => `<svg class="lay" width="1920" height="1080" viewBox="0 0 1920 1080" ${extra}>${inner}</svg>`;
const earthArc = (cx, cy, r, id = "e") => { const S = r * 2 * 1.1; return `<image id="eimg${id}" href="assets/earth.png" x="${cx - S / 2}" y="${cy - S / 2}" width="${S}" height="${S}"/>`; };


// ================= moving space life: twinkling glints, drifting dust, shooting stars, a slow galaxy, a passing satellite, double nebula drift
const BG = []; const rnd = (() => { let a = 20261111; return () => (a = (a * 1664525 + 1013904223) % 4294967296) / 4294967296; })();
for (let i = 0; i < 30; i++) { const x = rnd() * 1860 + 30, y = rnd() * 1000 + 30, sz = 5 + rnd() * 9;
  BG.push(`<svg class="gl4" id="gl${i}" style="left:${x.toFixed(0)}px;top:${y.toFixed(0)}px" width="${(sz * 2).toFixed(0)}" height="${(sz * 2).toFixed(0)}" viewBox="-10 -10 20 20"><path d="M0 -10 L1.6 -1.6 L10 0 L1.6 1.6 L0 10 L-1.6 1.6 L-10 0 L-1.6 -1.6 Z" fill="#fff"/></svg>`);
  js.push(`tl.fromTo("#gl${i}",{opacity:.9,scale:1},{opacity:.12,scale:.55,duration:${(1.3 + rnd() * 2.6).toFixed(2)},yoyo:true,repeat:${Math.ceil(DUR / 1.3)},ease:"sine.inOut"},${(rnd() * 3).toFixed(2)});`); }
for (let i = 0; i < 52; i++) { const x = rnd() * 1920, y = rnd() * 1080, sz = 1.6 + rnd() * 2.6, dx = -(120 + rnd() * 380), dy = -(40 + rnd() * 160);
  BG.push(`<i class="dust" id="du${i}" style="left:${x.toFixed(0)}px;top:${y.toFixed(0)}px;width:${sz.toFixed(1)}px;height:${sz.toFixed(1)}px;opacity:${(0.25 + rnd() * 0.4).toFixed(2)}"></i>`);
  js.push(`tl.to("#du${i}",{x:${dx.toFixed(0)},y:${dy.toFixed(0)},duration:${DUR},ease:"none"},0);`); }
{ let k = 0; for (let t = 7.5; t < DUR - 3; t += 6 + rnd() * 8, k++) {
    const left = rnd() < 0.35, ang = left ? 140 + rnd() * 28 : 12 + rnd() * 30, L = 160 + rnd() * 260, D = 600 + rnd() * 700, br = rnd() < 0.3;
    const x = 200 + rnd() * 1500, y = 40 + rnd() * 420, dx = Math.cos(ang * Math.PI / 180) * D, dy = Math.sin(ang * Math.PI / 180) * D, d = 0.55 + rnd() * 0.6;
    BG.push(`<div class="meteor${br ? " bright" : ""}" id="mt${k}" style="left:${x.toFixed(0)}px;top:${y.toFixed(0)}px;width:${L.toFixed(0)}px;rotate:${ang.toFixed(1)}deg"></div>`);
    js.push(`tl.fromTo("#mt${k}",{opacity:0,x:0,y:0},{opacity:1,x:${(dx * .3).toFixed(0)},y:${(dy * .3).toFixed(0)},duration:${(d * .3).toFixed(2)},ease:"power1.in"},${t.toFixed(2)});tl.to("#mt${k}",{x:${dx.toFixed(0)},y:${dy.toFixed(0)},opacity:0,duration:${(d * .7).toFixed(2)},ease:"power1.out"},${(t + d * .3).toFixed(2)});`);
    if (k % 2 === 0) sfx(t + 0.05, "sparkle", br ? 0.24 : 0.16, 1.3 + rnd() * 0.4); } }
for (let i = 0; i < 16; i++) { const x = rnd() * 1840 + 40, y = rnd() * 980 + 40, z = 26 + rnd() * 34, d1 = 2 + rnd() * 3, d2 = 9 + rnd() * 14, hue = rnd() < .5 ? "205,225,255" : "255,226,190";
  BG.push(`<div class="gstar" id="gs${i}" style="left:${x.toFixed(0)}px;top:${y.toFixed(0)}px;width:${z.toFixed(0)}px;height:${z.toFixed(0)}px"><i class="gh" style="background:radial-gradient(circle,rgba(${hue},.95) 0,rgba(${hue},.35) 18%,rgba(${hue},0) 62%)"></i><svg viewBox="-10 -10 20 20" width="${z.toFixed(0)}" height="${z.toFixed(0)}"><path d="M0 -10 L.7 -.7 L10 0 L.7 .7 L0 10 L-.7 .7 L-10 0 L-.7 -.7 Z" fill="rgba(${hue},.9)"/></svg></div>`);
  js.push(`tl.fromTo("#gs${i} .gh",{scale:.7,opacity:.55},{scale:1.35,opacity:1,duration:${d1.toFixed(2)},yoyo:true,repeat:${Math.ceil(DUR / d1)},ease:"sine.inOut"},${(rnd() * 2).toFixed(2)});tl.fromTo("#gs${i} svg",{rotation:0,opacity:.5},{rotation:${(rnd() < .5 ? 1 : -1) * 45},opacity:1,duration:${d2.toFixed(1)},yoyo:true,repeat:${Math.ceil(DUR / d2)},ease:"sine.inOut"},0);`); }
for (let i = 0; i < 26; i++) { const x = rnd() * 1920, y = rnd() * 1080, sz = 4 + rnd() * 7;   // foreground dust: bigger, blurred, faster (parallax depth)
  BG.push(`<i class="fdust" id="fd${i}" style="left:${x.toFixed(0)}px;top:${y.toFixed(0)}px;width:${sz.toFixed(1)}px;height:${sz.toFixed(1)}px;opacity:${(0.10 + rnd() * 0.18).toFixed(2)}"></i>`);
  js.push(`tl.to("#fd${i}",{x:${(-(500 + rnd() * 700)).toFixed(0)},y:${(-(120 + rnd() * 260)).toFixed(0)},duration:${DUR},ease:"none"},0);`); }
BG.push(`<div id="leak"></div>`); js.push(`tl.fromTo("#leak",{x:-300,opacity:.0},{x:600,opacity:.5,duration:${DUR / 2},ease:"sine.inOut",yoyo:true,repeat:1},0);`);
BG.push(`<div id="gal"></div><div id="sat"></div>`);
js.push(`tl.to("#gal",{rotation:-12,duration:${DUR},ease:"none"},0);tl.to("#sat",{x:2100,y:120,duration:48,ease:"none"},29);tl.to("#sat",{opacity:.25,duration:1.1,yoyo:true,repeat:40,ease:"sine.inOut"},29);`);
js.push(`tl.to("#neb",{x:330,y:-150,scale:1.12,duration:${DUR},ease:"none"},0);tl.to("#neb2",{x:-260,y:90,rotation:3,duration:${DUR},ease:"none"},0);tl.to("#neb",{opacity:.58,duration:14,ease:"sine.inOut",yoyo:true,repeat:${Math.ceil(DUR / 14)}},0);`);

const MEDIA = []; let trk = 10;
const sprite = (id, w, h, x, y, start, dur, mode, src) => { MEDIA.push({ id, kind: "sprite", src, w, h, start: +start.toFixed(3), dur: +dur.toFixed(3), mode }); return `<div class="spw" id="${id}" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px"><video id="${id}_v" class="clip" src="sprites/${id}.webm" muted playsinline data-start="${f3(start)}" data-duration="${f3(dur)}" data-track-index="${trk++}" style="width:${w}px;height:${h}px"></video></div>`; };
const order = ["c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8", "c9"];
// ---------- persistent: chapter label + progress bar
html.push(`<div id="chl" class="chl"></div>`);
{ const X0 = 210, X1 = 1824, GAP = 8, tot = DUR, segs = order.map((id, i) => { const st = i === 0 ? 0 : sc(id).start, en = i + 1 < order.length ? sc(order[i + 1]).start : DUR; return { st, en }; });
  let x = X0; const usable = X1 - X0 - GAP * (order.length - 1), BW = X1 - X0;
  segs.forEach((g) => { g.x = x; g.w = usable * (g.en - g.st) / tot; x += g.w + GAP; });
  html.push(`<div id="plab"><b id="plabn">1</b><span>/ ${order.length}</span></div><div id="pbar">${segs.map((g, i) => `<div class="pseg" id="ps${i}" style="left:${(BW - (g.x - X0) - g.w).toFixed(1)}px;width:${g.w.toFixed(1)}px"><i id="pf${i}"></i></div>`).join("")}<div id="phead"></div></div>`);
  segs.forEach((g, i) => {
    const hx0 = BW - (g.x - X0), hx1 = hx0 - g.w;
    js.push(`tl.fromTo("#pf${i}",{width:"0%"},{width:"100%",duration:${(g.en - g.st).toFixed(3)},ease:"none"},${f3(g.st)});tl.fromTo("#phead",{left:${hx0.toFixed(1)}},{left:${hx1.toFixed(1)},duration:${(g.en - g.st).toFixed(3)},ease:"none",immediateRender:false},${f3(g.st)});`);
    js.push(`tl.set("#plabn",{textContent:"${i + 1}"},${f3(g.st)});tl.fromTo("#plab",{scale:1.35},{scale:1,duration:.45,ease:"back.out(2)",immediateRender:false},${f3(g.st)});tl.fromTo("#ps${i}",{scaleY:2.2},{scaleY:1,duration:.5,ease:"power2.out",immediateRender:false},${f3(g.st)});tl.to("#ps${i}",{borderColor:"rgba(255,181,71,.9)",duration:.2},${f3(g.st)});tl.to("#ps${i}",{borderColor:"rgba(92,200,255,.35)",duration:.4},${f3(g.en)});`);
  }); }
S.sections.forEach((s, i) => { const t = sc(s.id).start; js.push(`tl.set("#chl",{textContent:"الفصل ${i + 1} · ${AR_T[i]}"},${f3(t)});tl.fromTo("#chl",{opacity:0,x:-12},{opacity:1,x:0,duration:.5,ease:"power2.out",immediateRender:false},${f3(t + 0.05)});`); });

// ================= C1 HOOK
scene("c1", 0, sc("c2").start, () => {
  text("c1y", 924, 120, 900, `2027`, "huge am");
  text("c1a", 920, 330, 900, `<span class="ppl"><i></i><i></i><i></i><i></i></span><span class="mono grey">أربعة رواد فضاء</span>`, "row");
  html.push(`<div id="c1t" class="stamp big2" style="left:420px;top:300px;width:1080px"><div>أرتميس 3</div></div>`);
  html.push(`<div id="c1n" class="stamp red2" style="left:380px;top:300px;width:1160px"><div>مش مهمة الهبوط</div></div>`);
  text("c1h", 1150, 560, 400, tag("الباب مفتوح", "cy"), "r");
  text("c1v", 520, 560, 500, tag("نسخة تجريبية", "am"), "r");
  text("c1mi2", 0, 860, 1920, tag("على ارتفاع حوالي 273 ميل فوق الأرض", "am"), "ctr");
  html.push(sprite("s_hook", 340, 340, 790, 380, A("c1", "float") - 0.1, sc("c2").start - (A("c1", "float") - 0.1), "loop", "lander"));
  js.push(`tl.fromTo("#s_hook",{opacity:0,y:16},{opacity:1,y:0,duration:.8,ease:"power2.out"},${f3(A("c1", "float") - 0.1)});`); sfx(A("c1", "float") - 0.05, "whoosh", 0.35, 0.9);
  js.push(`tl.fromTo("#c1mi2",{opacity:0},{opacity:1,duration:.3},${f3(A("c1", "hundred") - 0.1)});`);
  show("#c1y", 0.3); sfx(A("c1", "four") - 0.05, "pop", 0.5);
  show("#c1a", A("c1", "four") - 0.1); js.push(`tl.fromTo("#c1a i",{scale:0},{scale:1,duration:.2,stagger:.12,ease:"power2.out"},${f3(A("c1", "four") - 0.05)});`);
  js.push(`tl.to("#c1orb",{opacity:.9,duration:.8},${f3(A("c1", "hatch") - 0.4)});`);
  popv("#c1h", A("c1", "hatch") - 0.05); sfx(A("c1", "hatch") - 0.05, "click", 0.8);
  js.push(`tl.fromTo("#c1lan",{opacity:0,y:10},{opacity:1,y:0,duration:.5},${f3(A("c1", "float") - 0.1)});`); sfx(A("c1", "float") - 0.1, "pluck", 0.6);
  js.push(`tl.to("#c1y",{opacity:.35,duration:.4},${f3(A("c1", "Moon", 1) - 0.1)});tl.fromTo("#c1m",{opacity:0},{opacity:1,duration:1.2,ease:"power2.out"},${f3(A("c1", "Moon", 0) - 0.1)});`); sfx(A("c1", "Moon", 0) - 0.1, "glass", 0.4);
  draw("#c1dim", A("c1", "hundred") - 0.2, 0.5); js.push(`tl.to("#c1mi",{opacity:1,duration:.3},${f3(A("c1", "hundred") - 0.1)});`); sfx(A("c1", "hundred") - 0.1, "tick", 0.7);
  popv("#c1v", A("c1", "test") - 0.05); sfx(A("c1", "test") - 0.05, "pop", 0.7);
  js.push(`tl.fromTo("#c1t",{opacity:0,scale:.92},{opacity:1,scale:1,duration:.3,ease:"power2.out"},${f3(A("c1", "Artemis") - 0.1)});tl.to("#c1t",{opacity:0,duration:.3},${f3(A("c1", "It", 2) - 0.1)});`); sfx(A("c1", "Artemis") - 0.12, "marimba", 0.8);
  js.push(`tl.fromTo("#c1n",{opacity:0,scale:2.0,rotation:-8},{opacity:1,scale:1,rotation:-4,duration:.22,ease:"power4.in",immediateRender:false},${f3(A("c1", "landing") - 0.35)});tl.to("#c1n",{opacity:0,duration:.3},${f3(A("c1", "And") + 0.0)});`); sfx(A("c1", "landing") - 0.2, "stamp", 0.9); sfx(A("c1", "landing") - 0.2, "impact", 0.5);
});
// ================= C2 WHAT IT IS
scene("c2", sc("c2").start, sc("c3").start, () => {
  const ty = 440;
  html.push(svgWrap(`<rect x="160" y="${ty}" width="1600" height="8" rx="4" fill="${C.line}"/>${line("c2l", `M160 ${ty + 4} H1760`, C.cy, 8)}<circle cx="560" cy="${ty + 4}" r="20" fill="${C.cy}"/><circle cx="1360" cy="${ty + 4}" r="20" fill="${C.am}"/>`));
  text("c2a", 330, 200, 460, `<div class="big cy">2027</div>`, "ctr");text("c2a2", 330, 490, 460, `<div class="mono">أرتميس 3</div><div class="mono grey sm">مدار الأرض · 14 يوم</div>`, "ctr");
  text("c2b", 1130, 200, 460, `<div class="big am">2028</div>`, "ctr");text("c2b2", 1130, 490, 460, `<div class="mono">أرتميس 4</div><div class="mono grey sm">هبوط · القطب الجنوبي · الهدف</div>`, "ctr");
  const names = [["القائد", "راندي بريسنيك", "bresnik"], ["الطيار", "لوكا بارميتانو (ESA)", "parmitano"], ["أخصائي مهمة", "أندريه دوجلاس", "douglas"], ["أخصائي مهمة", "فرانك روبيو", "rubio"]];
  names.forEach(([r, n], i) => card(`c2c${i}`, 130 + (3 - i) * 420, 640, 390, 160, `<div class="mono grey sm">${r}</div><div class="nm">${n}</div>`, "mock"));
  card("c2q", 130, 810, 1660, 100, `<div class="quote">ناسا: <b>أرتميس 3 مش هتهبط على القمر.</b> الهبوط هيكون في أرتميس 4، والهدف سنة 2028.</div>`, "mock");
  html.push(`<div id="c2k" class="chips" style="left:130px;top:905px;width:1660px">${tag("تقليل المخاطر", "cy")}${tag("التأكد من الأجهزة", "cy")}${tag("اكتساب خبرة تشغيلية", "cy")}</div>`);
  const t0 = sc("c2").start;
  show("#c2a", A("c2", "twenty") - 0.1); show("#c2a2", A("c2", "twenty") - 0.1); draw("#c2l", A("c2", "twenty") - 0.1, 1.4); sfx(A("c2", "twenty") - 0.1, "pluck", 0.7);
  [["bresnik", 0], ["Luca", 1], ["Andre", 2], ["Frank", 3]].forEach(([w, i]) => { const t = (w === "bresnik" ? A("c2", "Randy") : A("c2", w)) - 0.1; show(`#c2c${i}`, t); sfx(t, "tick", 0.6, 1 + 0.1 * i); });
  show("#c2b", A("c2", "Artemis", 1) - 0.1); show("#c2b2", A("c2", "Artemis", 1) - 0.1); sfx(A("c2", "Artemis", 1) - 0.1, "pluck", 0.7, 1.26);
  show("#c2q", A("c2", "plainly") - 0.1); sfx(A("c2", "plainly") - 0.1, "glass", 0.7);
  ["REDUCE RISK", "VALIDATE HARDWARE", "GAIN OPERATIONAL EXPERIENCE"].forEach((_, i) => { const w = ["reduce", "validate", "gain"][i], t = A("c2", w) - 0.05; js.push(`tl.fromTo("#c2k .tag:nth-child(${i + 1})",{opacity:0,y:10},{opacity:1,y:0,duration:.3},${f3(t)});`); sfx(t, "pop", 0.6, 1 + 0.12 * i); });
  js.push(`tl.set("#c2k .tag",{opacity:0},0);`);
});
// ================= C3 THREE SPACECRAFT, THREE ROCKETS
scene("c3", sc("c3").start, sc("c4").start, () => {
  const xs = [380, 960, 1540];
  
  [["أوريون + إس إل إس", "ناسا", "c3on"], ["بلو مون مارك 2", "نسخة تجريبية", "c3bn"], ["ستارشيب V3", "نسخة تجريبية", "c3sn"]].forEach(([n, s, id], i) => text(id, xs[i] - 240, 662, 480, `<div class="nm">${n}</div><div class="mono grey">${s}</div>`, "ctr"));
  card("c3q", 260, 748, 1400, 160, `<div class="quote">«إحنا بنطلّق <b>تلات مركبات فضاء على تلات صواريخ مختلفة</b> وبنختبر إزاي بتشتغل مع بعض، حاجة ناسا عمرها ما حاولتها.» <span class="grey">جيريمي بارسونز، مدير برنامج أرتميس</span></div>`, "mock");
  text("c3x", 424, 130, 1400, `<div class="mono grey">مهمات أرتميس السابقة</div><div class="mid">صاروخ ناسا + كبسولة ناسا بس</div>`, "l");
  show("#c3x", sc("c3").start + 0.2);
  const tO = A("c3", "Orion"), tB = A("c3", "Blue", 0), tS = A("c3", "SpaceX's");
  js.push(`tl.to("#c3x",{opacity:.0,duration:.3},${f3(A("c3", "different") - 0.1)});`);
  show("#c3q", A("c3", "Parsons") - 0.1); sfx(A("c3", "Parsons") - 0.1, "glass", 0.7);
  [["#c3o", "#c3on", A("c3", "Those") + 0.9], ["#c3b", "#c3bn", 0], ["#c3s", "#c3sn", 0]].forEach(() => {});
  const tt = [A("c3", "Orion", 0), A("c3", "Blue", 0), A("c3", "SpaceX's", 0)];
  ["#c3o:#c3on", "#c3b:#c3bn", "#c3s:#c3sn"].forEach((p, i) => { const [g, n] = p.split(":"); js.push(`tl.fromTo("${g}",{opacity:0,y:20},{opacity:1,y:0,duration:.5,ease:"power2.out"},${f3(tt[i] - 0.1)});`); show(n, tt[i], 14); sfx(tt[i] - 0.1, "pluck", 0.7, [1, 1.26, 1.5][i]); });
  { const tA = [A("c3", "Orion", 0) - 0.1, A("c3", "Blue", 0) - 0.1, A("c3", "SpaceX's", 0) - 0.1], end = sc("c4").start;
    html.push(sprite("s_sls", 277, 480, 380 - 138, 420 - 240, tA[0], end - tA[0], "loop", "sls")); html.push(sprite("s_lan", 400, 400, 960 - 200, 430 - 200, tA[1], end - tA[1], "loop", "lander")); html.push(sprite("s_ship", 277, 480, 1540 - 138, 425 - 240, tA[2], end - tA[2], "loop", "ship"));
    ["s_sls", "s_lan", "s_ship"].forEach((id, i) => { js.push(`tl.fromTo("#${id}",{opacity:0,y:24},{opacity:1,y:0,duration:.8,ease:"power2.out"},${f3(tA[i])});`); sfx(tA[i] + 0.05, "whoosh", 0.32, 0.9 + 0.1 * i); }); }
  html.push(`<div id="c3t" style="position:absolute;left:0;width:1920px;top:912px;text-align:center;opacity:0">${tag("نسخ تجريبية، مش مركبات هبوط جاهزة", "am")}</div>`);
  popv("#c3t", A("c3", "Test") - 0.05); sfx(A("c3", "Test") - 0.05, "pop", 0.7);
});
// ================= C4 THE SEQUENCE (orbit diagram + steps)
scene("c4", sc("c4").start, sc("c5").start, () => {
  const cx = 470, cy = 540, R1 = 330, R2 = 400;
  html.push(svgWrap(`<text x="96" y="112" fill="#8FA0C0" font-family="JetBrains Mono" font-size="22" direction="ltr">رسم توضيحي، مش بمقياس رسم</text>`));
  const steps = [
    ["1", "إطلاق نسخة بلو مون التجريبية", "مدار دائري ~273 ميل · تستنى لحد 30 يوم", "c4s1"],
    ["2", "بعدها بأيام: أوريون تنطلق على SLS", "كينيدي · مدار ~345 ميل · يومين فحوصات", "c4s2"],
    ["3", "أوريون تلتحم · الطاقم يدخل جوّه", "حوالي يومين: الكابينة والتحكم ودعم الحياة", "c4s3"],
    ["4", "أوريون تفك الالتحام وتغيّر مكانها", "", "c4s4"],
    ["5", "إطلاق نسخة ستارشيب V3 التجريبية", "من فلوريدا · مدار أقل · نظام التحام إضافي", "c4s5"],
    ["6", "أوريون تلتحم بستارشيب (لحد ساعتين)", "الطاقم بره · وبعدها لحد 5 أيام اختبارات", "c4s6"],
  ];
  steps.forEach(([n, a, b, id], i) => card(id, 1000, 120 + i * 140, 830, 128, `<div class="stp"><b>${n}</b><div><div class="st1">${a}</div>${b ? `<div class="st2">${b}</div>` : ""}</div></div>`, "mock step"));
  const g = (sel, t, props) => js.push(`tl.to("${sel}",{${props},duration:1.2,ease:"power2.inOut"},${f3(t)});`);
  const o = (id, w, oc = 0) => A(id, w, oc);
  const marks = [o("c4", "Blue", 0) - 0.15, o("c4", "later") - 0.15, o("c4", "docks", 0) - 0.15, o("c4", "undocks") - 0.15, o("c4", "SpaceX") - 0.15, o("c4", "docks", 1) - 0.15];
  steps.forEach(([, , , id], i) => { show("#" + id, marks[i]); sfx(marks[i], i === 2 || i === 5 ? "success3" : "pop", 0.6, 1 + 0.07 * i); if (i) recolor(`#${steps[i - 1][3]}`, marks[i], `opacity:.5`); });
  sfx(marks[0] + 0.1, "whoosh", 0.45); sfx(marks[1] + 0.1, "whoosh", 0.45, 1.1); sfx(o("c4", "circle") + 0.1, "whoosh", 0.4, 0.9); sfx(marks[4] + 0.1, "whoosh", 0.45, 1.2); sfx(marks[5] - 0.3, "whoosh", 0.45, 1.0);
  sfx(marks[0], "glass", 0.35); sfx(marks[4], "glass", 0.35, 1.2);
  js.push(`tl.to("#c4r1",{opacity:.9,duration:.6},${f3(marks[0])});tl.fromTo("#c4bm",{opacity:0,rotation:-60,svgOrigin:"${cx} ${cy}"},{opacity:1,rotation:0,svgOrigin:"${cx} ${cy}",duration:1.0,ease:"power2.out"},${f3(marks[0] + 0.1)});`);
  js.push(`tl.to("#c4r0",{opacity:.9,duration:.6},${f3(o("c4", "stretched") - 0.1)});tl.fromTo("#c4or",{opacity:0,rotation:200,svgOrigin:"${cx} ${cy}"},{opacity:1,rotation:260,svgOrigin:"${cx} ${cy}",duration:1.0,ease:"power2.out"},${f3(marks[1] + 0.1)});tl.to("#c4r0",{opacity:.0,duration:.4},${f3(o("c4", "circle") + 0.2)});`);
  js.push(`tl.to("#c4or",{rotation:360,svgOrigin:"${cx} ${cy}",duration:2.4,ease:"power1.inOut"},${f3(o("c4", "circle") + 0.1)});`);
  js.push(`tl.to("#c4r2",{opacity:.5,duration:.5},${f3(marks[4])});tl.fromTo("#c4st",{opacity:0,rotation:-40,svgOrigin:"${cx} ${cy}"},{opacity:1,rotation:0,svgOrigin:"${cx} ${cy}",duration:1.0,ease:"power2.out"},${f3(marks[4] + 0.1)});`);
  js.push(`tl.to("#c4or",{rotation:430,svgOrigin:"${cx} ${cy}",duration:1.6,ease:"power1.inOut"},${f3(marks[5] - 0.3)});tl.to("#c4st",{rotation:70,svgOrigin:"${cx} ${cy}",duration:1.6,ease:"power1.inOut"},${f3(marks[5] - 0.3)});`);
  { const E = 540, X = 470, R_BM = 381, R_OR = 424, R_SS = 344, end = sc("c5").start;
    const arm = (id, R, w, h, start, src) => { html.push(`<div class="arm" id="arm_${id}" style="left:${X - w / 2}px;top:${E - R - h / 2}px;width:${w}px;height:${h}px;transform-origin:${w / 2}px ${R + h / 2}px;opacity:0"><div class="spr" id="spr_${id}" style="width:${w}px;height:${h}px">${sprite(id, w, h, 0, 0, start, end - start, "loop", src)}</div></div>`); };
    const rot = (id, a0, a1, t, d) => js.push(`tl.fromTo("#arm_${id}",{rotation:${a0}},{rotation:${a1},duration:${d},ease:"power2.inOut",immediateRender:false},${f3(t)});tl.fromTo("#spr_${id}",{rotation:${-a0}},{rotation:${-a1},duration:${d},ease:"power2.inOut",immediateRender:false},${f3(t)});`);
    const fadeIn = (id, t) => js.push(`tl.fromTo("#arm_${id}",{opacity:0},{opacity:1,duration:.5},${f3(t)});`);
    arm("o_bm", R_BM, 130, 130, marks[0], "lander"); arm("o_ora", R_OR, 130, 130, marks[1], "orion"); arm("o_orb", R_BM, 130, 130, o("c4", "circle"), "orion"); arm("o_ss", R_SS, 80, 138, marks[4], "ship");
    js.push(`tl.set("#arm_o_bm",{rotation:-60},0);tl.set("#spr_o_bm",{rotation:60},0);tl.set("#arm_o_ora",{rotation:200},0);tl.set("#spr_o_ora",{rotation:-200},0);tl.set("#arm_o_orb",{rotation:300},0);tl.set("#spr_o_orb",{rotation:-300},0);tl.set("#arm_o_ss",{rotation:-40},0);tl.set("#spr_o_ss",{rotation:40},0);`);
    fadeIn("o_bm", marks[0]); rot("o_bm", -60, 0, marks[0] + 0.1, 1.2);
    fadeIn("o_ora", marks[1]); rot("o_ora", 200, 260, marks[1] + 0.1, 1.2);
    js.push(`tl.to("#arm_o_ora",{opacity:0,duration:.5},${f3(o("c4", "circle"))});`); fadeIn("o_orb", o("c4", "circle")); rot("o_orb", 300, 350, o("c4", "circle") + 0.1, 2.6); sfx(o("c4", "circle") + 2.6, "sonar", 0.3);
    rot("o_orb", 350, 330, marks[3], 1.2);
    fadeIn("o_ss", marks[4]); rot("o_ss", -40, 20, marks[4] + 0.1, 1.2);
    rot("o_orb", 330, 380, marks[5] - 0.3, 1.6); sfx(marks[5] + 1.3, "sonar", 0.3, 1.2); }
  html.push(`<div id="c4n" style="position:absolute;left:96px;top:915px;width:900px;opacity:0">${tag("أول تقييم لمركبة هبوط تجارية وعليها طاقم", "am")}</div><div id="c4t" style="position:absolute;left:96px;top:915px;width:900px;opacity:0">${tag("5 أيام كمان: بدلات · حساسات · ضوضاء · دراسة فحص صحي", "cy")}</div>`);
  popv("#c4n", o("c4", "first") - 0.1); sfx(o("c4", "first") - 0.1, "glass", 0.7); hide("#c4n", o("c4", "Step", 3) - 0.1);
  popv("#c4t", o("c4", "Suits") - 0.1); sfx(o("c4", "Suits") - 0.1, "chirp", 0.6);
});
// ================= C5 TWO DOCKINGS
scene("c5", sc("c5").start, sc("c6").start, () => {
  text("c5t1", 200, 700, 560, `<div class="big3">فتحة جانبية</div><div class="mono grey">جنب كابينة الطاقم في بلو مون</div>`, "ctr");
  text("c5t2", 1160, 700, 560, `<div class="big3">فتحة أمامية</div><div class="mono grey">نظام أوريون الأمامي يقابل مقدمة ستارشيب</div>`, "ctr");
  { const tL = A("c5", "Orion") - 0.1, tS = A("c5", "Later") - 0.1, end = sc("c6").start;
    html.push(sprite("s_dockl", 482, 392, 480 - 241, 470 - 196, tL, end - tL, "hold", "dock_lander")); html.push(sprite("s_docks", 430, 430, 1440 - 215, 460 - 215, tS, end - tS, "hold", "dock_ship"));
    js.push(`tl.fromTo("#s_dockl",{opacity:0},{opacity:1,duration:.6},${f3(tL)});tl.fromTo("#s_docks",{opacity:0},{opacity:1,duration:.6},${f3(tS)});`);
    [tL, tS].forEach((t, i) => { sfx(t + 0.1, "whoosh", 0.35, 1 + 0.1 * i); sfx(t + 3.3, "click", 0.7); sfx(t + 3.36, "success3", 0.45, 1 + 0.12 * i); }); }
  html.push(`<div id="c5k" class="chips" style="left:96px;top:870px;width:1728px">${["التحكم", "التواصل", "البرمجيات مع بعض", "قوى الالتحام وفك الالتحام"].map((x) => tag(x, "cy")).join("")}</div>`);
  text("c5h", 224, 150, 1600, `<div class="mid">مركبتين هبوط. <span class="am">تصميمين للالتحام.</span> مهمة واحدة.</div>`, "l");
  show("#c5h", sc("c5").start + 0.2);
  js.push(`tl.fromTo("#c5a",{opacity:0},{opacity:1,duration:.5},${f3(A("c5", "Orion") - 0.1)});`); draw("#c5p1", A("c5", "port") - 0.1, 0.5); show("#c5t1", A("c5", "port") - 0.1); sfx(A("c5", "port") - 0.1, "pluck", 0.7);
  js.push(`tl.fromTo("#c5b",{opacity:0},{opacity:1,duration:.5},${f3(A("c5", "Later") - 0.1)});`); draw("#c5p2", A("c5", "forward") - 0.1, 0.5); show("#c5t2", A("c5", "forward") - 0.1); sfx(A("c5", "forward") - 0.1, "pluck", 0.7, 1.26);
  js.push(`tl.set("#c5k .tag",{opacity:0},0);`);
  [["handles", 0], ["communicate", 1], ["software", 2], ["forces", 3]].forEach(([w, i]) => { const t = A("c5", w) - 0.1; js.push(`tl.fromTo("#c5k .tag:nth-child(${i + 1})",{opacity:0,y:10},{opacity:1,y:0,duration:.3},${f3(t)});`); sfx(t, "tick", 0.6, 1 + 0.1 * i); });
});
// ================= C6 SCHEDULE PUZZLE + WHAT-IF
scene("c6", sc("c6").start, sc("c7").start, () => {
  const x0 = 200, x1 = 1720, y = 430, day = (d) => x0 + (x1 - x0) * d / 34;
  html.push(svgWrap(`<rect x="${x0}" y="${y}" width="${x1 - x0}" height="12" rx="6" fill="${C.line}"/>${line("c6bm", `M${x0} ${y + 6} H${day(30)}`, C.cy, 12)}<circle cx="${x0}" cy="${y + 6}" r="22" fill="${C.cy}"/>`));
  text("c6l0", x0 - 190, 250, 380, `<div class="mono">النسخة التجريبية من بلو مون<br>تنطلق للمدار</div>`, "ctr sm");
  text("c6l1", day(30) - 240, 250, 480, `<div class="mono am">لحد 30 يوم في المدار<br>المرونة اللي ذكرتها ناسا</div>`, "ctr sm");
  html.push(svgWrap(`<circle id="c6o" cx="${day(4)}" cy="${y + 6}" r="22" fill="${C.am}" opacity="0"/><circle id="c6s" cx="${day(12)}" cy="${y + 6}" r="22" fill="${C.gr}" opacity="0"/>`));
  text("c6o_t", day(4) - 200, 500, 400, `<div class="mono am sm">أوريون تنطلق<br>«بعدها بأيام بس»</div>`, "ctr");
  text("c6s_t", day(12) - 220, 500, 440, `<div class="mono gr sm">ستارشيب تنطلق بعدين<br>وقت أقصر في المدار</div>`, "ctr");
  card("c6w", 300, 640, 1320, 230, `<div class="big3 am">لو حتة واحدة اتأخرت؟</div><div class="quote" id="c6a" style="opacity:0">خطة ناسا المنشورة <b>مبتقولش</b> إيه تأثير أي مشكلة في المدار على هدف 2028.</div>`, "mock hotc");
  html.push(`<div id="c6t" style="position:absolute;left:0;width:1920px;top:895px;text-align:center;opacity:0">${tag("اعتبر أي تاريخ هدف، مش وعد", "grey")}</div>`);
  js.push(`tl.to("#c6bm",{strokeDashoffset:0,duration:1.2,ease:"power2.out"},${f3(A("c6", "Blue", 0) - 0.2)});`);
  show("#c6l0", sc("c6").start + 0.3); show("#c6l1", A("c6", "thirty") - 0.2); sfx(A("c6", "thirty") - 0.2, "glass", 0.7);
    show("#c6s_t", A("c6", "Starship") - 0.1); js.push(`tl.fromTo("#c6s",{opacity:0,scale:.5},{opacity:1,scale:1,duration:.3},${f3(A("c6", "late") - 0.1)});`);
  js.push(`tl.fromTo("#c6o",{opacity:0},{opacity:1,duration:.3},${f3(sc("c6").start + 1.0)});`);
  show("#c6o_t", sc("c6").start + 1.0);
  show("#c6w", A("c6", "what") - 0.2); sfx(A("c6", "what") - 0.2, "wobble", 0.7);
  js.push(`tl.to("#c6a",{opacity:1,duration:.4},${f3(A("c6", "honest") - 0.1)});`); sfx(A("c6", "honest") - 0.1, "buzz", 0.3);
  popv("#c6t", A("c6", "treat") - 0.1); sfx(A("c6", "treat") - 0.1, "pop", 0.6);
});
// ================= C7 THE RACE NOBODY HAS DECIDED
scene("c7", sc("c7").start, sc("c8").start, () => {
  card("c7a", 1030, 190, 760, 330, `<div class="mono grey sm">التخصيص الأصلي</div><div class="rr"><span>أرتميس 3 + 4</span>${tag("ستارشيب", "grey")}</div><div class="rr"><span>أرتميس 5</span>${tag("بلو مون مارك 2", "grey")}</div>`, "mock");
  card("c7b", 130, 190, 760, 330, `<div class="mono am sm">دلوقتي</div><div class="rr"><span>أرتميس 3 (مدار)</span>${tag("الشركتين", "am")}</div><div class="rr"><span>مهمة هبوط</span>${tag("ولا واحدة مخصصة", "red")}</div>`, "mock hotc");
  html.push(svgWrap(`<text x="960" y="380" text-anchor="middle" fill="${C.cy}" font-family="Inter" font-weight="900" font-size="90" opacity=".9">←</text>`));
  card("c7c", 130, 580, 1660, 140, `<div class="quote">بناءً على <b>جاهزية مركبات الهبوط</b>، ناسا هتقرر أنهي شركة هتكون الأولى في توصيل رواد فضاء لسطح القمر في 2028. وبعدها بتيجي فرصة هبوط تانية بطاقم.</div>`, "mock");
  html.push(`<div id="c7d" class="chips" style="left:130px;top:780px;width:1660px">${tag("الشركتين يطيّروا مهمة تجريبية من غير طاقم الأول", "cy")}${tag("ناسا تعتمد مركبات الهبوط قبل الطواقم", "cy")}</div>`);
  show("#c7a", A("c7", "Originally") - 0.1); sfx(A("c7", "Originally") - 0.1, "pluck", 0.7);
  show("#c7b", A("c7", "realigned") - 0.1); sfx(A("c7", "realigned") - 0.1, "pluck", 0.7, 1.26);
  show("#c7c", A("c7", "says") - 0.1); sfx(A("c7", "says") - 0.1, "glass", 0.7);
  js.push(`tl.set("#c7d .tag",{opacity:0},0);tl.fromTo("#c7d .tag:nth-child(1)",{opacity:0,y:10},{opacity:1,y:0,duration:.3},${f3(A("c7", "uncrewed") - 0.1)});tl.fromTo("#c7d .tag:nth-child(2)",{opacity:0,y:10},{opacity:1,y:0,duration:.3},${f3(A("c7", "certify") - 0.1)});`); sfx(A("c7", "uncrewed") - 0.1, "tick", 0.6); sfx(A("c7", "certify") - 0.1, "tick", 0.6, 1.2);
});
// ================= C8 HOW THE LANDINGS WORK
scene("c8", sc("c8").start, sc("c9").start, () => {
  card("c8h", 130, 150, 1660, 120, `<div class="quote">في مهمة الهبوط، مركبة هبوط تجارية بتلتحم بأوريون، وبعدين بتنزل <b>اتنين من الطاقم للسطح</b> وبيفضل <b>اتنين على متن</b> أوريون.</div>`, "mock");
  const spX = [["كذا ستارشيب تنطلق كناقلات وقود", "tankers"], ["نقل الوقود لستارشيب مخزن", "depot"], ["الهبوط يستنى في مدار الأرض؛ أوريون تلتحم", "waits"], ["إشعال محرك يبعت الاتنين لمدار قمري منخفض", "burn"], ["اتنين من الطاقم ينزلوا لعدة أيام", "crew"]];
  const bO = [["تلات مراحل نقل تنطلق للمدار", "three"], ["بلو مون مارك 2 تلحقها؛ بيلتحموا", "Followed"], ["المجموعة تتجه لمدار قطبي بيضاوي", "elliptical"], ["كل مرحلة بتنفصل لما وقودها يخلص", "drop"], ["أوريون تلتحم هناك · اتنين ينزلوا للقطب الجنوبي", "descend"]];
  [[spX, 990, "خطة ستارشيب", "c8x"], [bO, 130, "خطة بلو أوريجن", "c8y"]].forEach(([arr, x, title, id]) => { card(id, x, 290, 800, 70, `<div class="mono am sm">${title}</div>`, "mock hdr"); arr.forEach(([t], i) => card(`${id}${i}`, x, 372 + i * 100, 800, 92, `<div class="st1 sm2">${i + 1}. ${t}</div>`, "mock stepc")); });
  html.push(`<div id="c8n" style="position:absolute;left:130px;top:890px;width:1660px">${tag("ناسا: الخطتين بتحلّوا محل الالتقاء في مدار هالو شبه خطي", "grey")}${tag("جديد: بدلة «سورتي» أخف، بنص الوزن تقريبًا", "cy")}</div>`);
  show("#c8h", sc("c8").start + 0.2);
  const ta = [A("c8", "fleet"), A("c8", "transfer"), A("c8", "waits"), A("c8", "burn"), A("c8", "down")];
  show("#c8x", A("c8", "SpaceX's") - 0.1); sfx(A("c8", "SpaceX's") - 0.1, "marimba", 0.7);
  ta.forEach((t, i) => { show(`#c8x${i}`, t - 0.15); sfx(t - 0.15, "tick", 0.55, 1 + 0.08 * i); });
  const tb = [A("c8", "uses"), A("c8", "launch", 1), A("c8", "heads"), A("c8", "drops"), A("c8", "descend")];
  show("#c8y", A("c8", "Blue", 0) - 0.1); sfx(A("c8", "Blue", 0) - 0.1, "marimba", 0.7, 1.26);
  tb.forEach((t, i) => { show(`#c8y${i}`, t - 0.15); sfx(t - 0.15, "tick", 0.55, 1 + 0.08 * i); });
  js.push(`tl.set("#c8n .tag",{opacity:0},0);tl.fromTo("#c8n .tag:nth-child(1)",{opacity:0,y:10},{opacity:1,y:0,duration:.3},${f3(A("c8", "replace") - 0.1)});tl.fromTo("#c8n .tag:nth-child(2)",{opacity:0,y:10},{opacity:1,y:0,duration:.3},${f3(A("c8", "Sortie") - 0.1)});`); sfx(A("c8", "Sortie") - 0.1, "pop", 0.6);
});
// ================= C9 WHAT TO WATCH + CTA
scene("c9", sc("c9").start, null, () => {
  const items = [["1", "الأجهزة ماشية في الميعاد", "ناسا: أوقات التجهيز اتقلّت بحوالي النص", "One"], ["2", "جزء خط الوقود اتصمّم من جديد في 5 شهور", "ادعاء ناسا نفسها · حوالي عُشر تقدير خارجي", "Two"], ["3", "اختبارات الالتحام", "كل حاجة تانية بتعتمد عليها", "Three"]];
  items.forEach(([n, a, b], i) => card(`c9${i}`, 130, 150 + i * 190, 1660, 165, `<div class="stp"><b>${n}</b><div><div class="st1 big4">${a}</div><div class="st2">${b}</div></div></div>`, "mock step"));
  card("c9s", 130, 720, 1660, 200, `<div class="big3 cy">اشترك</div><div class="mono grey">الفيديو الجاي: إزاي ستارشيب بتتزوّد بالوقود في المدار، وليه ده مهم للهبوط</div>`, "mock hotc");
    items.forEach((_, i) => { const t = [A("c9", "One"), A("c9", "Two"), A("c9", "Three", 2)][i] - 0.15; show(`#c9${i}`, t); sfx(t, "pluck", 0.7, [1, 1.26, 1.5][i]); });
  show("#c9s", A("c9", "subscribe") - 0.15); sfx(A("c9", "subscribe") - 0.15, "success3", 0.8); sfx(A("c9", "subscribe") + 0.9, "click", 0.8);
  js.push(`tl.to("#c9s",{scale:1.03,duration:.6,ease:"sine.inOut",yoyo:true,repeat:${Math.max(1, Math.floor((DUR - A("c9", "subscribe")) / 0.6))}},${f3(A("c9", "subscribe") + 1.2)});`);
});

// ================= Arabic subtitles (timed from the recording)
{ const SUBS = JSON.parse(fs.readFileSync("audio/subs_ar.json", "utf8"));
  SUBS.forEach((c, i) => { const st = Math.max(0, c.t0 - 0.03), nxt = SUBS[i + 1] ? SUBS[i + 1].t0 - 0.03 : DUR, en = Math.min(c.t1 + 0.25, nxt);
    html.push(`<div class="sub" id="sb${i}"><span>${e(c.text)}</span></div>`);
    js.push(`tl.set("#sb${i}",{opacity:1},${f3(st)});tl.set("#sb${i}",{opacity:0},${f3(en)});`); }); }
js.push(`tl.to("#eimg1",{rotation:-2.5,svgOrigin:"960 1650",duration:${T.scene("c2").start},ease:"none"},0);tl.to("#eimg4",{rotation:6,svgOrigin:"470 540",duration:${T.scene("c5").start - T.scene("c4").start},ease:"none"},${f3(T.scene("c4").start)});`);
js.push(`tl.set("#sc_c1",{opacity:1},0);tl.to("#sfar",{backgroundPosition:"-260px 90px",duration:${DUR},ease:"none"},0);tl.to("#snear",{backgroundPosition:"-720px 220px",duration:${DUR},ease:"none"},0);tl.to("#neb",{x:150,y:-70,duration:${DUR / 2},ease:"sine.inOut",yoyo:true,repeat:1},0);tl.to("#snear",{opacity:.72,duration:2.6,ease:"sine.inOut",yoyo:true,repeat:${Math.ceil(DUR / 2.6)}},0);`);

js.push(`tl.to(".glow",{opacity:.35,duration:1.1,yoyo:true,repeat:${Math.ceil(DUR / 1.1)},ease:"sine.inOut"},0);`);
const TXC = [[960, 540, "92,200,255"], [1480, 380, "255,181,71"], [420, 620, "180,140,255"], [960, 330, "107,227,164"], [1420, 700, "255,120,120"], [560, 420, "92,200,255"], [1000, 720, "255,181,71"], [1300, 470, "180,140,255"]];
const SLIDE = [[110, 0], [-110, 0], [0, 80], [0, -80], [90, 50], [-90, 50], [120, -40], [-120, -40]];
order.forEach((id, i) => { if (!i) return; const t = sc(id).start, [cx, cy, col] = TXC[(i - 1) % TXC.length], [sx, sy] = SLIDE[(i - 1) % SLIDE.length];
  let parts = ""; for (let k = 0; k < 40; k++) { const a = rnd() * Math.PI * 2, r = 260 + rnd() * 620, z = 3 + rnd() * 7; parts += `<i class="xp" id="xp${i}_${k}" style="left:${cx}px;top:${cy}px;width:${z.toFixed(1)}px;height:${z.toFixed(1)}px;background:rgba(${col},1);box-shadow:0 0 ${(z * 3).toFixed(0)}px rgba(${col},.9)"></i>`;
    js.push(`tl.fromTo("#xp${i}_${k}",{x:0,y:0,opacity:0,scale:1},{x:${(Math.cos(a) * r).toFixed(0)},y:${(Math.sin(a) * r).toFixed(0)},opacity:1,scale:.25,duration:${(0.6 + rnd() * 0.5).toFixed(2)},ease:"power3.out"},${f3(t - 0.05)});tl.to("#xp${i}_${k}",{opacity:0,duration:.35},${f3(t + 0.45 + rnd() * 0.4)});`); }
  html.push(`<div class="tx" id="tx${i}" style="position:absolute;inset:0;pointer-events:none;z-index:60"><div class="xflash" id="xf${i}" style="background:radial-gradient(circle at ${cx}px ${cy}px,rgba(255,255,255,.95),rgba(${col},.55) 18%,rgba(${col},0) 55%)"></div><div class="xring" id="xr${i}" style="left:${cx - 150}px;top:${cy - 150}px;border-color:rgba(${col},.95);box-shadow:0 0 40px rgba(${col},.8),inset 0 0 30px rgba(${col},.6)"></div><div class="xring" id="xs${i}" style="left:${cx - 150}px;top:${cy - 150}px;border-color:rgba(255,255,255,.8)"></div>${parts}</div>`);
  js.push(`tl.fromTo("#xf${i}",{opacity:0},{opacity:1,duration:.09,ease:"power2.out"},${f3(t - 0.08)});tl.to("#xf${i}",{opacity:0,duration:.6,ease:"power2.in"},${f3(t + 0.02)});tl.fromTo("#xr${i}",{scale:.05,opacity:1},{scale:4.2,opacity:0,duration:.9,ease:"power3.out",immediateRender:false},${f3(t - 0.06)});tl.fromTo("#xs${i}",{scale:.05,opacity:.9},{scale:2.8,opacity:0,duration:.75,ease:"power3.out",immediateRender:false},${f3(t + 0.04)});`);
  js.push(`tl.fromTo("#sc_${id}",{x:${sx},y:${sy},scale:1.05},{x:0,y:0,scale:1,duration:.75,ease:"power3.out",immediateRender:false},${f3(t)});`);
  sfx(t - 0.06, "impact", 0.55, 0.9 + 0.05 * i); sfx(t - 0.02, "whoosh", 0.42, 0.85 + 0.06 * i); sfx(t + 0.1, "sparkle", 0.3, 0.9 + 0.08 * i); });
const FRONT = (b) => b.startsWith('<i class="fdust"') || b.startsWith('<div id="leak"');
// plates are dimmed where dense card stacks cover them, so planet slivers do not peek between cards
js.push(`tl.fromTo("#pw_c8",{filter:"brightness(1)"},{filter:"brightness(.3)",duration:.8,ease:"sine.inOut"},${f3(A("c8", "SpaceX's") - 0.3)});tl.fromTo("#pw_c9",{filter:"brightness(1)"},{filter:"brightness(.62)",duration:.8,ease:"sine.inOut"},${f3(A("c9", "One") - 0.3)});`);
const PLATES = order.map((id, i) => { const st = i === 0 ? 0 : sc(id).start, en = i + 1 < order.length ? sc(order[i + 1]).start : DUR; MEDIA.push({ id: "p" + (i + 1), kind: "plate", start: +st.toFixed(3), dur: +(en - st).toFixed(3) }); return `<div class="pw" id="pw_${id}"><video id="pl_${id}" class="clip plate" src="plates/p${i + 1}.webm" muted playsinline data-start="${f3(st)}" data-duration="${f3(en - st)}" data-track-index="${i + 1}"></video></div>`; }).join("");
fs.writeFileSync("audio/media.json", JSON.stringify(MEDIA, null, 1));
for (let t = 6.5, k = 0; t < DUR - 6; t += 9.2, k++) sfx(t, k % 3 === 2 ? "tap" : "countdown", 0.12, [1, 1.25, 1.5, 0.84][k % 4]);
const css = `
@font-face{font-family:Inter;src:url(./fonts/Cairo-400.ttf);font-weight:400}
@font-face{font-family:Inter;src:url(./fonts/Cairo-500.ttf);font-weight:500}
@font-face{font-family:Inter;src:url(./fonts/Cairo-600.ttf);font-weight:600}
@font-face{font-family:Inter;src:url(./fonts/Cairo-700.ttf);font-weight:700}
@font-face{font-family:Inter;src:url(./fonts/Cairo-800.ttf);font-weight:800}
@font-face{font-family:Inter;src:url(./fonts/Cairo-900.ttf);font-weight:900}
@font-face{font-family:"JetBrains Mono";src:url(./fonts/Cairo-400.ttf);font-weight:400}
@font-face{font-family:"JetBrains Mono";src:url(./fonts/Cairo-500.ttf);font-weight:500}
@font-face{font-family:"JetBrains Mono";src:url(./fonts/Cairo-600.ttf);font-weight:600}
@font-face{font-family:"JetBrains Mono";src:url(./fonts/Cairo-700.ttf);font-weight:700}
@font-face{font-family:"JetBrains Mono";src:url(./fonts/Cairo-800.ttf);font-weight:800}
@font-face{font-family:"JetBrains Mono";src:url(./fonts/Cairo-900.ttf);font-weight:900}
*{margin:0;padding:0;box-sizing:border-box;letter-spacing:0!important}html,body{direction:rtl;width:1920px;height:1080px;overflow:hidden;background:${C.bg};font-family:Inter,Arial,sans-serif;color:${C.txt}}
#root{position:relative;width:1920px;height:1080px;overflow:hidden;background:${C.bg}}
#neb{position:absolute;left:-340px;top:-280px;width:2700px;height:1700px;background:url(assets/nebula.png) 0 0/2600px 1600px no-repeat;opacity:.68}
#neb2{position:absolute;left:-200px;top:-120px;width:2600px;height:1600px;background:url(assets/nebula.png) 0 0/2600px 1600px no-repeat;transform:scaleX(-1) rotate(8deg);opacity:.26;mix-blend-mode:screen}
#sfar{position:absolute;inset:0;background:url(assets/stars_far.png) 0 0/2800px 1600px repeat;opacity:.9}
#snear{position:absolute;inset:0;background:url(assets/stars_near.png) 0 0/3400px 1900px repeat}
#vig{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 50%,transparent 55%,rgba(0,0,0,.5));pointer-events:none;z-index:5}
.chl{position:absolute;right:96px;top:50px;font:600 29px "JetBrains Mono",monospace;letter-spacing:.14em;color:${C.grey};z-index:30}
#bar{position:absolute;left:96px;right:96px;bottom:44px;height:8px;border-radius:4px;background:${C.line};z-index:30}#barfill{display:block;height:100%;width:0;border-radius:4px;background:${C.cy}}#bar b{position:absolute;top:-4px;width:3px;height:16px;background:${C.bg}}
.scene{position:absolute;inset:0;opacity:0}.lay{position:absolute;left:0;top:0;pointer-events:none}
.card{position:absolute;background:${C.card};border:1px solid ${C.line};border-radius:22px;padding:22px 30px;box-shadow:0 18px 50px rgba(0,0,0,.45)}.card.mock{opacity:0}.card.hotc{border-color:${C.am}}
.tx{position:absolute}.ctr{text-align:center}.l{text-align:right}.r{text-align:left}
.mono{font:600 30px "JetBrains Mono",monospace}.mono.sm,.sm{font-size:26px}.grey{color:${C.grey}}.am{color:${C.am}}.cy{color:${C.cy}}.gr{color:${C.gr}}
.huge{font:900 190px/1 Inter;letter-spacing:-.04em}.big{font:900 110px/1 Inter;letter-spacing:-.03em}.big3{font:900 56px/1.05 Inter;letter-spacing:-.02em}.big4{font-size:44px!important}.mid{font:800 64px/1.1 Inter;letter-spacing:-.02em}
.nm{font:800 36px/1.2 Inter}.quote{font:600 34px/1.35 Inter}.quote b{color:${C.am}}
.tag{display:inline-flex;align-items:center;padding:10px 24px;border-radius:999px;font:800 26px Inter;white-space:nowrap;margin-left:14px;background:#1A2338;color:${C.grey}}.tag.cy{background:rgba(92,200,255,.16);color:${C.cy}}.tag.am{background:rgba(255,181,71,.18);color:${C.am}}.tag.red{background:rgba(255,107,107,.2);color:${C.red}}.tag.grey{background:#1A2338;color:${C.grey}}
.chips{position:absolute;display:flex;flex-wrap:wrap;gap:12px}
.row{display:flex;align-items:center;gap:18px}.ppl i{display:inline-block;width:34px;height:34px;border-radius:50%;background:${C.cy};margin-left:10px}
.stamp{position:absolute;opacity:0;text-align:center;font:900 120px/1 Inter;letter-spacing:-.03em;border:10px solid ${C.am};border-radius:24px;padding:34px 20px;background:rgba(5,7,13,.92);color:${C.am};box-shadow:0 0 70px rgba(255,181,71,.25)}.stamp.red2{border-color:${C.red};color:${C.red};font-size:112px;box-shadow:0 0 70px rgba(255,107,107,.25)}
.step .stp,.stepc{display:flex;align-items:center}.stp{display:flex;align-items:center;gap:24px}.stp b{display:inline-flex;align-items:center;justify-content:center;flex:none;width:58px;height:58px;border-radius:50%;background:${C.cy};color:#001018;font:900 32px Inter}.st1{font:800 31px/1.2 Inter}.st2{font:500 24px/1.3 "JetBrains Mono",monospace;color:${C.grey};margin-top:6px}.sm2{font-size:28px!important}
.gl4{position:absolute;opacity:.8;pointer-events:none}.dust{position:absolute;border-radius:50%;background:#cfe0ff;pointer-events:none;filter:blur(.4px)}.meteor{position:absolute;width:260px;height:2px;border-radius:2px;background:linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,.95));transform-origin:100% 50%;rotate:24deg;opacity:0;pointer-events:none;box-shadow:0 0 8px rgba(160,200,255,.6)}#gal{position:absolute;left:1480px;top:130px;width:300px;height:110px;border-radius:50%;background:radial-gradient(ellipse at 50% 50%,rgba(255,240,210,.55) 0,rgba(180,190,255,.28) 22%,rgba(110,130,255,.10) 50%,transparent 72%);transform:rotate(-26deg);filter:blur(1.2px);opacity:.55;pointer-events:none}#sat{position:absolute;left:-60px;top:90px;width:4px;height:4px;border-radius:50%;background:#fff;box-shadow:0 0 8px 2px rgba(255,255,255,.7);pointer-events:none}.pw{position:absolute;inset:0}.plate{position:absolute;left:0;top:0;width:1920px;height:1080px;object-fit:cover}#scrim{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 45%,rgba(3,5,10,.12),rgba(3,5,10,.5));pointer-events:none}.spw{position:absolute;opacity:0}.arm .spw{opacity:1}.arm{position:absolute}.spr{position:relative}.meteor.bright{height:3px;box-shadow:0 0 14px rgba(190,220,255,.9);background:linear-gradient(90deg,rgba(255,255,255,0),rgba(200,225,255,.6) 70%,#fff)}
.gstar{position:absolute;pointer-events:none;transform:translate(-50%,-50%)}.gstar .gh{position:absolute;inset:-60%;border-radius:50%}.gstar svg{position:absolute;inset:0}
.fdust{position:absolute;border-radius:50%;background:#d9e6ff;filter:blur(1.6px);pointer-events:none}#leak{position:absolute;left:-400px;top:-300px;width:1400px;height:1100px;background:radial-gradient(ellipse,rgba(120,150,255,.10),transparent 65%);pointer-events:none;mix-blend-mode:screen}
#plab{position:absolute;right:96px;direction:ltr;bottom:26px;z-index:31;font:800 30px Inter;color:#EAF0FF;display:flex;align-items:baseline;gap:6px;transform-origin:100% 50%}#plab b{color:${C.am};font-size:34px;text-shadow:0 0 18px rgba(255,181,71,.7)}#plab span{font:600 22px "JetBrains Mono";color:${C.grey}}
#pbar{position:absolute;left:96px;right:210px;bottom:40px;height:10px;z-index:30}.pseg{position:absolute;top:0;height:10px;border-radius:6px;background:rgba(38,50,74,.65);border:1px solid rgba(92,200,255,.35);overflow:hidden}.pseg i{position:absolute;right:0;top:0;display:block;height:100%;width:0;background:linear-gradient(270deg,#3aa8e8,#5CC8FF 60%,#FFB547);box-shadow:0 0 12px rgba(92,200,255,.8)}
#phead{position:absolute;top:-6px;width:22px;height:22px;margin-left:-11px;border-radius:50%;background:radial-gradient(circle,#fff 0,#FFB547 40%,rgba(255,181,71,0) 72%);box-shadow:0 0 22px rgba(255,181,71,.9)}
.xflash{position:absolute;inset:0;opacity:0;mix-blend-mode:screen}.xring{position:absolute;width:300px;height:300px;border-radius:50%;border:6px solid;opacity:0}.xp{position:absolute;border-radius:50%;opacity:0;margin:-3px 0 0 -3px}
.card.hdr{padding:14px 30px}.sub{position:absolute;left:0;width:1920px;top:972px;text-align:center;opacity:0;z-index:40}.sub span{display:inline-block;background:rgba(5,7,13,.8);padding:4px 16px;border-radius:9px;font:600 29px/1.35 Inter;color:#EAF0FF}.rr{display:flex;justify-content:space-between;align-items:center;margin-top:22px;font:700 34px Inter}
`;
const page = `<!doctype html>
<html lang="ar" dir="rtl" data-resolution="landscape"><head><meta charset="UTF-8"/><meta name="viewport" content="width=1920, height=1080"/><script src="./gsap.min.js"></script><style>${css}</style></head>
<body><div id="root" data-composition-id="main" data-start="0" data-duration="${DUR.toFixed(3)}" data-width="1920" data-height="1080">
${DEFS}
<div id="neb"></div><div id="neb2"></div><div id="sfar"></div><div id="snear"></div>${BG.filter(b => !FRONT(b)).join("")}${PLATES}<div id="scrim"></div>${BG.filter(FRONT).join("")}
${html.join("\n")}
<div id="vig"></div></div>
<script>
window.__timelines=window.__timelines||{};const tl=gsap.timeline({paused:true});
${js.join("\n")}
window.__timelines["main"]=tl;tl.seek(0);
</script></body></html>`;
fs.writeFileSync("hf/index.html", page);
order.forEach((id, i) => { if (i) AUTO.push({ t: +(sc(id).start + 0.05).toFixed(3), type: "bell", gain: 0.5, rate: PENT[i % PENT.length] }); });
order.forEach((id, i) => { if (i) fx.push({ t: +(sc(id).start - 0.35).toFixed(3), type: "swell", gain: 0.5, rate: 1 }); });
{ AUTO.sort((a, b) => a.t - b.t); let lastA = -9; for (const ev of AUTO) { if (fx.some((m) => Math.abs(m.t - ev.t) < 0.09)) continue; if (ev.t - lastA < 0.11 && ev.type !== "bell") continue; fx.push(ev); lastA = ev.t; } }
fs.writeFileSync("audio/overlay.json", JSON.stringify({ c1: { appear: A("c1", "float") - 0.1, end: sc("c2").start }, c3: { sls: A("c3", "Orion", 0) - 0.1, lander: A("c3", "Blue", 0) - 0.1, ship: A("c3", "SpaceX's", 0) - 0.1, end: sc("c4").start }, c5: { lander: A("c5", "Orion") - 0.1, ship: A("c5", "Later") - 0.1, end: sc("c6").start } }, null, 1));
fx.sort((a, b) => a.t - b.t);
fs.writeFileSync("audio/sfx_events.json", JSON.stringify({ duration: T.duration, s4: 0.0, end: DUR - 3.2, hook: 0.1, events: fx }, null, 1));
if (MISS.length) console.log("MISSING ANCHORS:", [...new Set(MISS)].join(", "));
console.log(`hf/index.html ${(page.length / 1024).toFixed(0)} KB, ${DUR.toFixed(1)}s, ${fx.length} sound events`);
