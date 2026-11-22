// Fable 5.2 "saved model" reel: MOH dark identity in ORANGE. Generates hf/index.html (Hyperframes: HTML + one paused GSAP timeline).
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

html.push(`<div id="lab">FABLE 5.2 · YOUR SAVED MODEL</div>`);

// ================= HOOK (s1): picker, SAVED tag, then the row swaps 5.1 -> 5.2
scene("s1", 0, sc("s2").start, () => {
  box("pk", 60, 800, 960, 520, `<div class="mono grey up">/model · illustrative picker</div>${row("pr0", "Sonnet 5.5")}${row("pr1", "Opus 5.5")}${row("pr2", `<span id="n51">Fable 5.1</span><span id="n52" style="position:absolute;left:0;top:0;opacity:0">Fable 5.2</span>`, "hot", `<span class="ptag" id="tgS">SAVED</span><span class="ptag red" id="tgW" style="opacity:0;position:absolute;right:26px">SWAPPED</span>`)}`, "");
  [0, 1, 2].forEach((k) => showAt("#pr" + k, q["s1_r" + k]));
  js.push(`tl.fromTo("#pk .up",{opacity:0},{opacity:1,duration:.2},0.02);`);
  js.push(`tl.fromTo("#tgS",{opacity:0,scale:.94},{opacity:1,scale:1,duration:.22,ease:"power2.out"},${f3(q.s1_tag)});`);
  js.push(`tl.to("#n51",{opacity:0,y:-14,duration:.25,ease:"power2.out"},${f3(q.s1_swap)});tl.fromTo("#n52",{opacity:0,y:14},{opacity:1,y:0,duration:.25,ease:"power2.out"},${f3(q.s1_swap + 0.08)});tl.to("#tgS",{opacity:0,duration:.15},${f3(q.s1_swap)});tl.fromTo("#tgW",{opacity:0,scale:.94},{opacity:1,scale:1,duration:.22,ease:"power2.out"},${f3(q.s1_swapped)});`);
});
// ================= s2: the assumption
scene("s2", sc("s2").start, sc("s3").start, () => {
  ttl("s2", "5.1", q.s2_title, q.s2_card - 0.12);
  box("m2", 60, 800, 960, 330, `<div class="mono grey up">saved default</div><div class="big" id="b2">Fable 5.1</div><div id="t2" style="margin-top:22px;opacity:0">${tag("you might assume: it stays put", "grey")}</div>`, "mock");
  wipeIn("#m2", q.s2_card); js.push(`tl.fromTo("#b2",{color:"#ffffff"},{color:"${P.acc}",duration:.15},${f3(q.s2_pin)});`); popAt("#t2", q.s2_tag);
});
// ================= s3: the catch
scene("s3", sc("s3").start, sc("s4").start, () => {
  ttl("s3", "THE CATCH", q.s3_title, q.s3_a - 0.1, 190);
  box("m3a", 60, 790, 960, 350, `<div class="flow" style="margin-bottom:22px"><span class="mono grey" id="o3">ON</span>${tag("PRO", "acc", "p3")}${tag("MAX", "acc", "x3")}</div><div class="flow">${chip("c3_0", "saved: Fable 5.1")}${arr("a3_0")}${chip("c3_1", "fable alias")}</div><div style="margin-top:22px">${chip("c3_v", "first run of v2.1.321+", "am")}</div>`, "mock");
  box("m3b", 60, 1170, 960, 190, `<div class="flow">${chip("c3_2", "fable alias")}${arr("a3_1")}${chip("c3_3", "Fable 5.2", "ac")}</div>`, "mock");
  box("m3c", 60, 1390, 960, 190, `<div class="mono grey up" style="margin-bottom:14px">session start</div><div class="flow">${chip("c3_4", "effort: medium", "ac")}<span id="u3" style="opacity:0">${tag("unless you set a level", "grey")}</span></div>`, "mock");
  wipeIn("#m3a", q.s3_a); popAt("#p3", q.s3_pro); popAt("#x3", q.s3_max);
  popAt("#c3_0", q.s3_c0); popAt("#a3_0", q.s3_c1); popAt("#c3_1", q.s3_c2); popAt("#c3_v", q.s3_ver);
  wipeIn("#m3b", q.s3_b); popAt("#c3_2", q.s3_b0); popAt("#a3_1", q.s3_b1 - 0.1); popAt("#c3_3", q.s3_b1);
  wipeIn("#m3c", q.s3_c); popAt("#c3_4", q.s3_med); popAt("#u3", q.s3_unl);
  html.push(`<div class="ill" style="left:60px;top:1600px">illustrative · Pro/Max, per the docs</div>`);
});
// ================= s4: what you pay with
scene("s4", sc("s4").start, sc("s5").start, () => {
  box("m4a", 60, 790, 960, 360, `<div class="mono grey up">what you pay with</div>${row("r4_0", "plan's included limits")}${row("r4_1", "usage credits", "hot")}`, "mock");
  box("m4b", 60, 1190, 960, 170, `<div class="prow hot" id="pk4" style="margin-top:0"><span class="pn">Fable 5.2</span><span class="ptag am">Requires usage credits</span></div>`, "mock");
  html.push(`<div id="t4" style="position:absolute;left:60px;top:1400px;opacity:0">${tag("depends on your plan", "grey")}</div><div class="ill" style="left:60px;top:1480px">illustrative picker</div>`);
  wipeIn("#m4a", q.s4_a); showAt("#r4_0", q.s4_r0); popAt("#t4", q.s4_tag); showAt("#r4_1", q.s4_r1); wipeIn("#m4b", q.s4_b);
  js.push(`tl.to("#r4_0 .pn",{color:"${P.grey}",textDecoration:"line-through",duration:.2},${f3(q.s4_dim)});tl.to("#r4_0",{opacity:.5,duration:.2},${f3(q.s4_dim)});`);
});
// ================= s5: /model, check it, saved is not running
scene("s5", sc("s5").start, sc("s6").start, () => {
  box("m5a", 60, 790, 960, 170, `<div class="term"><span class="g">&gt;</span> ${typed("m5", "/model", q.s5_type, 0.06)}</div>`, "mock dark");
  box("m5b", 60, 1000, 960, 490, `<div class="mono grey up">which Fable · which effort</div>${row("q0", "Sonnet 5.5")}${row("q1", "Opus 5.5")}${row("q2", "Fable 5.2", "", `<span class="ptag dim" id="qe">effort: medium</span>`)}`, "mock");
  html.push(`<div id="stp" data-layout-allow-overlap data-layout-allow-occlusion><div>SAVED</div><div>≠ RUNNING</div><svg id="ticks" width="760" height="300" viewBox="0 0 760 300">${Array.from({ length: 10 }, (_, i) => { const a = (i / 10) * Math.PI * 2, cx = 380, cy = 150; return `<line x1="${cx + Math.cos(a) * 330}" y1="${cy + Math.sin(a) * 150}" x2="${cx + Math.cos(a) * 372}" y2="${cy + Math.sin(a) * 180}" stroke="${P.red}" stroke-width="7" stroke-linecap="round"/>`; }).join("")}</svg></div>`);
  wipeIn("#m5a", sc("s5").start + 0.05); wipeIn("#m5b", q.s5_card); [0, 1, 2].forEach((i) => showAt("#q" + i, q["s5_r" + i]));
  js.push(`tl.to("#q2",{borderColor:"${P.acc}",backgroundColor:"rgba(255,122,26,.14)",duration:.15},${f3(q.s5_hl)});tl.to("#qe",{backgroundColor:"${P.acc}",color:"#000",duration:.15},${f3(q.s5_eff)});`);
  js.push(`tl.fromTo("#stp",{opacity:.15,scale:2.4,rotation:-10,x:0},{opacity:1,scale:1,rotation:-6,x:0,duration:.2,ease:"power4.in",immediateRender:false},${f3(q.s5_stamp)});tl.fromTo("#ticks",{opacity:0,scale:.94},{opacity:1,scale:1,duration:.12,ease:"power2.out",immediateRender:false},${f3(q.s5_stamp + 0.2)});tl.to("#ticks",{opacity:0,duration:.25},${f3(q.s5_stamp + 0.45)});`);
});
// ================= s6: save, follow
scene("s6", sc("s6").start, null, () => {
  html.push(`<div id="sv"><div class="s1">SAVE</div><div class="s2">THIS</div></div>`);
  js.push(`tl.fromTo("#sv",{opacity:0,scale:.85,rotation:-6},{opacity:1,scale:1,rotation:-3,duration:.22,ease:"power4.out"},${f3(q.s6_save)});tl.set("#sv",{opacity:0},${f3(q.s6_end)});`);
  html.push(`<div id="fol"><div class="bolt"><svg width="84" height="84" viewBox="0 0 24 24"><path d="M13.5 2 L5 13.5 H11 L10 22 L19 10 H13 Z" fill="#fff"/></svg></div><div class="hdl" id="fh">${e(S.handle)}</div><div class="mono grey" id="fs" style="letter-spacing:.24em">CLAUDE CODE WORKFLOWS</div><div class="btn" id="fb">FOLLOW FOR MORE</div></div>`);
  js.push(`tl.set("#fol",{opacity:1},${f3(q.s6_end)});`);
  [["#fol .bolt", 0.1], ["#fh", 0.25], ["#fs", 0.35], ["#fb", 0.5]].forEach(([s, d]) => ent(s, q.s6_end + d));
  js.push(`tl.to("#fb",{scale:.94,duration:.07,yoyo:true,repeat:1},${f3(q.s6_click)});tl.to("#fb",{scale:1.05,duration:.6,ease:"sine.inOut",yoyo:true,repeat:${Math.max(1, Math.floor((DUR - q.s6_click - 0.3) / 0.6))}},${f3(q.s6_click + 0.25)});`);
});

