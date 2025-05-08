#!/usr/bin/env node

import { Command } from 'commander';
import inquirer from 'inquirer';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const program = new Command();

// Attempt to read version from the CLI's own package.json
let packageVersion = 'unknown';
try {
  const cliScriptRunningDir = path.dirname(fileURLToPath(import.meta.url)); // .../packages/cli/dist
  const cliPackageRootDir = path.resolve(cliScriptRunningDir, '..');       // .../packages/cli
  const packageJsonPath = path.join(cliPackageRootDir, 'package.json');
  const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf8');
  packageVersion = JSON.parse(packageJsonContent).version;
} catch (error) {
  console.warn('Could not read CLI package version:', error.message);
}

const DEFAULT_CONFIG = {
  templateEngine: null,
  templateDest: './components/basecoat', 
  scriptDest: './static/js/basecoat'
};
let config = { ...DEFAULT_CONFIG }; // User-specific config, potentially updated by prompts

// Discovers available components from the CLI's bundled assets.
async function getAvailableComponents() {
  try {
    const cliScriptRunningDir = path.dirname(fileURLToPath(import.meta.url));
    const assetsDir = path.resolve(cliScriptRunningDir, 'assets'); 
    const jsSourceDir = path.join(assetsDir, 'js');
    
    const jsFiles = await fs.readdir(jsSourceDir);
    
    return jsFiles
      .filter(file => file.endsWith('.js'))
      .map(file => path.basename(file, '.js'));
  } catch (error) {
    console.error("Error reading component source directories from CLI assets:", error);
    return [];
  }
}

// Ensures necessary configuration (template engine, destination paths) is set, prompting the user if needed.
async function ensureConfiguration() {
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

  const pathPrompts = [];
  if (!config.templateDest || config.templateDest === DEFAULT_CONFIG.templateDest) {
    pathPrompts.push({
        type: 'input',
        name: 'templateDest',
        message: 'Where should template files be placed?',
        default: DEFAULT_CONFIG.templateDest,
    });
  }
  if (!config.scriptDest || config.scriptDest === DEFAULT_CONFIG.scriptDest) {
    pathPrompts.push({
        type: 'input',
        name: 'scriptDest',
        message: 'Where should script files be placed?',
        default: DEFAULT_CONFIG.scriptDest,
    });
  }

  if (pathPrompts.length > 0) {
    const pathChoices = await inquirer.prompt(pathPrompts);
    if (pathChoices.templateDest) config.templateDest = pathChoices.templateDest;
    if (pathChoices.scriptDest) config.scriptDest = pathChoices.scriptDest;
  }
}

// Copies a component's template and script files to the user's project.
async function addComponent(componentName) {
  console.log(`\nProcessing component: ${componentName}...`);

  const cliScriptRunningDir = path.dirname(fileURLToPath(import.meta.url));
  const assetsDir = path.resolve(cliScriptRunningDir, 'assets');
  const templateExt = config.templateEngine === 'jinja' ? '.html.jinja' : '.njk';
  
  const templateSource = path.join(assetsDir, config.templateEngine, `${componentName}${templateExt}`); 
  const scriptSource = path.join(assetsDir, 'js', `${componentName}.js`); 

  const templateDestPath = path.resolve(process.cwd(), config.templateDest, `${componentName}${templateExt}`);
  const scriptDestPath = path.resolve(process.cwd(), config.scriptDest, `${componentName}.js`);

  try {
    const templateExists = await fs.pathExists(templateSource);
    const scriptExists = await fs.pathExists(scriptSource);

    if (!templateExists) {
      console.error(`  Error: Template file for component '${componentName}' not found in CLI assets. Searched: ${templateSource}`);
      // Optionally, list available template engines or files for that component if helpful
    }
    if (!scriptExists) {
      console.error(`  Error: Script file for component '${componentName}' not found in CLI assets. Searched: ${scriptSource}`);
    }
    if (!templateExists || !scriptExists) return; // Skip this component if sources are missing

    await fs.ensureDir(path.dirname(templateDestPath));
    await fs.ensureDir(path.dirname(scriptDestPath));

    await fs.copyFile(templateSource, templateDestPath);
    console.log(`  -> Copied template to: ${templateDestPath}`);
    await fs.copyFile(scriptSource, scriptDestPath);
    console.log(`  -> Copied script to:   ${scriptDestPath}`);

  } catch (error) {
    console.error(`  Error processing component ${componentName}:`, error);
  }
}

// Setup main CLI program
program
  .name('basecoat')
  .description('Add Basecoat components to your project')
  .version(packageVersion);

// Define the 'add' command
program
  .command('add')
  .description('Add one or more Basecoat components to your project')
  .argument('[components...]', 'Names of components to add (e.g., dialog select)')
  .action(async (componentsArg) => {
    let componentsToAdd = componentsArg;
    try {
      if (!componentsToAdd || componentsToAdd.length === 0) {
        const availableComponents = await getAvailableComponents();
        if (availableComponents.length === 0) {
          console.error('Error: No components available in the CLI. Build might be corrupted.');
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
      
      await ensureConfiguration(); // Confirm/gather destination paths

      for (const componentName of componentsToAdd) {
        await addComponent(componentName);
      }
      console.log('\nComponent addition process finished.');

    } catch (error) {
      if (error.isTtyError || error.constructor?.name === 'ExitPromptError') { // Handle inquirer cancellation
        console.log('\nOperation cancelled by user.');
      } else {
        console.error('\nAn unexpected error occurred during the add command:', error);
      }
      process.exit(1); // Exit with error code for unexpected errors
    }
  });

program.parse(process.argv); 