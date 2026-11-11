// Reel kit builder: src/spec.json + audio/timestamps.json -> hf/index.html (Hyperframes). Safe-zone layout: everything inside x 60-880, y 300-1420.
import fs from "node:fs";
import { buildTimeline } from "../src/timeline.js";
import { buildCues } from "../src/cues.js";
const SP = JSON.parse(fs.readFileSync("src/spec.json")), S = JSON.parse(fs.readFileSync("src/script.json")), TS = JSON.parse(fs.readFileSync("audio/timestamps.json"));
const T = buildTimeline(S, TS), Q = buildCues(T), q = Q.t, W = T.W;
const DUR = Math.ceil(T.duration * 30) / 30;
const P = { bg: "#0C0A08", acc: "#FF7A1A", red: "#FF4D5E", green: "#62E884", grey: "#A39A90", pale: "#241D16", card: "#17130F", line: "#3A2E22", amber: "#FFB020" };
const html = [], js = [];
const e = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
const f3 = (x) => (+x).toFixed(3);
const wipeIn = (sel, t, d = 0.28) => js.push(`tl.fromTo("${sel}",{opacity:0,y:14},{opacity:1,y:0,duration:${d},ease:"power2.out"},${f3(Math.max(0, t))});`);
const popAt = (sel, t) => js.push(`tl.fromTo("${sel}",{opacity:0,scale:.94},{opacity:1,scale:1,duration:.22,ease:"power2.out"},${f3(Math.max(0, t))});`);
const typed = (id, text, t0, step) => { let i = 0; const out = text.split(" ").map((wd) => `<span class="wd">${[...wd].map((c) => { const k = i++; js.push(`tl.set("#${id}_${k}",{opacity:1},${f3(t0 + k * step)});`); return `<span class="ch" id="${id}_${k}">${e(c)}</span>`; }).join("")}</span>`).map((x, n, a) => { i++; return n < a.length - 1 ? x + " " : x; }).join(""); js.push(`tl.set("#${id}_cur",{opacity:1},${f3(t0)});tl.set("#${id}_cur",{opacity:0},${f3(t0 + text.length * step + 0.25)});`); return out + `<span class="cur" id="${id}_cur">|</span>`; };
const ICON = {
  rewind: `<svg viewBox="0 0 24 24" width="100%" height="100%"><path d="M11 6 L3 12 L11 18 Z M21 6 L13 12 L21 18 Z" fill="${P.acc}"/></svg>`,
  branch: `<svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="${P.acc}" stroke-width="1.8" stroke-linecap="round"><circle cx="6" cy="5" r="2.2"/><circle cx="6" cy="19" r="2.2"/><circle cx="18" cy="9" r="2.2"/><path d="M6 7.2 V16.8 M18 11.2 C18 15 12 14 7.6 17.4"/></svg>`,
  shield: `<svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="${P.acc}" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"><path d="M12 2 L20 5.5 V11.5 C20 16.5 16.5 20.5 12 22 C7.5 20.5 4 16.5 4 11.5 V5.5 Z"/><path d="M8.5 12 L11 14.5 L15.8 9.5"/></svg>`,
  prompt: `<svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="${P.acc}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7 L10 12 L4 17"/><path d="M12 18 H20"/></svg>`,
};
const A = (sid, ref) => { const [w, o] = ref.split("#"); return W(sid, w, o ? +o : 0); };
const scene = (id, a, b, fn) => { html.push(`<div class="scene" id="sc_${id}">`); fn(); html.push(`</div>`); js.push(`tl.set("#sc_${id}",{opacity:1},${f3(a)});${b ? `tl.set("#sc_${id}",{opacity:0},${f3(b)});` : ""}`); };
const fit = (txt, max, cap) => Math.min(cap, Math.floor(max / (Math.max(...String(txt).split("\n").map((x) => x.length)) * 0.62)));

