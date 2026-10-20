import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { renderTemplate } from './template.mjs';
import { latestRunFor } from './status.mjs';

export const PROMPTS = [
  { id: 'fix-in-harness', label: 'Copy prompt: fix in your coding harness' },
  { id: 'file-a-ticket', label: 'Copy prompt: file a ticket' },
];

const METHOD_TEXT = {
  manual: 'manual test',
  automated: 'automated test',
  community: 'community test',
  reported: 'third-party report, not yet verified by attribution.now',
};

function utmFor(lab, item) {
  if (lab.documented_utm) return { value: lab.documented_utm, note: ' (the documented value)' };
  const observed = lab.surfaces
    .filter((s) => item.surfaces.includes(s.id) && s.observed_utm)
    .map((s) => s.observed_utm);
  const value = lab.observed_utm || observed[0];
  if (value) return { value, note: ' (the value already seen on links; publish it so sites can rely on it)' };
  return {
    value: lab.suggested_utm || lab.id.split('-').pop(),
    note: ' (a suggested value; choose one stable value and publish it)',
  };
}

const unique = (list) => [...new Set(list)];

/** Placeholder values for one work item (SPEC §9). */
export function promptContext(data, lab, item, site) {
  const surfaces = lab.surfaces.filter((s) => item.surfaces.includes(s.id));
  const locationIds = item.link_locations?.length
    ? item.link_locations
    : unique(surfaces.flatMap((s) => s.link_locations));
  const locationName = (id) => {
    const name = data.locations.find((l) => l.id === id)?.name || id;
    return name[0].toLowerCase() + name.slice(1);
  };
  const run = latestRunFor(data.results, lab, item);
  const utm = utmFor(lab, item);
  return {
    site,
    lab_id: lab.id,
    lab_name: lab.name,
    surface_names: surfaces.map((s) => s.name).join(', '),
    link_locations: locationIds.map(locationName).join('; '),
    last_verified: run ? run.date : 'no test data yet',
    method: run ? METHOD_TEXT[run.method] : 'untested',
    gap_summary: item.summary.trim(),
    work_item_title: item.title,
    documented_utm_or_suggested: utm.value,
    utm_note: utm.note,
    tests: item.tests.map((id) => {
      const test = data.tests.find((t) => t.id === id);
      return {
        test_id: id,
        pass_criteria: test.pass_criteria.replace('<documented value>', utm.value),
      };
    }),
  };
}

/** { 'fix-in-harness': text, 'file-a-ticket': text } for a work item. */
export function renderPrompts(root, data, lab, item, site) {
  const ctx = promptContext(data, lab, item, site);
  return Object.fromEntries(PROMPTS.map(({ id }) => {
    const template = readFileSync(join(root, 'prompts', 'templates', `${id}.md`), 'utf8');
    return [id, renderTemplate(template, ctx, `${id} for ${item.id}`).trim()];
  }));
}
