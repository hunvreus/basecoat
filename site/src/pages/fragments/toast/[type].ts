import fs from 'node:fs';
import path from 'node:path';
import Nunjucks from 'nunjucks';

const types = ['success', 'error', 'info', 'warning'];
const env = new Nunjucks.Environment(
  new Nunjucks.FileSystemLoader([
    path.resolve('../src/templates/nunjucks'),
    path.resolve('src/fragments/toast'),
  ]),
  { autoescape: true },
);

export function getStaticPaths() {
  return types.map((type) => ({ params: { type } }));
}

export function GET({ params }) {
  const type = String(params.type || '');
  if (!types.includes(type)) return new Response('Not found', { status: 404 });
  const source = fs.readFileSync(path.resolve('src/fragments/toast', `${type}.njk`), 'utf8');
  const html = env.renderString(source).trim();
  return new Response(html, { headers: { 'content-type': 'text/html; charset=utf-8' } });
}
