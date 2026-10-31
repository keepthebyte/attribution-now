// Who is driving a request: a person, an AI agent, or an automated fetcher/crawler.
// "Source" (referrer, UTM) says which assistant sent a visit; "actor" says who made it.
// Pure function over request signals, so it runs in the worker, in reports and in node --test.
//
// Actors:
//   crawler       indexes or trains; never on behalf of one person (GPTBot, ClaudeBot)
//   fetcher       fetches a page for one user's question, no browser (ChatGPT-User, Claude-User)
//   agent-hosted  drives a real browser in the lab's cloud (ChatGPT agent, Meta Muse)
//   agent-local   drives the user's own browser (Claude in Chrome); not detectable from
//                 headers today, so only returned when the caller passes a declared hint
//   human         nothing above matched
//
// Confidence: verified (signature checked by the caller), signed (signature present, not
// checked), declared (user agent token; anyone can send it), inferred (heuristics).

/** User agent tokens published by the labs. Order matters: first match wins. */
export const UA_TOKENS = [
  { token: 'ChatGPT-User', actor: 'fetcher', assistant: 'openai-chatgpt' },
  { token: 'OAI-SearchBot', actor: 'crawler', assistant: 'openai-chatgpt' },
  { token: 'GPTBot', actor: 'crawler', assistant: 'openai-chatgpt' },
  { token: 'Claude-User', actor: 'fetcher', assistant: 'anthropic-claude' },
  { token: 'Claude-SearchBot', actor: 'crawler', assistant: 'anthropic-claude' },
  { token: 'ClaudeBot', actor: 'crawler', assistant: 'anthropic-claude' },
  { token: 'Perplexity-User', actor: 'fetcher', assistant: 'perplexity' },
  { token: 'PerplexityBot', actor: 'crawler', assistant: 'perplexity' },
  { token: 'Meta-ExternalFetcher', actor: 'fetcher', assistant: 'meta-ai' },
  { token: 'Meta-ExternalAgent', actor: 'crawler', assistant: 'meta-ai' },
  { token: 'MistralAI-User', actor: 'fetcher', assistant: 'mistral-lechat' },
];

/** Signature-Agent origins (Web Bot Auth) we have seen or the labs document. */
export const SIGNATURE_AGENTS = {
  'chatgpt.com': 'openai-chatgpt',
};

const CHROME_BRANDS = /"(Google Chrome|Microsoft Edge|Opera|Brave|Vivaldi|Samsung Internet)"/;
const GENERIC_BOT = /bot\b|crawl|spider|slurp|headless/i;

function signatureHost(value) {
  if (!value) return null;
  const raw = value.trim().replace(/^[a-z0-9_-]+=/i, '').replace(/^"|"$/g, '');
  try {
    return new URL(raw.includes('://') ? raw : `https://${raw}`).hostname;
  } catch {
    return null;
  }
}

/**
 * Classify one request.
 * @param {object} s signals, using the column names of the worker's hits table:
 *   user_agent, sec_ch_ua, signature_agent, signed (0/1),
 *   plus optional agent_hint (cloud browser label from the page beacon),
 *   signature_verified (boolean, only when the caller checked the key directory) and
 *   declared_actor ('agent-local' when e.g. an extension says so; never guessed here).
 * @returns {{ actor: string, assistant: string|null, confidence: string|null, evidence: string[] }}
 */
export function classify(s = {}) {
  const ua = s.user_agent || '';
  const evidence = [];

  const host = signatureHost(s.signature_agent);
  if (host || s.signed) {
    evidence.push(host ? `signature-agent:${host}` : 'signature');
    const hit = UA_TOKENS.find((t) => ua.includes(t.token));
    return {
      // a signed fetcher or crawler keeps its role; anything else signed is a browsing agent
      actor: hit ? hit.actor : 'agent-hosted',
      assistant: SIGNATURE_AGENTS[host] ?? hit?.assistant ?? null,
      confidence: s.signature_verified ? 'verified' : 'signed',
      evidence,
    };
  }

  const token = UA_TOKENS.find((t) => ua.includes(t.token));
  if (token) {
    evidence.push(`ua:${token.token}`);
    return {
      actor: token.actor, assistant: token.assistant, confidence: 'declared', evidence,
    };
  }

  if (s.declared_actor === 'agent-local') {
    evidence.push('declared:agent-local');
    return {
      actor: 'agent-local', assistant: s.declared_assistant ?? null, confidence: 'declared', evidence,
    };
  }

  if (s.agent_hint) evidence.push(`hint:${s.agent_hint}`);
  // Headless and embedded Chromium builds send only the "Chromium" brand; branded browsers
  // add their own. Linux x86_64 is what hosted browsers claim, whatever CPU they run on.
  if (s.sec_ch_ua && !CHROME_BRANDS.test(s.sec_ch_ua) && /Linux x86_64/.test(ua)) {
    evidence.push('brand:chromium-only');
  }
  if (evidence.length) {
    return {
      actor: 'agent-hosted', assistant: null, confidence: 'inferred', evidence,
    };
  }

  if (GENERIC_BOT.test(ua)) {
    return {
      actor: 'crawler', assistant: null, confidence: 'declared', evidence: ['ua:generic-bot'],
    };
  }
  return {
    actor: 'human', assistant: null, confidence: null, evidence,
  };
}
