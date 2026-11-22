// ONE list of beats for the Fable 5.2 "fallback" reel (v2: routing-diagram format). Visuals read t.<name>; sounds come from the same entries.
// No sound at all before the first spoken word's beat; effects 1-3 frames BEFORE the picture's landing frame.
export function buildCues(T) {
  const W = T.W, sc = (id) => T.scene(id).start, t = {}, ev = [];
  const put = (n, when, s) => { const [type, gain = 1, rate = 1, dt = 0] = Array.isArray(s) ? s : [s]; const at = Math.max(0.02, when + dt); if (at <= T.duration) ev.push({ t: +at.toFixed(3), type, gain, rate, cue: n }); };
  const cue = (n, when, ...ss) => { t[n] = when; ss.forEach((s) => put(n, when, s)); return when; };
  const snd = (n, when, ...ss) => ss.forEach((s) => put(n, when, s));
  const keys = (n, t0, len, step) => { for (let i = 0; i < len; i += 3) snd(n, t0 + i * step, ["tap", 0.55 + 0.3 * Math.abs(Math.sin(i * 2.3))]); };
  // ---- s1 hook: picture is on from frame 0 (silent); sounds only on the words
  cue("s1_head", 0); cue("s1_mark", 0.15);
  cue("s1_wrong", W("s1", "wrong") - 0.05, ["error2", 0.6]);
  cue("s1_pill", W("s1", "most") - 0.05);
  cue("s1_hand", W("s1", "handed") - 0.1, ["chirp", 0.7]);
  cue("s1_diff", W("s1", "different") - 0.1, ["zap", 0.7], ["pop", 0.6, 1.1, 0.1]);
  // ---- s2: safety classifiers watch two things
  cue("s2_f", sc("s2") + 0.05, ["marimba", 0.85, 1]);
  cue("s2_gate", W("s2", "safety") - 0.1, ["pluck", 0.8, 1.26]);
  cue("s2_cy", W("s2", "cybersecurity") - 0.1, ["pop", 0.7]); cue("s2_bio", W("s2", "biology") - 0.1, ["pop", 0.7, 1.15]);
  // ---- s3: flagged -> re-run on another model
  cue("s3_R", sc("s3") + 0.05, ["tick", 0.7]);
  cue("s3_G", W("s3", "flags") - 0.25, ["glass", 0.7]); cue("s3_flag", W("s3", "flags") + 0.05, ["buzz", 0.4]); cue("s3_F", W("s3", "flags") + 0.45, ["pop", 0.7]);
  cue("s3_lines", W("s3", "reruns") - 0.1, ["chirp", 0.7]); cue("s3_oth", W("s3", "another") - 0.1, ["pop", 0.7, 1.1]);
  cue("s3_bio", W("s3", "Biology") - 0.05, ["coin", 0.7], ["pop", 0.7, 1.2, 0.05]);
  cue("s3_cy", W("s3", "Cybersecurity") - 0.05, ["coin", 0.7, 1.1], ["pop", 0.7, 1.1, 0.05]);
  // ---- s4: it can trigger on the first message
  cue("s4_a", sc("s4") + 0.1, ["pluck", 0.8, 1]); cue("s4_tag", W("s4", "first") - 0.05, ["click", 0.9]);
  cue("s4_c0", W("s4", "request") - 0.05, ["tick", 0.6]); cue("s4_c1", W("s4", "CLAUDE") - 0.05, ["tick", 0.6, 1.1]); cue("s4_c2", W("s4", "git") - 0.05, ["tick", 0.6, 1.2]);
  cue("s4_b", W("s4", "security") - 0.15, ["glass", 0.7]); cue("s4_trip", W("s4", "trip") - 0.05, ["wobble", 0.8], ["buzz", 0.35]);
  cue("s4_c", W("s4", "After") - 0.05, ["pluck", 0.8, 1.498]); cue("s4_stay", W("s4", "stays") - 0.05, ["coin", 0.7]);
  // ---- s5: notice in the transcript, /model to switch back
  cue("s5_a", sc("s5") + 0.1, ["pluck", 0.8, 1]); cue("s5_notice", W("s5", "notice") - 0.05, ["bell", 0.7]);
  cue("s5_type", W("s5", "slash") - 0.05); keys("s5_keys", W("s5", "slash") - 0.05, 16, 0.06);
  cue("s5_card", W("s5", "model") + 0.1, ["pluck", 0.8, 1]); [0, 1, 2].forEach((i) => cue("s5_r" + i, W("s5", "model") + 0.25 + i * 0.15, ["tick", 0.6, 1 + 0.1 * i]));
  cue("s5_hl", W("s5", "switch") - 0.05, ["success3", 0.7], ["sparkle", 0.4, 1, 0.1]);
  cue("s5_stamp", W("s5", "back") - 0.3, ["stamp", 1.0, 1, 0.13], ["impact", 0.6, 1, 0.13], ["error2", 0.7, 1, 0.16]);
  // ---- s6: save, follow
  cue("s6_save", W("s6", "Save") - 0.05, ["stamp", 0.9, 1, -0.07], ["impact", 0.6, 1, -0.07], ["boing", 0.7, 1, -0.05]);
  const end = cue("s6_end", W("s6", "Follow") - 0.05, ["whoosh", 0.6], ["impact", 0.9, 1, 0.0]);
  [0.15, 0.3, 0.4, 0.55].forEach((d, i) => snd("s6_pop" + i, end + d, ["pop", 0.5, 1 + d]));
  cue("s6_click", end + 1.05, ["click", 1], ["sparkle", 0.7, 1, 0.02]);
  ev.sort((a, b) => a.t - b.t);
  return { t, events: ev, end, TRANS: { pre: 0, dur: 0 } };
}
