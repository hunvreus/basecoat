#!/usr/bin/env node

import { Command } from 'commander';
import inquirer from 'inquirer';
import fs from 'fs-extra';
import path from 'path';

const program = new Command();

let packageVersion = 'unknown';
try {
  const cliScriptDir = path.dirname(new URL(import.meta.url).pathname);
  const packageJsonPath = path.resolve(cliScriptDir, '..', 'package.json');
  const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf8');
  packageVersion = JSON.parse(packageJsonContent).version;
} catch (error) {
  console.warn('Could not read package version:', error.message);
}

const DEFAULT_CONFIG = {
  templateEngine: null,
  templateDest: './components/basecoat', 
  scriptDest: './static/js/basecoat'
};
let config = { ...DEFAULT_CONFIG };

async function getAvailableComponents() {
  try {
    const packageRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
    const jsSourceDir = path.join(packageRoot, 'src', 'js');
    const jsFiles = await fs.readdir(jsSourceDir);
    return jsFiles
      .filter(file => file.endsWith('.js'))
      .map(file => path.basename(file, '.js'));
  } catch (error) {
    console.error("Error reading component source directories:", error);
    return [];
  }
}

async function ensureConfiguration() {
  console.log('\nChecking configuration...');

  if (!config.templateEngine) {
    const engineChoice = await inquirer.prompt([
      {
        type: 'list',
        name: 'engine',
        message: 'Which template engine are you using?',
        choices: ['nunjucks', 'jinja'],
      }
    ]);
    config.templateEngine = engineChoice.engine;
  }

  const pathChoices = await inquirer.prompt([
    {
      type: 'input',
      name: 'templateDest',
      message: 'Where should template files be placed?',
      default: './',
    },
    {
      type: 'input',
      name: 'scriptDest',
      message: 'Where should script files be placed?',
      default: './',
    }
  ]);
  config.templateDest = pathChoices.templateDest;
  config.scriptDest = pathChoices.scriptDest;

  console.log(`Configuration set: Engine=${config.templateEngine}, Templates=${config.templateDest}, Scripts=${config.scriptDest}`);
}

console.log('Basecoat CLI');

program
  .name('add')
  .description('Add Basecoat components to your project')
  .version(packageVersion)
  .argument('[components...]', 'Names of components to add')
  .action(async (componentsArg) => {
    let componentsToAdd = componentsArg;
    try {
      if (!componentsToAdd || componentsToAdd.length === 0) {
        const availableComponents = await getAvailableComponents();
        if (availableComponents.length === 0) {
          console.error('Error: Could not find any components.');
          return;
        }

        const answers = await inquirer.prompt([
          {
            type: 'checkbox',
            name: 'selectedComponents',
            message: 'Which component(s) would you like to add?',
            choices: availableComponents,
            validate: (input) => input.length > 0 ? true : 'Please select at least one component.'
          }
        ]);
        
        componentsToAdd = answers.selectedComponents;
      }

      if (!componentsToAdd || componentsToAdd.length === 0) {
        console.log('No components selected. Exiting.');
        return;
      }

      console.log(`Attempting to add: ${componentsToAdd.join(', ')}`);

      await ensureConfiguration();

      for (const componentName of componentsToAdd) {
        await addComponent(componentName);
      }

      console.log('\nComponent addition process finished.');
    } catch (error) {
      if (error.isTtyError || error.constructor.name === 'ExitPromptError') {
        console.log('\nOperation cancelled.');
      } else {
        console.error('\nAn unexpected error occurred:', error);
      }
      process.exit(1);
    }
  });

async function addComponent(componentName) {
  console.log(`\nProcessing component: ${componentName}...`);

  // 1. Determine source paths (relative to package root)
  const cliScriptDir = path.dirname(new URL(import.meta.url).pathname);
  const packageRoot = path.resolve(cliScriptDir, '../..');
  const templateExt = config.templateEngine === 'jinja' ? '.html.jinja' : '.njk';
  const templateSource = path.join(packageRoot, 'src', config.templateEngine, `${componentName}${templateExt}`); 
  const scriptSource = path.join(packageRoot, 'src', 'js', `${componentName}.js`); 

  // 2. Determine destination paths (relative to user's current working directory)
  const templateDestPath = path.resolve(process.cwd(), config.templateDest, `${componentName}${templateExt}`);
  const scriptDestPath = path.resolve(process.cwd(), config.scriptDest, `${componentName}.js`);

  try {
    // 3. Check if source files exist
    const templateExists = await fs.pathExists(templateSource);
    const scriptExists = await fs.pathExists(scriptSource);

    if (!templateExists || !scriptExists) {
      console.error(`  Error: Source files for component '${componentName}' not found. Searched:`);
      if (!templateExists) console.error(`    - ${templateSource}`);
      if (!scriptExists) console.error(`    - ${scriptSource}`);
      return; // Skip this component
    }

    // 4. Ensure destination directories exist
    await fs.ensureDir(path.dirname(templateDestPath));
    await fs.ensureDir(path.dirname(scriptDestPath));

    // 5. Copy files
    await fs.copyFile(templateSource, templateDestPath);
    console.log(`  -> Copied template to: ${templateDestPath}`);
    await fs.copyFile(scriptSource, scriptDestPath);
    console.log(`  -> Copied script to:   ${scriptDestPath}`);

  } catch (error) {
    console.error(`  Error processing component ${componentName}:`, error);
  }
}

program.parse(process.argv); 