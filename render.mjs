// Deterministic renderer: opens index.html in Chromium, seeks the GSAP master
// timeline to each frame time, screenshots it, and pipes frames into ffmpeg.
//
//   node render.mjs --quality draft          540x960 @ 15fps preview
//   node render.mjs --quality final          1080x1920 @ 30fps, CRF 18
//   node render.mjs --still 3.2,4.5          PNG stills at those seconds (out/still-<t>.png)
//   add --guides to tint the unsafe zones
import { createServer } from "node:http";
import { readFile, stat, mkdir, writeFile } from "node:fs/promises";
import { existsSync, statSync } from "node:fs";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
// require() also finds a globally installed Playwright (npm i -D playwright otherwise).
const { chromium } = createRequire(import.meta.url)("playwright");

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(ROOT, "out");
const args = process.argv.slice(2);
const arg = (name, def) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? def : args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : true;
};

const quality = arg("quality", "draft");
const preset = quality === "final" ? { w: 1080, h: 1920, fps: 30 } : { w: 540, h: 960, fps: 15 };
const stills = arg("still", null);
const guides = arg("guides", false);
const voice = path.join(ROOT, "audio/voiceover.mp3");
const music = path.join(ROOT, "audio/music.mp3");
const hasVoice = existsSync(voice);

