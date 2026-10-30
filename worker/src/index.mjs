// attribution.now worker: the AEM production proxy (aem-proxy.mjs, unchanged) plus
//  - www → apex redirect
//  - a logger for /t/* that runs on every request, before the cache (SPEC §10)
//  - /t/beacon for client-side values (document.referrer, fragment)
//  - headers (never the body) of RUM beacons, to see which reach the collector
//  - an agent door (agent.mjs): A2A agent card + POST / message/send, all knocks logged
import aem from './aem-proxy.mjs';
import {
  beaconRecord, echoJson, hitRecord, insert, isRumBeacon, originPath,
} from './log.mjs';
import {
  agentCard, corsHeaders, isAgentPath, isDoorPath, messageRecord, readBody, rpcResponse,
} from './agent.mjs';

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

const json = (request, body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: {
    'content-type': 'application/json', 'cache-control': 'no-store', 'x-robots-tag': 'noindex', ...corsHeaders(request),
  },
});

async function handleAgentMessage(request, env, ctx) {
  const hit = crypto.randomUUID();
  ctx.waitUntil(write(env, 'hits', hitRecord(request, hit)));
  const body = await readBody(request);
  if (!body) return json(request, { jsonrpc: '2.0', id: null, error: { code: -32600, message: 'Request too large' } }, 413);
  const meta = { contentType: request.headers.get('content-type'), encoding: body.encoding };
  ctx.waitUntil(write(env, 'agent_messages', messageRecord(hit, body.text, new Date(), meta)));
  return json(request, rpcResponse(body.text));
}

const AGENT_LINK_SECTION = '<div><p>AI agents: this site has an agent you can message. '
  + '<a href="/.well-known/agent-card.json">Agent (Agent Card)</a></p></div>';

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
    // the nav link can sit in a browser cache for hours (max-age=7200); this page is no-store
    .on('main', {
      element(main) {
        main.prepend(AGENT_LINK_SECTION, { html: true });
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
    if (request.method === 'OPTIONS' && isDoorPath(url.pathname)) {
      // preflight from a browser-based agent: log it, it shows who tries to call from a page
      ctx.waitUntil(write(env, 'hits', hitRecord(request, crypto.randomUUID())));
      return new Response(null, { status: 204, headers: corsHeaders(request) });
    }
    if (url.pathname === '/' && request.method === 'POST') return handleAgentMessage(request, env, ctx);
    if (isAgentPath(url.pathname)) {
      ctx.waitUntil(write(env, 'hits', hitRecord(request, crypto.randomUUID())));
      if (url.pathname === '/.well-known/agent-card.json') return json(request, agentCard(url.origin));
    }
    if (url.pathname === '/t/beacon') return handleBeacon(request, env, ctx);
    if (url.pathname.startsWith('/t/')) return handleTarget(request, env, ctx);
    if (isRumBeacon(request)) ctx.waitUntil(write(env, 'hits', hitRecord(request, crypto.randomUUID())));
    return aem.fetch(request, env, ctx);
  },
};
