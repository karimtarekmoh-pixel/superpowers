// Fable 5.2 "fallback" reel v2 (routing-diagram format): MOH dark identity in ORANGE. Generates hf/index.html (Hyperframes: HTML + one paused GSAP timeline).
// Every time comes from src/cues.js. usage: node tools/build_fable.mjs [audio/timestamps.json]
import fs from "node:fs";
import { buildTimeline } from "../src/timeline.js";
import { buildCues } from "../src/cues.js";
const S = JSON.parse(fs.readFileSync("src/script.json")), TS = JSON.parse(fs.readFileSync(process.argv[2] || "audio/timestamps.json"));
const T = buildTimeline(S, TS), Q = buildCues(T), q = Q.t, sc = (id) => T.scene(id);
const DUR = Math.ceil(T.duration * 30) / 30;
const P = { bg: "#0C0A08", acc: "#FF7A1A", red: "#FF4D5E", green: "#62E884", grey: "#A39A90", pale: "#241D16", card: "#17130F", line: "#3A2E22", amber: "#FFB020" };
const html = [], js = [];
const e = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
const f3 = (x) => (+x).toFixed(3);
const ent = (sel, t) => js.push(`tl.fromTo("${sel}",{opacity:0,y:14},{opacity:1,y:0,duration:.3,ease:"power2.out"},${f3(Math.max(0, t))});`);
const wipeIn = (sel, t, d = 0.28) => js.push(`tl.fromTo("${sel}",{opacity:0,y:14},{opacity:1,y:0,duration:${d},ease:"power2.out"},${f3(t)});`);
const showAt = (sel, t) => js.push(`tl.fromTo("${sel}",{opacity:0,y:14},{opacity:1,y:0,duration:.25,ease:"power2.out"},${f3(t)});`);
const popAt = (sel, t) => js.push(`tl.fromTo("${sel}",{opacity:0,scale:.94},{opacity:1,scale:1,duration:.22,ease:"power2.out"},${f3(t)});`);
const typed = (id, text, t0, step) => { let i = 0; const out = text.split(" ").map((wd) => `<span class="wd">${[...wd].map((c) => { const k = i++; js.push(`tl.set("#${id}_${k}",{opacity:1},${f3(t0 + k * step)});`); return `<span class="ch" id="${id}_${k}">${e(c)}</span>`; }).join("")}</span>`).map((x, n, a) => { i++; return n < a.length - 1 ? x + " " : x; }).join(""); js.push(`tl.set("#${id}_cur",{opacity:1},${f3(t0)});tl.set("#${id}_cur",{opacity:0},${f3(t0 + text.length * step + 0.25)});`); return out + `<span class="cur" id="${id}_cur">|</span>`; };
const tag = (text, cls, id = "") => `<span class="tag ${cls}" ${id ? `id="${id}"` : ""}>${e(text)}</span>`;
const box = (id, x, y, w, h, inner, cls = "") => html.push(`<div class="card ${cls}" id="${id}" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px">${inner}</div>`);
const scene = (id, a, b, fn) => { html.push(`<div class="scene" id="sc_${id}">`); fn(); html.push(`</div>`); js.push(`tl.set("#sc_${id}",{opacity:1},${f3(a)});${b ? `tl.set("#sc_${id}",{opacity:0},${f3(b)});` : ""}`); };
const ttl = (id, text, tIn, tOut, size = 230) => { html.push(`<div class="ttl" id="${id}_ttl" style="font-size:${size}px" data-layout-allow-overlap data-layout-allow-occlusion>${e(text)}</div>`); js.push(`tl.fromTo("#${id}_ttl",{opacity:0,scale:1.05},{opacity:1,scale:1,duration:.22,ease:"power2.out"},${f3(tIn)});tl.to("#${id}_ttl",{opacity:.22,color:"${P.line}",duration:.25,ease:"power2.out"},${f3(tOut)});`); };
const row = (id, name, cls = "", extra = "") => `<div class="prow ${cls}" id="${id}"><span class="pn">${name}</span>${extra}</div>`;
const chip = (id, text, cls = "") => `<span class="chip ${cls}" id="${id}">${e(text)}</span>`;
const arr = (id) => `<span class="arr" id="${id}">→</span>`;


