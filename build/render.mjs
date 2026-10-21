// Renders data/ + content/ into EDS-compatible semantic HTML (one file per path) in dist/.
// The output is what the BYOM content source serves: sections are <div>s in <main>,
// blocks are <div class="name"> with rows of cells (https://www.aem.live/developer/byom).
//
//   node build/render.mjs           render every page
//   node build/render.mjs --byom    skip paths authored in SourceBus (build/config.json)
import {
  createHash,
} from 'node:crypto';
import {
  mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync,
} from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { marked } from 'marked';
import YAML from 'yaml';
import { loadData } from '../lib/data.mjs';
import {
  aggregate, labCell, labDates, surfaceCell,
} from '../lib/status.mjs';
import { PROMPTS, renderPrompts } from '../lib/prompts.mjs';
import { addAttribution } from '../lib/attribution.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const config = JSON.parse(readFileSync(join(root, 'build', 'config.json'), 'utf8'));
const out = join(root, 'dist');
const byomOnly = process.argv.includes('--byom');
const data = loadData(root);
const { site } = config;
const repoUrl = `https://github.com/${config.aem.org}/${config.aem.site}`;

// ---------- HTML helpers ----------

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const md = (s) => marked.parseInline(String(s ?? '').trim());
const p = (html) => `<p>${html}</p>`;
const a = (href, text) => `<a href="${esc(href)}">${text}</a>`;
const cell = (html) => `<div>${html}</div>`;
const row = (...cells) => `<div>${cells.map(cell).join('')}</div>`;
const block = (name, rows) => `<div class="${name}">${rows.join('')}</div>`;
const section = (...parts) => `<div>${parts.join('\n')}</div>`;

function metadata(meta) {
  const rows = Object.entries(meta)
    .filter(([, v]) => v)
    .map(([k, v]) => row(esc(k), esc(v)));
  return block('metadata', rows);
}

function page({
  title, description, robots, template,
}, sections) {
  const meta = metadata({
    Title: title, Description: description, Robots: robots, Template: template,
  });
  const body = [...sections];
  body[body.length - 1] = body[body.length - 1].replace(/<\/div>$/, `${meta}</div>`);
  return `<!DOCTYPE html>
<html>
<head>
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">${robots ? `
<meta name="robots" content="${esc(robots)}">` : ''}${template ? `
<meta name="template" content="${esc(template)}">` : ''}
</head>
<body>
<header></header>
<main>
${body.join('\n')}
</main>
<footer></footer>
</body>
</html>
`;
}

