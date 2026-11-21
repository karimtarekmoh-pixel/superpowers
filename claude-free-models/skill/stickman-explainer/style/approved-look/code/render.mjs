// node render.mjs [out.mp4] [--workers N] [--scale 0.5] [--from s --to s]
// Renders every frame of index.html in headless Chrome (in parallel chunks), encodes with ffmpeg,
// and joins the chunks into one silent video.
import puppeteer from 'puppeteer-core';
import { spawn } from 'child_process';
import fs from 'fs'; import path from 'path';

const args = process.argv.slice(2);
const out = path.resolve(args.find(a => !a.startsWith('--') && !/^\d/.test(a) && !/^-?\d/.test(a)) || 'build/video_silent.mp4');
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? +args[i + 1] : d; };
const WORKERS = opt('--workers', 6), SCALE = opt('--scale', 1), FPS = 30, DUR = +(process.env.DUR || 45.6);
const F0 = Math.round(opt('--from', 0) * FPS), F1 = Math.min(Math.round(DUR * FPS), Math.round(opt('--to', DUR) * FPS)); // 2589 frames in full
const tmp = path.resolve('build/chunks'); fs.rmSync(tmp, { recursive: true, force: true }); fs.mkdirSync(tmp, { recursive: true });
const CHROME = process.env.CHROME || (process.platform === 'darwin' ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' : '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome');
const VW = +(process.env.VW || 1920), VH = +(process.env.VH || 1080);

async function worker(id, a, b) {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, protocolTimeout: 600000, args: ['--allow-file-access-from-files', '--no-sandbox', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage(); await page.setViewport({ width: VW, height: VH });
  page.on('pageerror', e => console.error(`[w${id}] PAGE ERROR`, e.message));
  page.on('console', m => { if (m.type() === 'error') console.error(`[w${id}]`, m.text()); });
  await page.goto('file://' + path.resolve('index.html')); await page.evaluate(() => window.ready);
  const file = path.join(tmp, `c${String(id).padStart(2, '0')}.mp4`);
  const vf = SCALE !== 1 ? ['-vf', `scale=${Math.round(VW * SCALE)}:${Math.round(VH * SCALE)}:flags=lanczos`] : [];
  const ff = spawn('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'png', '-i', '-',
    ...vf, '-c:v', 'libx264', '-preset', SCALE !== 1 ? 'veryfast' : 'slow', '-crf', SCALE !== 1 ? '23' : '15', '-pix_fmt', 'yuv420p', '-r', String(FPS), file], { stdio: ['pipe', 'inherit', 'inherit'] });
  const done = new Promise((res, rej) => ff.on('close', c => c === 0 ? res() : rej(new Error('ffmpeg ' + c))));
  for (let f = a; f < b; f++) {
    const d = await page.evaluate(t => window.frameData(t), f / FPS);
    const buf = Buffer.from(d.slice(d.indexOf(',') + 1), 'base64');
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if ((f - a) % 90 === 0) console.log(`[w${id}] frame ${f}/${b - 1}`);
  }
  ff.stdin.end(); await done; await browser.close();
  return file;
}

const t0 = Date.now();
const TOTAL = F1 - F0, per = Math.ceil(TOTAL / WORKERS), jobs = [];
for (let i = 0; i < WORKERS; i++) { const a = F0 + i * per, b = Math.min(F1, a + per); if (a < b) jobs.push(worker(i, a, b)); }
const files = await Promise.all(jobs);
const list = path.join(tmp, 'list.txt'); fs.writeFileSync(list, files.map(f => `file '${f}'`).join('\n'));
fs.mkdirSync(path.dirname(out), { recursive: true });
await new Promise((res, rej) => spawn('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', out], { stdio: 'inherit' }).on('close', c => c === 0 ? res() : rej(new Error('concat ' + c))));
console.log(`done ${out} (${TOTAL} frames) in ${((Date.now() - t0) / 1000).toFixed(1)} s`);
