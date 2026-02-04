import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

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

// Main build function to prepare packages for publishing.
async function build() {
  console.log('Starting build process...');

  // Define all necessary paths
  const cliPackageDir = path.join(projectRoot, 'packages', 'cli');
  const cliDistDir = path.join(cliPackageDir, 'dist');
  const cliDistAssetsDir = path.join(cliDistDir, 'assets');

  const cssPackageDir = path.join(projectRoot, 'packages', 'css');
  const cssDistDir = path.join(cssPackageDir, 'dist'); 

  const srcDir = path.join(projectRoot, 'src');
  const srcCssDir = path.join(srcDir, 'css');
  const srcJsDir = path.join(srcDir, 'js');
  const srcNunjucksDir = path.join(srcDir, 'nunjucks');
  const srcJinjaDir = path.join(srcDir, 'jinja');

  // Clean previous build artifacts
  console.log('Cleaning distribution directories...');
  await cleanDir(cliDistDir);
  await cleanDir(cssDistDir);
  
  // Build CLI package
  console.log('Building CLI package...');
  await ensureDir(cliDistDir); // Ensure base dist dir exists
  await ensureDir(cliDistAssetsDir); // Ensure assets dir within dist exists

  await fs.copyFile(path.join(cliPackageDir, 'index.js'), path.join(cliDistDir, 'index.js'));
  console.log(`Copied CLI index.js to ${cliDistDir}`);

  // JS files minification and copy
  const jsFiles = await fs.readdir(srcJsDir);
  const cliJsDistDir = path.join(cliDistAssetsDir, 'js');
  const cssJsDistDir = path.join(cssDistDir, 'js');
  await ensureDir(cliJsDistDir);
  await ensureDir(cssJsDistDir);
  console.log('Copying and minifying JS files...');

  for (const jsFile of jsFiles) {
    if (path.extname(jsFile) === '.js') {
      const srcFile = path.join(srcJsDir, jsFile);
      const baseName = path.basename(jsFile, '.js');
      const minifiedFileName = `${baseName}.min.js`;

      // Copy original file to both destinations
      await fs.copyFile(srcFile, path.join(cliJsDistDir, jsFile));
      await fs.copyFile(srcFile, path.join(cssJsDistDir, jsFile));

      // Create and copy minified file to both destinations
      const cliDestMinFile = path.join(cliJsDistDir, minifiedFileName);
      await execPromise(`npx terser ${srcFile} -o ${cliDestMinFile} --compress --mangle`);
      await fs.copyFile(cliDestMinFile, path.join(cssJsDistDir, minifiedFileName));
    }
  }

  // Create combined component files
  console.log('Creating combined component files...');
  const componentsToCombine = ['basecoat.js', 'command.js', 'dropdown-menu.js', 'popover.js', 'select.js', 'sidebar.js', 'tabs.js', 'toast.js'];
  const componentPaths = componentsToCombine.map(f => path.join(srcJsDir, f));

  // Create non-minified bundle
  let combinedContent = '';
  for (const p of componentPaths) {
    combinedContent += await fs.readFile(p, 'utf-8') + '\n';
  }
  const allJsPath = path.join(cliJsDistDir, 'all.js');
  await fs.writeFile(allJsPath, combinedContent);
  await fs.copyFile(allJsPath, path.join(cssJsDistDir, 'all.js'));
  
  // Create minified bundle
  const allMinJsPath = path.join(cliJsDistDir, 'all.min.js');
  await execPromise(`npx terser ${componentPaths.join(' ')} -o ${allMinJsPath} --compress --mangle`);
  await fs.copyFile(allMinJsPath, path.join(cssJsDistDir, 'all.min.js'));

  console.log(`Copied and minified JS to ${cliJsDistDir} and ${cssJsDistDir}`);

  await copyDirRecursive(srcNunjucksDir, path.join(cliDistAssetsDir, 'nunjucks'));
  console.log(`Copied Nunjucks assets to ${path.join(cliDistAssetsDir, 'nunjucks')}`);
  await copyDirRecursive(srcJinjaDir, path.join(cliDistAssetsDir, 'jinja'));
  console.log(`Copied Jinja assets to ${path.join(cliDistAssetsDir, 'jinja')}`);

  // Build CSS package
  console.log('Building CSS package...');
  await ensureDir(cssDistDir); // Ensure dist dir exists for css package
  await fs.copyFile(path.join(srcCssDir, 'basecoat.css'), path.join(cssDistDir, 'basecoat.css'));
  console.log(`Copied basecoat.css to ${cssDistDir}`);
  await fs.copyFile(path.join(srcCssDir, 'basecoat.shared.css'), path.join(cssDistDir, 'basecoat.shared.css'));
  console.log(`Copied basecoat.shared.css to ${cssDistDir}`);

  // Create Tailwind CSS builds for the CSS package
  const cdnCssSrc = path.join(srcCssDir, 'basecoat.cdn.css');
  const cssDistCdnPath = path.join(cssDistDir, 'basecoat.cdn.css');
  const cssDistCdnMinPath = path.join(cssDistDir, 'basecoat.cdn.min.css');
  
  await execPromise(`npx tailwindcss -i "${cdnCssSrc}" -o "${cssDistCdnPath}"`);
  console.log(`Generated non-minified CSS: ${cssDistCdnPath}`);
  await execPromise(`npx tailwindcss -i "${cdnCssSrc}" -o "${cssDistCdnMinPath}" --minify`);
  console.log(`Generated minified CSS: ${cssDistCdnMinPath}`);

  // Now for the Quasar build
  const quasarCssSrc = path.join(srcCssDir, 'basecoat.quasar.css');
  const cssDistQuasarPath = path.join(cssDistDir, 'basecoat.quasar.css');
  const cssDistQuasarMinPath = path.join(cssDistDir, 'basecoat.quasar.min.css');

  await execPromise(`npx tailwindcss -i "${quasarCssSrc}" -o "${cssDistQuasarPath}"`);
  console.log(`Generated non-minified Quasar CSS: ${cssDistQuasarPath}`);
  await execPromise(`npx tailwindcss -i "${quasarCssSrc}" -o "${cssDistQuasarMinPath}" --minify`);
  console.log(`Generated minified Quasar CSS: ${cssDistQuasarMinPath}`);

  console.log('HACK: Modifying Quasar CSS for :root, :host to body...');
  let quasarCssContent = await fs.readFile(cssDistQuasarPath, 'utf-8');
  quasarCssContent = quasarCssContent.replace(/:root, :host/g, 'body');
  await fs.writeFile(cssDistQuasarPath, quasarCssContent);
  console.log(`Modified ${cssDistQuasarPath} to replace :root with body`);

  let quasarMinCssContent = await fs.readFile(cssDistQuasarMinPath, 'utf-8');
  quasarMinCssContent = quasarMinCssContent.replace(/:root,:host/g, 'body');
  await fs.writeFile(cssDistQuasarMinPath, quasarMinCssContent);
  console.log(`Modified ${cssDistQuasarMinPath} to replace :root with body`);

  console.log('Build process finished successfully!');
}

build().catch(error => {
  console.error('Build failed:', error);
  process.exit(1);
});
