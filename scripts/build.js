import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';
import { transform } from 'esbuild';
import { generateCssEntrypoints } from './generate-css-entrypoints.js';

const execPromise = promisify(exec);

// Tailwind CSS v4 browser baseline (https://tailwindcss.com/docs/compatibility).
// Minified CDN CSS uses esbuild because Tailwind's --minify (Lightning CSS) can
// randomly drop rules (parcel-bundler/lightningcss#1235).
const cssTargets = ['chrome111', 'safari16.4', 'firefox128'];

// Resolve project root, assuming this script is in <project_root>/scripts/
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Ensures a directory exists. If it doesn't, it's created recursively.
async function ensureDir(dirPath) {
  try {
    await fs.access(dirPath);
  } catch (error) {
    if (error.code === 'ENOENT') {
      await fs.mkdir(dirPath, { recursive: true });
    } else {
      throw error;
    }
  }
}

// Cleans a directory by removing all its contents (files and subdirectories).
async function cleanDir(directory) {
  try {
    await fs.access(directory);
    const entries = await fs.readdir(directory, { withFileTypes: true });
    for (const entry of entries) {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        await fs.rm(entryPath, { recursive: true, force: true });
      } else {
        await fs.unlink(entryPath);
      }
    }
    console.log(`Cleaned directory: ${directory}`);
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log(`Directory not found, no need to clean: ${directory}`);
    } else {
      console.error(`Error cleaning directory ${directory}:`, error);
      throw error;
    }
  }
}

