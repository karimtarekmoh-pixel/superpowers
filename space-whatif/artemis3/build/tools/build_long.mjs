// Artemis III long-form (1920x1080): spec-in-code builder. All times come from audio/timestamps.json word times (W). Writes hf/index.html and audio/sfx_events.json.
import fs from "node:fs";
import { buildTimeline } from "../src/timeline.js";
const S = JSON.parse(fs.readFileSync("src/script.json")), TS = JSON.parse(fs.readFileSync("audio/timestamps.json"));
const T = buildTimeline(S, TS), W = T.W, sc = (id) => T.scene(id);
const DUR = Math.ceil(T.duration * 30) / 30;
const C = { bg: "#05070D", card: "#0E1422", line: "#26324A", txt: "#EAF0FF", grey: "#8FA0C0", cy: "#5CC8FF", am: "#FFB547", red: "#FF6B6B", gr: "#6BE3A4" };
const html = [], js = [], fx = [];
const e = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
const f3 = (x) => (+x).toFixed(3);
const sfx = (t, type, gain = 0.7, rate = 1) => { if (t > 0.9) fx.push({ t: +t.toFixed(3), type, gain, rate }); };
const show = (sel, t, y = 14, d = 0.35) => js.push(`tl.fromTo("${sel}",{opacity:0,y:${y}},{opacity:1,y:0,duration:${d},ease:"power2.out"},${f3(Math.max(0, t))});`);
const popv = (sel, t) => js.push(`tl.fromTo("${sel}",{opacity:0,scale:.94},{opacity:1,scale:1,duration:.25,ease:"power2.out"},${f3(Math.max(0, t))});`);
const hide = (sel, t, d = 0.3) => js.push(`tl.to("${sel}",{opacity:0,duration:${d}},${f3(t)});`);
const draw = (sel, t, d = 0.6) => js.push(`tl.to("${sel}",{strokeDashoffset:0,duration:${d},ease:"power2.out"},${f3(t)});`);
const recolor = (sel, t, props) => js.push(`tl.to("${sel}",{${props},duration:.2},${f3(t)});`);
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
const earthArc = (cx, cy, r, id = "e") => {
  const blobs = [[-.35, -.55, .34, .16, "#2F7D4F", .9], [-.1, -.35, .22, .13, "#3E8F57", .85], [.25, -.5, .3, .12, "#8A7A4A", .85], [.45, -.15, .22, .2, "#2F7D4F", .9], [-.55, -.1, .2, .12, "#8A7A4A", .8], [.05, .1, .26, .14, "#3E8F57", .85], [-.2, .3, .3, .12, "#2F7D4F", .85], [.4, .45, .22, .1, "#8A7A4A", .8]];
  const clouds = [[-.4, -.7, .42, .06], [.1, -.62, .5, .05], [-.6, -.3, .4, .05], [.3, -.28, .45, .06], [-.2, .0, .5, .05], [.45, .2, .4, .05], [-.45, .35, .45, .05], [.1, .55, .5, .05], [-.1, -.45, .3, .04], [.5, -.62, .25, .04]];
  return `<defs><radialGradient id="eg${id}" cx="40%" cy="30%" r="80%"><stop offset="0" stop-color="#4C9BE8"/><stop offset=".45" stop-color="#1F63B0"/><stop offset=".85" stop-color="#0E3466"/><stop offset="1" stop-color="#07162E"/></radialGradient>
  <radialGradient id="ea${id}" cx="50%" cy="50%" r="50%"><stop offset=".86" stop-color="rgba(120,205,255,.0)"/><stop offset=".94" stop-color="rgba(120,205,255,.42)"/><stop offset="1" stop-color="rgba(120,205,255,0)"/></radialGradient>
  <linearGradient id="et${id}" x1="0" y1="0" x2="1" y2="1"><stop offset=".45" stop-color="rgba(0,0,0,0)"/><stop offset="1" stop-color="rgba(0,0,10,.62)"/></linearGradient>
  <clipPath id="ec${id}"><circle cx="${cx}" cy="${cy}" r="${r}"/></clipPath></defs>
  <circle cx="${cx}" cy="${cy}" r="${r * 1.12}" fill="url(#ea${id})"/>
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#eg${id})"/>
  <g clip-path="url(#ec${id})"><g id="ecl${id}">${blobs.map(([dx, dy, rx, ry, col, op]) => `<ellipse cx="${cx + dx * r}" cy="${cy + dy * r}" rx="${rx * r}" ry="${ry * r}" fill="${col}" opacity="${op * 0.8}"/>`).join("")}${clouds.map(([dx, dy, rx, ry]) => `<ellipse cx="${cx + dx * r}" cy="${cy + dy * r}" rx="${rx * r}" ry="${ry * r}" fill="#fff" opacity=".5" filter="url(#blur6)"/>`).join("")}</g><circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#et${id})"/></g>
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="rgba(170,225,255,.55)" stroke-width="2"/>`;
};