html.push(`<div id="lab">${e(SP.label)}</div>`);
const order = SP.sections.map((s) => s.id);
SP.sections.forEach((s, k) => {
  const id = s.id, sc = T.scene(id), S2 = s.scene, nextStart = k + 1 < order.length ? T.scene(order[k + 1]).start : null;
  scene(id, k === 0 ? 0 : sc.start, nextStart, () => {
    if (S2.type === "hero") {
      html.push(`<div class="hd" style="left:60px;top:350px;width:820px"><div class="hl" style="font-size:${fit(S2.headA, 800, 112)}px">${e(S2.headA)}</div><div class="hl o" style="font-size:${fit(S2.headB, 800, 96)}px">${e(S2.headB)}</div></div>`);
      html.push(`<div class="ring ring1" style="left:220px;top:610px;width:500px;height:500px"></div><div class="ring ring2" style="left:170px;top:560px;width:600px;height:600px"></div><div id="${id}_glow" class="glow" style="left:170px;top:560px;width:600px;height:600px"></div>`);
      html.push(`<div id="${id}_mk" class="mk" style="left:330px;top:720px;width:280px;height:280px">${ICON[S2.icon] || ICON.prompt}</div>`);
      html.push(`<div class="card nodecard ${S2.node.cls || "red"}" id="${id}_nd" style="left:60px;top:1160px;width:820px;height:130px"><span class="q">${e(S2.node.sym ?? "?")}</span><span class="dmt" style="font-size:${fit(S2.node.t, 640, 56)}px">${e(S2.node.t)}</span></div>`);
      js.push(`tl.fromTo("#sc_${id} .hd",{opacity:0,y:14},{opacity:1,y:0,duration:.3,ease:"power2.out"},${f3(q[id + "_head"])});tl.fromTo("#${id}_mk",{opacity:0,scale:.92},{opacity:1,scale:1,duration:.35,ease:"power2.out"},${f3(q[id + "_mark"])});tl.fromTo("#${id}_glow",{opacity:0},{opacity:1,duration:.6},${f3(q[id + "_mark"])});tl.to("#sc_${id} .ring",{opacity:1,duration:.5},${f3(sc.start + 0.2)});${(S2.node.cls || "red") === "red" ? `tl.to("#sc_${id} .hl.o",{color:"${P.red}",duration:.2},${f3(A(id, S2.node.at) - 0.1)});` : ""}`);
      wipeIn(`#${id}_nd`, q[id + "_node"]);
    } else if (S2.type === "stack") {
      const stampOn = !!s.stamp, top = S2.title ? 560 : stampOn ? 720 : 380, hgt = S2.title ? 720 : stampOn ? 540 : 900;
      if (S2.title) { html.push(`<div class="ttl2" id="${id}_ttl" style="font-size:${fit(S2.title, 800, 100)}px">${e(S2.title)}</div>`); js.push(`tl.fromTo("#${id}_ttl",{opacity:0,y:14},{opacity:1,y:0,duration:.3,ease:"power2.out"},${f3(sc.start + 0.08)});`); }
      html.push(`<div class="stk" style="top:${top}px;height:${hgt}px">`);
      S2.items.forEach((it, i) => {
        const cid = `${id}_c${i}`, lab = it.label ? `<div class="mono grey up" style="margin-bottom:14px">${e(it.label)}</div>` : "";
        if (it.k === "term") {
          html.push(`<div class="card mock dark" id="${cid}"><div class="term"><span class="g">&gt;</span> ${typed(cid + "t", it.text, q[cid + "_t"], 0.06)}</div></div>`);
        } else if (it.k === "chips") {
          html.push(`<div class="card mock" id="${cid}">${lab}<div class="flow ${it.dir === "col" ? "col" : "wrap"}">${it.chips.map((c, j) => `${j && it.arrows ? `<span class="arr" id="${cid}_a${j}">${it.dir === "col" ? "↓" : "→"}</span>` : ""}<span class="chip ${c.cls || ""}" id="${cid}_${j}">${e(c.t)}</span>`).join("")}</div></div>`);
        } else if (it.k === "rows") {
          html.push(`<div class="card mock" id="${cid}">${lab}${it.rows.map((r, j) => `<div class="prow ${r.cls || ""}" id="${cid}_${j}"><span class="pn">${e(r.t)}</span>${r.tag ? `<span class="ptag ${r.tagCls || ""}">${e(r.tag)}</span>` : ""}</div>`).join("")}</div>`);
        } else if (it.k === "big") {
          html.push(`<div class="card mock" id="${cid}">${lab}<div class="big" style="font-size:${fit(it.t, 740, 100)}px">${e(it.t)}</div>${it.tag ? `<div class="tg" id="${cid}_tag"><span class="tag ${it.tag.cls || "grey"}">${e(it.tag.t)}</span></div>` : ""}</div>`);
        } else if (it.k === "warn") {
          html.push(`<div class="card mock red" id="${cid}">${lab}<div class="flow wrap">${it.items.map((x, j) => `<span class="tag red" id="${cid}_${j}">${e(x.t)}</span>`).join("")}</div></div>`);
        } else if (it.k === "code") {
          html.push(`<div class="card mock dark" id="${cid}">${lab}${it.lines.map((l, j) => `<div class="code" id="${cid}_${j}">${e(l.t)}</div>`).join("")}</div>`);
        }
        const kids = it.chips || it.rows || it.items || it.lines || [];
        wipeIn("#" + cid, q[cid]);
        kids.forEach((c, j) => { if (!c.at) return; const sel = `#${cid}_${j}`; if (it.k === "chips" && j && it.arrows) popAt(`#${cid}_a${j}`, q[`${cid}_${j}`] - 0.1); if (it.k === "code") { js.push(`tl.fromTo("${sel}",{opacity:0,y:14},{opacity:1,y:0,duration:.25,ease:"power2.out"},${f3(q[`${cid}_${j}`])});`); if (c.hl) js.push(`tl.to("${sel}",{color:"#000",backgroundColor:"${P.acc}",duration:.15},${f3(q[`${cid}_${j}`])});`); } else popAt(sel, q[`${cid}_${j}`]); });
        if (it.k === "code") it.lines.forEach((l, j) => { if (!l.at) js.push(`tl.set("#${cid}_${j}",{opacity:1},0);`); });
        if (it.k === "big" && it.tag) popAt(`#${cid}_tag`, q[`${cid}_tag`] ?? q[cid] + 0.3);
        if (it.k === "rows") js.push(`tl.set("#${cid} .prow",{opacity:0},0);`);
      });
      html.push(`</div>`);
      if (S2.note) html.push(`<div class="ill" style="left:60px;top:1262px">${e(S2.note)}</div>`);
    } else if (S2.type === "cta") {
      html.push(`<div id="${id}_sv" class="sv"><div class="s1">SAVE</div><div class="s2">THIS</div></div>`);
      js.push(`tl.fromTo("#${id}_sv",{opacity:0,scale:.85,rotation:-6},{opacity:1,scale:1,rotation:-3,duration:.22,ease:"power4.out"},${f3(q[id + "_save"])});tl.set("#${id}_sv",{opacity:0},${f3(q[id + "_end"])});`);
      html.push(`<div id="${id}_fol" class="fol"><div class="bolt"><svg width="86" height="86" viewBox="0 0 24 24"><path d="M13.5 2 L5 13.5 H11 L10 22 L19 10 H13 Z" fill="#fff"/></svg></div><div class="hdl" id="${id}_fh">${e(S.handle)}</div><div class="mono grey" id="${id}_fs" style="letter-spacing:.2em">CLAUDE CODE WORKFLOWS</div><div class="btn" id="${id}_fb">FOLLOW FOR MORE</div></div>`);
      js.push(`tl.set("#${id}_fol",{opacity:1},${f3(q[id + "_end"])});`);
      [[".bolt", 0.1], ["#" + id + "_fh", 0.25], ["#" + id + "_fs", 0.35], ["#" + id + "_fb", 0.5]].forEach(([sel, d]) => wipeIn(sel.startsWith("#") ? sel : `#${id}_fol ${sel}`, q[id + "_end"] + d, 0.3));
      js.push(`tl.to("#${id}_fb",{scale:.94,duration:.07,yoyo:true,repeat:1},${f3(q[id + "_click"])});tl.to("#${id}_fb",{scale:1.05,duration:.6,ease:"sine.inOut",yoyo:true,repeat:${Math.max(1, Math.floor((DUR - q[id + "_click"] - 0.3) / 0.6))}},${f3(q[id + "_click"] + 0.25)});`);
    }
    if (s.stamp) {
      html.push(`<div id="${id}_stp" class="stp" data-layout-allow-overlap data-layout-allow-occlusion>${s.stamp.text.map((x) => `<div>${e(x)}</div>`).join("")}<svg class="tk" id="${id}_tk" width="740" height="300" viewBox="0 0 740 300">${Array.from({ length: 10 }, (_, i) => { const a = (i / 10) * Math.PI * 2, cx = 370, cy = 150; return `<line x1="${cx + Math.cos(a) * 320}" y1="${cy + Math.sin(a) * 140}" x2="${cx + Math.cos(a) * 358}" y2="${cy + Math.sin(a) * 170}" stroke="${P.red}" stroke-width="7" stroke-linecap="round"/>`; }).join("")}</svg></div>`);
      js.push(`tl.fromTo("#${id}_stp",{opacity:.15,scale:2.2,rotation:-10},{opacity:1,scale:1,rotation:-6,duration:.2,ease:"power4.in",immediateRender:false},${f3(q[id + "_stamp"])});tl.fromTo("#${id}_tk",{opacity:0,scale:.94},{opacity:1,scale:1,duration:.12,ease:"power2.out",immediateRender:false},${f3(q[id + "_stamp"] + 0.2)});tl.to("#${id}_tk",{opacity:0,duration:.25},${f3(q[id + "_stamp"] + 0.45)});`);
    }
  });
});

