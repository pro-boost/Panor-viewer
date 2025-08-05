const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Path to the packaged standalone directory
const packagedStandalonePath = path.join(__dirname, '..', 'dist-new', 'win-unpacked', 'resources', 'app', '.next', 'standalone');
const packagedAppPath = path.join(__dirname, '..', 'dist-new', 'win-unpacked', 'resources', 'app');

console.log('Installing dependencies for packaged application...');

// Check if standalone directory exists (for unpacked builds)
if (fs.existsSync(packagedStandalonePath)) {
  try {
    console.log('Installing production dependencies in packaged app...');
    execSync('npm install --production --ignore-scripts', { 
      stdio: 'inherit',
      cwd: packagedStandalonePath 
    });
    
    console.log('✓ Dependencies installed successfully in packaged application');
  } catch (error) {
    console.error('✗ Failed to install dependencies in packaged app:', error.message);
    process.exit(1);
  }
} else if (fs.existsSync(path.join(packagedAppPath, 'app.asar'))) {
  // For ASAR-packed builds, dependencies are already included
  console.log('✓ Application is ASAR-packed, dependencies are already included');
} else {
  console.log('✗ Packaged application directory not found at:', packagedAppPath);
  process.exit(1);
}