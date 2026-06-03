import { spawn } from 'child_process';
import { execFile } from 'child_process';
import { cp, mkdir } from 'fs/promises';
import { promisify } from 'util';
import { generateCssEntrypoints } from './generate-css-entrypoints.js';

const execFilePromise = promisify(execFile);
const styles = ['vega', 'nova', 'maia', 'lyra', 'mira', 'luma', 'sera', 'rhea'];
const watch = process.argv.includes('--watch');
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

function tailwindArgs(input, output) {
  const args = ['tailwindcss', '-i', input, '-o', output];
  if (watch) args.push('--watch');
  else args.push('--minify');
  return args;
}

async function copyDocsAssets() {
  await mkdir('./docs/src/assets/js', { recursive: true });
  await cp('./node_modules/htmx.org/dist/htmx.min.js', './docs/src/assets/js/htmx.min.js');

  await mkdir('./docs/src/assets/fonts/geist', { recursive: true });
  for (const file of fontFiles) {
    const packageName = file.startsWith('geist-sans') ? 'geist-sans' : 'geist-mono';
    await cp(`./node_modules/@fontsource/${packageName}/files/${file}`, `./docs/src/assets/fonts/geist/${file}`);
  }
}

await copyDocsAssets();
await generateCssEntrypoints();

if (watch) {
  const children = styles.map((style) => {
    const child = spawn('npx', tailwindArgs(`./docs/css/styles-${style}.css`, `./docs/src/assets/styles-${style}.css`), {
      stdio: 'inherit',
    });
    child.on('exit', (code) => {
      if (code) process.exitCode = code;
    });
    return child;
  });

  const shutdown = () => {
    for (const child of children) child.kill('SIGTERM');
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
} else {
  for (const style of styles) {
    await execFilePromise('npx', tailwindArgs(`./docs/css/styles-${style}.css`, `./docs/src/assets/styles-${style}.css`));
  }
  await execFilePromise('npx', tailwindArgs('./docs/css/styles-vega.css', './docs/src/assets/styles.css'));
}
