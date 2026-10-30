import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  REPLY, agentCard, isAgentPath, messageRecord, rpcResponse,
} from '../worker/src/agent.mjs';

const HIT = '123e4567-e89b-12d3-a456-426614174000';
const send = (text, extra = {}) => JSON.stringify({
  jsonrpc: '2.0',
  id: 7,
  method: 'message/send',
  params: {
    message: {
      role: 'user', messageId: 'm1', contextId: 'c1', parts: [{ kind: 'text', text }],
    },
    ...extra,
  },
});

test('agent card points at the root endpoint', () => {
  const card = agentCard('https://attribution.now');
  assert.equal(card.url, 'https://attribution.now/');
  assert.equal(card.preferredTransport, 'JSONRPC');
  assert.ok(card.skills.length > 0);
  assert.equal(card.supportedInterfaces[0].url, 'https://attribution.now/');
  assert.match(card.description, /how you found this site/);
});

test('A2A 1.0 SendMessage gets the same acknowledgement', () => {
  const res = rpcResponse(JSON.stringify({ jsonrpc: '2.0', id: 2, method: 'SendMessage', params: { message: { parts: [{ text: 'hi' }] } } }));
  assert.equal(res.result.parts[0].text, REPLY);
});

test('knocks on well-known paths and llms.txt are logged', () => {
  assert.equal(isAgentPath('/.well-known/agent-card.json'), true);
  assert.equal(isAgentPath('/.well-known/agent-card.sig.json'), true);
  assert.equal(isAgentPath('/llms.txt'), true);
  assert.equal(isAgentPath('/t/check'), false);
});

test('message/send is logged with text and metadata', () => {
  const rec = messageRecord(HIT, send('Do you track ChatGPT referrals?', { metadata: { from: 'did:key:z6Mk', sig: 'abc' } }));
  assert.equal(rec.rpc_method, 'message/send');
  assert.equal(rec.message_id, 'm1');
  assert.equal(rec.text, 'Do you track ChatGPT referrals?');
  assert.deepEqual(JSON.parse(rec.metadata), { from: 'did:key:z6Mk', sig: 'abc' });
});

test('any body is kept, even when it is not JSON-RPC', () => {
  const rec = messageRecord(HIT, 'hello');
  assert.equal(rec.rpc_method, null);
  assert.equal(rec.body, 'hello');
});

test('reply acknowledges without repeating the message', () => {
  const res = rpcResponse(send('my secret question'));
  assert.equal(res.id, 7);
  assert.equal(res.result.parts[0].text, REPLY);
  assert.ok(!JSON.stringify(res).includes('my secret question'));
});

test('JSON-RPC errors', () => {
  assert.equal(rpcResponse('nope').error.code, -32700);
  assert.equal(rpcResponse(JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tasks/get' })).error.code, -32601);
});
