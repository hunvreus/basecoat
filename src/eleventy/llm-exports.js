import fs from 'node:fs/promises';
import path from 'node:path';

import { collectMenuSlugs, docUrl, fallbackLabelFromSlug } from './menu.js';

export const registerLlmExports = (eleventyConfig, options) => {
  const collectFiles = async (dir, predicate) => {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const out = [];

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) out.push(...(await collectFiles(fullPath, predicate)));
      else if (entry.isFile() && predicate(fullPath)) out.push(fullPath);
    }

    return out;
  };

  const writeTextFile = async (outputDir, relativePath, content) => {
    const outPath = path.join(outputDir, relativePath);
    await fs.mkdir(path.dirname(outPath), { recursive: true });
    await fs.writeFile(outPath, content, 'utf8');
  };

  const stripFrontMatter = (source) => {
    if (!source.startsWith('---')) return source;
    const match = source.match(/^---\s*\n[\s\S]*?\n---\s*\n?/);
    return match ? source.slice(match[0].length) : source;
  };

  const readFrontMatterField = (source, key) => {
    if (!source.startsWith('---')) return null;
    const match = source.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);
    if (!match) return null;
    const line = match[1]
      .split('\n')
      .map((l) => l.trim())
      .find((l) => l.startsWith(`${key}:`));
    if (!line) return null;
    let value = line.slice(`${key}:`.length).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    return value || null;
  };

  eleventyConfig.on('afterBuild', async (eventsArg) => {
    const outputDir = eventsArg?.directories?.output || eventsArg?.dir?.output;
    const inputDir = eventsArg?.directories?.input || eventsArg?.dir?.input;
    if (!outputDir || !inputDir) return;

    const docsRoot = path.resolve(inputDir);
    const siteUrl = options.getSiteUrl();
    const siteTitle = options.getSiteTitle();

    let docsConfig = null;
    for (const docsConfigPath of [path.join(docsRoot, '_data', 'docs.json'), path.join(docsRoot, 'docs.json')]) {
      try {
        docsConfig = JSON.parse(await fs.readFile(docsConfigPath, 'utf8'));
        break;
      } catch (_) {}
    }
    const menu = docsConfig?.menu || [];
    const menuSlugs = collectMenuSlugs(menu);

    const sourceFiles = await collectFiles(docsRoot, (filePath) => filePath.endsWith('.md'));
    const docs = (
      await Promise.all(
        sourceFiles.map(async (filePath) => {
          const source = await fs.readFile(filePath, 'utf8');
          const relative = path.relative(docsRoot, filePath).replaceAll(path.sep, '/');
          const slug = relative.replace(/\.md$/, '') === 'index' ? 'index' : relative.replace(/\.md$/, '');
          const url = docUrl(slug);
          const title = readFrontMatterField(source, 'title') || fallbackLabelFromSlug(slug);
          const description = (readFrontMatterField(source, 'description') || '').trim();
          const content = stripFrontMatter(source).trim();
          return { slug, url, title: title.trim(), description, content };
        }),
      )
    ).sort((a, b) => a.url.localeCompare(b.url));

    const docsBySlug = new Map(docs.map((d) => [d.slug, d]));
    const docsInMenu = menuSlugs.map((slug) => docsBySlug.get(slug)).filter(Boolean);
    const docsNotInMenu = docs.filter((doc) => !docsInMenu.includes(doc));
    const orderedDocs = [...docsInMenu, ...docsNotInMenu];

    const markdownExportPathFromSlug = (slug) => {
      if (slug === 'index') return 'index.md';
      if (slug.endsWith('/index')) return `${slug.slice(0, -'/index'.length)}.md`;
      return `${slug}.md`;
    };

    await Promise.all(
      docs.map(async (doc) => {
        const parts = [`# ${doc.title}`];
        if (doc.description) parts.push(doc.description);
        if (doc.content) parts.push(doc.content);
        await writeTextFile(outputDir, markdownExportPathFromSlug(doc.slug), parts.join('\n\n') + '\n');
      }),
    );

    const llmsLines = [`# ${siteTitle}`, '', '## Docs', ''];
    menu.forEach((group) => {
      if (group?.type !== 'group') return;
      llmsLines.push(`### ${group.label || 'Docs'}`, '');
      const addSlug = (slug) => {
        const doc = docsBySlug.get(slug);
        if (!doc) return;
        const fullUrl = `${siteUrl}${doc.url}`;
        llmsLines.push(doc.description ? `- [${doc.title}](${fullUrl}): ${doc.description}` : `- [${doc.title}](${fullUrl})`);
      };
      (group.items || []).forEach((item) => {
        if (typeof item === 'string') addSlug(item);
        else if (item?.type === 'submenu' && Array.isArray(item.items)) item.items.forEach(addSlug);
      });
      llmsLines.push('');
    });
    await writeTextFile(outputDir, 'llms.txt', llmsLines.join('\n'));

    const fullLines = [];
    orderedDocs.forEach((doc) => {
      fullLines.push(`# ${doc.title}`, `Source: ${siteUrl}${doc.url}`, '');
      if (doc.description) fullLines.push(doc.description, '');
      fullLines.push(doc.content, '', '---', '');
    });
    await writeTextFile(outputDir, 'llms-full.txt', fullLines.join('\n'));
  });
};
