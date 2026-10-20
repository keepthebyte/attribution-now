// Schema-checks every YAML file under data/ and cross-checks IDs, then renders every
// prompt for every work item to catch unfilled placeholders. Exit code 1 on any error.
import { readFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { loadData } from '../lib/data.mjs';
import { renderPrompts } from '../lib/prompts.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const config = JSON.parse(readFileSync(join(root, 'build', 'config.json'), 'utf8'));
const errors = [];
const fail = (file, msg) => errors.push(`${file}: ${msg}`);

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);
const schema = (name) => ajv.compile(JSON.parse(readFileSync(join(root, 'data', 'schemas', `${name}.schema.json`), 'utf8')));
const check = (validate, doc, file) => {
  const { file: omit, ...plain } = doc;
  if (!validate(plain)) {
    validate.errors.forEach((e) => fail(file, `${e.instancePath || '/'} ${e.message}`));
  }
};

let data;
try {
  data = loadData(root);
} catch (e) {
  console.error(`YAML parse error: ${e.message}`);
  process.exit(1);
}

check(schema('tests'), { tests: data.tests }, 'data/tests.yaml');
check(schema('locations'), { locations: data.locations }, 'data/locations.yaml');
check(schema('changelog'), { entries: data.changelog }, 'data/changelog.yaml');
const labSchema = schema('lab');
const resultSchema = schema('result');
data.labs.forEach((lab) => check(labSchema, lab, lab.file));
data.results.forEach((run) => check(resultSchema, run, run.file));

const testIds = new Set(data.tests.map((t) => t.id));
const locationIds = new Set(data.locations.map((l) => l.id));
const labsById = new Map(data.labs.map((l) => [l.id, l]));

const dupes = (list) => list.filter((x, i) => list.indexOf(x) !== i);
dupes(data.tests.map((t) => t.id)).forEach((id) => fail('data/tests.yaml', `duplicate test ${id}`));

data.labs.forEach((lab) => {
  if (basename(lab.file, '.yaml') !== lab.id) fail(lab.file, `file name must be ${lab.id}.yaml`);
  dupes(lab.surfaces.map((s) => s.id)).forEach((id) => fail(lab.file, `duplicate surface ${id}`));
  const surfaceIds = new Set(lab.surfaces.map((s) => s.id));
  lab.surfaces.forEach((s) => s.link_locations
    .filter((l) => !locationIds.has(l))
    .forEach((l) => fail(lab.file, `surface ${s.id}: unknown link location ${l}`)));
  lab.work_items.forEach((item) => {
    item.tests.filter((t) => !testIds.has(t)).forEach((t) => fail(lab.file, `${item.id}: unknown test ${t}`));
    item.surfaces.filter((s) => !surfaceIds.has(s)).forEach((s) => fail(lab.file, `${item.id}: unknown surface ${s}`));
    (item.link_locations || []).filter((l) => !locationIds.has(l)).forEach((l) => fail(lab.file, `${item.id}: unknown link location ${l}`));
  });
});
dupes(data.labs.flatMap((l) => l.work_items.map((w) => w.id))).forEach((id) => fail('data/labs', `duplicate work item ${id}`));

data.results.forEach((run) => {
  const name = basename(run.file);
  if (!/^\d{4}-\d{2}-\d{2}-[a-z0-9-]+-(manual|automated|community|reported)\.yaml$/.test(name)) {
    fail(run.file, 'file name must be <date>-<lab>-<surface>-<method>.yaml');
  }
  if (!name.startsWith(`${run.date}-`)) fail(run.file, `file name must start with its date ${run.date}`);
  if (!name.endsWith(`-${run.method}.yaml`)) fail(run.file, `file name must end with -${run.method}.yaml`);
  const lab = labsById.get(run.lab);
  if (!lab) {
    fail(run.file, `unknown lab ${run.lab}`);
    return;
  }
  const surface = lab.surfaces.find((s) => s.id === run.surface);
  if (run.surface !== '*' && !surface) fail(run.file, `unknown surface ${run.surface} for ${run.lab}`);
  (run.results || []).forEach((entry, i) => {
    const where = `results[${i}]`;
    const test = data.tests.find((t) => t.id === entry.test);
    if (!test) {
      fail(run.file, `${where}: unknown test ${entry.test}`);
      return;
    }
    if (run.surface === '*' && test.scope !== 'lab') fail(run.file, `${where}: ${test.id} is tested per surface; set a surface`);
    if (entry.location !== '*') {
      if (!locationIds.has(entry.location)) fail(run.file, `${where}: unknown link location ${entry.location}`);
      else if (surface && !surface.link_locations.includes(entry.location)) {
        fail(run.file, `${where}: ${entry.location} is not listed for ${lab.id}/${surface.id}`);
      }
    }
  });
});

data.changelog.forEach((entry, i) => {
  if (entry.lab && !labsById.has(entry.lab)) fail('data/changelog.yaml', `entries[${i}]: unknown lab ${entry.lab}`);
});

let prompts = 0;
if (!errors.length) {
  data.labs.forEach((lab) => lab.work_items.forEach((item) => {
    try {
      renderPrompts(root, data, lab, item, config.site);
      prompts += 2;
    } catch (e) {
      fail(lab.file, e.message);
    }
  }));
}

if (errors.length) {
  console.error(errors.map((e) => `✗ ${e}`).join('\n'));
  console.error(`\n${errors.length} error(s)`);
  process.exit(1);
}
console.log(`✓ ${data.tests.length} tests, ${data.labs.length} labs, ${data.results.length} result files, ${data.changelog.length} changelog entries, ${prompts} prompts`);
