// Renders the share image (og:image, twitter:image) to default-meta-image.png, 1200 × 630.
// EDS points every page's og:image at /default-meta-image.png unless the page sets its own image.
// Usage: node build/social-card.mjs   (needs the playwright devDependency)
// eslint-disable-next-line import/no-extraneous-dependencies
import { chromium } from 'playwright';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const root = fileURLToPath(new URL('..', import.meta.url));
const font = (file) => `url('file://${join(root, 'fonts', file)}')`;

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: B; src: ${font('bricolage-grotesque-latin.woff2')}; font-weight: 600 800; }
@font-face { font-family: H; src: ${font('hanken-grotesk-latin.woff2')}; font-weight: 400 700; }
* { margin: 0; box-sizing: border-box; }
body { width: 1200px; height: 630px; display: flex; flex-direction: column;
  background: oklch(94.5% 0.035 295deg); color: oklch(21% 0.035 290deg); font-family: H; }
.top { flex: 1; padding: 56px 72px 0; }
.brand { display: flex; align-items: center; gap: 14px; font: 700 34px B; letter-spacing: -0.01em; }
.brand svg { width: 64px; height: 64px; }
h1 { max-width: 16ch; margin-top: 44px; font: 800 76px/1.02 B; letter-spacing: -0.025em; text-wrap: balance; }
.fields { display: flex; height: 150px; }
.fields div { flex: 1; display: flex; align-items: center; padding: 0 72px; font: 700 28px/1.15 B; }
.analysts { background: oklch(46% 0.215 290deg); color: oklch(98.5% 0.006 290deg); }
.labs { background: oklch(78% 0.13 355deg); }
</style></head><body>
<div class="top">
  <div class="brand"><svg viewBox="6 6 52 52"><defs><clipPath id="c"><circle cx="22" cy="32" r="15"/></clipPath></defs>
    <circle cx="22" cy="32" r="15" fill="#5e2dc4"/><circle cx="42" cy="32" r="15" fill="#e13b86"/>
    <circle cx="42" cy="32" r="15" fill="#181527" clip-path="url(#c)"/></svg>attribution.now</div>
  <h1>AI assistants send you visitors. Many show up as Direct.</h1>
</div>
<div class="fields"><div class="analysts">For SEO, GEO and analytics teams</div><div class="labs">For teams at AI labs</div></div>
</body></html>`;

// a file:// page, so the self-hosted fonts load
const dir = mkdtempSync(join(tmpdir(), 'social-card-'));
writeFileSync(join(dir, 'card.html'), html);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.goto(`file://${join(dir, 'card.html')}`);
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: join(root, 'default-meta-image.png') });
await browser.close();
rmSync(dir, { recursive: true });
// eslint-disable-next-line no-console
console.log('✓ default-meta-image.png');
