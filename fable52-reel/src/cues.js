// ONE list of beats for the Fable 5.2 "saved model" reel. Visuals read t.<name>; sounds come from the same entries.
// Rule: effects 1-3 frames BEFORE the picture's landing frame.
export function buildCues(T) {
  const W = T.W, sc = (id) => T.scene(id).start, se = (id) => T.scene(id).end, t = {}, ev = [];
  const put = (n, when, s) => { const [type, gain = 1, rate = 1, dt = 0] = Array.isArray(s) ? s : [s]; const at = Math.max(0.02, when + dt); if (at <= T.duration) ev.push({ t: +at.toFixed(3), type, gain, rate, cue: n }); };
  const cue = (n, when, ...ss) => { t[n] = when; ss.forEach((s) => put(n, when, s)); return when; };
  const snd = (n, when, ...ss) => ss.forEach((s) => put(n, when, s));
  const keys = (n, t0, len, step) => { for (let i = 0; i < len; i += 3) snd(n, t0 + i * step, ["tap", 0.55 + 0.3 * Math.abs(Math.sin(i * 2.3))]); };
  // ---- HOOK (0-4.2 s): frame-0 hit, picker rows build 0.12 s apart, SAVED tag, then the row swaps 5.1 -> 5.2 on "swap"
  snd("s1_riser", 0.05, ["riser_t", 0.9, 1.38]);              // tonal riser, ends just before the swap lands
  cue("s1_open", 0, ["impact", 1.0], ["drop", 0.9]);
  [0, 1, 2].forEach((k) => cue("s1_r" + k, 0.02 + k * 0.12, ["tick", 0.8, 1 + 0.15 * k]));
  cue("s1_tag", 0.5, ["bloop", 0.9]);
  snd("s1_hb", 1.5, ["heartbeat", 0.8]);
  const sw = cue("s1_swap", W("s1", "swap") - 0.1, ["zap", 0.8], ["error2", 0.6, 1, 0.1]);
  cue("s1_swapped", sw + 0.2, ["pop", 0.7, 1.1]);
  cue("hook", sw + 0.5);
  // ---- s2: the assumption
  cue("s2_title", sc("s2"), ["marimba", 0.85, 1]); cue("s2_card", sc("s2") + 0.35, ["pluck", 0.8, 1]);
  cue("s2_pin", W("s2", "saved") - 0.05, ["click", 0.9]); cue("s2_tag", W("s2", "assume") - 0.05, ["wobble", 0.8]);
  // ---- s3: the catch (alias chain)
  cue("s3_title", sc("s3"), ["marimba", 0.85, 1.26]);
  cue("s3_a", W("s3", "On") - 0.05, ["glass", 0.7]); cue("s3_pro", W("s3", "Pro") - 0.05, ["pop", 0.7]); cue("s3_max", W("s3", "Max") - 0.05, ["pop", 0.7, 1.12]);
  cue("s3_c0", W("s3", "saved") - 0.05, ["tick", 0.7]); cue("s3_c1", W("s3", "moves") - 0.05, ["chirp", 0.7]); cue("s3_c2", W("s3", "alias", 0) - 0.1, ["pop", 0.8, 1.1]);
  cue("s3_ver", W("s3", "run") - 0.05, ["coin", 0.7]);
  cue("s3_b", W("s3", "That") - 0.05, ["pluck", 0.8, 1.26]); cue("s3_b0", W("s3", "alias", 1) - 0.1, ["tick", 0.6]); cue("s3_b1", W("s3", "two") - 0.3, ["success3", 0.8], ["sparkle", 0.4, 1, 0.1]);
  cue("s3_c", W("s3", "sessions") - 0.05, ["pluck", 0.8, 1.498]); cue("s3_eff", W("s3", "effort") - 0.1, ["tick", 0.7, 1.1]); cue("s3_med", W("s3", "medium") - 0.05, ["pop", 0.8, 1.2]); cue("s3_unl", W("s3", "level") - 0.1, ["wobble", 0.7]);
  // ---- s4: what you pay with
  cue("s4_a", sc("s4") + 0.1, ["pluck", 0.8, 1]); cue("s4_r0", sc("s4") + 0.4, ["pop", 0.6]);
  cue("s4_tag", W("s4", "plan") - 0.05, ["wobble", 0.8]);
  cue("s4_r1", W("s4", "usage") - 0.15, ["coin", 0.7], ["pop", 0.7, 1.15, 0.05]);
  cue("s4_b", W("s4", "credits") - 0.1, ["glass", 0.7]); cue("s4_dim", W("s4", "instead") - 0.05, ["buzz", 0.4]);
  // ---- s5: type /model, check it, saved is not running
  cue("s5_type", W("s5", "slash") - 0.05); keys("s5_keys", W("s5", "slash") - 0.05, 16, 0.06);
  cue("s5_card", W("s5", "model") + 0.1, ["pluck", 0.8, 1]); [0, 1, 2].forEach((i) => cue("s5_r" + i, W("s5", "model") + 0.25 + i * 0.15, ["tick", 0.6, 1 + 0.1 * i]));
  cue("s5_hl", W("s5", "Fable") - 0.05, ["pop", 0.7, 1.1]); cue("s5_eff", W("s5", "effort") - 0.05, ["pop", 0.7, 1.2]);
  const st = cue("s5_stamp", W("s5", "running") - 0.3, ["stamp", 1.0, 1, 0.13], ["impact", 0.6, 1, 0.13], ["error2", 0.7, 1, 0.16]);
  // ---- s6: save, follow
  cue("s6_save", W("s6", "Save") - 0.05, ["stamp", 0.9, 1, -0.07], ["impact", 0.6, 1, -0.07], ["boing", 0.7, 1, -0.05]);
  const end = cue("s6_end", W("s6", "Follow") - 0.05, ["whoosh", 0.6], ["impact", 0.9, 1, 0.0]);
  [0.15, 0.3, 0.4, 0.55].forEach((d, i) => snd("s6_pop" + i, end + d, ["pop", 0.5, 1 + d]));
  cue("s6_click", end + 1.05, ["click", 1], ["sparkle", 0.7, 1, 0.02]);
  ev.sort((a, b) => a.t - b.t);
  return { t, events: ev, end, TRANS: { pre: 0, dur: 0 } };
}
