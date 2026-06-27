export function GET({ site }) {
  const origin = site?.toString().replace(/\/$/, '') || 'https://basecoatui.com';
  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap-index.xml\n`, {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
}
