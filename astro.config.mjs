import { defineConfig } from 'astro/config';
import reallySimpleDocs from 'reallysimpledocs/astro';

export default defineConfig({
  site: process.env.SITE_URL || 'https://basecoatui.com',
  integrations: [
    reallySimpleDocs({
      docsDir: './docs/generated',
      routeBase: '/',
      style: 'nova',
      customCss: ['./src/docs.css'],
      components: {
        SidebarHeader: './src/components/SidebarHeader.astro',
      },
      site: {
        title: 'Basecoat',
        subtitle: 'v1.0.0-beta.1',
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
        links: [
          {
            label: 'GitHub',
            icon: '<svg aria-hidden="true" class="lucide lucide-github" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>',
            iconOnly: true,
            url: 'https://github.com/hunvreus/basecoat',
            attrs: { target: '_blank', rel: 'noopener noreferrer', class: 'btn-sm-icon-outline' },
          },
        ],
      },
    }),
  ],
});
