import { launch } from "/home/user/superpowers/reel-engine/engine/browser.mjs"; import path from "node:path"; import fs from "node:fs";
const ts = process.argv.slice(2).map(Number); fs.mkdirSync("out/snap", { recursive: true });
const b = await launch(), ctx = await b.newContext({ viewport: { width: 1080, height: 1920 } }), p = await ctx.newPage();
await p.goto("file://" + path.resolve("hf/index.html")); await p.waitForTimeout(900);
for (const t of ts) { await p.evaluate((t) => window.__timelines.main.seek(t), t); await p.waitForTimeout(120); await p.screenshot({ path: `out/snap/s_${t}.png` }); }
await b.close();
