#!/usr/bin/env node
// Before the site is built: a version that a page says is the one that is
// released. A page that says another stops the build, on the machine it
// was written on and in the deploy, instead of being served.
//
// Each plugin's page ends with `## Version` and the version it describes.
// That line is written by hand, when the page is brought up to a release:
// this is what notices that it was not. The versions the header and the
// cards of the plugins show are not written by hand at all
// (scripts/kito-version.sh, scripts/registry-sync.sh).
//
//   node scripts/check-versions.mjs
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(dirname(fileURLToPath(import.meta.url)));
const read = (path) => readFileSync(join(here, path), 'utf8');
const wrong = [];

const registry = JSON.parse(read('public/registry/index.json'));
for (const plugin of JSON.parse(read('src/data/plugins.json'))) {
  const latest = registry.plugins?.[plugin.name]?.latest;
  // Not listed yet: its page says what is to come.
  if (!latest) continue;
  const page = `src/content/docs/${plugin.page.replace(/\/$/, '')}.md`;
  const said = read(page).match(/^## Version\s+(\S+)\s*$/m)?.[1];
  if (said !== latest) {
    wrong.push(`${page}: it says version ${said ?? '(none)'}, and the registry lists ${plugin.name} ${latest}`);
  }
}

const kito = JSON.parse(read('src/data/kito.json')).version;
if (!/^\d+\.\d+\.\d+$/.test(kito ?? '')) {
  wrong.push('src/data/kito.json: it has no version of Kito: scripts/kito-version.sh writes it');
}

if (wrong.length > 0) {
  for (const line of wrong) console.error(`check-versions: ${line}`);
  process.exit(1);
}
