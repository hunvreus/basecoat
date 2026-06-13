import fs from 'node:fs';
import path from 'node:path';

const types = ['success', 'error', 'info', 'warning'];

export function getStaticPaths() {
  return types.map((type) => ({ params: { type } }));
}

export function GET({ params }) {
  const type = String(params.type || '');
  if (!types.includes(type)) return new Response('Not found', { status: 404 });
  const html = fs.readFileSync(path.resolve('docs/generated/fragments/toast', `${type}.html`), 'utf8');
  return new Response(html, { headers: { 'content-type': 'text/html; charset=utf-8' } });
}
