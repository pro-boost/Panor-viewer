#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

/**
 * Get the user data directory path for the current platform
 * This mimics Electron's app.getPath('userData') behavior
 * @returns {string} The user data directory path
 */
function getUserDataPath() {
  const platform = process.platform;
  const appName = 'advanced-panorama-viewer';
  
  switch (platform) {
    case 'win32':
      // Windows: %APPDATA%/advanced-panorama-viewer
      return path.join(process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming'), appName);
    
    case 'darwin':
      // macOS: ~/Library/Application Support/advanced-panorama-viewer
      return path.join(os.homedir(), 'Library', 'Application Support', appName);
    
    case 'linux':
    default:
      // Linux: ~/.config/advanced-panorama-viewer
      return path.join(process.env.XDG_CONFIG_HOME || path.join(os.homedir(), '.config'), appName);
  }
}

/**
 * Get the projects directory path
 * @returns {string} The projects directory path
 */
function getProjectsPath() {
  return path.join(getUserDataPath(), 'projects');
}

function startDevServer() {
  try {
    // Get the projects path
    const projectsPath = getProjectsPath();
    
    // Ensure the projects directory exists
    if (!fs.existsSync(projectsPath)) {
      fs.mkdirSync(projectsPath, { recursive: true });
    }
    
    console.log(`Setting PROJECTS_PATH to: ${projectsPath}`);
    
    // Set up environment variables
    const env = {
      ...process.env,
      PROJECTS_PATH: projectsPath
    };
    
    // Spawn the next dev process
    const nextDev = spawn('npx', ['next', 'dev'], {
      stdio: 'inherit',
      env: env,
      shell: true
    });
    
    // Handle process termination
    process.on('SIGINT', () => {
      nextDev.kill('SIGINT');
    });
    
    process.on('SIGTERM', () => {
      nextDev.kill('SIGTERM');
    });
    
    nextDev.on('exit', (code) => {
      process.exit(code);
    });
    
  } catch (error) {
    console.error('Error starting dev server:', error);
    process.exit(1);
  }
}

startDevServer();