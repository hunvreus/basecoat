import fs from 'node:fs';
import path from 'node:path';

const routePath = (slug) => slug === 'index' ? '/' : `/${slug.replace(/^\/+|\/+$/g, '')}/`;

function flatten(menu) {
  const out = [];
  const walk = (items = []) => {
    for (const item of items) {
      if (typeof item === 'string') out.push(item);
      else if (item?.slug) out.push(item.slug);
      else if (item?.type === 'submenu') walk(item.items || []);
    }
  };
  for (const group of menu || []) if (group?.type === 'group') walk(group.items || []);
  return out;
}

export function GET({ site }) {
  const origin = site?.toString().replace(/\/$/, '') || 'https://basecoatui.com';
  const manifest = JSON.parse(fs.readFileSync(path.resolve('docs/generated/docs.json'), 'utf8'));
  const urls = flatten(manifest.menu).map((slug) => `  <url><loc>${origin}${routePath(slug)}</loc></url>`).join('\n');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`, {
    headers: { 'content-type': 'application/xml; charset=utf-8' },
  });
}
