// Single source of timing, built from audio/timestamps.json (real word timestamps) + src/script.json.
// Used by the Remotion scenes AND by tools/export_events.mjs (sound effects), so picture and sound share
// the same times. All times are in seconds.
export const FPS = 30;
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9'/]/g, "");

export function buildTimeline(script, ts) {
  const words = ts.words.map((w, i) => ({ ...w, i }));
  const sec = Object.fromEntries(ts.sections.map((s) => [s.id, s]));
  const secWords = (id) => words.filter((w) => w.section === id);
  // start time of the n-th occurrence of a word inside a section
  const W = (id, word, occ = 0) => { const m = secWords(id).filter((w) => norm(w.text) === norm(word)); if (!m.length) throw new Error(`no word ${word} in ${id}`); return (m[occ] || m[m.length - 1]).start; };
  const E = (id, word, occ = 0) => { const m = secWords(id).filter((w) => norm(w.text) === norm(word)); return (m[occ] || m[m.length - 1]).end; };
  const order = script.sections.map((s) => s.id);
  const END_HOLD = 1.1;                                      // end card stays up after the last word (incl. the 0.5 s tail)
  const duration = +(ts.duration + END_HOLD).toFixed(3);
  // hard cuts sit just before each section's first word
  const scenes = order.map((id, k) => ({ id, start: k === 0 ? 0 : sec[id].first - 0.1, end: k + 1 < order.length ? sec[order[k + 1]].first - 0.1 : duration }));
  const scene = (id) => scenes.find((s) => s.id === id);

  // caption chunks: 1-3 words; "slash advisor" is shown as one token "/ADVISOR"
  const accent = new Set(script.accentWords);
  const chunks = [];
  for (const s of script.sections) {
    const ws = secWords(s.id); let k = 0;
    s.chunks.forEach((n) => {
      const raw = ws.slice(k, k + n); k += n;
      const cw = [];
      for (let j = 0; j < raw.length; j++) {
        const w = raw[j];
        if (["claude", "dot", "m", "d"].every((x, k) => raw[j + k] && norm(raw[j + k].text) === x)) { cw.push({ text: "CLAUDE.MD", start: w.start, end: raw[j + 3].end, accent: true }); j += 3; continue; }   // spoken "CLAUDE dot M D" shown as the file name
        if (["two", "point", "one", "point", "three", "one", "one"].every((x, k) => raw[j + k] && norm(raw[j + k].text) === x)) { cw.push({ text: "2.1.311", start: w.start, end: raw[j + 6].end, accent: false }); j += 6; continue; }   // spoken version number shown as digits
        if (norm(w.text) === "slash" && raw[j + 1]) { cw.push({ text: "/" + raw[j + 1].text.replace(/[.,:?!]$/g, "").toUpperCase(), start: w.start, end: raw[j + 1].end, accent: true }); j++; continue; }   // "slash model" is shown as one token, /MODEL
        const txt = w.text.replace(/[.,:?!]$/g, "").toUpperCase();
        cw.push({ text: txt, start: w.start, end: w.end, accent: accent.has(norm(w.text)) });
      }
      chunks.push({ section: s.id, words: cw, start: cw[0].start - 0.06 });
    });
  }
  chunks.forEach((c, i) => (c.end = i + 1 < chunks.length ? Math.min(chunks[i + 1].start, c.words[c.words.length - 1].end + 0.7) : duration));

  // sound events
  const sfx = [];
  const add = (t, type, gain = 1, rate = 1) => { if (t >= 0 && t <= duration) sfx.push({ t: +t.toFixed(3), type, gain, rate }); };
  return { duration, words, chunks, scenes, scene, sec, W, E, sfx, add };
}