const LOGO = fs.readFileSync("hf/claude.svg", "utf8").replace(/<svg[^>]*>/, '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">').replace(/<title>.*?<\/title>/, "");
const logo = (cls, px) => `<span class="lg ${cls}" style="width:${px}px;height:${px}px">${LOGO}</span>`;
const SHIELD = `<svg width="92" height="92" viewBox="0 0 24 24"><path d="M12 2 L20 5.5 V11.5 C20 16.5 16.5 20.5 12 22 C7.5 20.5 4 16.5 4 11.5 V5.5 Z" fill="none" stroke="${P.acc}" stroke-width="1.8" stroke-linejoin="round"/><path d="M8.5 12 L11 14.5 L15.8 9.5" fill="none" stroke="${P.acc}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const hline = (id, d, col, len = 1) => `<path id="${id}" d="${d}" pathLength="1" stroke="${col}" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1" stroke-dashoffset="1"/>`;
const drawAt = (id, t, d = 0.45) => js.push(`tl.to("#${id}",{strokeDashoffset:0,duration:${d},ease:"power2.out"},${f3(t)});`);

html.push(`<div id="lab">FABLE 5.2 · FALLBACK</div>`);

// ================= s1 HOOK: big Claude mark, "ASK THE WRONG QUESTION", then a different model appears
scene("s1", 0, sc("s2").start, () => {
  html.push(`<div id="h1" style="position:absolute;left:60px;top:520px;width:960px"><div class="hl">ASK THE</div><div class="hl o">WRONG QUESTION</div></div>`);
  html.push(`<div class="ring ring1" style="left:240px;top:710px;width:600px;height:600px"></div><div class="ring ring2" style="left:190px;top:660px;width:700px;height:700px"></div><div id="glow"></div>`);
  html.push(`<div id="mk" style="position:absolute;left:390px;top:860px">${logo("big", 300)}</div>`);
  html.push(`<div id="fp" style="position:absolute;left:0;width:1080px;top:1230px;text-align:center;opacity:0">${tag("FABLE 5.2 · most capable in Claude Code", "acc")}</div>`);
  html.push(`<svg id="hl_svg" width="1080" height="1920" style="position:absolute;left:0;top:0;pointer-events:none">${hline("hp0", "M540 1300 V1390", P.red)}</svg>`);
  box("dm", 160, 1390, 760, 190, `<div class="flow" style="justify-content:center"><span class="q">?</span><span class="dmt">DIFFERENT MODEL</span></div>`, "mock red");
  js.push(`tl.fromTo("#h1",{opacity:0,y:14},{opacity:1,y:0,duration:.3,ease:"power2.out"},${f3(q.s1_head)});tl.fromTo("#mk",{opacity:0,scale:.92},{opacity:1,scale:1,duration:.35,ease:"power2.out"},${f3(q.s1_mark)});tl.fromTo("#glow",{opacity:0},{opacity:1,duration:.6},${f3(q.s1_mark)});`);
  js.push(`tl.to("#h1 .hl.o",{color:"${P.red}",duration:.2},${f3(q.s1_wrong)});`);
  js.push(`tl.to(".ring",{opacity:1,duration:.5},0.2);`);
  popAt("#fp", q.s1_pill); drawAt("hp0", q.s1_hand, 0.4); wipeIn("#dm", q.s1_diff);
});
// ================= s2: Fable runs with safety classifiers: cybersecurity, biology
scene("s2", sc("s2").start, sc("s3").start, () => {
  box("f2", 120, 560, 840, 200, `<div class="flow" style="gap:26px">${logo("", 120)}<span class="big2">FABLE 5.2</span><span class="mono grey" style="margin-left:auto">runs with</span></div>`, "mock");
  html.push(`<svg width="1080" height="1920" style="position:absolute;left:0;top:0;pointer-events:none">${hline("l2", "M540 760 V850", P.acc)}</svg>`);
  box("g2", 120, 850, 840, 320, `<div class="flow" style="gap:34px">${SHIELD}<div><div class="big2">SAFETY CLASSIFIER</div><div class="mono grey" style="margin-top:8px">watches every request</div></div></div>`, "mock hot");
  html.push(`<div class="flow" id="cs" style="position:absolute;left:120px;top:1250px;gap:24px">${tag("CYBERSECURITY", "red", "cy2")}${tag("BIOLOGY", "am", "bi2")}</div>`);
  js.push(`tl.set("#cy2,#bi2",{opacity:0},0);`);
  wipeIn("#f2", q.s2_f); drawAt("l2", q.s2_gate - 0.1, 0.3); wipeIn("#g2", q.s2_gate); popAt("#cy2", q.s2_cy); popAt("#bi2", q.s2_bio);
});
// ================= s3: flagged -> same request re-runs on another model
scene("s3", sc("s3").start, sc("s4").start, () => {
  box("r3", 210, 540, 660, 150, `<div class="flow" style="justify-content:center"><span class="big2">YOUR REQUEST</span></div>`, "mock");
  html.push(`<svg width="1080" height="1920" style="position:absolute;left:0;top:0;pointer-events:none">${hline("l3a", "M540 690 V760", P.acc)}${hline("l3c", "M540 990 V1260", P.line)}${hline("l3l0", "M540 990 V1125 H210 V1260", P.line)}${hline("l3r0", "M540 990 V1125 H870 V1260", P.line)}${hline("l3l", "M540 990 V1125 H210 V1260", P.acc)}${hline("l3r", "M540 990 V1125 H870 V1260", P.amber)}</svg>`);
  box("g3", 210, 760, 660, 230, `<div class="flow" style="gap:22px">${SHIELD}<div><div class="big3">CLASSIFIER</div><div id="fl3" style="margin-top:10px;opacity:0">${tag("FLAGGED", "red")}</div></div></div>`, "mock");
  box("cF", 390, 1260, 300, 330, `<div class="mc">${logo("", 100)}<div class="mn">FABLE 5.2</div><div class="mt dim">flagged</div></div>`, "mock");
  box("cL", 60, 1260, 300, 330, `<div class="mc">${logo("", 100)}<div class="mn">OPUS 5</div><div class="mt" id="tl3">BIOLOGY</div></div>`, "mock");
  box("cR", 720, 1260, 300, 330, `<div class="mc">${logo("", 100)}<div class="mn">OPUS 4.8</div><div class="mt am" id="tr3">CYBERSEC</div></div>`, "mock");
  html.push(`<div class="ill" style="left:60px;top:1620px">per the Claude Code docs, for Fable models</div>`);
  wipeIn("#r3", q.s3_R); drawAt("l3a", q.s3_R + 0.15, 0.3); wipeIn("#g3", q.s3_G); popAt("#fl3", q.s3_flag); wipeIn("#cF", q.s3_F);
  ["l3c", "l3l0", "l3r0"].forEach((id) => drawAt(id, q.s3_lines, 0.5)); wipeIn("#cL", q.s3_oth); wipeIn("#cR", q.s3_oth + 0.1);
  js.push(`tl.to("#cF",{opacity:.45,duration:.25},${f3(q.s3_oth)});`);
  drawAt("l3l", q.s3_bio, 0.45); js.push(`tl.to("#cL",{borderColor:"${P.acc}",backgroundColor:"rgba(255,122,26,.14)",duration:.2},${f3(q.s3_bio + 0.3)});`);
  drawAt("l3r", q.s3_cy, 0.45); js.push(`tl.to("#cR",{borderColor:"${P.amber}",backgroundColor:"rgba(255,176,32,.14)",duration:.2},${f3(q.s3_cy + 0.3)});`);
});
// ================= s4: it can trigger on the very first message
scene("s4", sc("s4").start, sc("s5").start, () => {
  box("m4a", 60, 540, 960, 400, `<div style="margin-bottom:22px;opacity:0" id="ft4">${tag("FIRST MESSAGE", "acc")}</div><div class="mono grey up" style="margin-bottom:16px">the request also carries</div><div class="flow">${chip("k4_0", "your prompt")}${chip("k4_1", "CLAUDE.md")}${chip("k4_2", "git status")}</div>`, "mock");
  box("m4b", 60, 990, 960, 280, `<div class="mono grey up">a repo with security material</div><div style="margin-top:22px;opacity:0" id="t4">${tag("CAN TRIP THE CLASSIFIER", "red")}</div>`, "mock");
  box("m4c", 60, 1320, 960, 290, `<div class="flow">${chip("k4_3", "Fable 5.2")}${arr("a4")}${chip("k4_4", "fallback model", "ac")}</div><div style="margin-top:22px;opacity:0" id="s4t">${tag("session stays there", "grey")}</div>`, "mock");
  html.push(`<div class="ill" style="left:60px;top:1640px">per the Claude Code docs</div>`);
  wipeIn("#m4a", q.s4_a); popAt("#ft4", q.s4_tag); popAt("#k4_0", q.s4_c0); popAt("#k4_1", q.s4_c1); popAt("#k4_2", q.s4_c2);
  wipeIn("#m4b", q.s4_b); popAt("#t4", q.s4_trip); js.push(`tl.to("#m4b",{borderColor:"${P.red}",duration:.15},${f3(q.s4_trip)});`);
  wipeIn("#m4c", q.s4_c); popAt("#k4_3", q.s4_c); popAt("#a4", q.s4_c + 0.2); popAt("#k4_4", q.s4_c + 0.3); popAt("#s4t", q.s4_stay);
});
// ================= s5: notice in the transcript, /model to switch back
scene("s5", sc("s5").start, sc("s6").start, () => {
  box("m5a", 60, 540, 960, 340, `<div class="mono grey up">transcript · illustrative</div><div class="mono grey" style="margin-top:16px;font-size:38px">&gt; your message</div><div class="nt" id="nt5" style="margin-top:18px;opacity:0">↳ continuing on a fallback model</div>`, "mock dark");
  box("m5b", 60, 910, 960, 180, `<div class="term"><span class="g">&gt;</span> ${typed("m5", "/model", q.s5_type, 0.06)}</div>`, "mock dark");
  box("m5c", 60, 1130, 960, 520, `<div class="mono grey up">pick your model</div>${row("q0", "Sonnet 5.5")}${row("q1", "Opus 5.5")}${row("q2", "Fable 5.2", "", `<span class="ptag dim" id="qe">BACK</span>`)}`, "mock");
  html.push(`<div id="stp" data-layout-allow-overlap data-layout-allow-occlusion><div>CHECK</div><div>/MODEL</div><svg id="ticks" width="760" height="300" viewBox="0 0 760 300">${Array.from({ length: 10 }, (_, i) => { const a = (i / 10) * Math.PI * 2, cx = 380, cy = 150; return `<line x1="${cx + Math.cos(a) * 330}" y1="${cy + Math.sin(a) * 150}" x2="${cx + Math.cos(a) * 372}" y2="${cy + Math.sin(a) * 180}" stroke="${P.red}" stroke-width="7" stroke-linecap="round"/>`; }).join("")}</svg></div>`);
  wipeIn("#m5a", q.s5_a); popAt("#nt5", q.s5_notice); wipeIn("#m5b", q.s5_a + 0.2); wipeIn("#m5c", q.s5_card); [0, 1, 2].forEach((i) => showAt("#q" + i, q["s5_r" + i]));
  js.push(`tl.to("#q2",{borderColor:"${P.acc}",backgroundColor:"rgba(255,122,26,.14)",duration:.15},${f3(q.s5_hl)});tl.to("#qe",{backgroundColor:"${P.acc}",color:"#000",duration:.15},${f3(q.s5_hl)});`);
  js.push(`tl.fromTo("#stp",{opacity:.15,scale:2.4,rotation:-10,x:0},{opacity:1,scale:1,rotation:-6,x:0,duration:.2,ease:"power4.in",immediateRender:false},${f3(q.s5_stamp)});tl.fromTo("#ticks",{opacity:0,scale:.94},{opacity:1,scale:1,duration:.12,ease:"power2.out",immediateRender:false},${f3(q.s5_stamp + 0.2)});tl.to("#ticks",{opacity:0,duration:.25},${f3(q.s5_stamp + 0.45)});`);
});
// ================= s6: save, follow
scene("s6", sc("s6").start, null, () => {
  html.push(`<div id="sv"><div class="s1">SAVE</div><div class="s2">THIS</div></div>`);
  js.push(`tl.fromTo("#sv",{opacity:0,scale:.85,rotation:-6},{opacity:1,scale:1,rotation:-3,duration:.22,ease:"power4.out"},${f3(q.s6_save)});tl.set("#sv",{opacity:0},${f3(q.s6_end)});`);
  html.push(`<div id="fol"><div class="bolt">${logo("", 100)}</div><div class="hdl" id="fh">${e(S.handle)}</div><div class="mono grey" id="fs" style="letter-spacing:.24em">CLAUDE CODE WORKFLOWS</div><div class="btn" id="fb">FOLLOW FOR MORE</div></div>`);
  js.push(`tl.set("#fol",{opacity:1},${f3(q.s6_end)});`);
  [["#fol .bolt", 0.1], ["#fh", 0.25], ["#fs", 0.35], ["#fb", 0.5]].forEach(([s, d]) => ent(s, q.s6_end + d));
  js.push(`tl.to("#fb",{scale:.94,duration:.07,yoyo:true,repeat:1},${f3(q.s6_click)});tl.to("#fb",{scale:1.05,duration:.6,ease:"sine.inOut",yoyo:true,repeat:${Math.max(1, Math.floor((DUR - q.s6_click - 0.3) / 0.6))}},${f3(q.s6_click + 0.25)});`);
});

