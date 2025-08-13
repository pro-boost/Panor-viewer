const path = require('path');
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

module.exports = {
  getUserDataPath,
  getProjectsPath,
};