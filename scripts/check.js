// Cheap sanity checks. Run after a build.
//   node scripts/check.js        package: every export target exists, JS parses, min CSS keeps all selectors
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

// Minified CDN CSS must keep every selector of its unminified source.
// Selectors are flattened (nesting resolved, :is() lists expanded) and normalized
// (::after/:after, attribute quotes, combinator spacing, from/0%) before comparing.
function splitTop(str) {
  const out = [];
  let depth = 0, quote = null, cur = '';
  for (let i = 0; i < str.length; i++) {
    const c = str[i];
    if (quote) { cur += c; if (c === '\\') cur += str[++i] ?? ''; else if (c === quote) quote = null; continue; }
    if (c === '"' || c === "'") { quote = c; cur += c; continue; }
    if (c === '(' || c === '[') depth++;
    else if (c === ')' || c === ']') depth--;
    if (c === ',' && depth === 0) { out.push(cur); cur = ''; } else cur += c;
  }
  out.push(cur);
  return out.map((s) => s.trim()).filter(Boolean);
}

function parseCss(css) {
  css = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const root = { children: [] };
  const stack = [root];
  let buf = '', quote = null, paren = 0;
  for (let i = 0; i < css.length; i++) {
    const c = css[i];
    if (quote) { buf += c; if (c === '\\') buf += css[++i] ?? ''; else if (c === quote) quote = null; continue; }
    if (c === '"' || c === "'") { quote = c; buf += c; continue; }
    if (c === '(') paren++;
    else if (c === ')') paren--;
    if (paren > 0) { buf += c; continue; }
    if (c === '{') { const node = { prelude: buf.trim(), children: [] }; stack.at(-1).children.push(node); stack.push(node); buf = ''; }
    else if (c === '}') { if (buf.trim()) stack.at(-1).children.push({ decl: true }); stack.pop(); buf = ''; }
    else if (c === ';') { if (buf.trim()) stack.at(-1).children.push({ decl: true }); buf = ''; }
    else buf += c;
  }
  return root;
}

function normalizeSelector(s) {
  return s
    .replace(/::(before|after|first-line|first-letter)\b/g, ':$1')
    .replace(/\[\s*([^\]=~|^$*\s]+)\s*([~|^$*]?=)\s*(["'])((?:\\.|(?!\3).)*)\3\s*(\s[is])?\s*\]/g, '[$1$2$4$5]')
    .replace(/\s+/g, ' ')
    .replace(/\s*([>+~,])\s*/g, '$1')
    .replace(/\(\s+/g, '(')
    .replace(/\s+\)/g, ')')
    .replace(/^from$/, '0%')
    .replace(/^to$/, '100%')
    .trim();
}

function expandIs(sel) {
  const i = sel.indexOf(':is(');
  if (i < 0) return [sel];
  let depth = 0, j = i + 3;
  for (; j < sel.length; j++) { if (sel[j] === '(') depth++; else if (sel[j] === ')' && --depth === 0) break; }
  const inner = splitTop(sel.slice(i + 4, j));
  const attached = i > 0 && !/[\s>+~(,]/.test(sel[i - 1]);
  if (attached && inner.some((part) => /[\s>+~]/.test(part.replace(/\([^)]*\)/g, '')))) {
    return expandIs(sel.slice(j + 1)).map((rest) => sel.slice(0, j + 1) + rest);
  }
  return inner.flatMap((part) => expandIs(sel.slice(0, i) + part + sel.slice(j + 1)));
}

function flatSelectors(css) {
  const keys = new Set();
  const normParams = (p) => p.replace(/\s+/g, ' ').replace(/\s*([():,<>=]+)\s*/g, '$1').replace(/"/g, "'").trim().toLowerCase();
  const walk = (node, ctx, parents) => {
    for (const child of node.children) {
      if (!child.children) continue;
      const pre = child.prelude;
      if (pre.startsWith('@')) {
        const [, name, params] = pre.match(/^@([\w-]+)\s*([\s\S]*)$/);
        const at = `@${name} ${normParams(params)}`;
        if (/^(media|supports|layer|container|keyframes|-webkit-keyframes|scope|starting-style)$/.test(name)) {
          // Declarations directly inside a nested at-rule belong to the parent selectors.
          if (parents && child.children.some((c) => c.decl)) for (const p of parents) keys.add(`${[...ctx, at].join(' | ')} || ${p}`);
          walk(child, [...ctx, at], name.endsWith('keyframes') ? null : parents);
        } else keys.add([...ctx, at].join(' | '));
        continue;
      }
      const own = splitTop(pre);
      const sels = (parents ? parents.flatMap((p) => own.map((s) => (s.includes('&') ? s.replace(/&/g, p) : `${p} ${s}`))) : own)
        .map(normalizeSelector).flatMap(expandIs).map(normalizeSelector);
      if (child.children.some((c) => c.decl)) for (const s of sels) keys.add(`${ctx.join(' | ')} || ${s}`);
      walk(child, ctx, sels);
    }
  };
  walk(parseCss(css), [], null);
  return keys;
}

function checkMinifiedCss() {
  const dist = path.join(root, 'dist');
  for (const name of fs.existsSync(dist) ? fs.readdirSync(dist) : []) {
    if (!name.endsWith('.cdn.css')) continue;
    const minName = name.replace(/\.css$/, '.min.css');
    const minFile = path.join(dist, minName);
    if (!fs.existsSync(minFile)) { errors.push(`dist/${minName} is missing`); continue; }
    const min = flatSelectors(fs.readFileSync(minFile, 'utf8'));
    const missing = [...flatSelectors(fs.readFileSync(path.join(dist, name), 'utf8'))].filter((key) => !min.has(key));
    if (missing.length) errors.push(`dist/${minName} dropped ${missing.length} selector(s) from dist/${name}, e.g. ${missing.slice(0, Number(process.env.SHOW || 3)).join('; ')}`);
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
if (target === 'package') {
  checkPackage();
  checkMinifiedCss();
}
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
