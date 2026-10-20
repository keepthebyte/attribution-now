import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { loadData } from '../lib/data.mjs';
import { renderPrompts } from '../lib/prompts.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const data = loadData(root);

data.labs.forEach((lab) => lab.work_items.forEach((item) => {
  test(`prompts for ${item.id} are complete and self-contained`, () => {
    const prompts = renderPrompts(root, data, lab, item, 'https://attribution.now');
    Object.values(prompts).forEach((text) => {
      assert.ok(!text.includes('{{'), 'no unfilled placeholders');
      assert.ok(text.includes(lab.name));
      assert.ok(text.includes('https://attribution.now/t/check'));
      item.tests.forEach((t) => assert.ok(text.includes(t), `mentions ${t}`));
    });
  });
}));