const order = ["c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8", "c9"];
// ---------- persistent: chapter label + progress bar
html.push(`<div id="chl" class="chl"></div><div id="bar"><i id="barfill"></i>${order.map((_, i) => `<b style="left:${(i + 1) / order.length * 100}%"></b>`).join("")}</div>`);
S.sections.forEach((s, i) => { const t = sc(s.id).start; js.push(`tl.set("#chl",{textContent:"CHAPTER ${i + 1} · ${s.title.toUpperCase()}"},${f3(t)});tl.to("#barfill",{width:"${((i + 1) / order.length * 100).toFixed(2)}%",duration:.6,ease:"power2.out"},${f3(t)});`); });

// ================= C1 HOOK
scene("c1", 0, sc("c2").start, () => {
  html.push(svgWrap(`${earthArc(960, 1650, 800, "1")}<circle id="c1orb" cx="960" cy="1650" r="900" fill="none" stroke="${C.cy}" stroke-width="3" stroke-dasharray="3 16" opacity="0"/><g transform="translate(960 700)"><g id="c1lan" opacity="0">${lander(1.5)}</g></g>${line("c1dim", "M1280 917 V809", C.am, 4)}<text id="c1mi" x="1305" y="880" fill="${C.am}" font-family="JetBrains Mono" font-weight="800" font-size="44" opacity="0">273 mi</text>`));
  text("c1y", 96, 120, 900, `2027`, "huge am");
  text("c1a", 100, 330, 900, `<span class="ppl"><i></i><i></i><i></i><i></i></span><span class="mono grey">FOUR ASTRONAUTS</span>`, "row");
  html.push(`<div id="c1t" class="stamp big2" style="left:420px;top:300px;width:1080px"><div>ARTEMIS III</div></div>`);
  html.push(`<div id="c1n" class="stamp red2" style="left:380px;top:300px;width:1160px"><div>NOT THE LANDING</div></div>`);
  text("c1h", 470, 620, 400, tag("HATCH OPEN", "cy"), "r");
  text("c1v", 1060, 620, 500, tag("TEST VERSION", "am"), "r");
  show("#c1y", 0.3); sfx(A("c1", "four") - 0.05, "pop", 0.5);
  show("#c1a", A("c1", "four") - 0.1); js.push(`tl.fromTo("#c1a i",{scale:0},{scale:1,duration:.2,stagger:.12,ease:"power2.out"},${f3(A("c1", "four") - 0.05)});`);
  js.push(`tl.to("#c1orb",{opacity:.9,duration:.8},${f3(A("c1", "hatch") - 0.4)});`);
  popv("#c1h", A("c1", "hatch") - 0.05); sfx(A("c1", "hatch") - 0.05, "click", 0.8);
  js.push(`tl.fromTo("#c1lan",{opacity:0,y:10},{opacity:1,y:0,duration:.5},${f3(A("c1", "float") - 0.1)});`); sfx(A("c1", "float") - 0.1, "pluck", 0.6);
  js.push(`tl.to("#c1y",{opacity:.35,duration:.4},${f3(A("c1", "Moon", 1) - 0.1)});`);
  draw("#c1dim", A("c1", "hundred") - 0.2, 0.5); js.push(`tl.to("#c1mi",{opacity:1,duration:.3},${f3(A("c1", "hundred") - 0.1)});`); sfx(A("c1", "hundred") - 0.1, "tick", 0.7);
  popv("#c1v", A("c1", "test") - 0.05); sfx(A("c1", "test") - 0.05, "pop", 0.7);
  js.push(`tl.fromTo("#c1t",{opacity:0,scale:.92},{opacity:1,scale:1,duration:.3,ease:"power2.out"},${f3(A("c1", "Artemis") - 0.1)});tl.to("#c1t",{opacity:0,duration:.3},${f3(A("c1", "It", 2) - 0.1)});`); sfx(A("c1", "Artemis") - 0.12, "marimba", 0.8);
  js.push(`tl.fromTo("#c1n",{opacity:0,scale:2.0,rotation:-8},{opacity:1,scale:1,rotation:-4,duration:.22,ease:"power4.in",immediateRender:false},${f3(A("c1", "landing") - 0.35)});tl.to("#c1n",{opacity:0,duration:.3},${f3(A("c1", "And") + 0.0)});`); sfx(A("c1", "landing") - 0.2, "stamp", 0.9); sfx(A("c1", "landing") - 0.2, "impact", 0.5);
});
// ================= C2 WHAT IT IS
scene("c2", sc("c2").start, sc("c3").start, () => {
  const ty = 440;
  html.push(svgWrap(`<rect x="160" y="${ty}" width="1600" height="8" rx="4" fill="${C.line}"/>${line("c2l", `M160 ${ty + 4} H1760`, C.cy, 8)}<circle cx="560" cy="${ty + 4}" r="20" fill="${C.cy}"/><circle cx="1360" cy="${ty + 4}" r="20" fill="${C.am}"/>`));
  text("c2a", 330, 200, 460, `<div class="big cy">2027</div>`, "ctr");text("c2a2", 330, 490, 460, `<div class="mono">ARTEMIS III</div><div class="mono grey sm">Earth orbit · 14 days</div>`, "ctr");
  text("c2b", 1130, 200, 460, `<div class="big am">2028</div>`, "ctr");text("c2b2", 1130, 490, 460, `<div class="mono">ARTEMIS IV</div><div class="mono grey sm">landing · south pole · target</div>`, "ctr");
  const names = [["COMMANDER", "Randy Bresnik", "bresnik"], ["PILOT", "Luca Parmitano (ESA)", "parmitano"], ["MISSION SPECIALIST", "Andre Douglas", "douglas"], ["MISSION SPECIALIST", "Frank Rubio", "rubio"]];
  names.forEach(([r, n], i) => card(`c2c${i}`, 130 + i * 420, 640, 390, 160, `<div class="mono grey sm">${r}</div><div class="nm">${n}</div>`, "mock"));
  card("c2q", 130, 810, 1660, 100, `<div class="quote">NASA: <b>Artemis III will not land on the Moon.</b> The landing is Artemis IV, targeted for 2028.</div>`, "mock");
  html.push(`<div id="c2k" class="chips" style="left:130px;top:905px;width:1660px">${tag("REDUCE RISK", "cy")}${tag("VALIDATE HARDWARE", "cy")}${tag("GAIN OPERATIONAL EXPERIENCE", "cy")}</div>`);
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
  html.push(svgWrap(`<g transform="translate(${xs[0]} 410)"><g id="c3o" opacity="0">${sls(2.0)}</g></g><g transform="translate(${xs[1]} 420)"><g id="c3b" opacity="0">${lander(2.1)}</g></g><g transform="translate(${xs[2]} 415)"><g id="c3s" opacity="0">${ship(2.0)}</g></g>`));
  [["Orion + SLS", "NASA", "c3on"], ["Blue Moon Mark 2", "test article", "c3bn"], ["Starship V3", "test article", "c3sn"]].forEach(([n, s, id], i) => text(id, xs[i] - 240, 662, 480, `<div class="nm">${n}</div><div class="mono grey">${s}</div>`, "ctr"));
  card("c3q", 260, 748, 1400, 160, `<div class="quote">“We're launching <b>three spacecraft on three different rockets</b> and testing how they operate together, something NASA has never attempted.” <span class="grey">Jeremy Parsons, Artemis program manager</span></div>`, "mock");
  text("c3x", 96, 130, 1400, `<div class="mono grey">EARLIER ARTEMIS MISSIONS</div><div class="mid">NASA's rocket + NASA's capsule only</div>`, "l");
  show("#c3x", sc("c3").start + 0.2);
  const tO = A("c3", "Orion"), tB = A("c3", "Blue", 0), tS = A("c3", "SpaceX's");
  js.push(`tl.to("#c3x",{opacity:.0,duration:.3},${f3(A("c3", "different") - 0.1)});`);
  show("#c3q", A("c3", "Parsons") - 0.1); sfx(A("c3", "Parsons") - 0.1, "glass", 0.7);
  [["#c3o", "#c3on", A("c3", "Those") + 0.9], ["#c3b", "#c3bn", 0], ["#c3s", "#c3sn", 0]].forEach(() => {});
  const tt = [A("c3", "Orion", 0), A("c3", "Blue", 0), A("c3", "SpaceX's", 0)];
  ["#c3o:#c3on", "#c3b:#c3bn", "#c3s:#c3sn"].forEach((p, i) => { const [g, n] = p.split(":"); js.push(`tl.fromTo("${g}",{opacity:0,y:20},{opacity:1,y:0,duration:.5,ease:"power2.out"},${f3(tt[i] - 0.1)});`); show(n, tt[i], 14); sfx(tt[i] - 0.1, "pluck", 0.7, [1, 1.26, 1.5][i]); });
  html.push(`<div id="c3t" style="position:absolute;left:0;width:1920px;top:912px;text-align:center;opacity:0">${tag("TEST VERSIONS, NOT FINISHED LANDERS", "am")}</div>`);
  popv("#c3t", A("c3", "Test") - 0.05); sfx(A("c3", "Test") - 0.05, "pop", 0.7);
});
// ================= C4 THE SEQUENCE (orbit diagram + steps)
scene("c4", sc("c4").start, sc("c5").start, () => {
  const cx = 470, cy = 540, R1 = 330, R2 = 400;
  html.push(svgWrap(`${earthArc(cx, cy, 230, "4")}<circle id="c4r1" cx="${cx}" cy="${cy}" r="${R1}" fill="none" stroke="${C.cy}" stroke-width="3" stroke-dasharray="3 14" opacity="0"/><ellipse id="c4r0" cx="${cx - 70}" cy="${cy}" rx="${R2 - 10}" ry="${R1 - 60}" fill="none" stroke="${C.am}" stroke-width="3" stroke-dasharray="3 14" opacity="0"/><circle id="c4r2" cx="${cx}" cy="${cy}" r="${R2 + 40}" fill="none" stroke="${C.gr}" stroke-width="3" stroke-dasharray="3 14" opacity="0"/>
  <g id="c4bm" opacity="0"><g transform="translate(${cx} ${cy - R1}) rotate(0)">${lander(.95)}</g></g>
  <g id="c4or" opacity="0"><g transform="translate(${cx} ${cy - R1 - 0}) rotate(0)">${orion(.9)}</g></g>
  <g id="c4st" opacity="0"><g transform="translate(${cx} ${cy - R2 - 40})">${ship(.95)}</g></g>
  <text x="96" y="112" fill="#8FA0C0" font-family="JetBrains Mono" font-size="22">illustration, not to scale</text>`));
  const steps = [
    ["1", "Blue Moon test article launches", "circular orbit ~273 miles up · can wait up to 30 days", "c4s1"],
    ["2", "Days later: Orion launches on SLS", "Kennedy · ~345-mile circle · 2 days of checkout", "c4s2"],
    ["3", "Orion docks · crew goes inside", "about 2 days: cabin, controls, life support", "c4s3"],
    ["4", "Orion undocks and repositions", "", "c4s4"],
    ["5", "Starship V3 test article launches", "from Florida · lower orbit · extra nose docking system", "c4s5"],
    ["6", "Orion docks with Starship (up to 2 h)", "crew stays out · then up to 5 more days of tests", "c4s6"],
  ];
  steps.forEach(([n, a, b, id], i) => card(id, 1000, 120 + i * 140, 830, 128, `<div class="stp"><b>${n}</b><div><div class="st1">${a}</div>${b ? `<div class="st2">${b}</div>` : ""}</div></div>`, "mock step"));
  const g = (sel, t, props) => js.push(`tl.to("${sel}",{${props},duration:1.2,ease:"power2.inOut"},${f3(t)});`);
  const o = (id, w, oc = 0) => A(id, w, oc);
  const marks = [o("c4", "Blue", 0) - 0.15, o("c4", "later") - 0.15, o("c4", "docks", 0) - 0.15, o("c4", "undocks") - 0.15, o("c4", "SpaceX") - 0.15, o("c4", "docks", 1) - 0.15];
  steps.forEach(([, , , id], i) => { show("#" + id, marks[i]); sfx(marks[i], i === 2 || i === 5 ? "success3" : "pop", 0.6, 1 + 0.07 * i); if (i) recolor(`#${steps[i - 1][3]}`, marks[i], `opacity:.5`); });
  js.push(`tl.to("#c4r1",{opacity:.9,duration:.6},${f3(marks[0])});tl.fromTo("#c4bm",{opacity:0,rotation:-60,svgOrigin:"${cx} ${cy}"},{opacity:1,rotation:0,svgOrigin:"${cx} ${cy}",duration:1.0,ease:"power2.out"},${f3(marks[0] + 0.1)});`);
  js.push(`tl.to("#c4r0",{opacity:.9,duration:.6},${f3(o("c4", "stretched") - 0.1)});tl.fromTo("#c4or",{opacity:0,rotation:200,svgOrigin:"${cx} ${cy}"},{opacity:1,rotation:260,svgOrigin:"${cx} ${cy}",duration:1.0,ease:"power2.out"},${f3(marks[1] + 0.1)});tl.to("#c4r0",{opacity:.0,duration:.4},${f3(o("c4", "circle") + 0.2)});`);
  js.push(`tl.to("#c4or",{rotation:360,svgOrigin:"${cx} ${cy}",duration:2.4,ease:"power1.inOut"},${f3(o("c4", "circle") + 0.1)});`);
  js.push(`tl.to("#c4r2",{opacity:.5,duration:.5},${f3(marks[4])});tl.fromTo("#c4st",{opacity:0,rotation:-40,svgOrigin:"${cx} ${cy}"},{opacity:1,rotation:0,svgOrigin:"${cx} ${cy}",duration:1.0,ease:"power2.out"},${f3(marks[4] + 0.1)});`);
  js.push(`tl.to("#c4or",{rotation:430,svgOrigin:"${cx} ${cy}",duration:1.6,ease:"power1.inOut"},${f3(marks[5] - 0.3)});tl.to("#c4st",{rotation:70,svgOrigin:"${cx} ${cy}",duration:1.6,ease:"power1.inOut"},${f3(marks[5] - 0.3)});`);
  html.push(`<div id="c4n" style="position:absolute;left:96px;top:915px;width:900px;opacity:0">${tag("FIRST COMMERCIAL LANDER EVALUATION WITH A CREW", "am")}</div><div id="c4t" style="position:absolute;left:96px;top:915px;width:900px;opacity:0">${tag("5 MORE DAYS: SUITS · SENSORS · NOISE · HEALTH-CHECK STUDY", "cy")}</div>`);
  popv("#c4n", o("c4", "first") - 0.1); sfx(o("c4", "first") - 0.1, "glass", 0.7); hide("#c4n", o("c4", "Step", 3) - 0.1);
  popv("#c4t", o("c4", "Suits") - 0.1); sfx(o("c4", "Suits") - 0.1, "chirp", 0.6);
});
// ================= C5 TWO DOCKINGS
scene("c5", sc("c5").start, sc("c6").start, () => {
  html.push(svgWrap(`<g transform="translate(480 480)"><g id="c5a" opacity="0">${lander(2.4)}<g transform="translate(185 -70) rotate(-90)">${orion(1.15)}</g></g></g><g transform="translate(1440 520)"><g id="c5b" opacity="0">${ship(2.4)}<g transform="translate(0 -292) rotate(180)">${orion(1.15)}</g></g></g>${line("c5p1", "M572 408 L612 408", C.am, 6)}${line("c5p2", "M1440 312 V336", C.am, 6)}`));
  text("c5t1", 200, 700, 560, `<div class="big3">SIDE PORT</div><div class="mono grey">beside Blue Moon's crew cabin</div>`, "ctr");
  text("c5t2", 1160, 700, 560, `<div class="big3">NOSE PORT</div><div class="mono grey">Orion's forward system meets Starship's nose</div>`, "ctr");
  html.push(`<div id="c5k" class="chips" style="left:96px;top:870px;width:1728px">${["CONTROLLABILITY", "COMMUNICATIONS", "SOFTWARE TOGETHER", "DOCKING & UNDOCKING FORCES"].map((x) => tag(x, "cy")).join("")}</div>`);
  text("c5h", 96, 150, 1300, `<div class="mid">Two landers. <span class="am">Two docking designs.</span> One mission.</div>`, "l");
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
  text("c6l0", x0 - 150, 250, 300, `<div class="mono">BLUE MOON TEST ARTICLE<br>launches into orbit</div>`, "ctr sm");
  text("c6l1", day(30) - 240, 250, 480, `<div class="mono am">UP TO 30 DAYS ON ORBIT<br>NASA's stated flexibility</div>`, "ctr sm");
  html.push(svgWrap(`<circle id="c6o" cx="${day(4)}" cy="${y + 6}" r="22" fill="${C.am}" opacity="0"/><circle id="c6s" cx="${day(12)}" cy="${y + 6}" r="22" fill="${C.gr}" opacity="0"/>`));
  text("c6o_t", day(4) - 200, 500, 400, `<div class="mono am sm">ORION launches<br>“only days after”</div>`, "ctr");
  text("c6s_t", day(12) - 220, 500, 440, `<div class="mono gr sm">STARSHIP launches later<br>shorter time on orbit</div>`, "ctr");
  card("c6w", 300, 640, 1320, 230, `<div class="big3 am">WHAT IF ONE PIECE IS LATE?</div><div class="quote" id="c6a" style="opacity:0">NASA's published plan <b>doesn't say</b> what a problem in orbit would do to the 2028 target.</div>`, "mock hotc");
  html.push(`<div id="c6t" style="position:absolute;left:0;width:1920px;top:895px;text-align:center;opacity:0">${tag("TREAT EVERY DATE AS A TARGET, NOT A PROMISE", "grey")}</div>`);
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
  card("c7a", 130, 190, 760, 330, `<div class="mono grey sm">ORIGINAL ASSIGNMENT</div><div class="rr"><span>Artemis III + IV</span>${tag("Starship", "grey")}</div><div class="rr"><span>Artemis V</span>${tag("Blue Moon Mark 2", "grey")}</div>`, "mock");
  card("c7b", 1030, 190, 760, 330, `<div class="mono am sm">NOW</div><div class="rr"><span>Artemis III (orbit)</span>${tag("both companies", "am")}</div><div class="rr"><span>A landing mission</span>${tag("neither assigned", "red")}</div>`, "mock hotc");
  html.push(svgWrap(`<text x="960" y="380" text-anchor="middle" fill="${C.cy}" font-family="Inter" font-weight="900" font-size="90" opacity=".9">→</text>`));
  card("c7c", 130, 580, 1660, 140, `<div class="quote">Based on <b>lander readiness</b>, NASA will decide which company is first to deliver astronauts to the surface in 2028. A second crewed landing opportunity follows.</div>`, "mock");
  html.push(`<div id="c7d" class="chips" style="left:130px;top:780px;width:1660px">${tag("BOTH FLY AN UNCREWED DEMO FIRST", "cy")}${tag("NASA CERTIFIES THE LANDERS BEFORE CREWS FLY", "cy")}</div>`);
  show("#c7a", A("c7", "Originally") - 0.1); sfx(A("c7", "Originally") - 0.1, "pluck", 0.7);
  show("#c7b", A("c7", "realigned") - 0.1); sfx(A("c7", "realigned") - 0.1, "pluck", 0.7, 1.26);
  show("#c7c", A("c7", "says") - 0.1); sfx(A("c7", "says") - 0.1, "glass", 0.7);
  js.push(`tl.set("#c7d .tag",{opacity:0},0);tl.fromTo("#c7d .tag:nth-child(1)",{opacity:0,y:10},{opacity:1,y:0,duration:.3},${f3(A("c7", "uncrewed") - 0.1)});tl.fromTo("#c7d .tag:nth-child(2)",{opacity:0,y:10},{opacity:1,y:0,duration:.3},${f3(A("c7", "certify") - 0.1)});`); sfx(A("c7", "uncrewed") - 0.1, "tick", 0.6); sfx(A("c7", "certify") - 0.1, "tick", 0.6, 1.2);
});
// ================= C8 HOW THE LANDINGS WORK
scene("c8", sc("c8").start, sc("c9").start, () => {
  card("c8h", 130, 150, 1660, 120, `<div class="quote">On a landing mission, a commercial lander links up with Orion, then takes <b>two crew to the surface</b> while <b>two stay aboard</b> Orion.</div>`, "mock");
  const spX = [["Several Starships launch as tankers", "tankers"], ["Transfer propellant to a depot Starship", "depot"], ["Lander waits in Earth orbit; Orion docks", "waits"], ["Burn sends the pair to low lunar orbit", "burn"], ["Two crew descend for several days", "crew"]];
  const bO = [["Three transfer stages launch to orbit", "three"], ["Blue Moon Mark 2 lander follows; they dock", "Followed"], ["Stack heads to an elliptical polar orbit", "elliptical"], ["Stages drop away as fuel runs out", "drop"], ["Orion docks there · two crew descend to the south pole", "descend"]];
  [[spX, 130, "STARSHIP PLAN", "c8x"], [bO, 990, "BLUE ORIGIN PLAN", "c8y"]].forEach(([arr, x, title, id]) => { card(id, x, 290, 800, 70, `<div class="mono am sm">${title}</div>`, "mock hdr"); arr.forEach(([t], i) => card(`${id}${i}`, x, 372 + i * 100, 800, 92, `<div class="st1 sm2">${i + 1}. ${t}</div>`, "mock stepc")); });
  html.push(`<div id="c8n" style="position:absolute;left:130px;top:890px;width:1660px">${tag("NASA: replaces the earlier near-rectilinear halo orbit meeting point", "grey")}${tag("NEW: lighter ‘Sortie suit’, about half the weight", "cy")}</div>`);
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
  const items = [["1", "Hardware is on track", "NASA: processing times cut by about half", "One"], ["2", "Fuel-line part redesigned in 5 months", "NASA's own claim · about a tenth of an outside estimate", "Two"], ["3", "The docking tests", "Everything else depends on them", "Three"]];
  items.forEach(([n, a, b], i) => card(`c9${i}`, 130, 150 + i * 190, 1660, 165, `<div class="stp"><b>${n}</b><div><div class="st1 big4">${a}</div><div class="st2">${b}</div></div></div>`, "mock step"));
  card("c9s", 130, 720, 1660, 200, `<div class="big3 cy">SUBSCRIBE</div><div class="mono grey">Next: how a Starship refuels in orbit, and why it matters for the landing</div>`, "mock hotc");
  const tt = [A("c9", "One", 0), A("c9", "Two", 1) , A("c9", "Three")];
  items.forEach((_, i) => { const t = [A("c9", "One"), A("c9", "Two"), A("c9", "Three")][i] - 0.15; show(`#c9${i}`, t); sfx(t, "pluck", 0.7, [1, 1.26, 1.5][i]); });
  show("#c9s", A("c9", "subscribe") - 0.15); sfx(A("c9", "subscribe") - 0.15, "success3", 0.8); sfx(A("c9", "subscribe") + 0.9, "click", 0.8);
  js.push(`tl.to("#c9s",{scale:1.03,duration:.6,ease:"sine.inOut",yoyo:true,repeat:${Math.max(1, Math.floor((DUR - A("c9", "subscribe")) / 0.6))}},${f3(A("c9", "subscribe") + 1.2)});`);
});

