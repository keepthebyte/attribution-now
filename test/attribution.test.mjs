import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { addAttribution } from '../lib/attribution.mjs';

const { source, vectors } = JSON.parse(readFileSync(new URL('../lib/vectors.json', import.meta.url), 'utf8'));

vectors.forEach((v) => {
  test(`${v.test}: ${v.name}`, () => {
    assert.equal(addAttribution(v.input, source, v.medium), v.expected);
  });
});

test('is idempotent', () => {
  const once = addAttribution('https://example.com/p?a=1#x', source);
  assert.equal(addAttribution(once, source), once);
});
