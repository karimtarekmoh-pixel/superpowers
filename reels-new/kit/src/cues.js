// Generic cue list driven by src/spec.json: every element's time is a spoken word (W). Sounds come from the same entries.
// No sound before the first spoken-word beat. Effects 1-3 frames before the picture lands.
import fs from "node:fs";
export function buildCues(T) {
  const SP = JSON.parse(fs.readFileSync("src/spec.json")), W = T.W, t = {}, ev = [];
  const put = (n, when, s) => { const [type, gain = 1, rate = 1, dt = 0] = Array.isArray(s) ? s : [s]; const at = Math.max(0.02, when + dt); if (at <= T.duration) ev.push({ t: +at.toFixed(3), type, gain, rate, cue: n }); };
  const cue = (n, when, ...ss) => { t[n] = when; ss.forEach((s) => put(n, when, s)); return when; };
  const snd = (n, when, ...ss) => ss.forEach((s) => put(n, when, s));
  const keys = (n, t0, len, step) => { for (let i = 0; i < len; i += 3) snd(n, t0 + i * step, ["tap", 0.55 + 0.3 * Math.abs(Math.sin(i * 2.3))]); };
  let end = 0;
  SP.sections.forEach((s) => {
    const id = s.id, sc = T.scene(id).start, S = s.scene, A = (ref) => { const [w, o] = ref.split("#"); return W(id, w, o ? +o : 0); };
    if (S.type === "hero") {
      cue(id + "_head", sc === T.scene(SP.sections[0].id).start ? 0 : sc); cue(id + "_mark", sc + 0.15);
      cue(id + "_node", A(S.node.at) - 0.1, ["zap", 0.7], ["pop", 0.6, 1.1, 0.1]);
    } else if (S.type === "stack") {
      S.items.forEach((it, i) => {
        const kids = it.chips || it.rows || it.items || it.lines || [], firsts = kids.filter((k) => k.at).map((k) => A(k.at));
        const base = it.at ? A(it.at) - 0.05 : firsts.length ? Math.min(...firsts) - 0.3 : sc + 0.1 + i * 0.2;
        cue(`${id}_c${i}`, Math.max(sc + 0.05, base), ["pluck", 0.8, [1, 1.26, 1.498, 2][i % 4]]);
        if (it.k === "term") { cue(`${id}_c${i}_t`, base + 0.1); keys(`${id}_c${i}_k`, base + 0.1, it.text.length, 0.06); }
        kids.forEach((k, j) => { if (k.at) cue(`${id}_c${i}_${j}`, A(k.at) - 0.05, it.k === "warn" ? [["glass", 0.7], ["buzz", 0.35, 1, 0.05]][j % 2 ? 1 : 0] : ["tick", 0.65, 1 + 0.1 * j]); });
        if (it.tag) cue(`${id}_c${i}_tag`, A(it.tag.at) - 0.05, ["wobble", 0.8]);
      });
    }
    if (s.stamp) cue(id + "_stamp", A(s.stamp.at) - 0.3, ["stamp", 1.0, 1, 0.13], ["impact", 0.6, 1, 0.13], ["error2", 0.7, 1, 0.16]);
    if (S.type === "cta") {
      cue(id + "_save", W(id, "Save") - 0.05, ["stamp", 0.9, 1, -0.07], ["impact", 0.6, 1, -0.07], ["boing", 0.7, 1, -0.05]);
      end = cue(id + "_end", W(id, "Follow") - 0.05, ["whoosh", 0.6], ["impact", 0.9, 1, 0.0]);
      [0.15, 0.3, 0.4, 0.55].forEach((d, i) => snd(id + "_pop" + i, end + d, ["pop", 0.5, 1 + d]));
      cue(id + "_click", end + 1.05, ["click", 1], ["sparkle", 0.7, 1, 0.02]);
    }
  });
  ev.sort((a, b) => a.t - b.t);
  return { t, events: ev, end, TRANS: { pre: 0, dur: 0 } };
}
