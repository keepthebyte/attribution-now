import { chromium } from 'playwright';
const b = await chromium.launch();
for (const w of [1024, 1440, 360, 768]) {
  const p = await b.newPage({ viewport: { width: w, height: 900 } });
  await p.goto('http://localhost:3011/', { waitUntil: 'networkidle' }); await p.waitForTimeout(1200);
  console.log(w, await p.evaluate(() => ({
    cardOverflow: [...document.querySelectorAll('.scorecard-card')].map((c) => c.scrollWidth - c.clientWidth),
    navWrap: document.querySelector('.nav-links')?.getBoundingClientRect().height,
    doc: document.documentElement.scrollWidth - innerWidth,
    font: document.fonts.check('800 20px "Bricolage Grotesque"'),
  })));
}
await b.close();
