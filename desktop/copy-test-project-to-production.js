const fs = require('fs');
const path = require('path');
const { app } = require('electron');

/**
 * Copy test project to production projects directory
 * This ensures the test project is available in the built Electron app
 */
function copyTestProjectToProduction() {
  try {
    // Source: development test project (from unpacked asar)
    // In production, __dirname points to app.asar, but we need app.asar.unpacked
    const appPath = app.getAppPath();
    const isPackaged = app.isPackaged;
    
    let sourceProjectPath;
    if (isPackaged) {
      // In packaged app, look in the unpacked directory
      const unpackedPath = appPath.replace('app.asar', 'app.asar.unpacked');
      sourceProjectPath = path.join(unpackedPath, 'projects', 'test-project');
    } else {
      // In development, use the regular path
      sourceProjectPath = path.join(__dirname, '..', 'projects', 'test-project');
    }
    
    // Destination: production projects directory (user data)
    const userDataPath = app.getPath('userData');
    const destProjectsPath = path.join(userDataPath, 'projects');
    const destProjectPath = path.join(destProjectsPath, 'test-project');
    
    console.log('Copying test project to production...');
    console.log('Source:', sourceProjectPath);
    console.log('Destination:', destProjectPath);
    
    // Check if source exists
    if (!fs.existsSync(sourceProjectPath)) {
      console.log('Source test project not found, skipping copy.');
      return;
    }
    
    // Check if destination already exists
    if (fs.existsSync(destProjectPath)) {
      console.log('Test project already exists in production, skipping copy.');
      return;
    }
    
    // Ensure destination directory exists
    if (!fs.existsSync(destProjectsPath)) {
      fs.mkdirSync(destProjectsPath, { recursive: true });
    }
    
    // Copy the entire project directory
    copyDirectoryRecursive(sourceProjectPath, destProjectPath);
    
    console.log('Test project copied successfully to production!');
    
  } catch (error) {
    console.error('Failed to copy test project to production:', error);
  }
}

/**
 * Recursively copy a directory and all its contents
 */
function copyDirectoryRecursive(source, destination) {
  // Create destination directory
  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination, { recursive: true });
  }
  
  // Read source directory
  const items = fs.readdirSync(source);
  
  for (const item of items) {
    const sourcePath = path.join(source, item);
    const destPath = path.join(destination, item);
    
    const stat = fs.statSync(sourcePath);
    
    if (stat.isDirectory()) {
      // Recursively copy subdirectory
      copyDirectoryRecursive(sourcePath, destPath);
    } else {
      // Copy file
      fs.copyFileSync(sourcePath, destPath);
    }
  }
}

module.exports = { copyTestProjectToProduction };