const STATUS_LABEL = {
  works: 'Works', partial: 'Partial', missing: 'Missing', reported: 'Reported', untested: 'Untested', 'n/a': 'n/a',
};
const METHOD_LABEL = {
  manual: 'Verified (manual)', automated: 'Verified (automated)', community: 'Verified (community)', reported: 'Reported',
};
// EDS derives heading ids from heading text; link to the same slug.
const slug = (text) => text.toLowerCase().replace(/<[^>]+>/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const testHeading = (t) => `${t.id}: ${t.name}`;
const testAnchor = (id) => `/tests#${slug(testHeading(data.tests.find((t) => t.id === id)))}`;
const labById = (id) => data.labs.find((l) => l.id === id);
const locationName = (id) => (id === '*' ? 'All link locations' : data.locations.find((l) => l.id === id)?.name || id);

// ---------- Generated blocks ----------

function evidenceLine(r) {
  const parts = [STATUS_LABEL[r.status], r.date, METHOD_LABEL[r.method]];
  if (r.client) parts.push(esc(r.client));
  const ev = r.evidence || {};
  const extra = [];
  if (ev.referer !== undefined) extra.push(`Referer: <code>${esc(ev.referer ?? '(none)')}</code>`);
  if (ev.document_referrer !== undefined) extra.push(`document.referrer: <code>${esc(ev.document_referrer ?? '(none)')}</code>`);
  if (ev.landing_url) extra.push(`Landing URL: <code>${esc(ev.landing_url)}</code>`);
  if (ev.notes) extra.push(md(ev.notes));
  if (r.source_url) extra.push(a(r.source_url, 'Source'));
  extra.push(a(`${repoUrl}/blob/main/${r.file}`, 'Data'));
  return `${parts.join(' · ')}. ${extra.join(' ')}`;
}

/** Status cell: first paragraph is the chip label, the list holds the per-location evidence. */
function statusCellHtml(c, locations) {
  let label = STATUS_LABEL[c.status];
  if (c.status === 'reported' && c.finding) label = `Reported: ${STATUS_LABEL[c.finding].toLowerCase()}`;
  const head = p(c.date ? `${label} <em>(${c.date})</em>` : label);
  if (!locations?.length) return head;
  // group locations that share the same winning result (e.g. a "*" report)
  const groups = [];
  locations.forEach(({ location, result }) => {
    const key = result ? `${result.file}|${result.location}` : null;
    const g = groups.find((x) => x.key === key);
    if (g) g.locations.push(location);
    else groups.push({ key, result, locations: [location] });
  });
  const items = groups.map(({ result, locations: locs }) => {
    const names = result?.location === '*' && locs.length === locations.length
      ? 'All link locations'
      : locs.map(locationName).join(', ');
    return `<li><strong>${esc(names)}</strong>: ${result ? evidenceLine(result) : 'Untested.'}</li>`;
  });
  return `${head}<ul>${items.join('')}</ul>`;
}

function statusTables(lab) {
  const perLocation = data.tests.filter((t) => t.scope === 'location');
  const labWide = data.tests.filter((t) => t.scope === 'lab');
  const header = row('Test', ...lab.surfaces.map((s) => esc(s.name)));
  const testLabel = (t) => p(a(testAnchor(t.id), `<strong>${t.id}</strong> ${esc(t.name)}`));
  const rows = perLocation.map((t) => row(
    testLabel(t),
    ...lab.surfaces.map((s) => {
      const c = surfaceCell(data.results, lab, s, t);
      return statusCellHtml(c, c.locations);
    }),
  ));
  const labRows = labWide.map((t) => {
    const c = labCell(data.results, lab, t);
    return row(testLabel(t), statusCellHtml(c, c.result ? [{ location: '*', result: c.result }] : []));
  });
  return [
    block('status-table', [header, ...rows]),
    '<h3>Lab-wide</h3>',
    block('status-table lab', [row('Test', 'All surfaces'), ...labRows]),
  ];
}

function workItemBlock(lab, item) {
  const surfaces = lab.surfaces.filter((s) => item.surfaces.includes(s.id)).map((s) => s.name);
  const prompts = renderPrompts(root, data, lab, item, site);
  const rows = [
    row('Title', `<h3>${esc(item.title)}</h3>`),
    row('Surfaces', p(esc(surfaces.join(', ')))),
    row('Tests', p(item.tests.map((t) => a(testAnchor(t), t)).join(', '))),
    row('Summary', p(md(item.summary))),
    row('Suggested fix', p(md(item.suggested_fix))),
    ...PROMPTS.map(({ id, label }) => row(esc(label), `<pre><code>${esc(prompts[id])}</code></pre>`)),
  ];
  return block('work-item', rows);
}

const CHANGE_TYPES = { shipped: 'Fix shipped', change: 'Change', site: 'Site update' };

function changelogBlock(entries) {
  const sorted = [...entries].sort((x, y) => (x.date < y.date ? 1 : -1));
  return block('changelog', sorted.map((e) => {
    const lab = e.lab ? labById(e.lab) : null;
    const tag = e.verified ? 'Verified' : 'Reported';
    const body = [
      `<h2>${esc(e.title)}</h2>`,
      p(md(e.text)),
      e.thank_you ? p(`<strong>${esc(e.thank_you)}</strong>`) : '',
      p(`${tag}${e.source_url ? ` · ${a(e.source_url, 'Source')}` : ''}`),
    ].join('');
    const labCell = p(lab ? a(`/labs/${lab.id}`, esc(lab.name)) : 'attribution.now');
    return row(p(e.date), labCell, body, p(CHANGE_TYPES[e.type] || ''));
  }));
}

function labTilesBlock() {
  return block('lab-tiles', data.labs.map((lab) => {
    const open = lab.work_items.filter((w) => ['open', 'in-progress'].includes(w.status)).length;
    const { lastChecked } = labDates(data.results, lab.id);
    return row(
      `<h3>${a(`/labs/${lab.id}`, esc(lab.name))}</h3>${p(esc(lab.company))}`,
      p(md(lab.what_works)),
      p(`<strong>${open}</strong> next improvement${open === 1 ? '' : 's'}`) + (lastChecked ? p(`Last checked ${lastChecked}`) : ''),
    );
  }));
}

// Scorecard columns group surfaces by surface id; surfaces not listed (e.g. Workspace, Chrome) stay on lab pages.
const SCORECARD_GROUPS = [
  { name: 'Web', surfaces: ['web', 'web-desktop'] },
  { name: 'Mobile apps', surfaces: ['ios', 'android'] },
  { name: 'Desktop apps', surfaces: ['macos', 'windows'] },
];
const SCORECARD_SIGNALS = [{ name: 'Referrer', test: 'REF-01' }, { name: 'UTM', test: 'UTM-01' }];
// Lab-page status rows get these ids (blocks/status-table), so the scorecard can link to them.
const statusAnchor = (lab, testId) => `/labs/${lab.id}#status-${testId.toLowerCase()}`;

/** One status for a group of surface cells: verified results win, otherwise reported findings. */
function groupStatus(cells) {
  const verified = cells.filter((c) => !['reported', 'untested', 'n/a'].includes(c.status));
  if (verified.length) return { status: aggregate(verified.map((c) => c.status)), reported: false };
  const reported = cells.filter((c) => c.status === 'reported');
  if (reported.length) return { status: aggregate(reported.map((c) => c.finding)), reported: true };
  return { status: 'untested', reported: false };
}

function scorecard() {
  const tests = Object.fromEntries(data.tests.map((t) => [t.id, t]));
  const both = [];
  const rows = data.labs.map((lab) => {
    const cells = SCORECARD_GROUPS.map((g) => {
      const surfaces = lab.surfaces.filter((s) => g.surfaces.includes(s.id));
      if (!surfaces.length) return p('n/a');
      const signals = SCORECARD_SIGNALS.map((sig) => ({
        ...sig,
        ...groupStatus(surfaces.map((s) => surfaceCell(data.results, lab, s, tests[sig.test]))),
      }));
      if (signals.every((sig) => sig.status === 'works' && !sig.reported)) both.push(`${lab.name} (${g.name})`);
      return signals.map((sig) => p(a(
        statusAnchor(lab, sig.test),
        `${sig.name}: ${sig.reported ? `Reported ${STATUS_LABEL[sig.status].toLowerCase()}` : STATUS_LABEL[sig.status]}`,
      ))).join('');
    });
    const documented = lab.documented_utm
      ? p(a(statusAnchor(lab, 'UTM-03'), `Yes: <code>${esc(lab.documented_utm)}</code>`))
      : p(a(statusAnchor(lab, 'UTM-03'), 'No'));
    return row(`<h3>${a(`/labs/${lab.id}`, esc(lab.name))}</h3>${p(esc(lab.company))}`, ...cells, documented);
  });
  const takeaway = both.length
    ? `Both signals arrive verified from ${both.join(', ')}.`
    : 'No assistant sends both signals yet, on any surface we have tested.';
  // single-cell rows before and after the table: the takeaway (the section heading, #scorecard) and the legend
  return block('scorecard', [
    row(`<h2 id="scorecard">${esc(takeaway)}</h2>${p('What arrives with a visit when someone clicks a link in each assistant: the assistant as the referrer, and a UTM tag.')}`),
    row('Assistant', ...SCORECARD_GROUPS.map((g) => g.name), 'Documented UTM'),
    ...rows,
    row(p(`<strong>Reported</strong> means a third-party report we have not yet verified first-hand. Select a status to see the evidence on the lab page, or see ${a('/tests', 'how we test')}.`)),
  ]);
}

function testCatalog() {
  return data.tests.map((t) => [
    `<h3 id="${slug(testHeading(t))}">${esc(testHeading(t))}</h3>`,
    p(`<strong>Pass criteria:</strong> ${md(t.pass_criteria)}`),
    p(md(t.explainer)),
    p(`Scope: ${t.scope === 'lab' ? 'once per lab' : 'per surface and link location'}${t.applies_to === 'web' ? ', web surfaces only' : ''}. Target: ${a(t.target.split('#')[0], `<code>${esc(t.target)}</code>`)}`),
  ].join('\n')).join('\n');
}

function testVectors() {
  const { source, vectors } = JSON.parse(readFileSync(join(root, 'lib', 'vectors.json'), 'utf8'));
  const items = vectors.map((v) => {
    const actual = addAttribution(v.input, source, v.medium);
    if (actual !== v.expected) throw new Error(`vector "${v.name}" fails: ${actual}`);
    return `<li><strong>${v.test}</strong> ${esc(v.name)}${v.medium ? ` (medium <code>${esc(v.medium)}</code>)` : ''}<br>in: <code>${esc(v.input)}</code><br>out: <code>${esc(v.expected)}</code></li>`;
  });
  return [
    p(`Source value <code>${esc(source)}</code>. Machine-readable: ${a(`${repoUrl}/blob/main/lib/vectors.json`, 'lib/vectors.json')}.`),
    `<ul>${items.join('')}</ul>`,
  ].join('\n');
}

// The homepage is authored in SourceBus, so its lab tiles come from a generated fragment that CI keeps current.
const LAB_STATUS_FRAGMENT = '/fragments/lab-status';
const SCORECARD_FRAGMENT = '/fragments/scorecard';

const GENERATED = {
  'lab-tiles': labTilesBlock,
  'lab-status-fragment': () => block('fragment', [row(p(a(LAB_STATUS_FRAGMENT, LAB_STATUS_FRAGMENT)))]),
  scorecard,
  'scorecard-fragment': () => block('fragment', [row(p(a(SCORECARD_FRAGMENT, SCORECARD_FRAGMENT)))]),
  'test-catalog': testCatalog,
  'test-vectors': testVectors,
  changelog: () => changelogBlock(data.changelog),
};

// ---------- Pages ----------

/** content/*.md: YAML front matter, `---` between sections, `{{block:name}}` lines for generated blocks. */
function renderMarkdown(file) {
  const src = readFileSync(join(root, 'content', file), 'utf8');
  const fm = src.match(/^---\n([\s\S]*?)\n---\n/);
  const meta = fm ? YAML.parse(fm[1]) : {};
  const body = fm ? src.slice(fm[0].length) : src;
  const sections = [];
  let current = [];
  let fence = false;
  body.split('\n').forEach((line) => {
    if (/^```/.test(line)) fence = !fence;
    if (!fence && line.trim() === '---') {
      sections.push(current.join('\n'));
      current = [];
    } else current.push(line);
  });
  sections.push(current.join('\n'));
  const html = sections.map((s) => section(marked.parse(s).replace(/<p>\{\{block:([a-z-]+)\}\}<\/p>/g, (m, name) => {
    if (!GENERATED[name]) throw new Error(`${file}: unknown block ${name}`);
    return GENERATED[name]();
  })));
  return page(meta, html);
}

function labPage(lab) {
  const { lastChecked, lastVerified } = labDates(data.results, lab.id);
  const open = lab.work_items.filter((w) => ['open', 'in-progress'].includes(w.status));
  const shipped = lab.work_items.filter((w) => w.status === 'shipped');
  const thanks = data.changelog.filter((e) => e.lab === lab.id && e.type === 'shipped');
  const reviewUrl = `${repoUrl}/issues/new?template=lab-review.yml&labels=lab-review&title=${encodeURIComponent(`Review request: ${lab.name}`)}`;
  const sections = [
    section(
      `<h1>${esc(lab.name)}</h1>`,
      p(`By ${esc(lab.company)}. ${lab.documented_utm ? `Documented UTM: <code>utm_source=${esc(lab.documented_utm)}</code>${lab.docs_url ? ` (${a(lab.docs_url, 'docs')})` : ''}.` : 'No UTM value documented yet.'}`),
      '<h2>What works today</h2>',
      p(md(lab.what_works)),
      lab.evidence_widget ? p(a(lab.evidence_widget, lab.evidence_widget)) : '',
      p(`<em>As of ${lab.what_works_date}.</em>`),
    ),
    section(
      '<h2>Status</h2>',
      p('Rows are tests, columns are surfaces. Select a cell to see each link location, the date, the method and the evidence. <strong>Reported</strong> means a third-party report we have not yet verified first-hand. '
        + `See ${a('/tests', 'how we test')}.`),
      ...statusTables(lab),
    ),
    section(
      '<h2>Next improvements</h2>',
      open.length
        ? p('Each card has two prompts you can paste: one for a coding assistant working in your codebase, one to file a ticket.')
        : p('No open improvements. Thank you.'),
      ...open.map((item) => workItemBlock(lab, item)),
    ),
    section(
      '<h2>Shipped</h2>',
      shipped.length || thanks.length
        ? `<ul>${[
          ...shipped.map((w) => `<li><strong>${w.shipped_date}</strong>: ${esc(w.title)}. ${esc(w.thank_you)}</li>`),
          ...thanks.map((e) => `<li><strong>${e.date}</strong>: ${esc(e.title)}. ${esc(e.thank_you)}${e.verified ? '' : ' <em>(Reported)</em>'}</li>`),
        ].join('')}</ul>`
        : p('Nothing recorded yet.'),
      p(`Full history on the ${a('/changelog', 'changelog')}.`),
    ),
    section(
      p(`<strong>Last verified:</strong> ${lastVerified || 'not yet verified first-hand'}${lastChecked ? `. Last checked: ${lastChecked}` : ''}.`),
      p(`Work on ${esc(lab.name)} and see something out of date? ${a(reviewUrl, 'Request a review')} and we will update the entry.`),
    ),
  ];
  return page({
    title: `${lab.name} link attribution: referrer and UTM status`,
    description: `For ${lab.company} teams and analysts: ${lab.seo_summary}`,
  }, sections);
}

function echoBlock() {
  return block('test-echo', [row(p('What this page received'))]);
}

function targetPage(test) {
  const path = `/t/${test.id.toLowerCase()}`;
  const variant = test.target !== path ? test.target : null;
  return page({
    title: `${test.id}: ${test.name}`,
    description: test.explainer.trim().split('. ')[0],
    robots: 'noindex',
  }, [section(
    `<h1>${test.id}: ${esc(test.name)}</h1>`,
    p(md(test.explainer)),
    '<h2>Pass criteria</h2>',
    p(md(test.pass_criteria)),
    '<h2>How to test</h2>',
    `<ol><li>Ask the assistant to cite or link this page${variant ? `, using the exact URL <code>${esc(site + test.target)}</code>` : ''}.</li><li>Open the link from the answer.</li><li>Compare what arrived (below) with the pass criteria.</li></ol>`,
    p(`For a unique, self-identifying link use <code>${esc(`${site}${path}/<lab>/<surface>/<location>`)}</code>, e.g. <code>${esc(`${site}${path}/anthropic-claude/web/inline-citation`)}</code>.`),
    echoBlock(),
    p(`About this test: ${a(testAnchor(test.id), 'test catalog')}.`),
  )]);
}

function checkPage() {
  return page({
    title: 'Check what a link sent',
    description: 'Open this page from an AI assistant to see the referrer, UTM, query and fragment that arrived.',
    robots: 'noindex',
  }, [section(
    '<h1>Check what a link sent</h1>',
    p('Open this page from a link in an AI assistant. It shows what arrived with the visit: the <code>Referer</code> header the server received, <code>document.referrer</code>, the query string and the fragment.'),
    p('Visits are logged for research without IP addresses. See '
      + `${a('/contribute', 'how to contribute')} a result.`),
    echoBlock(),
  )]);
}

// nav, footer and fragments are pieces of other pages: keep them out of search and the sitemap
const PARTIAL_ROBOTS = '<meta name="robots" content="noindex">';

function nav() {
  return `<!DOCTYPE html><html><head><title>Navigation</title>${PARTIAL_ROBOTS}</head><body><main>
${section(p(a('/', 'attribution.now')))}
${section(`<ul>${[
    ['/why', 'Why'], ['/best-practices', 'Best practices'],
    ...data.labs.map((l) => [`/labs/${l.id}`, esc(l.name)]),
    ['/tests', 'Tests'], ['/changelog', 'Changelog'],
  ].map(([href, text]) => `<li>${a(href, text)}</li>`).join('')}</ul>`)}
${section(p(a('/t/check', 'Check a link')))}
</main></body></html>
`;
}

function labStatusFragment() {
  return `<!DOCTYPE html><html><head><title>Lab status</title>${PARTIAL_ROBOTS}</head><body><main>
${section(labTilesBlock())}
</main></body></html>
`;
}

function scorecardFragment() {
  return `<!DOCTYPE html><html><head><title>Scorecard</title>${PARTIAL_ROBOTS}</head><body><main>
${section(scorecard())}
</main></body></html>
`;
}

function footer() {
  return `<!DOCTYPE html><html><head><title>Footer</title>${PARTIAL_ROBOTS}</head><body><main>
${section(
    p(`A side project by ${a('https://www.linkedin.com/in/cedrichuesler/', 'Cedric Huesler')}, running on ${a('https://www.aem.live/', 'Adobe Experience Manager')}, with traffic data from ${a('https://business.adobe.com/products/brand-visibility.html', 'Adobe Brand Visibility')}.`),
    p(`${a('/contribute', 'Contribute')} · ${a(repoUrl, 'GitHub')} · Code, content and data under the ${a(`${repoUrl}/blob/main/LICENSE`, 'Apache License 2.0')}.`),
  )}
</main></body></html>
`;
}

// ---------- Write ----------

const pages = new Map();
readdirSync(join(root, 'content')).filter((f) => f.endsWith('.md')).forEach((f) => {
  const name = f.replace(/\.md$/, '');
  pages.set(name === 'index' ? '/' : `/${name}`, () => renderMarkdown(f));
});
pages.set('/changelog', () => page({
  title: 'AI assistant link attribution changelog',
  template: 'guide',
  description: 'For analysts and AI lab teams: dated changes in how ChatGPT, Gemini and Claude tag and refer links, like Gemini\'s 11 days of UTM tags and ChatGPT\'s tag bug.',
}, [section(
  '<h1>Changelog</h1>',
  p('Dated changes to link attribution, newest first. Shipped improvements come with a thank-you. <strong>Reported</strong> entries come from third parties and are not yet verified by us.'),
  changelogBlock(data.changelog),
)]));
data.labs.forEach((lab) => pages.set(`/labs/${lab.id}`, () => labPage(lab)));
pages.set('/t/check', checkPage);
data.tests.forEach((t) => pages.set(`/t/${t.id.toLowerCase()}`, () => targetPage(t)));
pages.set('/nav', nav);
pages.set('/footer', footer);
pages.set(LAB_STATUS_FRAGMENT, labStatusFragment);
pages.set(SCORECARD_FRAGMENT, scorecardFragment);

const authored = new Set(config.byom.authored_paths);

/**
 * BYOM pages carry their metadata as <meta> tags in <head>; the pipeline reads a metadata
 * block too but leaves it in the body. Only pages pushed to SourceBus keep the block,
 * because SourceBus stores <main> alone.
 */
const METADATA_BLOCK = /<div class="metadata">(?:<div><div>[^<]*<\/div><div>[^<]*<\/div><\/div>)*<\/div>/;
const stripMetadata = (html) => html.replace(METADATA_BLOCK, '');
rmSync(out, { recursive: true, force: true });
const manifest = {};
pages.forEach((render, path) => {
  if (byomOnly && authored.has(path)) return;
  const html = authored.has(path) ? render() : stripMetadata(render());
  const file = join(out, `${path === '/' ? '/index' : path}.html`);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
  manifest[path] = createHash('sha256').update(html).digest('hex').slice(0, 16);
});
writeFileSync(join(out, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`✓ rendered ${Object.keys(manifest).length} pages to dist/${byomOnly ? ' (BYOM: authored paths skipped)' : ''}`);
