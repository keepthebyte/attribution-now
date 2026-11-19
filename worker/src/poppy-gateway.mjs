// poppy.json from Adobe's Personal Agent Gateway, the same setup as wknd.site: the gateway is
// multi-tenant and builds the document from X-Forwarded-Host. It lists the gateway's Poppy agent
// and a read-only MCP server with one tool, search_site; every call logs the visitor's intent
// (scrubbed) to Splunk on Adobe's side. Our own company agent stays at /poppy/conversations.
// Kept free of Workers bindings (fetch is passed in) so it runs under node --test.

export const GATEWAY_PATH = '/personal-agent-gateway/.well-known/poppy.json';
const MAX_DOCUMENT = 65536;

/**
 * Fetch the gateway's poppy.json for `host`. Returns { status, body } where body is the
 * document text as served, or null with status 502 when the gateway fails or answers non-JSON.
 */
export async function gatewayPoppy(gateway, host, fetcher = fetch) {
  let res;
  try {
    res = await fetcher(new URL(GATEWAY_PATH, gateway).href, {
      headers: { 'x-forwarded-host': host, accept: 'application/json' },
      redirect: 'manual',
    });
  } catch {
    return { status: 502, body: null };
  }
  if (res.status !== 200) return { status: 502, body: null };
  const text = await res.text();
  if (text.length > MAX_DOCUMENT) return { status: 502, body: null };
  try {
    const doc = JSON.parse(text);
    // the gateway answers for any host; refuse a document for another domain
    if (doc?.organization?.domain !== host) return { status: 502, body: null };
  } catch {
    return { status: 502, body: null };
  }
  return { status: 200, body: text };
}
