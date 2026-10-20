// attribution.now worker: the AEM production proxy (aem-proxy.mjs, unchanged) plus
//  - www → apex redirect
//  - a logger for /t/* that runs on every request, before the cache (SPEC §10)
//  - /t/beacon for client-side values (document.referrer, fragment)
import aem from './aem-proxy.mjs';
import {
  beaconRecord, echoJson, hitRecord, insert, originPath,
} from './log.mjs';

async function write(env, table, record) {
  if (!env.HITS) return;
  const { sql, values } = insert(table, record);
  try {
    await env.HITS.prepare(sql).bind(...values).run();
  } catch (e) {
    console.error(`log ${table} failed`, e);
  }
}

async function handleBeacon(request, env, ctx) {
  if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin) return new Response('Forbidden', { status: 403 });
  const text = await request.text();
  if (text.length > 8192) return new Response('Payload Too Large', { status: 413 });
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    return new Response('Bad Request', { status: 400 });
  }
  const record = beaconRecord(body);
  if (!record) return new Response('Bad Request', { status: 400 });
  ctx.waitUntil(write(env, 'beacons', record));
  return new Response(null, { status: 204 });
}

async function handleTarget(request, env, ctx) {
  const record = hitRecord(request, crypto.randomUUID());
  ctx.waitUntil(write(env, 'hits', record));

  const url = new URL(request.url);
  const path = originPath(url.pathname);
  let originRequest = request;
  if (path !== url.pathname) {
    url.pathname = path;
    originRequest = new Request(url, request);
  }
  const upstream = await aem.fetch(originRequest, env, ctx);
  const resp = new Response(upstream.body, upstream);
  resp.headers.set('x-robots-tag', 'noindex');
  // the page echoes per-request values, so browsers and shared caches must not store it
  resp.headers.set('cache-control', 'private, no-store');
  if (!(resp.headers.get('content-type') || '').includes('text/html')) return resp;
  return new HTMLRewriter()
    .on('head', {
      element(head) {
        head.append(`<script type="application/json" id="server-echo">${echoJson(record)}</script>`, { html: true });
      },
    })
    .transform(resp);
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (env.CANONICAL_HOST && url.hostname === `www.${env.CANONICAL_HOST}`) {
      url.hostname = env.CANONICAL_HOST;
      return Response.redirect(url.href, 301);
    }
    if (url.pathname === '/t/beacon') return handleBeacon(request, env, ctx);
    if (url.pathname.startsWith('/t/')) return handleTarget(request, env, ctx);
    return aem.fetch(request, env, ctx);
  },
};
