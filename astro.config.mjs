import { defineConfig } from 'astro/config';
import reallySimpleDocs from 'reallysimpledocs/astro';

export default defineConfig({
  site: process.env.SITE_URL || 'https://basecoatui.com',
  vite: {
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
  ],
});
