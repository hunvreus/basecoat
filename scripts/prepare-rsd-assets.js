import { cp, mkdir, rm } from 'node:fs/promises';

const fontFiles = [
  'geist-sans-latin-400-normal.woff2',
  'geist-sans-latin-500-normal.woff2',
  'geist-sans-latin-600-normal.woff2',
  'geist-sans-latin-700-normal.woff2',
  'geist-mono-latin-400-normal.woff2',
  'geist-mono-latin-500-normal.woff2',
  'geist-mono-latin-600-normal.woff2',
  'geist-mono-latin-700-normal.woff2',
];

await rm('./public/assets', { recursive: true, force: true });
await mkdir('./public/assets', { recursive: true });
await cp('./docs/src/assets', './public/assets', {
  recursive: true,
  filter: (source) => !source.endsWith('.DS_Store') && !/styles(?:-[a-z]+)?\.css$/.test(source),
});

await mkdir('./public/assets/js', { recursive: true });
await cp('./node_modules/htmx.org/dist/htmx.min.js', './public/assets/js/htmx.min.js');

await mkdir('./public/assets/fonts/geist', { recursive: true });
for (const file of fontFiles) {
  const packageName = file.startsWith('geist-sans') ? 'geist-sans' : 'geist-mono';
  await cp(`./node_modules/@fontsource/${packageName}/files/${file}`, `./public/assets/fonts/geist/${file}`);
}
