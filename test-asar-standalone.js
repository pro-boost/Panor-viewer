const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

// Test ASAR standalone access in Electron context
function testAsarStandaloneAccess() {
  console.log('Testing ASAR standalone access...');
  console.log('__dirname:', __dirname);
  console.log('process.resourcesPath:', process.resourcesPath);
  
  const isAsar = __dirname.includes('.asar');
  console.log('Is ASAR mode:', isAsar);
  
  if (isAsar) {
    try {
      const asarStandalonePath = path.join(__dirname, '../.next/standalone');
      console.log('Checking ASAR standalone path:', asarStandalonePath);
      console.log('ASAR standalone path exists:', fs.existsSync(asarStandalonePath));
      
      if (fs.existsSync(asarStandalonePath)) {
        const serverPath = path.join(asarStandalonePath, 'server.js');
        console.log('Server path:', serverPath);
        console.log('Server.js exists:', fs.existsSync(serverPath));
        
        // Try to read the server.js file
        try {
          const serverContent = fs.readFileSync(serverPath, 'utf8');
          console.log('✓ Successfully read server.js from ASAR');
          console.log('Server.js length:', serverContent.length);
        } catch (readError) {
          console.log('✗ Failed to read server.js from ASAR:', readError.message);
        }
        
        // Check if node_modules exists
        const nodeModulesPath = path.join(asarStandalonePath, 'node_modules');
        console.log('Node modules path:', nodeModulesPath);
        console.log('Node modules exists:', fs.existsSync(nodeModulesPath));
      }
    } catch (error) {
      console.log('✗ Failed to access ASAR standalone:', error.message);
    }
  } else {
    console.log('Not in ASAR mode');
  }
}

app.whenReady().then(() => {
  testAsarStandaloneAccess();
  
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