// captions: bottom pill inside the safe zone; "slash X" -> /X, spoken numbers kept as words
const ACC = new Set(SP.accentWords || []), nz = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
const out = []; { let skip = 0; T.words.forEach((w, i) => { if (skip) { skip--; return; } const n1 = T.words[i + 1];
  if (nz(w.text) === "slash" && n1) { out.push({ text: "/" + n1.text, start: w.start, end: n1.end, section: w.section }); skip = 1; } else out.push({ ...w }); }); }
const phrases = []; { let cur = []; out.forEach((w, i) => { cur.push(w); const last = i === out.length - 1, nextSec = !last && out[i + 1].section !== w.section; if (/[.,:?!]$/.test(w.text) || cur.length >= 5 || nextSec || last) { phrases.push(cur); cur = []; } }); }
const groups = []; phrases.forEach((ph) => { for (let k = 0; k < ph.length; k += 3) groups.push(ph.slice(k, k + 3)); });
groups.forEach((g, i) => {
  html.push(`<div class="cap" id="cp${i}"><div class="pl">${g.map((w, j) => `<span id="cp${i}w${j}" class="${ACC.has(nz(w.text)) ? "acc" : ""}">${e(w.text.replace(/[.,:?!]$/, "").toUpperCase())}</span>`).join("")}</div></div>`);
  const st = g[0].start - 0.06, en = i + 1 < groups.length ? groups[i + 1][0].start - 0.06 : DUR;
  js.push(`tl.set("#cp${i}",{opacity:1},${f3(Math.max(0, st))});tl.fromTo("#cp${i} .pl",{scale:.9},{scale:1,duration:.13,ease:"power2.out",immediateRender:false},${f3(Math.max(0, st))});tl.set("#cp${i}",{opacity:0},${f3(en)});`);
  g.forEach((w, j) => { const a = Math.max(st, w.start - 0.03), b = Math.max(a + 0.1, w.end - 0.02), acc = ACC.has(nz(w.text));
    js.push(`tl.set("#cp${i}w${j}",{opacity:.5,color:"#ffffff",backgroundColor:"rgba(255,122,26,0)",scale:1},0);tl.to("#cp${i}w${j}",{opacity:1,color:"#000000",backgroundColor:"${P.acc}",scale:1.08,duration:.08,ease:"power2.out"},${f3(a)});tl.to("#cp${i}w${j}",{backgroundColor:"rgba(255,122,26,0)",color:"${acc ? P.acc : "#ffffff"}",scale:1,duration:.14,ease:"power2.out"},${f3(b)});`); });
});
js.push(`tl.set("#sc_${order[0]}",{opacity:1},0);tl.to("#bg",{backgroundPosition:"360px 864px",duration:${DUR},ease:"none"},0);tl.to("#o1",{x:160,y:-120,duration:${DUR / 2},ease:"sine.inOut",yoyo:true,repeat:1},0);tl.to("#o2",{x:-180,y:140,duration:${DUR / 2},ease:"sine.inOut",yoyo:true,repeat:1},0);tl.to(".ring1",{rotation:360,duration:40,ease:"none"},0);tl.to(".ring2",{rotation:-360,duration:60,ease:"none"},0);`);

