// Captures the real public Anthropic docs page once (viewport 1920x960 @2x) and records where its key paragraph sits.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1920, height: 960 }, deviceScaleFactor: 2 });
  await p.goto('https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-hallucinations', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await p.waitForTimeout(3500);
  const box = await p.evaluate(() => {
    const el = [...document.querySelectorAll('p')].find(e => e.textContent.startsWith('Even the most advanced language models'));
    const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height, text: el.textContent };
  });
  await p.screenshot({ path: 'anthropic_page.png' });
  require('fs').writeFileSync('anthropic_box.json', JSON.stringify(box));
  console.log(JSON.stringify(box));
  await b.close();
})();
