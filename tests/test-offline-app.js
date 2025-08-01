const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Test the offline functionality
console.log('Testing Electron app offline functionality...');

// Temporarily rename the credential config to simulate offline mode
const credentialConfigPath = path.join(__dirname, 'data', 'credential-config.json');
const backupPath = credentialConfigPath + '.backup';

if (fs.existsSync(credentialConfigPath)) {
  fs.renameSync(credentialConfigPath, backupPath);
  console.log('Temporarily disabled credential config for offline test');
}

// Start the app
const appPath = path.join(__dirname, 'dist', 'win-ia32-unpacked', 'PrimeZone Advanced Panorama Viewer.exe');
console.log('Starting app:', appPath);

const appProcess = spawn(appPath, [], {
  stdio: ['ignore', 'pipe', 'pipe']
});

appProcess.stdout.on('data', (data) => {
  console.log('App Output:', data.toString());
});

appProcess.stderr.on('data', (data) => {
  console.log('App Error:', data.toString());
});

appProcess.on('error', (error) => {
  console.error('Failed to start app:', error);
});

appProcess.on('exit', (code) => {
  console.log('App exited with code:', code);
  
  // Restore credential config
  if (fs.existsSync(backupPath)) {
    fs.renameSync(backupPath, credentialConfigPath);
    console.log('Restored credential config');
  }
});

// Kill the app after 10 seconds for testing
setTimeout(() => {
  console.log('Stopping app for test completion...');
  appProcess.kill();
}, 10000);