// Exports logged /t/* hits (joined with client beacons) from D1 as CSV.
//
//   npm run export-hits -- --since 2026-10-20 [--until 2026-10-27] [--out exports/hits.csv] [--local]
//
// Hits inside a window listed in worker/ignored-hits.json (recording mistakes) are left out.
// The rows stay in D1; add a window there instead of deleting them.
//
// Uses wrangler with the worker's wrangler.toml, so run `npx wrangler login` once first.
// The CSV splits unique test paths (/t/<test>/<lab>/<surface>/<location>) into columns
// to make converting rows into data/results/ entries straightforward.
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const workerDir = join(dirname(fileURLToPath(import.meta.url)), '..');
const { values: args } = parseArgs({
  options: {
    since: { type: 'string' },
    until: { type: 'string' },
    out: { type: 'string' },
    local: { type: 'boolean', default: false },
  },
});
const DATE = /^\d{4}-\d{2}-\d{2}$/;
if (!args.since || !DATE.test(args.since) || (args.until && !DATE.test(args.until))) {
  console.error('Usage: npm run export-hits -- --since YYYY-MM-DD [--until YYYY-MM-DD] [--out file.csv] [--local]');
  process.exit(1);
}

// Dates are validated above, so inlining them is safe (wrangler d1 execute has no bind params).
const until = args.until ? `AND h.ts < date('${args.until}', '+1 day')` : '';
const sql = `SELECT h.ts, h.hit, h.method, h.path, h.query, h.referer, h.sec_fetch_site, h.sec_fetch_dest,
  h.sec_fetch_mode, h.sec_purpose, h.country, h.user_agent,
  h.asn, h.as_org, h.accept_language, h.sec_ch_ua, h.sec_ch_ua_platform, h.signature_agent, h.signed,
  b.document_referrer, b.search AS client_search, b.hash AS client_hash, b.agent_hint, b.client
FROM hits h LEFT JOIN beacons b ON b.hit = h.hit
WHERE h.ts >= '${args.since}' ${until}
ORDER BY h.ts`;

const output = execFileSync('npx', [
  'wrangler', 'd1', 'execute', 'attribution-now-hits',
  args.local ? '--local' : '--remote', '--json', '--command', sql,
], { cwd: workerDir, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
const ignored = JSON.parse(readFileSync(join(workerDir, 'ignored-hits.json'), 'utf8'));
const isIgnored = (ts) => ignored.some((w) => ts >= w.from && ts <= w.to);
const all = JSON.parse(output).flatMap((r) => r.results || []);
const rows = all.filter((r) => !isIgnored(r.ts));
if (rows.length < all.length) console.error(`Ignored ${all.length - rows.length} hits in windows from ignored-hits.json`);

const columns = ['ts', 'hit', 'test', 'lab', 'surface', 'location', 'utm_source', 'referer', 'document_referrer',
  'query', 'client_search', 'client_hash', 'sec_fetch_site', 'sec_fetch_dest', 'sec_fetch_mode', 'sec_purpose',
  'country', 'method', 'path', 'user_agent', 'asn', 'as_org', 'accept_language', 'sec_ch_ua',
  'sec_ch_ua_platform', 'signature_agent', 'signed', 'agent_hint', 'client'];
const csvCell = (v) => {
  const s = v === null || v === undefined ? '' : String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const lines = rows.map((r) => {
  const [, , test = '', lab = '', surface = '', location = ''] = r.path.split('/');
  const utm = new URLSearchParams(r.query || r.client_search || '').get('utm_source');
  const row = {
    ...r, test, lab, surface, location, utm_source: utm,
  };
  return columns.map((c) => csvCell(row[c])).join(',');
});
const csv = `${[columns.join(','), ...lines].join('\n')}\n`;

if (args.out) {
  mkdirSync(dirname(args.out), { recursive: true });
  writeFileSync(args.out, csv);
  console.error(`✓ ${rows.length} hits → ${args.out}`);
} else {
  process.stdout.write(csv);
}
