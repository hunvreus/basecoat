#!/usr/bin/env node
// ^^^ Makes the script executable

import { Command } from 'commander';
// We'll add fs-extra and inquirer later

const program = new Command();

console.log('Basecoat CLI');

program
  .name('basecoat')
  .description('Add Basecoat components to your project')
  .version('0.1.0'); // TODO: Get version from package.json

program
  .command('add')
  .description('Add one or more components to your project')
  .argument('[components...]', 'Names of components to add') // Optional arg for now
  .action(async (components) => {
    if (!components || components.length === 0) {
      console.log('Please specify which component(s) to add, or run add without args for a list (TODO).');
      // TODO: Implement interactive component selection if no args
      return;
    }

    console.log(`Attempting to add: ${components.join(', ')}`);

    for (const componentName of components) {
      await addComponent(componentName);
    }

    console.log('\nComponent addition process finished.');
  });

// Placeholder function for adding a single component
async function addComponent(componentName) {
  console.log(`\nProcessing component: ${componentName}`);

  // 1. Check if config file exists (TODO)
  // 2. If not, run init command/ask questions (TODO)
  // 3. Read config (template engine, paths) (TODO)
  // 4. Determine source file paths based on component name and config (TODO)
  // 5. Check if source files exist in the package (TODO)
  // 6. Copy files to destination paths using fs-extra (TODO)

  console.log(`  -> Placeholder: Logic to copy ${componentName} files would go here.`);
}

// TODO: Implement init command
// program
//   .command('init')
//   .description('Initialize basecoat configuration')
//   .action(async () => {
//     console.log('Running init...');
//     // Ask config questions
//     // Save config file
//   });

program.parse(process.argv); 