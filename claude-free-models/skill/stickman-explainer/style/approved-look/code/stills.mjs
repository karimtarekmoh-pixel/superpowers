// node stills.mjs OUTDIR t1 t2 ...  -> renders JPG stills at the given times (seconds); "--sheet" also tiles them
import puppeteer from 'puppeteer-core';
import fs from 'fs'; import path from 'path';
const args = process.argv.slice(2).filter(a => a !== '--sheet');
const [out, ...times] = args;
fs.mkdirSync(out, { recursive: true });
const b = await puppeteer.launch({ executablePath: process.env.CHROME || (process.platform === 'darwin' ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' : '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome'), headless: true, args: ['--allow-file-access-from-files', '--no-sandbox', '--ignore-gpu-blocklist'] });
const p = await b.newPage(); await p.setViewport({ width: +(process.env.VW || 1920), height: +(process.env.VH || 1080) });
p.on('pageerror', e => console.error('PAGE ERROR', e.message)); p.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') console.error('console', m.text()); });
await p.goto('file://' + path.resolve('index.html')); await p.evaluate(() => window.ready);
for (const t of times) {
  const d = await p.evaluate(t => window.frameData(t, 'image/jpeg'), +t);
  const f = path.join(out, `s_${(+t).toFixed(2).padStart(6, '0')}.jpg`);
  fs.writeFileSync(f, Buffer.from(d.split(',')[1], 'base64')); console.log(f);
}
await b.close();
