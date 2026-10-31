import { test } from 'node:test';
import assert from 'node:assert/strict';
import { classify } from '../lib/actor.mjs';

// Values as logged in the worker's hits table (Oct 2026)
const CHATGPT_USER = 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; ChatGPT-User/1.0; +https://openai.com/bot';
const CLAUDE_USER = 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; Claude-User/1.0; +claude-user@anthropic.com)';
const LINUX = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36';
const MAC = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36';
const CHROMIUM_ONLY = '"Chromium";v="155", "Not(A:Brand";v="24"';
const GOOGLE_CHROME = '"Not:A-Brand";v="8", "Chromium";v="156", "Google Chrome";v="156"';

test('fetchers declare themselves in the user agent', () => {
  assert.deepEqual(classify({ user_agent: CHATGPT_USER }), {
    actor: 'fetcher', assistant: 'openai-chatgpt', confidence: 'declared', evidence: ['ua:ChatGPT-User'],
  });
  assert.equal(classify({ user_agent: CLAUDE_USER }).assistant, 'anthropic-claude');
  assert.equal(classify({ user_agent: 'Mozilla/5.0 (compatible; ClaudeBot/1.0; +claudebot@anthropic.com)' }).actor, 'crawler');
});

test('a Web Bot Auth signature makes a browsing agent', () => {
  const r = classify({
    user_agent: MAC, sec_ch_ua: GOOGLE_CHROME, signature_agent: '"https://chatgpt.com"', signed: 1,
  });
  assert.deepEqual(r, {
    actor: 'agent-hosted', assistant: 'openai-chatgpt', confidence: 'signed', evidence: ['signature-agent:chatgpt.com'],
  });
  assert.equal(classify({ signature_agent: 'chatgpt.com', signed: 1, signature_verified: true }).confidence, 'verified');
  // dictionary form from the newer drafts
  assert.equal(classify({ signature_agent: 'sig1="https://chatgpt.com"', signed: 1 }).assistant, 'openai-chatgpt');
  // a signed fetcher stays a fetcher
  assert.equal(classify({ user_agent: CHATGPT_USER, signature_agent: '"https://chatgpt.com"', signed: 1 }).actor, 'fetcher');
  // unknown signer: still an agent, assistant unknown
  assert.equal(classify({ user_agent: LINUX, signature_agent: '"https://agent.example"', signed: 1 }).assistant, null);
});

test('Meta Muse is inferred from the cloud browser hint and Chromium-only brand', () => {
  const r = classify({ user_agent: LINUX, sec_ch_ua: CHROMIUM_ONLY, agent_hint: 'arm-software-gpu' });
  assert.deepEqual(r, {
    actor: 'agent-hosted', assistant: null, confidence: 'inferred', evidence: ['hint:arm-software-gpu', 'brand:chromium-only'],
  });
  // server side only, before any beacon
  assert.equal(classify({ user_agent: LINUX, sec_ch_ua: CHROMIUM_ONLY }).actor, 'agent-hosted');
});

test('branded browsers and missing signals stay human', () => {
  assert.equal(classify({ user_agent: LINUX.replace('155', '156'), sec_ch_ua: GOOGLE_CHROME }).actor, 'human');
  assert.equal(classify({ user_agent: MAC, sec_ch_ua: CHROMIUM_ONLY }).actor, 'human');
  assert.equal(classify({ user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)' }).actor, 'human');
  assert.equal(classify().actor, 'human');
});

test('Claude Duet names itself in an otherwise ordinary Chrome user agent', () => {
  const r = classify({
    user_agent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko; compatible; Claude-Agent/1.0) Chrome/156.0.0.0 Safari/537.36',
    sec_ch_ua: GOOGLE_CHROME,
  });
  assert.deepEqual(r, {
    actor: 'agent-hosted', assistant: 'anthropic-claude', confidence: 'declared', evidence: ['ua:Claude-Agent'],
  });
});

test('Google-Agent names itself in a Chrome user agent without client hints', () => {
  const r = classify({
    user_agent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko; compatible; Google-Agent; +https://developers.google.com/crawling/docs/crawlers-fetchers/google-agent) Chrome/156.0.8078.47 Safari/537.36',
  });
  assert.deepEqual(r, {
    actor: 'agent-hosted', assistant: 'google-gemini', confidence: 'declared', evidence: ['ua:Google-Agent'],
  });
});

test('local agents are only reported when declared', () => {
  const r = classify({
    user_agent: MAC, sec_ch_ua: GOOGLE_CHROME, declared_actor: 'agent-local', declared_assistant: 'anthropic-claude',
  });
  assert.equal(r.actor, 'agent-local');
  assert.equal(r.assistant, 'anthropic-claude');
  assert.equal(r.confidence, 'declared');
});

test('other bots are crawlers without an assistant', () => {
  const r = classify({ user_agent: 'Mozilla/5.0 (compatible; SemrushBot/7~bl; +http://www.semrush.com/bot.html)' });
  assert.deepEqual([r.actor, r.assistant], ['crawler', null]);
});
