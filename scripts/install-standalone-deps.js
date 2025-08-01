const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Path to the standalone directory
const standalonePath = path.join(__dirname, '..', '.next', 'standalone');

console.log('Installing dependencies for standalone build...');

if (fs.existsSync(standalonePath)) {
  try {
    // Change to standalone directory and install production dependencies
    process.chdir(standalonePath);
    
    console.log('Installing production dependencies...');
    execSync('npm install --production --ignore-scripts', { 
      stdio: 'inherit',
      cwd: standalonePath 
    });
    
    console.log('✓ Dependencies installed successfully in standalone build');
  } catch (error) {
    console.error('✗ Failed to install dependencies:', error.message);
    process.exit(1);
  }
} else {
  console.log('✗ Standalone directory not found');
  process.exit(1);
}