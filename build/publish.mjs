// Diffs two render manifests and previews + publishes changed paths via the AEM Admin API.
//
//   node build/publish.mjs diff <previous-manifest.json> <next-manifest.json>   → JSON array of paths
//   node build/publish.mjs publish '<json array of paths>'                       (needs AEM_ADMIN_TOKEN)
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const { aem } = JSON.parse(readFileSync(join(root, 'build', 'config.json'), 'utf8'));
const ADMIN = 'https://admin.hlx.page';
const [mode, ...args] = process.argv.slice(2);

const readJson = (file) => (existsSync(file) ? JSON.parse(readFileSync(file, 'utf8') || '{}') : {});

async function call(action, path) {
  const res = await fetch(`${ADMIN}/${action}/${aem.org}/${aem.site}/${aem.ref}${path}`, {
    method: 'POST',
    headers: { authorization: `token ${process.env.AEM_ADMIN_TOKEN}` },
  });
  if (!res.ok) throw new Error(`${action} ${path}: ${res.status} ${res.headers.get('x-error') || ''}`);
}

if (mode === 'diff') {
  const [prev, next] = args.map(readJson);
  const changed = Object.keys(next).filter((p) => prev[p] !== next[p]);
  const removed = Object.keys(prev).filter((p) => !(p in next));
  if (removed.length) console.error(`Removed (unpublish manually if needed): ${removed.join(', ')}`);
  console.log(JSON.stringify(changed));
} else if (mode === 'publish') {
  if (!process.env.AEM_ADMIN_TOKEN) {
    console.error('AEM_ADMIN_TOKEN is not set');
    process.exit(1);
  }
  const paths = JSON.parse(args[0] || '[]');
  let failed = 0;
  // nav and footer first, so pages pick them up
  paths.sort((a, b) => (['/nav', '/footer'].includes(b) ? 1 : 0) - (['/nav', '/footer'].includes(a) ? 1 : 0));
  for (const path of paths) {
    try {
      // eslint-disable-next-line no-await-in-loop
      await call('preview', path);
      // eslint-disable-next-line no-await-in-loop
      await call('live', path);
      console.log(`✓ ${path}`);
    } catch (e) {
      failed += 1;
      console.error(`✗ ${e.message}`);
    }
  }
  if (failed) process.exit(1);
} else {
  console.error('Usage: publish.mjs diff <prev> <next> | publish <json-paths>');
  process.exit(1);
}
