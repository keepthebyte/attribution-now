import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import YAML from 'yaml';

const readYaml = (file) => YAML.parse(readFileSync(file, 'utf8'));

/** Loads everything under data/ into one object. Dates stay ISO strings. */
export function loadData(root) {
  const dir = join(root, 'data');
  const { tests } = readYaml(join(dir, 'tests.yaml'));
  const { locations } = readYaml(join(dir, 'locations.yaml'));
  const { entries: changelog } = readYaml(join(dir, 'changelog.yaml'));
  const labs = readdirSync(join(dir, 'labs'))
    .filter((f) => f.endsWith('.yaml'))
    .sort()
    .map((f) => ({ ...readYaml(join(dir, 'labs', f)), file: `data/labs/${f}` }));
  const results = readdirSync(join(dir, 'results'))
    .filter((f) => f.endsWith('.yaml'))
    .sort()
    .map((f) => ({ ...readYaml(join(dir, 'results', f)), file: `data/results/${f}` }));
  return {
    tests, locations, labs, results, changelog,
  };
}
