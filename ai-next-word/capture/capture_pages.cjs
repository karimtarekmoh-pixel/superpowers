// Records real public web pages with headless Chromium (real screen recording of the live page).
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path'); const { execSync } = require('child_process');
const OUT = path.resolve('..', 'footage'); const TMP = path.resolve('tmp'); fs.mkdirSync(TMP, { recursive: true });
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function run(name, url, secs, action, label) {
  if (process.argv.length > 2 && !process.argv.includes(name)) return;
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1920, height: 960 }, recordVideo: { dir: TMP, size: { width: 1920, height: 960 } } });
  await ctx.addInitScript(() => { const kill = () => document.querySelectorAll('div,section,aside').forEach(e => { if (e.dataset.k) return; const t = e.textContent || ''; if (t.length < 3000 && /The internet is changing|Sorry to interrupt|Please select an amount/.test(t) && e.getBoundingClientRect().height > 40) { const r = e.getBoundingClientRect(); if (r.height < 900) { let a = e; while (a.parentElement && a.parentElement !== document.body && a.parentElement.textContent.length < 3200) a = a.parentElement; a.style.display = 'none'; a.dataset.k = 1; } } }); new MutationObserver(kill).observe(document, { childList: true, subtree: true }); setInterval(kill, 200); });
  const p = await ctx.newPage();
  await p.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 }); await sleep(2500);
  await p.addStyleTag({ content: '#cookie-banner,.cookie,[id*=cookie],#centralNotice,.frbanner,#frb-inline,#frb-nag,#siteNotice,[class*=fundraising],[id*=frb],[class*=frb]{display:none!important}' });
  await p.evaluate(l => { const d = document.createElement('div'); d.textContent = l; d.style.cssText = 'position:fixed;left:48px;top:20px;z-index:99999;background:rgba(0,0,0,.78);color:#fff;font:700 22px Arial;padding:10px 18px;border-radius:24px'; document.body.appendChild(d); }, label);
  const t0 = Date.now(); await action(p); const left = secs * 1000 - (Date.now() - t0); if (left > 0) await sleep(left);
  const v = p.video(); await ctx.close(); const f = await v.path(); await b.close();
  execSync(`ffmpeg -loglevel error -y -i "${f}" -ss 2.4 -t ${secs} -vf "fps=30,scale=1920:960" -c:v libx264 -preset fast -crf 17 -pix_fmt yuv420p "${path.join(OUT, name + '.mp4')}"`);
  console.log(name, 'done');
}
const smooth = (p, y0, y1, ms) => p.evaluate(([a, b, d]) => new Promise(res => { const s = performance.now(); (function f(n) { const k = Math.min(1, (n - s) / d); const e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; window.scrollTo(0, a + (b - a) * e); k < 1 ? requestAnimationFrame(f) : res(); })(s); }), [y0, y1, ms]);
(async () => {
  // r03: real Anthropic docs page, zoom on the key paragraph
  await run('r03_docs_page', 'https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-hallucinations', 5, async p => {
    await sleep(600);
    await p.evaluate(() => { const el = [...document.querySelectorAll('p')].find(e => e.textContent.startsWith('Even the most advanced language models')); el.style.cssText += ';outline:5px solid #e8574e;outline-offset:12px;border-radius:10px;background:rgba(232,87,78,.10);transition:all .6s'; const r = el.getBoundingClientRect(); const cx = r.x + r.width / 2, cy = r.y + r.height / 2; document.documentElement.style.cssText += `;transform-origin:${cx}px ${cy}px;transition:transform 1.8s cubic-bezier(.45,0,.2,1);transform:scale(1.9)`; });
    await sleep(3500);
  }, 'REAL PAGE · platform.claude.com/docs');
  // r04: real Wikipedia article scrolled fast (lots of text)
  await run('r04_wikipedia_scroll', 'https://en.wikipedia.org/wiki/Large_language_model', 5, async p => { await smooth(p, 0, 9000, 4600); }, 'REAL PAGE · en.wikipedia.org (CC BY-SA)');
  // r05: real Wikipedia article on hallucination, zoom on the opening paragraph
  await run('r05_wikipedia_hallucination', 'https://en.wikipedia.org/wiki/Hallucination_(artificial_intelligence)', 5, async p => {
    await sleep(500);
    await p.evaluate(() => { const el = [...document.querySelectorAll('#mw-content-text p')].find(e=>e.textContent.trim().length>120); el.style.cssText += ';outline:5px solid #e8574e;outline-offset:12px;border-radius:10px;background:rgba(232,87,78,.10)'; el.scrollIntoView({ block: 'center' }); const r = el.getBoundingClientRect(); document.documentElement.style.cssText += `;transform-origin:${r.x + r.width / 2}px ${r.y + r.height / 2}px;transition:transform 1.8s cubic-bezier(.45,0,.2,1);transform:scale(1.7)`; console.log(el.textContent.slice(0, 200)); });
    await sleep(3500);
  }, 'REAL PAGE · en.wikipedia.org (CC BY-SA)');
})().catch(e => { console.error(e); process.exit(1); });
