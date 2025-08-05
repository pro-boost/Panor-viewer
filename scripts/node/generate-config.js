#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { generateConfig } = require('./generate-marzipano-config');
const { calculateNorthOffsets } = require('./calculate-north-offsets');

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    project: null,
    projectsPath: null,
    help: false
  };
  
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--project':
        options.project = args[++i];
        break;
      case '--projects-path':
        options.projectsPath = args[++i];
        break;
      case '--help':
      case '-h':
        options.help = true;
        break;
    }
  }
  
  return options;
}

function showHelp() {
  console.log('Usage: node generate-config.js --project <projectId> [--projects-path <path>]');
  console.log('\nGenerate Marzipano configuration from panorama data');
  console.log('\nOptions:');
  console.log('  --project <projectId>      Project ID for project-specific generation (required)');
  console.log('  --projects-path <path>     Custom projects directory path (optional)');
  console.log('  --help, -h                Show this help message');
  console.log('\nExample:');
  console.log('  node generate-config.js --project toyota --projects-path /custom/projects');
}

try {
  const options = parseArgs();
  
  if (options.help) {
    showHelp();
    process.exit(0);
  }

  if (!options.project) {
    console.error('Error: Project ID is required. Use --project <projectId> argument.');
    console.log('\nUse --help for more information.');
    process.exit(1);
  }
  
  const projectId = options.project;

  console.log(`Generating panorama configuration for project: ${projectId}`);

  // Project-specific paths - use command line argument or environment variable
  const projectsPath = options.projectsPath || process.env.PROJECTS_PATH || path.join(process.cwd(), 'projects');
  console.log(`Using projects path: ${projectsPath}`);
  const csvFile = path.join(projectsPath, projectId, 'config', 'pano-poses.csv');
  const outputFile = path.join(projectsPath, projectId, 'config.json');
  const projectPath = `/${projectId}`;

  if (!fs.existsSync(csvFile)) {
    throw new Error(`CSV file not found at ${csvFile}`);
  }

  // Generate config for specific project using Node.js implementation
  generateConfig(csvFile, outputFile, projectPath);

  if (!fs.existsSync(outputFile)) {
    throw new Error(`config.json was not generated at ${outputFile}`);
  }

  console.log(`Configuration generated successfully at ${outputFile}`);

  console.log('Calculating north offsets...');
  
  // Calculate north offsets using Node.js implementation
  calculateNorthOffsets(outputFile);

  console.log('North offsets calculated and applied successfully');
} catch (error) {
  console.error('Error in configuration process:', error.message);
  process.exit(1);
}
