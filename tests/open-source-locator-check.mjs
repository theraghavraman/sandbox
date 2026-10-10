import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

const page = await readFile(new URL('../open-source-locator.html', import.meta.url), 'utf8');
const index = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const readme = await readFile(new URL('../README.md', import.meta.url), 'utf8');

for (const marker of [
  'https://api.github.com/search/repositories',
  'https://huggingface.co/api/',
  'https://zenodo.org/api/records',
  'https://api.openalex.org/works',
  'Official website',
  'Source repository',
  'Documentation & tutorials',
  'Downloads, releases & packages',
  'Licence & contribution guidelines',
  'data-category="datasets"',
  'data-category="models"',
  'data-category="research"',
  'data-category="hardware"',
  'data-category="fonts"',
  'Provenance:',
  'URL sourced',
  'rel="noopener noreferrer"',
  'function safeUrl',
  'id="searchBtn"'
]) assert.ok(page.includes(marker), 'Missing expected studio feature: ' + marker);

assert.ok(index.includes('href="open-source-locator.html"'), 'Studio missing from main navigation');
assert.ok(index.includes('22 DESTINATIONS'), 'Main navigation destination count not updated');
assert.ok(readme.includes('22 independent destinations'), 'README destination count not updated');
assert.ok(readme.includes('Open Source Locator Studio'), 'README does not document the studio');
assert.ok(page.includes('const esc='), 'Dynamic HTML escaping helper missing');
assert.ok(page.includes("['https:','http:'].includes(u.protocol)"), 'External link protocol allowlist missing');

console.log('Open Source Locator integrity checks passed.');
console.log('Checked four source integrations, six URL/provenance safeguards, eight category/section/navigation markers.');