const css = `
@font-face{font-family:Inter;src:url(./fonts/Inter-400.woff2);font-weight:100 900}
@font-face{font-family:"JetBrains Mono";src:url(./fonts/JetBrainsMono-400.woff2);font-weight:100 800}
*{margin:0;padding:0;box-sizing:border-box}html,body{width:1080px;height:1920px;overflow:hidden;background:${P.bg};font-family:Inter,Arial,sans-serif;color:#fff}
#root{position:relative;width:1080px;height:1920px;overflow:hidden;background:${P.bg}}
#bg{position:absolute;inset:-80px;background-image:radial-gradient(circle,${P.line} 2.4px,transparent 3px);background-size:72px 72px}
.orb{position:absolute;border-radius:50%}#o1{left:-200px;top:300px;width:840px;height:840px;background:radial-gradient(circle,rgba(255,122,26,.17),transparent 65%)}#o2{left:380px;top:860px;width:920px;height:920px;background:radial-gradient(circle,rgba(255,176,32,.10),transparent 65%)}
#vig{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 50%,transparent 55%,rgba(0,0,0,.45));pointer-events:none;z-index:5}
#lab{position:absolute;left:60px;top:312px;font:600 28px "JetBrains Mono",monospace;letter-spacing:.14em;color:${P.grey};z-index:20;white-space:nowrap}
.cap{position:absolute;left:60px;width:820px;top:1306px;display:flex;justify-content:center;opacity:0;z-index:40}.cap .pl{max-width:820px;background:#000;border-radius:14px;padding:10px 20px;display:flex;gap:4px;white-space:nowrap;font:900 52px/1.12 Inter;letter-spacing:-.01em;color:#fff;box-shadow:0 10px 30px rgba(0,0,0,.4)}.cap .pl span{display:inline-block;padding:0 10px;border-radius:12px}
.scene{position:absolute;inset:0;opacity:0}
.stk{position:absolute;left:60px;top:380px;width:820px;height:900px;display:flex;flex-direction:column;justify-content:center;gap:26px}
.card{background:${P.card};border:1px solid ${P.line};border-radius:28px;padding:34px 38px;box-shadow:0 20px 60px rgba(0,0,0,.45)}.card.mock{opacity:0}.card.dark{background:#0F0C09;border-color:#2A2118}.card.red{border-color:${P.red};background:rgba(255,77,94,.08)}
.nodecard{position:absolute;display:flex;align-items:center;justify-content:center;opacity:0}
.mono{font-family:"JetBrains Mono",monospace;font-size:34px}.grey{color:${P.grey}}.up{text-transform:uppercase;letter-spacing:.1em;font-size:28px!important}
.big{font:900 100px/1.1 Inter;letter-spacing:-.03em}.tg{margin-top:20px;opacity:0}
.tag{display:inline-flex;align-items:center;padding:12px 28px;border-radius:999px;font:800 36px Inter;white-space:nowrap}.tag.red{background:${P.red};color:#000}.tag.grey{background:#2B241C;color:${P.grey}}.tag.acc{background:${P.acc};color:#000}.tag.green{background:${P.green};color:#000}
.prow{display:flex;justify-content:space-between;align-items:center;margin-top:14px;padding:28px 28px;border-radius:20px;background:#1F1913;border:2px solid ${P.line};font:700 46px Inter;gap:16px}.prow.hot{border-color:${P.acc};background:rgba(255,122,26,.12)}.prow.dim{opacity:.7}.pn{display:inline-block}
.ptag{font:800 28px Inter;padding:10px 18px;border-radius:999px;background:${P.acc};color:#000;white-space:nowrap}.ptag.red{background:${P.red}}.ptag.grey{background:#2B241C;color:${P.grey}}
.term{font:500 44px/1.45 "JetBrains Mono",monospace;word-break:break-all}.term .g{color:${P.acc}}.ch{opacity:0}.wd{display:inline-block;white-space:nowrap}.cur{opacity:0;color:#fff}
.flow{display:flex;align-items:center;gap:14px}.flow.col{flex-direction:column;align-items:flex-start;gap:8px}.flow.wrap{flex-wrap:wrap;row-gap:14px}.chip{display:inline-flex;padding:18px 26px;border-radius:18px;background:#1F1913;border:2px solid ${P.line};font:700 36px "JetBrains Mono";white-space:nowrap;opacity:0;color:#fff}.chip.ac{background:${P.acc};color:#000;border-color:${P.acc}}.chip.am{background:rgba(255,176,32,.14);border-color:${P.amber};color:${P.amber}}.chip.rd{background:rgba(255,77,94,.14);border-color:${P.red};color:${P.red}}.arr{font:800 36px Inter;color:${P.acc};opacity:0}
.code{font:500 38px/1.55 "JetBrains Mono",monospace;white-space:pre;opacity:0;color:#E8E6DF;border-radius:8px;padding:0 10px}
.ill{position:absolute;font:500 26px "JetBrains Mono",monospace;color:${P.grey};opacity:.85}
.ttl2{position:absolute;left:60px;top:392px;width:820px;font:900 100px/1 Inter;letter-spacing:-.035em;color:#fff;white-space:nowrap;opacity:0;text-shadow:0 0 40px rgba(255,122,26,.25)}.hd{position:absolute}.hl{font:900 112px/1.0 Inter;letter-spacing:-.04em;color:#fff;white-space:nowrap}.hl.o{color:${P.acc}}
.ring{position:absolute;border-radius:50%;border:3px solid rgba(255,122,26,.45);opacity:0}.ring2{border:3px dashed rgba(255,176,32,.35)}.glow{position:absolute;border-radius:50%;background:radial-gradient(circle,rgba(255,122,26,.35),transparent 68%);opacity:0}
.mk{position:absolute;opacity:0;filter:drop-shadow(0 0 40px rgba(255,122,26,.55))}
.q{font:900 80px Inter;color:${P.red};margin-right:16px}.dmt{font:900 56px Inter;color:${P.red}}.nodecard.acc{border-color:${P.acc};background:rgba(255,122,26,.10)}.nodecard.acc .q,.nodecard.acc .dmt{color:${P.acc}}.nodecard.red{border-color:${P.red};background:rgba(255,77,94,.08)}
.stp{position:absolute;left:100px;top:400px;width:740px;text-align:center;font:900 84px/1.02 Inter;color:${P.acc};border:9px solid ${P.acc};border-radius:20px;padding:26px 20px;opacity:0;box-shadow:0 0 60px rgba(255,122,26,.25);background:rgba(12,10,8,.9)}.stp div{position:relative;z-index:2}.tk{position:absolute;left:-9px;top:-30px;z-index:1;opacity:0;overflow:visible}
.sv{position:absolute;left:60px;top:470px;width:820px;height:440px;border-radius:36px;background:${P.acc};color:#000;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;box-shadow:0 0 80px rgba(255,122,26,.3)}.sv .s1{font:900 200px/.95 Inter;letter-spacing:-.03em}.sv .s2{font:900 96px/1 Inter;margin-top:14px}
.fol{position:absolute;left:60px;top:430px;width:820px;display:flex;flex-direction:column;align-items:center;opacity:0}.bolt{width:150px;height:150px;border-radius:39px;background:#000;border:2px solid ${P.line};display:flex;align-items:center;justify-content:center;opacity:0;box-shadow:0 0 50px rgba(255,122,26,.3)}.hdl{margin-top:36px;font:800 70px Inter;opacity:0}.fol .mono{margin-top:14px;opacity:0}.btn{margin-top:50px;background:${P.acc};color:#000;border-radius:999px;padding:28px 60px;font:900 48px Inter;opacity:0;box-shadow:0 0 40px rgba(255,122,26,.25)}
`;
const page = `<!doctype html>
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
fs.writeFileSync("hf/index.html", page);
console.log(`hf/index.html ${(page.length / 1024).toFixed(0)} KB, ${DUR.toFixed(2)}s, ${groups.length} caption groups, ${Q.events.length} sound events`);