// ================= captions: bottom pill, spoken word gets the orange box; "five point one" shows as 5.1, "slash model" as /model
const ACC = new Set(S.accentWords), nz = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
const out = []; { let skip = 0; T.words.forEach((w, i) => { if (skip) { skip--; return; }
  const n1 = T.words[i + 1], n2 = T.words[i + 2];
  const n3 = T.words[i + 3], NUM = { one: "1", two: "2", eight: "8" };
  if (["four", "five"].includes(nz(w.text)) && n1 && nz(n1.text) === "point" && n2 && NUM[nz(n2.text)]) { out.push({ text: (nz(w.text) === "four" ? "4." : "5.") + NUM[nz(n2.text)] + (n2.text.match(/[.,:?!]$/)?.[0] || ""), start: w.start, end: n2.end, section: w.section }); skip = 2; }
  else if (nz(w.text) === "claude" && n1 && nz(n1.text) === "dot" && n2 && nz(n2.text) === "m" && n3 && nz(n3.text) === "d") { out.push({ text: "CLAUDE.MD", start: w.start, end: n3.end, section: w.section }); skip = 3; }
  else if (nz(w.text) === "slash" && n1) { out.push({ text: "/" + n1.text, start: w.start, end: n1.end, section: w.section }); skip = 1; }
  else out.push({ ...w }); }); }
