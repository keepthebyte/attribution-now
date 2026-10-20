// Resolves the current status of every lab × surface × location × test cell from data/results.
//
// Rule (SPEC §4): most recent result by date wins; on the same date a verified method
// (manual/automated/community) beats `reported`; then an exact surface/location beats a `*`.

export const isVerified = (method) => method !== 'reported';

function candidates(results, labId, test) {
  const out = [];
  results.forEach((run) => {
    if (run.lab !== labId) return;
    run.results.forEach((entry) => {
      if (entry.test !== test) return;
      out.push({
        ...entry,
        date: run.date,
        method: run.method,
        surface: run.surface,
        tester: run.tester,
        client: run.client,
        source_url: run.source_url,
        file: run.file,
      });
    });
  });
  return out;
}

function compare(a, b) {
  if (a.date !== b.date) return a.date < b.date ? 1 : -1;
  const va = isVerified(a.method) ? 1 : 0;
  const vb = isVerified(b.method) ? 1 : 0;
  if (va !== vb) return vb - va;
  const sa = (a.surface !== '*') + (a.location !== '*');
  const sb = (b.surface !== '*') + (b.location !== '*');
  return sb - sa;
}

/** Most relevant result for one lab × surface × location × test, or null. */
export function resolveLocation(results, labId, surfaceId, location, test) {
  const list = candidates(results, labId, test)
    .filter((c) => (c.surface === surfaceId || c.surface === '*')
      && (c.location === location || c.location === '*'));
  list.sort(compare);
  return list[0] || null;
}

/** works / missing / partial from a list of statuses (n/a ignored). */
export function aggregate(statuses) {
  const known = statuses.filter((s) => s !== 'n/a');
  if (!known.length) return 'n/a';
  if (known.every((s) => s === 'works')) return 'works';
  if (known.every((s) => s === 'missing')) return 'missing';
  return 'partial';
}

function summarize(winners) {
  const verified = winners.filter((w) => isVerified(w.method));
  const pool = verified.length ? verified : winners;
  if (!pool.length) return { status: 'untested', finding: null, date: null };
  const finding = aggregate(pool.map((w) => w.status));
  const status = verified.length || finding === 'n/a' ? finding : 'reported';
  const date = pool.map((w) => w.date).sort().pop();
  return { status, finding, date };
}

/**
 * Cell for one surface × test. `locations` lists every link location with its winning result
 * (null when untested), so pages can show per-location evidence.
 */
export function surfaceCell(results, lab, surface, test) {
  if (test.applies_to === 'web' && surface.platform === 'native') {
    return {
      status: 'n/a', finding: 'n/a', date: null, locations: [],
    };
  }
  const locations = surface.link_locations.map((location) => ({
    location,
    result: resolveLocation(results, lab.id, surface.id, location, test.id),
  }));
  const winners = locations.map((l) => l.result).filter(Boolean);
  return { ...summarize(winners), locations };
}

/** Cell for a lab-wide test (scope: lab): the newest result for the test on any surface. */
export function labCell(results, lab, test) {
  const list = candidates(results, lab.id, test.id).sort(compare);
  const winner = list[0] || null;
  return { ...summarize(winner ? [winner] : []), result: winner };
}

/** Newest result date for a lab, overall and verified-only. */
export function labDates(results, labId) {
  const runs = results.filter((r) => r.lab === labId);
  const max = (list) => list.map((r) => r.date).sort().pop() || null;
  return {
    lastChecked: max(runs),
    lastVerified: max(runs.filter((r) => isVerified(r.method))),
  };
}

/** Newest result run touching a work item's tests and surfaces. */
export function latestRunFor(results, lab, item) {
  const runs = results
    .filter((r) => r.lab === lab.id)
    .filter((r) => r.surface === '*' || item.surfaces.includes(r.surface))
    .filter((r) => r.results.some((e) => item.tests.includes(e.test)));
  runs.sort((a, b) => compare({ ...a, location: '*' }, { ...b, location: '*' }));
  return runs[0] || null;
}