// ================= subtitles (small, bottom, burned in). Spoken numbers shown as digits.
{
  const fixNum = (t) => t.replace(/twenty twenty seven/gi, "2027").replace(/twenty twenty eight/gi, "2028").replace(/two hundred and seventy three/gi, "273").replace(/three hundred and forty five/gi, "345").replace(/fourteen day/gi, "14-day").replace(/thirty days/gi, "30 days").replace(/thirty day/gi, "30-day").replace(/Artemis Three/g, "Artemis III").replace(/Artemis Four/g, "Artemis IV").replace(/Artemis Five/g, "Artemis V").replace(/Version Three/g, "V3").replace(/Mark Two/g, "Mark 2").replace(/Mark two/g, "Mark 2").replace(/Version three/g, "V3").replace(/five more days/gi, "5 more days").replace(/five days/gi, "5 days").replace(/up to two hours/gi, "up to 2 hours").replace(/two crew/gi, "2 crew").replace(/two days/gi, "2 days");
  const ws = T.words, chunks = []; let cur = [];
  const len = (a) => a.map((w) => w.text).join(" ").length;
  ws.forEach((w, i) => { cur.push(w); const nx = ws[i + 1]; const stop = /[.?!:;]$/.test(w.text) || (/,$/.test(w.text) && len(cur) > 30) || len(cur) >= 62 || (nx && nx.section !== w.section) || i === ws.length - 1; if (stop) { chunks.push(cur); cur = []; } });
  chunks.forEach((c, i) => {
    const txt = fixNum(c.map((w) => w.text).join(" ")), st = Math.max(0, c[0].start - 0.05), en0 = c[c.length - 1].end + 0.35, nxt = chunks[i + 1] ? chunks[i + 1][0].start - 0.05 : DUR, en = Math.min(en0, nxt);
    html.push(`<div class="sub" id="sb${i}"><span>${e(txt)}</span></div>`);
    js.push(`tl.set("#sb${i}",{opacity:1},${f3(st)});tl.set("#sb${i}",{opacity:0},${f3(en)});`);
  });
}
js.push(`tl.to("#ecl1",{rotation:10,svgOrigin:"960 1650",duration:${DUR},ease:"none"},0);tl.to("#ecl4",{rotation:-30,svgOrigin:"470 540",duration:${DUR},ease:"none"},0);`);
js.push(`tl.set("#sc_c1",{opacity:1},0);tl.to("#stars",{backgroundPosition:"-300px 120px",duration:${DUR},ease:"none"},0);tl.to("#neb",{x:120,y:-60,duration:${DUR / 2},ease:"sine.inOut",yoyo:true,repeat:1},0);`);