const phrases = []; { let cur = []; out.forEach((w, i) => { cur.push(w); const last = i === out.length - 1, nextSec = !last && out[i + 1].section !== w.section; if (/[.,:?!]$/.test(w.text) || cur.length >= 5 || nextSec || last) { phrases.push(cur); cur = []; } }); }
const groups = []; phrases.forEach((ph) => { for (let k = 0; k < ph.length; k += 3) groups.push(ph.slice(k, k + 3)); });
groups.forEach((g, i) => {
  html.push(`<div class="cap" id="cp${i}"><div class="pl">${g.map((w, j) => { const acc = ACC.has(nz(w.text)); return `<span id="cp${i}w${j}" class="${acc ? "acc" : ""}">${e(w.text.replace(/[.,:?!]$/, "").toUpperCase())}</span>`; }).join("")}</div></div>`);
  const st = g[0].start - 0.06, en = i + 1 < groups.length ? groups[i + 1][0].start - 0.06 : DUR;
  js.push(`tl.set("#cp${i}",{opacity:1},${f3(Math.max(0, st))});tl.fromTo("#cp${i} .pl",{scale:.9},{scale:1,duration:.13,ease:"power2.out",immediateRender:false},${f3(Math.max(0, st))});tl.set("#cp${i}",{opacity:0},${f3(en)});`);
  g.forEach((w, j) => { const a = Math.max(st, w.start - 0.03), b = Math.max(a + 0.1, w.end - 0.02), acc = ACC.has(nz(w.text));
    js.push(`tl.set("#cp${i}w${j}",{opacity:.5,color:"#ffffff",backgroundColor:"rgba(255,122,26,0)",scale:1},0);tl.to("#cp${i}w${j}",{opacity:1,color:"#000000",backgroundColor:"${P.acc}",scale:1.08,duration:.08,ease:"power2.out"},${f3(a)});tl.to("#cp${i}w${j}",{backgroundColor:"rgba(255,122,26,0)",color:"${acc ? P.acc : "#ffffff"}",scale:1,duration:.14,ease:"power2.out"},${f3(b)});`); });
});
js.push(`tl.set("#sc_s1",{opacity:1},0);tl.to(".ring1",{rotation:360,duration:40,ease:"none"},0);tl.to(".ring2",{rotation:-360,duration:60,ease:"none"},0);tl.to("#bg",{backgroundPosition:"360px 864px",duration:${DUR},ease:"none"},0);tl.to("#o1",{x:160,y:-120,duration:${DUR / 2},ease:"sine.inOut",yoyo:true,repeat:1},0);tl.to("#o2",{x:-180,y:140,duration:${DUR / 2},ease:"sine.inOut",yoyo:true,repeat:1},0);`);

