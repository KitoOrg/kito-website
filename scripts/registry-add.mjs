#!/usr/bin/env node
// Lists a version of a plugin in the registry (ADR 0008 of Kito), from an
// archive of it: reads the manifest inside, computes the checksum, and
// writes `plugins/<name>.json` and `index.json`.
//
//   node scripts/registry-add.mjs <archive.tar.gz> --platform linux-x86_64
//        [--url <where the archive is>] [--copy] [--registry public/registry]
//
// Without --url the archive is taken to be at kito.sh/downloads/<its name>;
// --copy puts it in public/downloads/ so that it is. Run it once for each
// platform's archive of a version. It changes files and nothing else:
// the change is reviewed and merged like any other.
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { copyFileSync, existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const PLATFORMS = ['linux-x86_64', 'linux-aarch64', 'macos-arm64', 'macos-x86_64', 'windows-x86_64'];
const here = dirname(dirname(fileURLToPath(import.meta.url)));

function fail(why) {
  console.error(`registry-add: ${why}`);
  process.exit(1);
}

const args = process.argv.slice(2);
const said = (flag) => {
  const at = args.indexOf(flag);
  return at === -1 ? undefined : args.splice(at, 2)[1];
};
const platform = said('--platform');
const url = said('--url');
const registry = resolve(said('--registry') ?? join(here, 'public/registry'));
const copy = args.includes('--copy') && args.splice(args.indexOf('--copy'), 1).length > 0;
const archive = args[0];
if (!archive || args.length !== 1) fail('usage: registry-add.mjs <archive.tar.gz> --platform <platform> [--url <address>] [--copy]');
if (!PLATFORMS.includes(platform)) fail(`--platform is one of ${PLATFORMS.join(', ')}`);
if (!existsSync(archive)) fail(`${archive}: it is not there`);

// The manifest inside: the plugin says what it is, not the archive's name.
const members = execFileSync('tar', ['-tzf', archive], { encoding: 'utf8' }).split('\n').filter(Boolean);
const inside = members.find((member) => /^(\.\/)?([^/]+\/)?kito-plugin\.toml$/.test(member));
if (!inside) fail(`${archive}: there is no kito-plugin.toml in it, or in the one directory it holds`);
const manifest = execFileSync('tar', ['-xzOf', archive, inside], { encoding: 'utf8' });
// The first lines of a manifest, before its first table.
const top = manifest.split(/^\[/m)[0];
const text = (key) => top.match(new RegExp(`^${key}\\s*=\\s*"((?:[^"\\\\]|\\\\.)*)"`, 'm'))?.[1]?.replace(/\\(.)/g, '$1');
const name = text('name');
const version = text('version');
const about = text('description') ?? '';
const api = Number(top.match(/^api\s*=\s*(\d+)/m)?.[1]);
if (!name || !/^[a-z0-9][a-z0-9_-]*$/.test(name)) fail(`${archive}: its manifest has no name a plugin can have`);
if (!version || !Number.isInteger(api)) fail(`${archive}: its manifest has no version, or no api`);
const program = new RegExp(`(^|/)kito-${name}(\\.exe)?$`);
if (!members.some((member) => program.test(member))) fail(`${archive}: the program kito-${name} is not in it`);

const bytes = readFileSync(archive);
const file = {
  url: url ?? `https://kito.sh/downloads/${basename(archive)}`,
  sha256: createHash('sha256').update(bytes).digest('hex'),
  size: statSync(archive).size,
};
if (!/^https:\/\//.test(file.url)) fail(`${file.url}: an archive is listed by an https address`);
if (copy) {
  const downloads = join(dirname(registry), 'downloads');
  mkdirSync(downloads, { recursive: true });
  copyFileSync(archive, join(downloads, basename(archive)));
}

const read = (path, empty) => (existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : empty);
const write = (path, value) => writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
mkdirSync(join(registry, 'plugins'), { recursive: true });

const pluginPath = join(registry, 'plugins', `${name}.json`);
const plugin = read(pluginPath, { name, about, versions: {} });
plugin.about = about;
plugin.versions[version] ??= { api, files: {} };
plugin.versions[version].api = api;
plugin.versions[version].files[platform] = file;
write(pluginPath, plugin);

// The latest: by its numbers, 0.10 after 0.9.
const numbers = (v) => v.split(/[.+-]/).map((part) => Number.parseInt(part, 10) || 0);
const later = (a, b) => {
  const [x, y] = [numbers(a), numbers(b)];
  for (let i = 0; i < Math.max(x.length, y.length); i++) if ((x[i] ?? 0) !== (y[i] ?? 0)) return (x[i] ?? 0) - (y[i] ?? 0);
  return 0;
};
const latest = Object.keys(plugin.versions).sort(later).at(-1);
const indexPath = join(registry, 'index.json');
const index = read(indexPath, { registry: 1, plugins: {} });
index.plugins[name] = { about, latest };
index.plugins = Object.fromEntries(Object.entries(index.plugins).sort(([a], [b]) => a.localeCompare(b)));
write(indexPath, index);

console.log(`${name} ${version} for ${platform}: ${file.url}`);
console.log(`  SHA-256 ${file.sha256}, ${file.size} bytes; the registry's latest is ${latest}`);
