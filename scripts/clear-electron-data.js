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
  const platform = os.platform();
  
  // Both possible app names (dev uses package name, production uses productName)
  const appNames = ['Advanced Panorama Viewer', 'pano-app'];
  const allPaths = [];
  
  appNames.forEach(appName => {
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
    
    allPaths.push({
      appName,
      userDataPath,
      sessionStoragePath: path.join(userDataPath, 'Session Storage'),
      localStoragePath: path.join(userDataPath, 'Local Storage'),
      cookiesPath: path.join(userDataPath, 'Cookies'),
      cachePath: path.join(userDataPath, 'Cache'),
      logsPath: path.join(userDataPath, 'logs'),
      preferencesPath: path.join(userDataPath, 'Preferences'),
      networkPersistentStatePath: path.join(userDataPath, 'Network Persistent State')
    });
  });
  
  // Also add the credential cache location
  const credentialCachePath = path.join(os.homedir(), '.panorama-viewer');
  allPaths.push({
    appName: 'Credential Cache',
    userDataPath: credentialCachePath,
    sessionStoragePath: null,
    localStoragePath: null,
    cookiesPath: null,
    cachePath: null,
    logsPath: null,
    preferencesPath: null,
    networkPersistentStatePath: null,
    credentialCachePath: path.join(credentialCachePath, 'credentials-cache.json')
  });
  
  return allPaths;
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
    const allPaths = getElectronDataPaths();
    
    console.log('\n📍 Detected platform:', os.platform());
    
    let foundData = false;
    
    allPaths.forEach(paths => {
      console.log(`\n🔍 Checking ${paths.appName}:`);
      console.log('📁 Path:', paths.userDataPath);
      
      if (!fs.existsSync(paths.userDataPath)) {
        console.log('   ✅ No data found for this app name.');
        return;
      }
      
      foundData = true;
      console.log('   🗑️  Clearing data...');
      
      // Handle credential cache differently
      if (paths.appName === 'Credential Cache') {
        if (paths.credentialCachePath && fs.existsSync(paths.credentialCachePath)) {
          deleteFile(paths.credentialCachePath);
          console.log('   ✅ Credential cache cleared');
        }
        // Remove the entire .panorama-viewer directory if empty
        try {
          if (fs.existsSync(paths.userDataPath)) {
            const files = fs.readdirSync(paths.userDataPath);
            if (files.length === 0) {
              fs.rmdirSync(paths.userDataPath);
              console.log('   ✅ Empty credential cache directory removed');
            }
          }
        } catch (error) {
          console.log('   ⚠️  Could not remove credential cache directory:', error.message);
        }
        return;
      }
      
      // Clear session storage (contains authentication tokens)
      if (paths.sessionStoragePath) deleteDirectory(paths.sessionStoragePath);
      
      // Clear local storage
      if (paths.localStoragePath) deleteDirectory(paths.localStoragePath);
      
      // Clear cookies (HTTP-only cookies for authentication)
      if (paths.cookiesPath) {
        deleteFile(paths.cookiesPath);
        deleteFile(paths.cookiesPath + '-journal');
      }
      
      // Clear cache
      if (paths.cachePath) deleteDirectory(paths.cachePath);
      
      // Clear network state
      if (paths.networkPersistentStatePath) deleteFile(paths.networkPersistentStatePath);
      
      // Clear preferences (optional - contains window state, etc.)
      if (paths.preferencesPath) deleteFile(paths.preferencesPath);
      
      // Clear logs
      if (paths.logsPath) deleteDirectory(paths.logsPath);
      
      console.log(`   ✅ ${paths.appName} data cleared successfully!`);
    });
    
    if (!foundData) {
      console.log('\n✅ No Electron app data found. App data is already clean.');
      return;
    }
    
    console.log('\n🎉 All Electron app data cleared successfully!');
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
    const allPaths = getElectronDataPaths();
    
    console.log('\n📍 Detected platform:', os.platform());
    
    let foundData = false;
    
    allPaths.forEach(paths => {
      console.log(`\n🔍 Checking ${paths.appName}:`);
      console.log('📁 Path:', paths.userDataPath);
      
      if (!fs.existsSync(paths.userDataPath)) {
        console.log('   ✅ No data found for this app name.');
        return;
      }
      
      foundData = true;
      console.log('   🗑️  Clearing authentication data only...');
      
      // Handle credential cache
      if (paths.appName === 'Credential Cache') {
        if (paths.credentialCachePath && fs.existsSync(paths.credentialCachePath)) {
          deleteFile(paths.credentialCachePath);
          console.log('   ✅ Credential cache cleared');
        }
        return;
      }
      
      // Clear session storage (contains authentication tokens)
      if (paths.sessionStoragePath) deleteDirectory(paths.sessionStoragePath);
      
      // Clear cookies (HTTP-only cookies for authentication)
      if (paths.cookiesPath) {
        deleteFile(paths.cookiesPath);
        deleteFile(paths.cookiesPath + '-journal');
      }
      
      // Clear network state
      if (paths.networkPersistentStatePath) deleteFile(paths.networkPersistentStatePath);
      
      console.log(`   ✅ ${paths.appName} authentication data cleared!`);
    });
    
    if (!foundData) {
      console.log('\n✅ No Electron app data found.');
      return;
    }
    
    console.log('\n🎉 All authentication data cleared successfully!');
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