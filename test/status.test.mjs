import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  aggregate, labCell, resolveLocation, surfaceCell,
} from '../lib/status.mjs';

const lab = { id: 'lab-x' };
const web = { id: 'web', platform: 'web', link_locations: ['inline-citation', 'sources-panel'] };
const app = { id: 'ios', platform: 'native', link_locations: ['inline-citation'] };
const REF01 = { id: 'REF-01', scope: 'location', applies_to: 'all' };
const REF03 = { id: 'REF-03', scope: 'location', applies_to: 'web' };
const run = (date, method, surface, results) => ({
  date, method, surface, lab: 'lab-x', file: `${date}-${method}`, results,
});
const r = (location, status, t = 'REF-01') => ({
  location, test: t, status, evidence: {},
});

test('aggregate', () => {
  assert.equal(aggregate(['works', 'works']), 'works');
  assert.equal(aggregate(['missing', 'n/a']), 'missing');
  assert.equal(aggregate(['works', 'missing']), 'partial');
  assert.equal(aggregate(['n/a']), 'n/a');
});

test('newest result wins', () => {
  const results = [run('2026-01-01', 'manual', 'web', [r('*', 'works')]), run('2026-02-01', 'manual', 'web', [r('*', 'missing')])];
  assert.equal(resolveLocation(results, 'lab-x', 'web', 'inline-citation', 'REF-01').status, 'missing');
});

test('verified beats reported on the same date', () => {
  const results = [run('2026-02-01', 'manual', 'web', [r('*', 'works')]), run('2026-02-01', 'reported', 'web', [r('*', 'missing')])];
  assert.equal(resolveLocation(results, 'lab-x', 'web', 'inline-citation', 'REF-01').method, 'manual');
});

test('exact location beats * on the same date and method', () => {
  const results = [run('2026-02-01', 'manual', 'web', [r('*', 'works'), r('sources-panel', 'missing')])];
  assert.equal(resolveLocation(results, 'lab-x', 'web', 'sources-panel', 'REF-01').status, 'missing');
  assert.equal(resolveLocation(results, 'lab-x', 'web', 'inline-citation', 'REF-01').status, 'works');
});

test('cell: partial across locations, reported-only shows reported with finding', () => {
  const verified = [run('2026-02-01', 'manual', 'web', [r('inline-citation', 'works'), r('sources-panel', 'missing')])];
  assert.equal(surfaceCell(verified, lab, web, REF01).status, 'partial');
  const reported = [run('2026-02-01', 'reported', 'web', [r('*', 'missing')])];
  const c = surfaceCell(reported, lab, web, REF01);
  assert.deepEqual([c.status, c.finding, c.date], ['reported', 'missing', '2026-02-01']);
});

test('cell: verified locations take precedence over older reported ones', () => {
  const results = [
    run('2026-01-01', 'reported', 'web', [r('*', 'missing')]),
    run('2026-02-01', 'manual', 'web', [r('inline-citation', 'works')]),
  ];
  assert.equal(surfaceCell(results, lab, web, REF01).status, 'works');
});

test('cell: untested and n/a', () => {
  assert.equal(surfaceCell([], lab, web, REF01).status, 'untested');
  assert.equal(surfaceCell([], lab, app, REF03).status, 'n/a');
});

test('lab cell uses the newest lab-wide result', () => {
  const UTM03 = { id: 'UTM-03', scope: 'lab', applies_to: 'all' };
  const results = [run('2026-02-01', 'reported', '*', [r('*', 'works', 'UTM-03')])];
  assert.equal(labCell(results, lab, UTM03).status, 'reported');
});
