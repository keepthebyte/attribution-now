import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  beaconRecord, echoJson, hitRecord, insert, originPath,
} from '../worker/src/log.mjs';

const HIT = '123e4567-e89b-12d3-a456-426614174000';

test('unique test URLs map to the test page', () => {
  assert.equal(originPath('/t/ref-01/openai-chatgpt/web-desktop/inline-citation'), '/t/ref-01');
  assert.equal(originPath('/t/check'), '/t/check');
  assert.equal(originPath('/t/mrg-01'), '/t/mrg-01');
});

test('hit record keeps the fields we need and no IP', () => {
  const req = new Request('https://attribution.now/t/mrg-01?a=1&b=2&utm_source=chatgpt.com', {
    headers: {
      referer: 'https://chatgpt.com/', 'user-agent': 'UA', 'sec-fetch-site': 'cross-site', 'cf-connecting-ip': '203.0.113.9', 'x-forwarded-for': '203.0.113.9',
    },
  });
  const rec = hitRecord(req, HIT, new Date('2026-10-20T00:00:00Z'));
  assert.equal(rec.referer, 'https://chatgpt.com/');
  assert.equal(rec.query, '?a=1&b=2&utm_source=chatgpt.com');
  assert.equal(rec.ts, '2026-10-20T00:00:00.000Z');
  assert.ok(!JSON.stringify(rec).includes('203.0.113.9'));
});

test('beacon validation', () => {
  assert.equal(beaconRecord({ hit: 'x', path: '/t/check' }), null);
  assert.equal(beaconRecord({ hit: HIT, path: '/elsewhere' }), null);
  const rec = beaconRecord({
    hit: HIT, path: '/t/mrg-02', hash: '#section-2', search: '?utm_source=gemini', document_referrer: 'x'.repeat(5000),
  });
  assert.equal(rec.hash, '#section-2');
  assert.equal(rec.document_referrer.length, 2048);
});

test('echo JSON cannot close the script tag', () => {
  assert.ok(!echoJson({ hit: HIT, referer: '</script><b>', path: '/t/check' }).includes('<'));
});

test('insert builds a parameterized statement', () => {
  assert.deepEqual(insert('hits', { a: 1, b: null }), { sql: 'INSERT INTO hits (a, b) VALUES (?, ?)', values: [1, null] });
});
