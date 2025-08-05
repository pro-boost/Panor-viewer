const path = require('path');
const fs = require('fs');

const port = parseInt(process.env.PORT || '3456', 10);

// Check if we're in ASAR mode
const isAsar = __dirname.includes('.asar');

// Calculate standalone path based on environment
let standalonePath;

if (process.resourcesPath) {
  // Packaged app - use process.resourcesPath for reliable path resolution
  if (isAsar) {
    // ASAR packaged app
    standalonePath = path.join(process.resourcesPath, 'app.asar.unpacked', '.next', 'standalone');
  } else {
    // Non-ASAR packaged app - check multiple possible locations
    const possiblePaths = [
      path.join(process.resourcesPath, 'standalone'),
      path.join(process.resourcesPath, 'app', '.next', 'standalone'),
      path.join(process.resourcesPath, '.next', 'standalone')
    ];
    
    standalonePath = possiblePaths.find(p => fs.existsSync(p));
    if (!standalonePath) {
      throw new Error(`Standalone directory not found in any of: ${possiblePaths.join(', ')}`);
    }
  }
} else {
  // Development mode
  standalonePath = isAsar 
    ? path.join(__dirname, '..', '.next', 'standalone')  // In ASAR, go up one level from scripts
    : path.join(__dirname, '..', '.next', 'standalone'); // In development, use parent directory
}

// In desktop environment, use the user data path for projects
// Otherwise, use the standalone build directory
const projectsPath = process.env.ELECTRON_PROJECTS_PATH || 
                    process.env.PROJECTS_PATH || 
                    path.join(standalonePath, 'projects');

// Set environment variables for standalone server
process.env.PORT = port.toString();
process.env.PROJECTS_PATH = projectsPath;
process.env.NODE_ENV = 'production';

// Ensure projects directory exists
if (!fs.existsSync(projectsPath)) {
  fs.mkdirSync(projectsPath, { recursive: true });
}

console.log(`> Starting production server on port ${port}`);
console.log(`> Projects path: ${projectsPath}`);
console.log(`> Standalone path: ${standalonePath}`);
console.log(`> ASAR mode: ${isAsar}`);

if (isAsar) {
  // In ASAR mode, don't change directory, just require the server
  console.log('> Running in ASAR mode, skipping directory change');
  require(path.join(standalonePath, 'server.js'));
} else {
  // Change to standalone directory and run the server
  process.chdir(standalonePath);
  // Require the standalone server with absolute path
  require(path.join(standalonePath, 'server.js'));
}