const css = `
.lg{display:inline-block;flex:none}.lg svg{display:block}.lg.big{filter:drop-shadow(0 0 60px rgba(255,122,26,.55))}
#glow{position:absolute;left:240px;top:710px;width:600px;height:600px;border-radius:50%;background:radial-gradient(circle,rgba(255,122,26,.35),transparent 68%);opacity:0}
.ring{position:absolute;border-radius:50%;border:3px solid rgba(255,122,26,.45);opacity:0}.ring2{border:3px dashed rgba(255,176,32,.35)}
.hl{font:900 128px/1.0 Inter;letter-spacing:-.04em;color:#fff}.hl.o{color:#FF7A1A;font-size:104px}
.big2{font:900 70px/1.05 Inter;letter-spacing:-.02em}.big3{font:900 54px/1.05 Inter;letter-spacing:-.02em}
.card.hot{border-color:#FF7A1A;box-shadow:0 0 50px rgba(255,122,26,.18),0 20px 60px rgba(0,0,0,.45)}.card.red{border-color:#FF4D5E;background:rgba(255,77,94,.08)}
.q{font:900 84px Inter;color:#FF4D5E;margin-right:16px}.dmt{font:900 60px Inter;color:#FF4D5E;letter-spacing:-.01em}
.mc{display:flex;flex-direction:column;align-items:center;gap:12px;text-align:center}.mn{font:900 46px Inter;letter-spacing:-.01em}.mt{font:800 26px "JetBrains Mono";padding:6px 14px;border-radius:999px;background:rgba(255,122,26,.2);color:#FF7A1A}.mt.am{background:rgba(255,176,32,.2);color:#FFB020}.mt.dim{background:#2B241C;color:#A39A90}
.nt{font:600 36px "JetBrains Mono";color:#FF7A1A}.tag.am{background:#FFB020;color:#000}
.bolt{background:#000}

@font-face{font-family:Inter;src:url(./fonts/Inter-400.woff2);font-weight:100 900}
@font-face{font-family:"JetBrains Mono";src:url(./fonts/JetBrainsMono-400.woff2);font-weight:100 800}
*{margin:0;padding:0;box-sizing:border-box}html,body{width:1080px;height:1920px;overflow:hidden;background:${P.bg};font-family:Inter,Arial,sans-serif;color:#fff}
#root{position:relative;width:1080px;height:1920px;overflow:hidden;background:${P.bg}}
#bg{position:absolute;inset:-80px;background-image:radial-gradient(circle,${P.line} 2.4px,transparent 3px);background-size:72px 72px}
.orb{position:absolute;border-radius:50%}#o1{left:-200px;top:300px;width:840px;height:840px;background:radial-gradient(circle,rgba(255,122,26,.17),transparent 65%)}#o2{left:480px;top:960px;width:920px;height:920px;background:radial-gradient(circle,rgba(255,176,32,.10),transparent 65%)}
#vig{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 50%,transparent 55%,rgba(0,0,0,.45));pointer-events:none;z-index:5}
#lab{position:absolute;left:60px;top:290px;font:600 30px "JetBrains Mono",monospace;letter-spacing:.14em;color:${P.grey};z-index:20}
.cap{position:absolute;left:0;right:0;top:1606px;display:flex;justify-content:center;opacity:0;z-index:40}.cap .pl{max-width:960px;background:#000;border-radius:14px;padding:12px 24px;display:flex;gap:6px;white-space:nowrap;font:900 56px/1.12 Inter;letter-spacing:-.01em;color:#fff;box-shadow:0 10px 30px rgba(0,0,0,.4)}.cap .pl span{display:inline-block;padding:0 12px;border-radius:12px}
.scene{position:absolute;inset:0;opacity:0;transform:translateY(-150px)}
.tag{display:inline-flex;align-items:center;padding:12px 28px;border-radius:999px;font:800 36px Inter;white-space:nowrap;letter-spacing:.02em}.tag.red{background:${P.red};color:#000}.tag.grey{background:#2B241C;color:${P.grey}}.tag.green{background:${P.green};color:#000}.tag.acc{background:${P.acc};color:#000;box-shadow:0 0 36px rgba(255,122,26,.28)}
#stp{position:absolute;left:120px;top:900px;width:760px;text-align:center;font:900 92px/1.02 Inter;color:${P.acc};border:9px solid ${P.acc};border-radius:20px;padding:26px 20px;letter-spacing:-.01em;opacity:0;transform-origin:50% 50%;box-shadow:0 0 60px rgba(255,122,26,.25);background:rgba(12,10,8,.88)}#stp div{position:relative;z-index:2}#ticks{position:absolute;left:-10px;top:-40px;z-index:1;opacity:0;overflow:visible}
.ttl{position:absolute;left:50px;top:830px;font:900 230px/1 Inter;letter-spacing:-.05em;color:#fff;transform:rotate(-4deg);opacity:0;white-space:nowrap;text-shadow:0 0 50px rgba(255,122,26,.25)}
.card{position:absolute;background:${P.card};border:1px solid ${P.line};border-radius:28px;padding:30px 36px;box-shadow:0 20px 60px rgba(0,0,0,.45)}.card.mock{opacity:0}.card.dark{background:#0F0C09;border-color:#2A2118}
.mono{font-family:"JetBrains Mono",monospace;font-size:34px}.up{font-size:28px!important}.mono.grey,.grey{color:${P.grey}}.up{text-transform:uppercase;letter-spacing:.1em;font-size:24px}
.big{font:900 84px/1.1 Inter;letter-spacing:-.03em;margin-top:14px}
.prow{display:flex;justify-content:space-between;align-items:center;position:relative;margin-top:18px;padding:28px 30px;border-radius:20px;background:#1F1913;border:2px solid ${P.line};font:700 50px Inter;opacity:0}.prow.hot{border-color:${P.acc};background:rgba(255,122,26,.12)}.pn{position:relative;display:inline-block;min-width:260px}
.ptag{font:800 32px Inter;padding:8px 18px;border-radius:999px;background:${P.acc};color:#000;white-space:nowrap}.ptag.red{background:${P.red}}.ptag.am{background:${P.amber}}.ptag.dim{background:#2B241C;color:${P.grey}}
.term{font:500 42px/1.45 "JetBrains Mono",monospace}.term .g{color:${P.acc}}.ch{opacity:0}.wd{display:inline-block;white-space:nowrap}.cur{opacity:0;color:#fff}
.flow{display:flex;align-items:center;gap:16px}.chip{display:inline-flex;padding:18px 28px;border-radius:18px;background:#1F1913;border:2px solid ${P.line};font:700 36px "JetBrains Mono";white-space:nowrap;opacity:0;color:#fff}.chip.ac{background:${P.acc};color:#000;border-color:${P.acc}}.chip.am{background:rgba(255,176,32,.14);border-color:${P.amber};color:${P.amber}}.arr{font:800 36px Inter;color:${P.acc};opacity:0}
.ill{position:absolute;font:500 30px "JetBrains Mono",monospace;color:${P.grey};opacity:.85}
#sv{position:absolute;left:60px;top:900px;width:960px;height:460px;border-radius:36px;background:${P.acc};color:#000;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;box-shadow:0 0 80px rgba(255,122,26,.3)}#sv .s1{font:900 220px/.95 Inter;letter-spacing:-.03em}#sv .s2{font:900 104px/1 Inter;margin-top:14px}
#fol{position:absolute;left:60px;top:780px;width:960px;display:flex;flex-direction:column;align-items:center;opacity:0}.bolt{width:150px;height:150px;border-radius:39px;background:#000;border:2px solid ${P.line};display:flex;align-items:center;justify-content:center;opacity:0;box-shadow:0 0 50px rgba(255,122,26,.3)}.hdl{margin-top:36px;font:800 76px Inter;opacity:0}#fs{margin-top:14px;opacity:0;color:${P.grey}}.btn{margin-top:56px;background:${P.acc};color:#000;border-radius:999px;padding:30px 72px;font:900 52px Inter;opacity:0;box-shadow:0 0 40px rgba(255,122,26,.25)}
`;
const out2 = `<!doctype html>
<html lang="en" data-resolution="portrait"><head><meta charset="UTF-8"/><meta name="viewport" content="width=1080, height=1920"/><script src="./gsap.min.js"></script><style>${css}</style></head>
<body><div id="root" data-composition-id="main" data-start="0" data-duration="${DUR.toFixed(3)}" data-width="1080" data-height="1920">
<div id="bg"></div><div class="orb" id="o1"></div><div class="orb" id="o2"></div>
${html.join("\n")}
<div id="vig"></div></div>
<script>
window.__timelines=window.__timelines||{};const tl=gsap.timeline({paused:true});
${js.join("\n")}
window.__timelines["main"]=tl;tl.seek(0);
</script></body></html>`;
fs.writeFileSync("hf/index.html", out2);
console.log(`hf/index.html ${(out2.length / 1024).toFixed(0)} KB, duration ${DUR.toFixed(2)}s, ${phrases.length} caption phrases, ${Q.events.length} sound events`);
