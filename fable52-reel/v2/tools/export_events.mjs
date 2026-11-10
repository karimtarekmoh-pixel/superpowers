// Sound events from src/cues.js (the same list the composition reads its entrance times from). usage: node tools/export_events.mjs [timestamps.json]
import fs from "node:fs";
import { buildTimeline } from "../src/timeline.js";
import { buildCues } from "../src/cues.js";
const S = JSON.parse(fs.readFileSync("src/script.json")), TS = JSON.parse(fs.readFileSync(process.argv[2] || "audio/timestamps.json"));
const T = buildTimeline(S, TS), Q = buildCues(T);
const count = {}; Q.events.forEach((e) => (count[e.type] = (count[e.type] || 0) + 1));
fs.writeFileSync("audio/sfx_events.json", JSON.stringify({ duration: T.duration, s4: 0.0, end: Q.end, hook: Q.t.hook ?? ((Q.t.s2_stamp || 5) + 0.3), events: Q.events }, null, 1));
console.log(`${Q.events.length} events, duration ${T.duration}`, JSON.stringify(count));
