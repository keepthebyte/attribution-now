// Pure helpers for the /t/* logger, kept free of Workers globals so they run under node --test.

const MAX = 2048;
const clip = (v) => (typeof v === 'string' ? v.slice(0, MAX) : null);
const HIT = /^[0-9a-f-]{36}$/;

/** Unique test URLs /t/<test>/<lab>/<surface>/<location> are served by the page at /t/<test>. */
export function originPath(pathname) {
  const m = pathname.match(/^\/t\/([a-z0-9-]+)\/.*$/);
  return m ? `/t/${m[1]}` : pathname;
}

/** Row for the hits table. Deliberately no IP address or cf-connecting-ip. */
export function hitRecord(request, hit, now = new Date()) {
  const url = new URL(request.url);
  const h = request.headers;
  return {
    hit,
    ts: now.toISOString(),
    method: request.method,
    path: clip(url.pathname),
    query: clip(url.search),
    referer: clip(h.get('referer')),
    user_agent: clip(h.get('user-agent')),
    sec_fetch_site: clip(h.get('sec-fetch-site')),
    sec_fetch_dest: clip(h.get('sec-fetch-dest')),
    sec_fetch_mode: clip(h.get('sec-fetch-mode')),
    sec_purpose: clip(h.get('sec-purpose') || h.get('purpose')),
    country: clip(request.cf?.country ?? null),
  };
}

/** Validated row for the beacons table, or null. */
export function beaconRecord(body, now = new Date()) {
  if (!body || typeof body !== 'object' || !HIT.test(body.hit || '')) return null;
  if (typeof body.path !== 'string' || !body.path.startsWith('/t/')) return null;
  return {
    hit: body.hit,
    ts: now.toISOString(),
    path: clip(body.path),
    document_referrer: clip(body.document_referrer),
    search: clip(body.search),
    hash: clip(body.hash),
  };
}

/** JSON for <script type="application/json" id="server-echo">, safe inside HTML. */
export function echoJson(record) {
  return JSON.stringify({
    hit: record.hit,
    referer: record.referer,
    sec_fetch_site: record.sec_fetch_site,
    path: record.path,
  }).replace(/</g, '\\u003c');
}

export function insert(table, record) {
  const keys = Object.keys(record);
  return {
    sql: `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${keys.map(() => '?').join(', ')})`,
    values: keys.map((k) => record[k]),
  };
}
