const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Path to the packaged standalone directory
const packagedStandalonePath = path.join(__dirname, '..', 'dist', 'win-unpacked', 'resources', 'app.asar.unpacked', '.next', 'standalone');

console.log('Installing dependencies for packaged application...');

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
} else {
  console.log('✗ Packaged standalone directory not found at:', packagedStandalonePath);
  process.exit(1);
}