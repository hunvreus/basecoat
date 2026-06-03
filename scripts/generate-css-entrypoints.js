import fs from 'fs/promises';
import path from 'path';

const styles = ['vega', 'nova', 'maia', 'lyra', 'mira', 'luma', 'sera', 'rhea'];
const excludedComponents = new Set(['form']);

// Keep cascade stable for components whose selectors intentionally compose.
const componentOrder = [
  'alert',
  'badge',
  'button',
  'button-group',
  'card',
  'collapsible',
  'command',
  'combobox',
  'dialog',
  'dropdown-menu',
  'empty',
  'field',
  'checkbox',
  'input',
  'input-group',
  'item',
  'kbd',
  'label',
  'native-select',
  'popover',
  'radio',
  'range',
  'select',
  'sidebar',
  'skeleton',
  'switch',
  'table',
  'tabs',
  'textarea',
  'toast',
  'tooltip',
];

async function existingComponentNames(cssDir) {
  const componentDir = path.join(cssDir, 'components');
  const files = await fs.readdir(componentDir);
  const names = files
    .filter((file) => file.endsWith('.css'))
    .map((file) => path.basename(file, '.css'))
    .filter((name) => !excludedComponents.has(name));
  const known = componentOrder.filter((name) => names.includes(name));
  const extra = names.filter((name) => !componentOrder.includes(name)).sort();
  return [...known, ...extra];
}

function componentImports(names) {
  return [
    '/* Components */',
    ...names.map((name) => `@import "./components/${name}.css";`),
  ].join('\n');
}

async function writeIfChanged(filePath, content) {
  let current = null;
  try {
    current = await fs.readFile(filePath, 'utf8');
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  if (current !== content) await fs.writeFile(filePath, content);
}

export async function generateCssEntrypoints({ cssDir = path.resolve('src/css') } = {}) {
  const components = await existingComponentNames(cssDir);
  const componentsCss = `${componentImports(components)}\n`;
  const baseCss = `@import "./base/base.css";\n@import "./basecoat-components.css";\n`;

  await writeIfChanged(path.join(cssDir, 'basecoat-components.css'), componentsCss);
  await writeIfChanged(path.join(cssDir, 'basecoat-base.css'), baseCss);
  await writeIfChanged(path.join(cssDir, 'basecoat-base.cdn.css'), '@import "tailwindcss" source(none);\n@import "./basecoat-base.css";\n');

  for (const style of styles) {
    await writeIfChanged(
      path.join(cssDir, `basecoat-${style}.css`),
      `@import "./basecoat-base.css";\n@import "./styles/${style}.css";\n`,
    );
    await writeIfChanged(
      path.join(cssDir, `basecoat-${style}.cdn.css`),
      `@import "tailwindcss" source(none);\n@import "./basecoat-${style}.css";\n`,
    );
  }

  await writeIfChanged(path.join(cssDir, 'basecoat.css'), '@import "./basecoat-vega.css";\n');
  await writeIfChanged(path.join(cssDir, 'basecoat.all.css'), '@import "./basecoat.css";\n');
  await writeIfChanged(path.join(cssDir, 'basecoat.cdn.css'), '@import "tailwindcss" source(none);\n@import "./basecoat.css";\n');

  return { components, styles };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await generateCssEntrypoints();
}
