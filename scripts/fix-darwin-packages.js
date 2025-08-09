const fs = require('fs');
const path = require('path');

/**
 * Fix for ENOENT error with @next/swc-darwin-arm64 package
 * This script creates placeholder darwin packages to prevent build issues on Windows
 */

const nodeModulesPath = path.join(__dirname, '..', 'node_modules');
const darwinPackages = [
  { name: '@next/swc-darwin-arm64', cpu: 'arm64' },
  { name: '@next/swc-darwin-x64', cpu: 'x64' }
];

console.log('Fixing darwin packages...');

darwinPackages.forEach(({ name, cpu }) => {
  const packagePath = path.join(nodeModulesPath, name);
  const packageJsonPath = path.join(packagePath, 'package.json');
  
  if (!fs.existsSync(packagePath)) {
    console.log(`Creating placeholder directory for ${name}...`);
    try {
      fs.mkdirSync(packagePath, { recursive: true });
      
      const packageJson = {
        name: name,
        version: '0.0.0',
        description: 'Placeholder package for Windows build compatibility',
        main: 'index.js',
        os: ['darwin'],
        cpu: [cpu]
      };
      
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      console.log(`✓ Successfully created placeholder for ${name}`);
    } catch (error) {
      console.error(`✗ Failed to create placeholder for ${name}:`, error.message);
    }
  } else {
    console.log(`✓ ${name} already exists`);
  }
});

console.log('Darwin packages fix completed.');