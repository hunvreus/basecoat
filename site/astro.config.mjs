import { defineConfig } from 'astro/config';
import { defaultStyle } from './src/style.js';
import { readFileSync } from 'node:fs';
import sitemap from '@astrojs/sitemap';
import reallySimpleDocs from 'reallysimpledocs/astro';

const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));

const includeInSitemap = (page) => {
  const { pathname } = new URL(page);

  return pathname === '/' || (
    pathname.endsWith('/') &&
    !pathname.startsWith('/fragments/')
  );
};

export default defineConfig({
  site: process.env.SITE_URL || 'https://basecoatui.com',
  server: {
    host: '127.0.0.1',
  },
  vite: {
    optimizeDeps: { include: ['chart.js/auto'] },
    build: {
      assetsInlineLimit: 0,
    },
    resolve: {
      dedupe: ['basecoat-css'],
    },
  },
  integrations: [
    {
      name: 'watch-docs-menu',
      hooks: {
        // ReallySimpleDocs collects the MDX page modules at startup.
        'astro:config:setup': ({ addWatchFile }) => addWatchFile(new URL('./src/docs/docs.json', import.meta.url)),
      },
    },
    reallySimpleDocs({
      docsDir: './src/docs',
      routeBase: '/',
      style: defaultStyle,
      css: false,
      bodyAttrs: {
        class: 'antialiased',
        'hx-boost': 'true',
        'hx-target': '#content',
        'hx-select': '#content',
        'hx-swap': 'outerHTML',
        'hx-push-url': 'true',
      },
      components: {
        Head: './src/components/StyleHead.astro',
        SidebarHeader: './src/components/SidebarHeader.astro',
        ContentHeader: './src/components/ContentHeader.astro',
      },
      site: {
        title: 'Basecoat',
        subtitle: `v${packageJson.version}`,
        description: 'A components library built with Tailwind CSS that works with any web stack.',
        url: process.env.SITE_URL || 'https://basecoatui.com',
        keywords: ['components', 'component library', 'component system', 'UI', 'UI kit', 'shadcn', 'shadcn/ui', 'Tailwind CSS', 'Tailwind', 'CSS', 'HTML', 'Jinja', 'Nunjucks', 'JS', 'JavaScript', 'vanilla JS', 'vanilla JavaScript'],
        author: {
          name: 'Ronan Berder',
          x: '@hunvreus',
        },
        favicon: 'favicon.svg',
        appleTouchIcon: 'apple-touch-icon.png',
        socialImage: 'social.png',
        logo: {
          svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" class="h-4 w-4"><rect width="256" height="256" fill="none"></rect><line x1="208" y1="128" x2="128" y2="208" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32"></line><line x1="192" y1="40" x2="40" y2="192" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32"></line></svg>',
        },
      },
    }),
    sitemap({
      filter: includeInSitemap,
    }),
  ],
});
