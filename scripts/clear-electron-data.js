#!/usr/bin/env node

/**
 * Script to clear Electron app data including cookies, sessions, and cache
 * This helps resolve authentication issues and provides a fresh start
 * Run with: node scripts/clear-electron-data.js
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

// Get Electron app data paths for different platforms
function getElectronDataPaths() {
  const appName = 'Advanced Panorama Viewer'; // Match the app name from package.json
  const platform = os.platform();
  
  let userDataPath;
  
  switch (platform) {
    case 'win32':
      userDataPath = path.join(os.homedir(), 'AppData', 'Roaming', appName);
      break;
    case 'darwin':
      userDataPath = path.join(os.homedir(), 'Library', 'Application Support', appName);
      break;
    case 'linux':
      userDataPath = path.join(os.homedir(), '.config', appName);
      break;
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
  
  return {
    userDataPath,
    sessionStoragePath: path.join(userDataPath, 'Session Storage'),
    localStoragePath: path.join(userDataPath, 'Local Storage'),
    cookiesPath: path.join(userDataPath, 'Cookies'),
    cachePath: path.join(userDataPath, 'Cache'),
    logsPath: path.join(userDataPath, 'logs'),
    preferencesPath: path.join(userDataPath, 'Preferences'),
    networkPersistentStatePath: path.join(userDataPath, 'Network Persistent State')
  };
}

// Recursively delete directory
function deleteDirectory(dirPath) {
  if (fs.existsSync(dirPath)) {
    try {
      fs.rmSync(dirPath, { recursive: true, force: true });
      console.log(`✅ Deleted: ${dirPath}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to delete ${dirPath}:`, error.message);
      return false;
    }
  } else {
    console.log(`ℹ️  Not found: ${dirPath}`);
    return true;
  }
}

// Delete specific file
function deleteFile(filePath) {
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      console.log(`✅ Deleted file: ${filePath}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to delete file ${filePath}:`, error.message);
      return false;
    }
  } else {
    console.log(`ℹ️  File not found: ${filePath}`);
    return true;
  }
}

// Main function to clear all Electron data
function clearElectronData() {
  console.log('🧹 Clearing Electron App Data...');
  console.log('=' .repeat(60));
  
  try {
    const paths = getElectronDataPaths();
    
    console.log('\n📍 Detected platform:', os.platform());
    console.log('📁 User data path:', paths.userDataPath);
    
    if (!fs.existsSync(paths.userDataPath)) {
      console.log('\n✅ No Electron app data found. App data is already clean.');
      return;
    }
    
    console.log('\n🗑️  Clearing authentication data...');
    
    // Clear session storage (contains authentication tokens)
    deleteDirectory(paths.sessionStoragePath);
    
    // Clear local storage
    deleteDirectory(paths.localStoragePath);
    
    // Clear cookies (HTTP-only cookies for authentication)
    deleteFile(paths.cookiesPath);
    deleteFile(paths.cookiesPath + '-journal');
    
    // Clear cache
    console.log('\n🗑️  Clearing cache data...');
    deleteDirectory(paths.cachePath);
    
    // Clear network state
    deleteFile(paths.networkPersistentStatePath);
    
    // Clear preferences (optional - contains window state, etc.)
    console.log('\n🗑️  Clearing preferences...');
    deleteFile(paths.preferencesPath);
    
    // Clear logs
    console.log('\n🗑️  Clearing logs...');
    deleteDirectory(paths.logsPath);
    
    console.log('\n✅ Electron app data cleared successfully!');
    console.log('\n💡 Next steps:');
    console.log('   1. Restart the Electron application');
    console.log('   2. You will need to log in again');
    console.log('   3. Check if the "internal server error" is resolved');
    
  } catch (error) {
    console.error('\n💥 Error clearing Electron data:', error.message);
    console.log('\n🔍 You may need to:');
    console.log('   1. Close the Electron application completely');
    console.log('   2. Run this script again');
    console.log('   3. Manually delete the app data folder if needed');
  }
}

// Add option to clear only authentication data (preserve other settings)
function clearAuthDataOnly() {
  console.log('🔐 Clearing Authentication Data Only...');
  console.log('=' .repeat(60));
  
  try {
    const paths = getElectronDataPaths();
    
    console.log('\n📍 Detected platform:', os.platform());
    console.log('📁 User data path:', paths.userDataPath);
    
    if (!fs.existsSync(paths.userDataPath)) {
      console.log('\n✅ No Electron app data found.');
      return;
    }
    
    console.log('\n🗑️  Clearing authentication data only...');
    
    // Clear session storage (contains authentication tokens)
    deleteDirectory(paths.sessionStoragePath);
    
    // Clear cookies (HTTP-only cookies for authentication)
    deleteFile(paths.cookiesPath);
    deleteFile(paths.cookiesPath + '-journal');
    
    // Clear network state
    deleteFile(paths.networkPersistentStatePath);
    
    console.log('\n✅ Authentication data cleared successfully!');
    console.log('\n💡 Window preferences and cache were preserved.');
    console.log('   Restart the app and log in again.');
    
  } catch (error) {
    console.error('\n💥 Error clearing authentication data:', error.message);
  }
}

// Command line interface
function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log('Electron App Data Cleaner');
    console.log('\nUsage:');
    console.log('  node scripts/clear-electron-data.js           # Clear all app data');
    console.log('  node scripts/clear-electron-data.js --auth    # Clear authentication data only');
    console.log('  node scripts/clear-electron-data.js --help    # Show this help');
    console.log('\nOptions:');
    console.log('  --auth    Clear only authentication data (preserve preferences)');
    console.log('  --help    Show help information');
    return;
  }
  
  if (args.includes('--auth')) {
    clearAuthDataOnly();
  } else {
    clearElectronData();
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  clearElectronData,
  clearAuthDataOnly,
  getElectronDataPaths
};