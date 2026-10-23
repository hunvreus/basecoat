// Cheap sanity checks. Run after a build.
//   node scripts/check.js        package: every export target exists, JS parses
//   node scripts/check.js site   docs site: site/dist built, llms.txt links to .md exports
import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];

function checkPackage() {
  const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));

  for (const [key, target] of Object.entries(pkg.exports)) {
    const file = path.join(root, target);
    if (target.includes('*')) {
      const dir = path.dirname(file.slice(0, file.indexOf('*')) + 'x');
      if (!fs.existsSync(dir) || fs.readdirSync(dir).length === 0) {
        errors.push(`export "${key}": no files in ${path.relative(root, dir)}`);
      }
    } else if (!fs.existsSync(file) || fs.statSync(file).size === 0) {
      errors.push(`export "${key}": ${target} is missing or empty`);
    }
  }

  const jsDir = path.join(root, 'dist', 'js');
  for (const name of fs.existsSync(jsDir) ? fs.readdirSync(jsDir) : []) {
    if (!name.endsWith('.js')) continue;
    try {
      execFileSync(process.execPath, ['--check', path.join(jsDir, name)], { stdio: 'pipe' });
    } catch (error) {
      const message = error.stderr.toString().split('\n').find((line) => /Error/.test(line));
      errors.push(`dist/js/${name} does not parse: ${message || 'syntax error'}`);
    }
  }
}

function checkSite() {
  const dist = path.join(root, 'site', 'dist');
  for (const file of ['index.html', 'llms.txt', 'llms-full.txt']) {
    if (!fs.existsSync(path.join(dist, file))) errors.push(`site/dist/${file} is missing`);
  }
  const llms = path.join(dist, 'llms.txt');
  if (!fs.existsSync(llms)) return;
  const links = [...fs.readFileSync(llms, 'utf8').matchAll(/^- \[[^\]]*\]\(([^)]+)\)/gm)].map((m) => m[1]);
  if (links.length === 0) errors.push('site/dist/llms.txt has no links');
  for (const link of links) {
    if (!link.endsWith('.md')) errors.push(`site/dist/llms.txt links to ${link}, not a .md export`);
  }
}

const target = process.argv[2] || 'package';
if (target === 'package') checkPackage();
else if (target === 'site') checkSite();
else {
  console.error(`Unknown target "${target}". Use "package" or "site".`);
  process.exit(2);
}

if (errors.length) {
  console.error(`${target} check failed:\n- ${errors.join('\n- ')}`);
  process.exit(1);
}
console.log(`${target} check passed.`);
