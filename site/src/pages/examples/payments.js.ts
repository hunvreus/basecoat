import source from '../../scripts/data-table-example.js?raw';

export function GET() {
  return new Response(source, { headers: { 'content-type': 'text/javascript; charset=utf-8' } });
}
