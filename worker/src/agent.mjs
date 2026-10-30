// Pure helpers for the agent door: an A2A agent card at /.well-known/agent-card.json and
// a JSON-RPC `message/send` endpoint (POST /). Research only: every knock and message is
// logged so we can see which agents (e.g. Meta Muse) discover the door and what they say.

const MAX_TEXT = 8192;
const clip = (v, max = MAX_TEXT) => (typeof v === 'string' ? v.slice(0, max) : null);

export const REPLY = 'Thanks, your message reached attribution.now. This endpoint is a research '
  + 'experiment: messages are logged (no IP addresses) to study how AI agents contact websites. '
  + 'No one will follow up.';

/** Public A2A agent card. */
export function agentCard(origin) {
  return {
    protocolVersion: '0.3.0',
    name: 'attribution.now',
    description: 'Research site on how AI assistants attribute and link to websites. '
      + 'Agents may send a message; it is logged for research. Please start your message with a '
      + 'short self-declared introduction: which agent or product you are, who you act for '
      + '(a role such as "a shopper", never personal details), how you found this site, and what '
      + 'you want. Nothing is verified.',
    url: `${origin}/`,
    preferredTransport: 'JSONRPC',
    // A2A 1.0 card field, next to the 0.3 fields above, so clients of either version can read it
    supportedInterfaces: [{ url: `${origin}/`, protocolBinding: 'JSONRPC', protocolVersion: '1.0' }],
    version: '1.0.0',
    provider: { organization: 'attribution.now', url: origin },
    capabilities: { streaming: false, pushNotifications: false },
    defaultInputModes: ['text/plain'],
    defaultOutputModes: ['text/plain'],
    skills: [{
      id: 'contact',
      name: 'Contact',
      description: 'Send a question or note to the site, starting with your introduction '
        + '(agent, who you act for, how you found us, intent). You get an automatic acknowledgement.',
      tags: ['contact', 'research'],
    }],
  };
}

export const MAX_BODY = 65536;

/** CORS headers so browser-based agents can read the card and POST from any page. */
export function corsHeaders(request) {
  return {
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET, POST, OPTIONS',
    'access-control-allow-headers': request.headers.get('access-control-request-headers') || 'content-type',
    'access-control-max-age': '86400',
  };
}

/** Is this a door path that answers CORS preflights? */
export function isDoorPath(pathname) {
  return pathname === '/' || pathname === '/.well-known/agent-card.json';
}

async function readCapped(stream, max) {
  const reader = stream.getReader();
  const chunks = [];
  let size = 0;
  for (;;) {
    // eslint-disable-next-line no-await-in-loop
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > max) {
      reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  const out = new Uint8Array(size);
  let at = 0;
  chunks.forEach((c) => { out.set(c, at); at += c.byteLength; });
  return out;
}

/**
 * Request body as text, decompressed when sent with Content-Encoding gzip/deflate or when it
 * starts with the gzip magic bytes. Returns { text, encoding } or null when it is too large.
 */
export async function readBody(request, max = MAX_BODY) {
  if (!request.body) return { text: '', encoding: null };
  const raw = await readCapped(request.body, max);
  if (!raw) return null;
  const header = (request.headers.get('content-encoding') || '').trim().toLowerCase();
  let encoding = ['gzip', 'x-gzip', 'deflate'].includes(header) ? header.replace('x-', '') : null;
  if (!encoding && raw[0] === 0x1f && raw[1] === 0x8b) encoding = 'gzip';
  if (!encoding) return { text: new TextDecoder().decode(raw), encoding: header || null };
  try {
    const inflated = new Blob([raw]).stream().pipeThrough(new DecompressionStream(encoding));
    const bytes = await readCapped(inflated, max);
    if (!bytes) return null;
    return { text: new TextDecoder().decode(bytes), encoding };
  } catch {
    return { text: new TextDecoder().decode(raw), encoding: `${encoding} (failed)` };
  }
}

/** Is this a knock on the door, i.e. a path we log even when we answer 404? */
export function isAgentPath(pathname) {
  return pathname.startsWith('/.well-known/') || pathname === '/llms.txt';
}

/** Row for the agent_messages table from a raw POST body (any shape is logged). */
export function messageRecord(hit, text, now = new Date(), via = {}) {
  let rpc = null;
  try {
    rpc = JSON.parse(text);
  } catch {
    // keep the raw body
  }
  const message = rpc?.params?.message;
  const parts = Array.isArray(message?.parts) ? message.parts : [];
  const said = parts.filter((p) => typeof p?.text === 'string').map((p) => p.text).join('\n');
  const meta = rpc?.params?.metadata ?? message?.metadata ?? null;
  return {
    hit,
    ts: now.toISOString(),
    rpc_method: clip(rpc?.method ?? null, 128),
    message_id: clip(message?.messageId ?? null, 256),
    context_id: clip(message?.contextId ?? null, 256),
    text: clip(said || null),
    metadata: meta && typeof meta === 'object' ? clip(JSON.stringify(meta)) : null,
    body: clip(text, 16384),
    content_type: clip(via.contentType ?? null, 256),
    content_encoding: clip(via.encoding ?? null, 64),
  };
}

/** JSON-RPC response body for a POST. */
export function rpcResponse(text) {
  let rpc = null;
  try {
    rpc = JSON.parse(text);
  } catch {
    return { jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' } };
  }
  const id = rpc?.id ?? null;
  // message/send (A2A 0.3) or SendMessage (1.0); everything is logged either way
  if (!['message/send', 'SendMessage'].includes(rpc?.method)) {
    return { jsonrpc: '2.0', id, error: { code: -32601, message: 'Method not found' } };
  }
  return {
    jsonrpc: '2.0',
    id,
    result: {
      kind: 'message',
      role: 'agent',
      messageId: crypto.randomUUID(),
      contextId: rpc.params?.message?.contextId,
      parts: [{ kind: 'text', text: REPLY }],
    },
  };
}