// ================= captions: bottom pill, spoken word gets the orange box; "five point one" shows as 5.1, "slash model" as /model
const ACC = new Set(S.accentWords), nz = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
const out = []; { let skip = 0; T.words.forEach((w, i) => { if (skip) { skip--; return; }
  const n1 = T.words[i + 1], n2 = T.words[i + 2];
  if (nz(w.text) === "five" && n1 && nz(n1.text) === "point" && n2 && ["one", "two"].includes(nz(n2.text))) { out.push({ text: "5." + (nz(n2.text) === "one" ? "1" : "2") + (n2.text.match(/[.,:?!]$/)?.[0] || ""), start: w.start, end: n2.end, section: w.section }); skip = 2; }
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
js.push(`tl.set("#sc_s1",{opacity:1},0);tl.to("#bg",{backgroundPosition:"360px 864px",duration:${DUR},ease:"none"},0);tl.to("#o1",{x:160,y:-120,duration:${DUR / 2},ease:"sine.inOut",yoyo:true,repeat:1},0);tl.to("#o2",{x:-180,y:140,duration:${DUR / 2},ease:"sine.inOut",yoyo:true,repeat:1},0);`);

const css = `
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
.tag{display:inline-flex;align-items:center;padding:10px 24px;border-radius:999px;font:800 30px Inter;white-space:nowrap;letter-spacing:.02em}.tag.red{background:${P.red};color:#000}.tag.grey{background:#2B241C;color:${P.grey}}.tag.green{background:${P.green};color:#000}.tag.acc{background:${P.acc};color:#000;box-shadow:0 0 36px rgba(255,122,26,.28)}
#stp{position:absolute;left:120px;top:900px;width:760px;text-align:center;font:900 92px/1.02 Inter;color:${P.acc};border:9px solid ${P.acc};border-radius:20px;padding:26px 20px;letter-spacing:-.01em;opacity:0;transform-origin:50% 50%;box-shadow:0 0 60px rgba(255,122,26,.25);background:rgba(12,10,8,.88)}#stp div{position:relative;z-index:2}#ticks{position:absolute;left:-10px;top:-40px;z-index:1;opacity:0;overflow:visible}
.ttl{position:absolute;left:50px;top:830px;font:900 230px/1 Inter;letter-spacing:-.05em;color:#fff;transform:rotate(-4deg);opacity:0;white-space:nowrap;text-shadow:0 0 50px rgba(255,122,26,.25)}
.card{position:absolute;background:${P.card};border:1px solid ${P.line};border-radius:28px;padding:30px 36px;box-shadow:0 20px 60px rgba(0,0,0,.45)}.card.mock{opacity:0}.card.dark{background:#0F0C09;border-color:#2A2118}
.mono{font-family:"JetBrains Mono",monospace;font-size:30px}.mono.grey,.grey{color:${P.grey}}.up{text-transform:uppercase;letter-spacing:.1em;font-size:24px}
.big{font:900 84px/1.1 Inter;letter-spacing:-.03em;margin-top:14px}
.prow{display:flex;justify-content:space-between;align-items:center;position:relative;margin-top:14px;padding:22px 26px;border-radius:18px;background:#1F1913;border:2px solid ${P.line};font:700 40px Inter;opacity:0}.prow.hot{border-color:${P.acc};background:rgba(255,122,26,.12)}.pn{position:relative;display:inline-block;min-width:260px}
.ptag{font:800 26px Inter;padding:8px 18px;border-radius:999px;background:${P.acc};color:#000;white-space:nowrap}.ptag.red{background:${P.red}}.ptag.am{background:${P.amber}}.ptag.dim{background:#2B241C;color:${P.grey}}
.term{font:500 34px/1.45 "JetBrains Mono",monospace}.term .g{color:${P.acc}}.ch{opacity:0}.wd{display:inline-block;white-space:nowrap}.cur{opacity:0;color:#fff}
.flow{display:flex;align-items:center;gap:16px}.chip{display:inline-flex;padding:14px 22px;border-radius:16px;background:#1F1913;border:2px solid ${P.line};font:700 28px "JetBrains Mono";white-space:nowrap;opacity:0;color:#fff}.chip.ac{background:${P.acc};color:#000;border-color:${P.acc}}.chip.am{background:rgba(255,176,32,.14);border-color:${P.amber};color:${P.amber}}.arr{font:800 36px Inter;color:${P.acc};opacity:0}
.ill{position:absolute;font:500 26px "JetBrains Mono",monospace;color:${P.grey};opacity:.85}
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
