// Pushes rendered pages from dist/ into SourceBus (the site's content source,
// https://api.aem.live/{org}/sites/{site}/source/…), then previews and optionally publishes.
//
//   AEM_TOKEN=<IMS token> node build/sourcebus.mjs [--publish] /nav /footer / /why
//
// Documents are body fragments (<body><header/><main>…</main><footer/></body>); the
// metadata block stays in the content and becomes <meta> tags at delivery.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const { aem } = JSON.parse(readFileSync(join(root, 'build', 'config.json'), 'utf8'));
const token = process.env.AEM_TOKEN;
const api = `https://api.aem.live/${aem.org}/sites/${aem.site}`;
const args = process.argv.slice(2);
const publish = args.includes('--publish');
const paths = args.filter((a) => a.startsWith('/'));

if (!token || !paths.length) {
  console.error('Usage: AEM_TOKEN=... node build/sourcebus.mjs [--publish] <path> [<path> …]   (run npm run render first)');
  process.exit(1);
}

const docName = (path) => (path === '/' ? '/index' : path);
const auth = { authorization: `Bearer ${token}` };

function sourceBody(path) {
  const html = readFileSync(join(root, 'dist', `${docName(path)}.html`), 'utf8');
  const main = html.match(/<main>([\s\S]*)<\/main>/)?.[1];
  if (!main) throw new Error(`${path}: no <main> in dist output`);
  return `<body><header></header><main>${main.trim()}</main><footer></footer></body>`;
}

async function call(method, url, body, type) {
  const headers = type ? { ...auth, 'content-type': type } : auth;
  const res = await fetch(url, { method, headers, body });
  if (!res.ok) throw new Error(`${method} ${url}: ${res.status} ${res.headers.get('x-error') || await res.text()}`);
}

let failed = 0;
for (const path of paths) {
  try {
    // eslint-disable-next-line no-await-in-loop
    await call('PUT', `${api}/source${docName(path)}.html`, sourceBody(path), 'text/html');
    // eslint-disable-next-line no-await-in-loop
    await call('POST', `${api}/preview${path}`);
    // eslint-disable-next-line no-await-in-loop
    if (publish) await call('POST', `${api}/live${path}`);
    console.log(`✓ ${path}${publish ? ' (previewed + published)' : ' (previewed)'}`);
  } catch (e) {
    failed += 1;
    console.error(`✗ ${e.message}`);
  }
}
if (failed) process.exit(1);
