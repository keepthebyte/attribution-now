import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderTemplate } from '../lib/template.mjs';

test('fills variables and loops, one line per test', () => {
  const out = renderTemplate('Hi {{lab_name}}\n{{for each test}}- {{test_id}}: {{pass_criteria}}{{/for}}\nend', {
    lab_name: 'Lab',
    tests: [{ test_id: 'A-01', pass_criteria: 'one' }, { test_id: 'B-02', pass_criteria: 'two' }],
  });
  assert.equal(out, 'Hi Lab\n- A-01: one\n- B-02: two\nend');
});

test('throws on a missing value', () => {
  assert.throws(() => renderTemplate('{{nope}}', {}), /no value for \{\{nope\}\}/);
});
