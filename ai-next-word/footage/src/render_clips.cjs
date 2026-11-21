const { chromium } = require('playwright'); const { spawn } = require('child_process'); const fs = require('fs'); const path = require('path');
(async () => {
  const only = process.argv.slice(2);
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 960 } });
  p.on('pageerror', e => console.error('PAGE ERROR', e.message));
  await p.goto('file://' + path.resolve('clips.html')); await p.evaluate(() => window.ready);
  const box = JSON.parse(fs.readFileSync('anthropic_box.json'));
  const img = 'data:image/png;base64,' + fs.readFileSync('anthropic_page.png').toString('base64');
  await p.evaluate(([s, bx]) => window.setDoc(s, bx), [img, box]);
  const names = await p.evaluate(() => window.names);
  for (const n of names) {
    if (only.length && !only.includes(n)) continue;
    const dur = await p.evaluate(n => window.dur(n), n); const frames = Math.round(dur * 30);
    const out = path.resolve('..', n + '.mp4');
    const ff = spawn('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-f', 'image2pipe', '-framerate', '30', '-c:v', 'png', '-i', '-', '-c:v', 'libx264', '-preset', 'fast', '-crf', '16', '-pix_fmt', 'yuv420p', '-r', '30', out], { stdio: ['pipe', 'inherit', 'inherit'] });
    const done = new Promise(r => ff.on('close', r));
    for (let f = 0; f < frames; f++) { const d = await p.evaluate(([n, t]) => window.frame(n, t), [n, f / 30]); ff.stdin.write(Buffer.from(d.split(',')[1], 'base64')); }
    ff.stdin.end(); await done; console.log(n, frames, 'frames');
  }
  await b.close();
})();