js.push(`tl.to(".glow",{opacity:.35,duration:1.1,yoyo:true,repeat:${Math.ceil(DUR / 1.1)},ease:"sine.inOut"},0);`);
const css = `
@font-face{font-family:Inter;src:url(./fonts/Inter-400.woff2);font-weight:100 900}
@font-face{font-family:"JetBrains Mono";src:url(./fonts/JetBrainsMono-400.woff2);font-weight:100 800}
*{margin:0;padding:0;box-sizing:border-box}html,body{width:1920px;height:1080px;overflow:hidden;background:${C.bg};font-family:Inter,Arial,sans-serif;color:${C.txt}}
#root{position:relative;width:1920px;height:1080px;overflow:hidden;background:${C.bg}}
#stars{position:absolute;inset:-200px;background-image:radial-gradient(circle,rgba(255,255,255,.75) 1.4px,transparent 2px),radial-gradient(circle,rgba(160,190,255,.5) 1px,transparent 1.6px),radial-gradient(circle,rgba(255,255,255,.35) .8px,transparent 1.3px);background-size:331px 277px,197px 241px,113px 139px;background-position:0 0,60px 90px,30px 40px}
#neb{position:absolute;left:900px;top:-200px;width:1300px;height:1300px;border-radius:50%;background:radial-gradient(circle,rgba(92,120,255,.10),transparent 62%)}
#vig{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 50%,transparent 55%,rgba(0,0,0,.5));pointer-events:none;z-index:5}
.chl{position:absolute;left:96px;top:54px;font:600 24px "JetBrains Mono",monospace;letter-spacing:.14em;color:${C.grey};z-index:30}
#bar{position:absolute;left:96px;right:96px;bottom:44px;height:8px;border-radius:4px;background:${C.line};z-index:30}#barfill{display:block;height:100%;width:0;border-radius:4px;background:${C.cy}}#bar b{position:absolute;top:-4px;width:3px;height:16px;background:${C.bg}}
.scene{position:absolute;inset:0;opacity:0}.lay{position:absolute;left:0;top:0;pointer-events:none}
.card{position:absolute;background:${C.card};border:1px solid ${C.line};border-radius:22px;padding:22px 30px;box-shadow:0 18px 50px rgba(0,0,0,.45)}.card.mock{opacity:0}.card.hotc{border-color:${C.am}}
.tx{position:absolute}.ctr{text-align:center}.l{text-align:left}.r{text-align:left}
.mono{font:600 28px "JetBrains Mono",monospace}.mono.sm,.sm{font-size:22px}.grey{color:${C.grey}}.am{color:${C.am}}.cy{color:${C.cy}}.gr{color:${C.gr}}
.huge{font:900 190px/1 Inter;letter-spacing:-.04em}.big{font:900 110px/1 Inter;letter-spacing:-.03em}.big3{font:900 56px/1.05 Inter;letter-spacing:-.02em}.big4{font-size:44px!important}.mid{font:800 64px/1.1 Inter;letter-spacing:-.02em}
.nm{font:800 36px/1.2 Inter}.quote{font:600 34px/1.35 Inter}.quote b{color:${C.am}}
.tag{display:inline-flex;align-items:center;padding:10px 24px;border-radius:999px;font:800 26px Inter;white-space:nowrap;margin-right:14px;background:#1A2338;color:${C.grey}}.tag.cy{background:rgba(92,200,255,.16);color:${C.cy}}.tag.am{background:rgba(255,181,71,.18);color:${C.am}}.tag.red{background:rgba(255,107,107,.2);color:${C.red}}.tag.grey{background:#1A2338;color:${C.grey}}
.chips{position:absolute;display:flex;flex-wrap:wrap;gap:12px}
.row{display:flex;align-items:center;gap:18px}.ppl i{display:inline-block;width:34px;height:34px;border-radius:50%;background:${C.cy};margin-right:10px}
.stamp{position:absolute;opacity:0;text-align:center;font:900 120px/1 Inter;letter-spacing:-.03em;border:10px solid ${C.am};border-radius:24px;padding:34px 20px;background:rgba(5,7,13,.92);color:${C.am};box-shadow:0 0 70px rgba(255,181,71,.25)}.stamp.red2{border-color:${C.red};color:${C.red};font-size:112px;box-shadow:0 0 70px rgba(255,107,107,.25)}
.step .stp,.stepc{display:flex;align-items:center}.stp{display:flex;align-items:center;gap:24px}.stp b{display:inline-flex;align-items:center;justify-content:center;flex:none;width:58px;height:58px;border-radius:50%;background:${C.cy};color:#001018;font:900 32px Inter}.st1{font:800 31px/1.2 Inter}.st2{font:500 21px/1.3 "JetBrains Mono",monospace;color:${C.grey};margin-top:6px}.sm2{font-size:28px!important}
.card.hdr{padding:14px 30px}.sub{position:absolute;left:0;width:1920px;top:972px;text-align:center;opacity:0;z-index:40}.sub span{display:inline-block;background:rgba(5,7,13,.8);padding:4px 16px;border-radius:9px;font:600 26px/1.3 Inter;color:#EAF0FF}.rr{display:flex;justify-content:space-between;align-items:center;margin-top:22px;font:700 34px Inter}
`;
const page = `<!doctype html>
<html lang="en" data-resolution="landscape"><head><meta charset="UTF-8"/><meta name="viewport" content="width=1920, height=1080"/><script src="./gsap.min.js"></script><style>${css}</style></head>
<body><div id="root" data-composition-id="main" data-start="0" data-duration="${DUR.toFixed(3)}" data-width="1920" data-height="1080">
${DEFS}
<div id="stars"></div><div id="neb"></div>
${html.join("\n")}
<div id="vig"></div></div>
<script>
window.__timelines=window.__timelines||{};const tl=gsap.timeline({paused:true});
${js.join("\n")}
window.__timelines["main"]=tl;tl.seek(0);
</script></body></html>`;
fs.writeFileSync("hf/index.html", page);
fx.sort((a, b) => a.t - b.t);
fs.writeFileSync("audio/sfx_events.json", JSON.stringify({ duration: T.duration, s4: 0.0, end: DUR - 3.2, hook: 0.1, events: fx }, null, 1));
if (MISS.length) console.log("MISSING ANCHORS:", [...new Set(MISS)].join(", "));
console.log(`hf/index.html ${(page.length / 1024).toFixed(0)} KB, ${DUR.toFixed(1)}s, ${fx.length} sound events`);
