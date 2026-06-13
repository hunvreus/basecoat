import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import * as lucideIcons from 'lucide-static';
import Nunjucks from 'nunjucks';
import prettier from 'prettier';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceDir = path.join(root, 'docs/src');
const outputDir = path.join(root, 'docs/generated');
const fragmentsDir = path.join(outputDir, 'fragments');
const pkg = JSON.parse(await fs.readFile(path.join(root, 'package.json'), 'utf8'));

const pageFiles = [
  'introduction.md',
  'installation.md',
  'customization.md',
  'cli.md',
  'kitchen-sink.njk',
  ...(await collectFiles(path.join(sourceDir, 'components'))).map((file) => path.relative(sourceDir, file)),
];

function parseFrontMatter(source) {
  if (!source.startsWith('---')) return { data: {}, body: source };
  const match = source.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);
  if (!match) return { data: {}, body: source };
  const data = {};
  for (const line of match[1].split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const keyMatch = trimmed.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!keyMatch) continue;
    let value = keyMatch[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    data[keyMatch[1]] = value;
  }
  return { data, body: source.slice(match[0].length) };
}

async function collectFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await collectFiles(full)));
    else if (entry.isFile() && /\.(md|njk)$/.test(entry.name)) files.push(full);
  }
  return files.sort();
}

function pascalIconName(iconName) {
  const normalized = String(iconName || '').trim();
  if (!normalized) return '';
  if (normalized.includes('-')) {
    return normalized.split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('');
  }
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function addAttrs(svg, attrs = {}) {
  let out = String(svg || '');
  for (const [name, value] of Object.entries(attrs || {})) {
    if (value === undefined || value === null || value === false) continue;
    const escaped = String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;');
    if (name === 'class' && out.includes('class="')) out = out.replace('class="', `class="${escaped} `);
    else out = out.replace('<svg', value === true ? `<svg ${name}` : `<svg ${name}="${escaped}"`);
  }
  return out;
}

class LucideExtension {
  tags = ['lucide'];

  parse(parser, nodes) {
    const token = parser.nextToken();
    const args = parser.parseSignature(null, true);
    parser.advanceAfterBlockEnd(token.value);
    return new nodes.CallExtension(this, 'run', args);
  }

  run(_context, iconName, attrs = {}) {
    const svg = lucideIcons[pascalIconName(iconName)] || '';
    return new Nunjucks.runtime.SafeString(addAttrs(svg, attrs));
  }
}

function renderTemplate(env, source, context) {
  return new Promise((resolve, reject) => {
    env.renderString(source, context, (error, result) => {
      if (error) reject(error);
      else resolve(result);
    });
  });
}

function outputSlug(relativeFile) {
  const normalized = relativeFile.replaceAll(path.sep, '/').replace(/\.(md|njk)$/, '');
  return normalized === 'introduction' ? 'index' : normalized;
}

function normalizeNavigationItem(item) {
  if (typeof item === 'string') return item === 'introduction' ? 'index' : item;
  if (item?.type === 'item') {
    if (item.slug) return { ...item, slug: item.slug === 'introduction' ? 'index' : item.slug };
    if (item.url && item.url.startsWith('/')) {
      const slug = item.url.replace(/^\/+|\/+$/g, '') || 'index';
      return { slug, icon: item.icon };
    }
    return null;
  }
  if (item?.type === 'submenu') {
    return { ...item, items: (item.items || []).map(normalizeNavigationItem).filter(Boolean) };
  }
  return item;
}

async function main() {
  await fs.rm(outputDir, { recursive: true, force: true });
  await fs.mkdir(outputDir, { recursive: true });

  const docsConfig = JSON.parse(await fs.readFile(path.join(sourceDir, '_data/docs.json'), 'utf8'));
  const menu = docsConfig.menu.map((group) => ({
    ...group,
    items: (group.items || []).map(normalizeNavigationItem).filter(Boolean),
  }));
  await fs.writeFile(path.join(outputDir, 'docs.json'), `${JSON.stringify({ menu }, null, 2)}\n`);

  const env = new Nunjucks.Environment(
    new Nunjucks.FileSystemLoader([
      path.join(root, 'src/nunjucks'),
      path.join(sourceDir, '_includes'),
    ]),
    { autoescape: true },
  );
  env.addExtension('LucideExtension', new LucideExtension());
  env.addFilter('prettyHtml', async (code, callback) => {
    try {
      callback(null, await prettier.format(code, {
        parser: 'html',
        printWidth: 1000,
        singleAttributePerLine: false,
        bracketSameLine: true,
        htmlWhitespaceSensitivity: 'ignore',
      }));
    } catch (error) {
      callback(error, code);
    }
  }, true);

  const context = {
    pkg,
    site: {
      title: 'Basecoat',
      description: 'A components library built with Tailwind CSS that works with any web stack.',
    },
  };

  for (const relativeFile of pageFiles) {
    const absoluteFile = path.join(sourceDir, relativeFile);
    const source = await fs.readFile(absoluteFile, 'utf8');
    const { data, body } = parseFrontMatter(source);
    const rendered = (await renderTemplate(env, body, context)).replaceAll('<pre class="scrollbar">', '<pre class="scrollbar" data-copy-code-initialized="true">');
    const slug = outputSlug(relativeFile);
    const outPath = path.join(outputDir, `${slug}.md`);
    await fs.mkdir(path.dirname(outPath), { recursive: true });
    const title = data.title || titleFromSlug(slug);
    const hasOwnHeading = /<h1[\s>]/.test(rendered);
    const heading = hasOwnHeading ? '' : `# ${title}`;
    const description = !hasOwnHeading && data.description ? `\n\n<p class="text-muted-foreground text-[1.05rem] sm:text-base">${escapeHtml(data.description)}</p>` : '';
    await fs.writeFile(outPath, `${heading}${description}\n\n${rendered.trim()}\n\n<div id="toaster" class="toaster"></div>\n<script src="/assets/js/htmx.min.js" defer></script>\n`);
  }

  for (const type of ['success', 'error', 'info', 'warning']) {
    const source = await fs.readFile(path.join(sourceDir, 'fragments/toast', `${type}.njk`), 'utf8');
    const rendered = await renderTemplate(env, source, context);
    const outPath = path.join(fragmentsDir, 'toast', `${type}.html`);
    await fs.mkdir(path.dirname(outPath), { recursive: true });
    await fs.writeFile(outPath, rendered.trim());
  }
}


function titleFromSlug(slug) {
  const last = slug.split('/').at(-1) || slug;
  return last.replaceAll('-', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function escapeHtml(value) {
  return String(value || '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
}

await main();