// Tiny static file server so fetch("scenes.json") works (file:// blocks it).
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".mp3": "audio/mpeg" };
const server = createServer(async (req, res) => {
  try {
    const file = path.join(ROOT, decodeURIComponent(new URL(req.url, "http://x").pathname));
    if (!file.startsWith(ROOT) || !(await stat(file)).isFile()) throw new Error();
    res.writeHead(200, { "content-type": TYPES[path.extname(file)] || "application/octet-stream" });
    res.end(await readFile(file));
  } catch {
    res.writeHead(404).end();
  }
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const port = server.address().port;

const run = (cmd, a, input) =>
  new Promise((resolve, reject) => {
    const p = spawn(cmd, a, { stdio: [input ? "pipe" : "ignore", "ignore", "pipe"] });
    let err = "";
    p.stderr.on("data", (d) => (err += d));
    p.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} failed: ${err.slice(-800)}`))));
    if (input) input(p.stdin);
  });

// Use the system proxy (if any) for Google Fonts, but never for the local server.
const proxy = process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY, bypass: "127.0.0.1,localhost" } : undefined;
const browser = await chromium.launch({ proxy });
const page = await browser.newPage({ viewport: { width: preset.w, height: preset.h }, deviceScaleFactor: 1 });
page.on("console", (m) => m.text().startsWith("[timeline]") && console.log(m.text()));
page.on("pageerror", (e) => console.error("page error:", e.message));
// Renders always use the vendored GSAP 3.12.5 (byte-identical to the cdnjs file),
// so output never depends on the network.
await page.route("**/cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js", (route) =>
  route.fulfill({ path: path.join(ROOT, "vendor/gsap.min.js"), contentType: "text/javascript" }),
);

const qs = new URLSearchParams({ render: "1" });
if (hasVoice) qs.set("audio", "1");
if (guides) qs.set("guides", "1");
await page.goto(`http://127.0.0.1:${port}/index.html?${qs}`);
await page.waitForFunction(() => window.__ready === true, null, { timeout: 30000 });
await page.evaluate(() => document.fonts.ready);
const fontsOk = await page.evaluate(() => ["Instrument Serif", "Inter", "JetBrains Mono"].map((f) => `${f}: ${document.fonts.check(`16px "${f}"`)}`));
console.log("fonts", fontsOk.join(", "));
const meta = await page.evaluate(() => window.__meta);
await mkdir(OUT, { recursive: true });

const seek = (t) => page.evaluate((t) => window.__seek(t), t);

// Captions as SRT (same groups that are burned in).
const srtTime = (t) => {
  const ms = Math.round(t * 1000);
  const p = (n, l = 2) => String(n).padStart(l, "0");
  return `${p(Math.floor(ms / 3600000))}:${p(Math.floor(ms / 60000) % 60)}:${p(Math.floor(ms / 1000) % 60)},${p(ms % 1000, 3)}`;
};
const caps = await page.evaluate(() => window.__captions);
await writeFile(path.join(OUT, "captions.srt"), caps.map((c, i) => `${i + 1}\n${srtTime(c.start)} --> ${srtTime(c.end)}\n${c.text}\n`).join("\n"));

// No voiceover yet: write the exact script to record, with pause marks between scenes.
if (!hasVoice) {
  const scenes = await page.evaluate(() => window.__scenes);
  const lines = scenes.map((s) => `[${s.id} ${s.name} | ${s.start}s-${s.end}s | ${(s.end - s.start).toFixed(1)}s]\n${s.vo}`).join("\n\n[pause 0.4s]\n\n");
  await writeFile(path.join(OUT, "voiceover-script.txt"), lines + "\n");
}

if (stills) {
  for (const t of String(stills).split(",").map(Number)) {
    await seek(t);
    const file = path.join(OUT, `still-${t.toFixed(1)}${guides ? "-guides" : ""}.png`);
    await page.screenshot({ path: file });
    console.log("still", path.relative(ROOT, file));
  }
} else {
  const total = Math.round(meta.duration * preset.fps);
  const silent = path.join(OUT, `video-${quality}.mp4`);
  const t0 = Date.now();
  await run(
    "ffmpeg",
    ["-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(preset.fps), "-c:v", "mjpeg", "-i", "-",
      "-c:v", "libx264", "-crf", quality === "final" ? "18" : "26", "-preset", "veryfast", "-pix_fmt", "yuv420p", "-movflags", "+faststart", silent],
    async (stdin) => {
      for (let f = 0; f < total; f++) {
        await seek(f / preset.fps);
        const buf = await page.screenshot({ type: "jpeg", quality: quality === "final" ? 92 : 80 });
        if (!stdin.write(buf)) await new Promise((r) => stdin.once("drain", r));
        if (f % (preset.fps * 5) === 0) process.stdout.write(`\r  frame ${f}/${total}`);
      }
      stdin.end();
    },
  );
  console.log(`\r  ${total} frames in ${((Date.now() - t0) / 1000).toFixed(0)}s`);

  // Audio is added afterwards: voice, plus optional music at -22 dB under it.
  const reel = path.join(OUT, quality === "final" ? "reel.mp4" : "reel-draft.mp4");
  if (hasVoice) {
    const inputs = ["-i", silent, "-i", voice];
    const mix = existsSync(music)
      ? ["-i", music, "-filter_complex", "[2:a]volume=-22dB[m];[1:a][m]amix=inputs=2:duration=first:normalize=0[a]", "-map", "0:v", "-map", "[a]"]
      : ["-map", "0:v", "-map", "1:a"];
    await run("ffmpeg", ["-y", "-loglevel", "error", ...inputs, ...mix, "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-t", String(meta.duration), "-movflags", "+faststart", reel]);
  } else {
    await run("ffmpeg", ["-y", "-loglevel", "error", "-i", silent, "-c", "copy", reel]);
  }

  // Preview GIF of the first 8 seconds.
  const gif = path.join(OUT, "preview.gif");
  await run("ffmpeg", ["-y", "-loglevel", "error", "-t", "8", "-i", reel, "-vf", "fps=12,scale=360:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=96[p];[b][p]paletteuse=dither=bayer", gif]);

  const mb = (f) => `${(statSync(f).size / 1e6).toFixed(1)} MB`;
  console.log(`\nDuration: ${meta.duration}s ${hasVoice ? "(with voiceover)" : "(silent draft)"}`);
  console.log(`${path.relative(ROOT, reel)}  ${mb(reel)}`);
  console.log(`${path.relative(ROOT, gif)}  ${mb(gif)}`);
  console.log(`out/captions.srt  ${caps.length} captions`);
  if (!hasVoice) console.log("out/voiceover-script.txt  (record this, save as audio/voiceover.mp3, re-render)");
}

await browser.close();
server.close();
