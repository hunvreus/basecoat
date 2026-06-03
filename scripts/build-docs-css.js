import { spawn } from 'child_process';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFilePromise = promisify(execFile);
const styles = ['vega', 'nova', 'maia', 'lyra', 'mira', 'luma', 'sera', 'rhea'];
const watch = process.argv.includes('--watch');

function tailwindArgs(input, output) {
  const args = ['tailwindcss', '-i', input, '-o', output];
  if (watch) args.push('--watch');
  else args.push('--minify');
  return args;
}

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
