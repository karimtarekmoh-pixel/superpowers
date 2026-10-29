// Quality gate. Run after a render:  node qa.mjs [--video out/reel.mp4]
// 1) DOM check every 0.5s: clipped/overflowing text, content in unsafe zones, captions overlapping other elements
// 2) Static frames: ffmpeg freezedetect, no freeze longer than 2.5s
// 3) Captions match the script word for word
// 4) No real brand names in on-screen text
// 5) Total length 65-75s
// Also writes out/qa-sheet.png: one frame every 2 seconds for a visual check.
import { createServer } from "node:http";
import { readFile, stat, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
const { chromium } = createRequire(import.meta.url)("playwright");

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const vi = process.argv.indexOf("--video");
const video = vi > -1 ? process.argv[vi + 1] : ["out/reel.mp4", "out/reel-draft.mp4"].find((f) => existsSync(path.join(ROOT, f)));

const server = createServer(async (req, res) => {
  try {
    const f = path.join(ROOT, decodeURIComponent(new URL(req.url, "http://x").pathname));
    if (!(await stat(f)).isFile()) throw 0;
    res.writeHead(200, { "content-type": f.endsWith(".js") ? "text/javascript" : f.endsWith(".css") ? "text/css" : f.endsWith(".json") ? "application/json" : "text/html" });
    res.end(await readFile(f));
  } catch {
    res.writeHead(404).end();
  }
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const proxy = process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY, bypass: "127.0.0.1,localhost" } : undefined;
const browser = await chromium.launch({ proxy });
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
await page.route("**/cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js", (r) => r.fulfill({ path: path.join(ROOT, "vendor/gsap.min.js"), contentType: "text/javascript" }));
const audio = existsSync(path.join(ROOT, "audio/voiceover.mp3"));
await page.goto(`http://127.0.0.1:${server.address().port}/index.html?render=1${audio ? "&audio=1" : ""}`);
await page.waitForFunction(() => window.__ready === true);
await page.evaluate(() => document.fonts.ready);
const meta = await page.evaluate(() => window.__meta);

const results = [];
const check = (name, ok, detail) => results.push({ name, ok, detail });

// ---- 1) DOM checks
const problems = [];
for (let t = 0; t <= meta.duration - 0.05; t += 0.5) {
  const found = await page.evaluate((t) => {
    window.__seek(t);
    const SAFE_TOP = 220, SAFE_BOTTOM = 1920 - 380;
    const out = [];
    const visible = (el) => {
      for (let n = el; n && n !== document.body; n = n.parentElement) {
        const cs = getComputedStyle(n);
        if (cs.display === "none" || cs.visibility === "hidden" || parseFloat(cs.opacity) < 0.05) return false;
      }
      return true;
    };
    const name = (el) => (el.className && typeof el.className === "string" ? "." + el.className.split(" ")[0] : el.tagName.toLowerCase()) + ` "${(el.textContent || "").trim().slice(0, 24)}"`;
    // Elements that own text directly.
    const texts = [...document.querySelectorAll("#scenes *, #captions *, #mascot-strip *")].filter((el) => [...el.childNodes].some((c) => c.nodeType === 3 && c.textContent.trim()) && visible(el));
    for (const el of texts) {
      const r = el.getBoundingClientRect();
      if (r.width === 0) continue;
      // Text must be fully inside the nearest clipping ancestor (card, phone screen, terminal).
      for (let a = el.parentElement; a && a.id !== "stage"; a = a.parentElement) {
        const cs = getComputedStyle(a);
        if (cs.overflow === "hidden" || cs.overflowX === "hidden") {
          const ar = a.getBoundingClientRect();
          if (r.left < ar.left - 2 || r.right > ar.right + 2 || r.top < ar.top - 2 || r.bottom > ar.bottom + 2) out.push(`clipped ${name(el)}`);
          break;
        }
      }
      if (el.scrollWidth > el.clientWidth + 2 && getComputedStyle(el).overflow !== "visible") out.push(`overflow ${name(el)}`);
      if (r.top < SAFE_TOP || r.bottom > SAFE_BOTTOM) out.push(`unsafe zone ${name(el)} y=${Math.round(r.top)}-${Math.round(r.bottom)}`);
    }
    // Cards, phones, terminals must also stay in the safe band.
    for (const el of document.querySelectorAll(".card, .pixel, .cap-group")) {
      if (!visible(el)) continue;
      const r = el.getBoundingClientRect();
      if (r.top < SAFE_TOP - 1 || r.bottom > SAFE_BOTTOM + 1) out.push(`unsafe zone ${name(el)} y=${Math.round(r.top)}-${Math.round(r.bottom)}`);
    }
    // Caption pill must not overlap the card, the mascot or the tracker.
    const pill = [...document.querySelectorAll(".cap-group")].find(visible);
    if (pill) {
      const p = pill.getBoundingClientRect();
      if (p.left < 0 || p.right > 1080) out.push(`caption off-screen "${pill.textContent}"`);
      for (const el of document.querySelectorAll(".card, .pixel svg, .tracker")) {
        if (!visible(el)) continue;
        const r = el.getBoundingClientRect();
        if (p.left < r.right && p.right > r.left && p.top < r.bottom && p.bottom > r.top) out.push(`caption overlaps ${name(el)}`);
      }
    }
    return out;
  }, t);
  found.forEach((f) => problems.push(`${t.toFixed(1)}s ${f}`));
}
check("no clipped/overflowing text, nothing in unsafe zones, no caption overlaps", problems.length === 0, problems.length ? problems.slice(0, 25).join("\n    ") + (problems.length > 25 ? `\n    …${problems.length - 25} more` : "") : "checked every 0.5s");

// ---- 3) Captions match script
const { capText, voText } = await page.evaluate(() => ({ capText: window.__captions.map((c) => c.text).join(" "), voText: window.__scenes.map((s) => s.vo.trim()).join(" ") }));
const norm = (s) => s.split(/\s+/).join(" ");
check("captions match the script word for word", norm(capText) === norm(voText), `${norm(voText).split(" ").length} words`);

// ---- 4) Real brands
const DENY = ["Instagram", "Facebook", "Meta", "TikTok", "YouTube", "Google", "Apple", "Calendly", "Square", "Booksy", "Fresha", "Vagaro", "Acuity", "Stripe", "Shopify", "QuickBooks", "Xero", "Mindbody", "Setmore", "Squire", "OpenAI", "ChatGPT", "Microsoft"];
const allText = await page.evaluate(() => document.getElementById("stage").innerText + " " + [...document.querySelectorAll("svg text")].map((t) => t.textContent).join(" "));
const hits = DENY.filter((b) => new RegExp(`\\b${b}\\b`, "i").test(allText));
check("no real company names/logos on screen", hits.length === 0, hits.length ? `found: ${hits.join(", ")}` : "only fictional names (BookIt, TabTally, StampCard, ShiftPad, QueueUp, Fade & Co.); 'Claude Code' is the product the script teaches");

await browser.close();
server.close();

// ---- 2) Static frames + 5) duration (from the rendered video)
if (video && existsSync(path.join(ROOT, video))) {
  const v = path.join(ROOT, video);
  const dur = Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", v]).toString());
  check("total length 65-75s", dur >= 65 && dur <= 75, `${dur.toFixed(2)}s (${video})`);
  // freezedetect logs to stderr; -55dB still counts the slow 1.00->1.04 drift as motion.
  const log = execFileSync("sh", ["-c", `ffmpeg -hide_banner -i "${v}" -vf freezedetect=n=-55dB:d=2.5 -map 0:v -f null - 2>&1 | grep -E "freeze_(start|duration)" || true`]).toString().trim();
  check("no frame static for more than 2.5s", log === "", log || "freezedetect found nothing");
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", v, "-vf", "fps=1/2,scale=216:-1,tile=9x4", "-frames:v", "1", path.join(ROOT, "out/qa-sheet.png")]);
} else check("total length 65-75s", meta.duration >= 65 && meta.duration <= 75, `${meta.duration}s from scenes.json (no video found for the static-frame check)`);

let failed = 0;
for (const r of results) {
  if (!r.ok) failed++;
  console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.name}\n    ${r.detail}`);
}
await writeFile(path.join(ROOT, "out/qa-report.json"), JSON.stringify(results, null, 2));
process.exit(failed ? 1 : 0);
