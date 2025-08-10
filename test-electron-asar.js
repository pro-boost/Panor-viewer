const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

// Test ASAR file access in Electron context
function testAsarAccess() {
  console.log('Testing ASAR file access...');
  console.log('__dirname:', __dirname);
  console.log('process.resourcesPath:', process.resourcesPath);
  
  const isAsar = __dirname.includes('.asar');
  console.log('Is ASAR mode:', isAsar);
  
  if (isAsar) {
    try {
      const configPath = path.join(__dirname, '../data/credential-config.json');
      console.log('Trying to read from:', configPath);
      const configData = fs.readFileSync(configPath, 'utf8');
      const config = JSON.parse(configData);
      console.log('✓ Successfully loaded config from ASAR');
      console.log('Config keys:', Object.keys(config));
    } catch (error) {
      console.log('✗ Failed to load config from ASAR:', error.message);
    }
  } else {
    console.log('Not in ASAR mode, testing regular file access...');
    try {
      const configPath = path.join(__dirname, 'data/credential-config.json');
      console.log('Trying to read from:', configPath);
      const configData = fs.readFileSync(configPath, 'utf8');
      const config = JSON.parse(configData);
      console.log('✓ Successfully loaded config from regular file');
      console.log('Config keys:', Object.keys(config));
    } catch (error) {
      console.log('✗ Failed to load config from regular file:', error.message);
    }
  }
}

app.whenReady().then(() => {
  testAsarAccess();
  
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  
  win.loadFile('package.json'); // Just load something simple
  
  setTimeout(() => {
    app.quit();
  }, 5000);
});

app.on('window-all-closed', () => {
  app.quit();
});