// Recursively copies a directory.
async function copyDirRecursive(src, dest) {
  await ensureDir(dest);
  const entries = await fs.readdir(src, { withFileTypes: true });
  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      await copyDirRecursive(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

// Recursively inlines relative `@import "./...";` lines into a single CSS string.
// Each file is inlined at most once per bundle (tracked in `seen`).
async function inlineCssImports(filePath, seen) {
  const resolved = path.resolve(filePath);
  if (seen.has(resolved)) return '';
  seen.add(resolved);

  const source = await fs.readFile(resolved, 'utf-8');
  const lines = source.split('\n');
  const out = [];
  for (const line of lines) {
    const match = line.match(/^\s*@import\s+["'](\.{1,2}\/[^"']+)["']\s*;\s*$/);
    if (match) {
      const inlined = await inlineCssImports(path.join(path.dirname(resolved), match[1]), seen);
      if (inlined) out.push(inlined.replace(/\n+$/, ''));
    } else if (/^\s*@import\s+["']\.{1,2}\//.test(line)) {
      throw new Error(`Unsupported relative @import (with modifiers) in ${resolved}: ${line.trim()}`);
    } else {
      out.push(line);
    }
  }
  return out.join('\n');
}

// Writes an uncompiled single-file bundle for a dist CSS entrypoint.
async function writeCssBundle(entryPath, outPath, label, version) {
  const body = await inlineCssImports(entryPath, new Set());
  const header = `/* Basecoat v${version}, ${label}, single-file source. Import after tailwindcss. */\n`;
  await fs.writeFile(outPath, `${header}${body.replace(/\n+$/, '')}\n`);
}

// Main build function to prepare the package for publishing.
async function build() {
  console.log('Starting build process...');
  await generateCssEntrypoints();

  // Define all necessary paths
  const cssDistDir = path.join(projectRoot, 'dist');
  const cssTemplatesDir = path.join(projectRoot, 'templates');

  const srcDir = path.join(projectRoot, 'src');
  const srcCssDir = path.join(srcDir, 'css');
  const srcCssStylesDir = path.join(srcCssDir, 'styles');
  const srcCssCompatDir = path.join(srcCssDir, 'compat');
  const srcJsDir = path.join(srcDir, 'js');
  const srcNunjucksDir = path.join(srcDir, 'templates', 'nunjucks');
  const srcJinjaDir = path.join(srcDir, 'templates', 'jinja');

  // Clean previous build artifacts
  console.log('Cleaning distribution directories...');
  await cleanDir(cssDistDir);
  await cleanDir(cssTemplatesDir);

  // JS files minification and copy
  const jsFiles = await fs.readdir(srcJsDir);
  const cssJsDistDir = path.join(cssDistDir, 'js');
  await ensureDir(cssJsDistDir);
  console.log('Copying and minifying JS files...');

  for (const jsFile of jsFiles) {
    if (path.extname(jsFile) === '.js') {
      const srcFile = path.join(srcJsDir, jsFile);
      const baseName = path.basename(jsFile, '.js');
      const minifiedFileName = `${baseName}.min.js`;

      // Copy original file to destination
      await fs.copyFile(srcFile, path.join(cssJsDistDir, jsFile));

      // Create minified file
      await execPromise(`npx terser ${srcFile} -o ${path.join(cssJsDistDir, minifiedFileName)} --compress --mangle`);
    }
  }

  // Create combined component files
  console.log('Creating combined component files...');
  const componentsToCombine = ['basecoat.js', 'accordion.js', 'carousel.js', 'command.js', 'combobox.js', 'drawer.js', 'dropdown-menu.js', 'popover.js', 'range.js', 'select.js', 'sidebar.js', 'tabs.js', 'toast.js'];
  const componentPaths = componentsToCombine.map(f => path.join(srcJsDir, f));

  // Create non-minified bundle
  let combinedContent = '';
  for (const p of componentPaths) {
    combinedContent += await fs.readFile(p, 'utf-8') + '\n';
  }
  const allJsPath = path.join(cssJsDistDir, 'all.js');
  await fs.writeFile(allJsPath, combinedContent);
  
  // Create minified bundle
  const allMinJsPath = path.join(cssJsDistDir, 'all.min.js');
  await execPromise(`npx terser ${componentPaths.join(' ')} -o ${allMinJsPath} --compress --mangle`);

  console.log(`Copied and minified JS to ${cssJsDistDir}`);

  // Build CSS package
  console.log('Building CSS package...');
  await ensureDir(cssDistDir);
  const styles = ['vega', 'nova', 'maia', 'lyra', 'mira', 'luma', 'sera', 'rhea'];
  await fs.copyFile(path.join(srcCssDir, 'basecoat.css'), path.join(cssDistDir, 'basecoat.css'));
  await fs.copyFile(path.join(srcCssDir, 'basecoat.all.css'), path.join(cssDistDir, 'basecoat.all.css'));
  await fs.copyFile(path.join(srcCssDir, 'basecoat-base.css'), path.join(cssDistDir, 'basecoat-base.css'));
  await fs.copyFile(path.join(srcCssDir, 'basecoat-base.cdn.css'), path.join(cssDistDir, 'basecoat-base.cdn.css'));
  await fs.copyFile(path.join(srcCssDir, 'basecoat-compat.css'), path.join(cssDistDir, 'basecoat-compat.css'));
  await fs.copyFile(path.join(srcCssDir, 'basecoat-compat.cdn.css'), path.join(cssDistDir, 'basecoat-compat.cdn.css'));
  await fs.copyFile(path.join(srcCssDir, 'basecoat-components.css'), path.join(cssDistDir, 'basecoat-components.css'));
  for (const style of styles) {
    await fs.copyFile(path.join(srcCssDir, `basecoat-${style}.css`), path.join(cssDistDir, `basecoat-${style}.css`));
    await fs.copyFile(path.join(srcCssDir, `basecoat-${style}.cdn.css`), path.join(cssDistDir, `basecoat-${style}.cdn.css`));
  }
  console.log(`Copied basecoat CSS entrypoints to ${cssDistDir}`);

  // Copy split CSS folders used by basecoat.css imports.
  const cssBaseSrcDir = path.join(srcCssDir, 'base');
  const cssComponentsSrcDir = path.join(srcCssDir, 'components');
  const cssBaseDistDir = path.join(cssDistDir, 'base');
  const cssComponentsDistDir = path.join(cssDistDir, 'components');
  const cssStylesDistDir = path.join(cssDistDir, 'styles');
  const cssCompatDistDir = path.join(cssDistDir, 'compat');
  await copyDirRecursive(cssBaseSrcDir, cssBaseDistDir);
  await copyDirRecursive(cssComponentsSrcDir, cssComponentsDistDir);
  await copyDirRecursive(srcCssStylesDir, cssStylesDistDir);
  await copyDirRecursive(srcCssCompatDir, cssCompatDistDir);
  console.log(`Copied split CSS folders to ${cssDistDir}`);

  // Create uncompiled single-file bundles for Tailwind users without a package manager.
  const { version } = JSON.parse(await fs.readFile(path.join(projectRoot, 'package.json'), 'utf-8'));
  for (const style of styles) {
    await writeCssBundle(
      path.join(cssDistDir, `basecoat-${style}.css`),
      path.join(cssDistDir, `basecoat-${style}.bundle.css`),
      style,
      version,
    );
  }
  await writeCssBundle(path.join(cssDistDir, 'basecoat.css'), path.join(cssDistDir, 'basecoat.bundle.css'), 'vega', version);
  await writeCssBundle(path.join(cssDistDir, 'basecoat-base.css'), path.join(cssDistDir, 'basecoat-base.bundle.css'), 'base (no style pack)', version);
  console.log(`Generated single-file CSS bundles in ${cssDistDir}`);

  await copyDirRecursive(srcNunjucksDir, path.join(cssTemplatesDir, 'nunjucks'));
  await copyDirRecursive(srcJinjaDir, path.join(cssTemplatesDir, 'jinja'));
  console.log(`Copied template assets to ${cssTemplatesDir}`);

  // Create Tailwind CSS builds for the CSS package.
  const cdnEntries = ['basecoat.cdn.css', 'basecoat-base.cdn.css', 'basecoat-compat.cdn.css', ...styles.map((style) => `basecoat-${style}.cdn.css`)];
  for (const entry of cdnEntries) {
    const cdnCssSrc = path.join(srcCssDir, entry);
    const baseName = path.basename(entry, '.css');
    const cssDistCdnPath = path.join(cssDistDir, `${baseName}.css`);
    const cssDistCdnMinPath = path.join(cssDistDir, `${baseName}.min.css`);

    await execPromise(`npx tailwindcss -i "${cdnCssSrc}" -o "${cssDistCdnPath}"`);
    console.log(`Generated non-minified CSS: ${cssDistCdnPath}`);
    const { code, warnings } = await transform(await fs.readFile(cssDistCdnPath, 'utf-8'), {
      loader: 'css',
      minify: true,
      target: cssTargets,
    });
    if (warnings.length) throw new Error(`esbuild warnings for ${cssDistCdnPath}: ${warnings.map((w) => w.text).join('; ')}`);
    await fs.writeFile(cssDistCdnMinPath, code);
    console.log(`Generated minified CSS: ${cssDistCdnMinPath}`);
  }

  console.log('Build process finished successfully!');
}

build().catch(error => {
  console.error('Build failed:', error);
  process.exit(1);
});
