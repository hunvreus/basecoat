import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import reallySimpleDocs from 'reallysimpledocs/astro';

const rsdCssPath = (relativePath) =>
  fileURLToPath(new URL(`./node_modules/reallysimpledocs/src/css/${relativePath}`, import.meta.url));

function basecoatDocsStyles() {
  return {
    name: 'basecoat-docs-styles',
    hooks: {
      'astro:config:setup': ({ config }) => {
        const root = fileURLToPath(config.root);
        const generatedStyles = path.join(root, '.astro', 'reallysimpledocs', 'styles.css');

        fs.mkdirSync(path.dirname(generatedStyles), { recursive: true });
        fs.writeFileSync(
          generatedStyles,
          [
            '@import "tailwindcss/theme";',
            '@import "tailwindcss/utilities";',
            '@reference "basecoat-css/base";',
            `@import ${JSON.stringify(rsdCssPath('components.css'))};`,
            `@import ${JSON.stringify(rsdCssPath('sources.css'))};`,
            `@import ${JSON.stringify(rsdCssPath('custom.css'))};`,
            `@import ${JSON.stringify(rsdCssPath('overrides.css'))};`,
            `@source ${JSON.stringify(fileURLToPath(new URL('./node_modules/reallysimpledocs/src/runtime/**/*.{astro,js,ts}', import.meta.url)))};`,
            `@source ${JSON.stringify(path.join(root, 'docs/src/**/*.{md,mdx}'))};`,
            '',
          ].join('\n'),
        );
      },
    },
  };
}

export default defineConfig({
  site: process.env.SITE_URL || 'https://basecoatui.com',
  vite: {
    build: {
      assetsInlineLimit: 0,
    },
    resolve: {
      dedupe: ['basecoat-css'],
    },
  },
  integrations: [
    reallySimpleDocs({
      docsDir: './docs/src',
      routeBase: '/',
      style: 'vega',
      components: {
        Head: './docs/src/site/StyleHead.astro',
        ContentHeader: './docs/src/site/ContentHeader.astro',
      },
      site: {
        title: 'Basecoat',
        subtitle: 'v1.0.0-beta.2',
        description: 'A components library built with Tailwind CSS that works with any web stack.',
        url: process.env.SITE_URL || 'https://basecoatui.com',
        keywords: ['components', 'component library', 'component system', 'UI', 'UI kit', 'shadcn', 'shadcn/ui', 'Tailwind CSS', 'Tailwind', 'CSS', 'HTML', 'Jinja', 'Nunjucks', 'JS', 'JavaScript', 'vanilla JS', 'vanilla JavaScript'],
        author: {
          name: 'Ronan Berder',
          x: '@hunvreus',
        },
        assets: {
          favicon: 'favicon.svg',
          appleTouchIcon: 'apple-touch-icon.png',
          socialImage: 'social.png',
        },
        logo: {
          svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" class="h-4 w-4"><rect width="256" height="256" fill="none"></rect><line x1="208" y1="128" x2="128" y2="208" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32"></line><line x1="192" y1="40" x2="40" y2="192" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32"></line></svg>',
        },
      },
    }),
    basecoatDocsStyles(),
  ],
});
