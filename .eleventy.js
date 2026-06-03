import fs from 'node:fs';
import path from 'node:path';

import eleventyLucideicons from '@grimlink/eleventy-plugin-lucide-icons';
import Shiki from '@shikijs/markdown-it';
import pluginTOC from 'eleventy-plugin-toc';
import * as lucideIcons from 'lucide-static';
import markdownIt from 'markdown-it';
import markdownItAnchor from 'markdown-it-anchor';
import Nunjucks from 'nunjucks';
import prettier from 'prettier';

import { registerLlmExports } from './src/eleventy/llm-exports.js';
import { registerNavigationFilters } from './src/eleventy/navigation.js';

export default async function(eleventyConfig) {
  eleventyConfig.addWatchTarget('src/nunjucks/');
  eleventyConfig.addPassthroughCopy({ 'docs/src/assets': 'assets' });
  eleventyConfig.addPassthroughCopy({ 'src/js': 'assets/js' });
  eleventyConfig.addPlugin(eleventyLucideicons);
  eleventyConfig.addPlugin(pluginTOC);

  const isServe = process.argv.includes('--serve');
  const siteUrl = process.env.SITE_URL || (isServe ? '' : 'https://basecoatui.com');
  eleventyConfig.addGlobalData('siteUrl', siteUrl);

  const shiki = await Shiki({
    themes: {
      light: 'github-light-default',
      dark: 'github-dark-default',
    },
    defaultColor: false,
    colorReplacements: {
      'github-dark-default': {
        '#24292e': 'oklch(0.145 0 0)',
      },
    },
    langAlias: {
      njk: 'html',
      jinja: 'html',
    },
    fallbackLanguage: 'text',
  });

  const markdown = markdownIt({
    html: true,
    breaks: true,
    linkify: true,
  })
    .use(markdownItAnchor, {
      permalink: markdownItAnchor.permalink.headerLink(),
    })
    .use(shiki);

  const defaultTableOpen = markdown.renderer.rules.table_open;
  const defaultTableClose = markdown.renderer.rules.table_close;
  markdown.renderer.rules.table_open = (tokens, idx, mdOptions, env, self) => {
    return '<div class="relative w-full overflow-auto my-6"><table>' + (defaultTableOpen ? defaultTableOpen(tokens, idx, mdOptions, env, self) : '');
  };
  markdown.renderer.rules.table_close = (tokens, idx, mdOptions, env, self) => {
    return (defaultTableClose ? defaultTableClose(tokens, idx, mdOptions, env, self) : '') + '</table></div>';
  };
  eleventyConfig.setLibrary('md', markdown);

  eleventyConfig.addFilter('markdownUrl', function markdownUrl(pageUrl) {
    if (pageUrl === '/') return '/index.md';
    return pageUrl.replace(/\/$/, '') + '.md';
  });

  registerNavigationFilters(eleventyConfig, lucideIcons);
  registerLlmExports(eleventyConfig, {
    getSiteUrl: () => siteUrl,
    getSiteTitle: () => 'Basecoat',
  });

  eleventyConfig.addShortcode('fetchCode', function(filePath) {
    const absolutePath = path.resolve(process.cwd(), filePath);
    try {
      return fs.readFileSync(absolutePath, 'utf8');
    } catch (error) {
      console.error(`[Eleventy FetchCode Error] Failed to read: ${absolutePath}`, error);
      return `<!-- Error fetching code for ${filePath} -->`;
    }
  });

  eleventyConfig.addNunjucksAsyncFilter('prettyHtml', async (code, callback) => {
    try {
      const formattedCode = await prettier.format(code, {
        parser: 'html',
        printWidth: 1000,
        singleAttributePerLine: false,
        bracketSameLine: true,
        htmlWhitespaceSensitivity: 'ignore',
      });
      callback(null, formattedCode);
    } catch (err) {
      console.error('Error formatting HTML with Prettier:', err);
      callback(err, code);
    }
  });

  const nunjucksEnvironment = new Nunjucks.Environment(
    new Nunjucks.FileSystemLoader([
      'src/nunjucks',
      'docs/src/_includes',
    ]),
    { autoescape: true },
  );
  eleventyConfig.setLibrary('njk', nunjucksEnvironment);

  return {
    dir: {
      input: 'docs/src',
      output: '_site',
      includes: '_includes',
      data: '_data',
    },
    markdownTemplateEngine: 'njk',
  };
}
