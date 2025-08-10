const { ServerManager } = require('./desktop/server.js');
const path = require('path');
const os = require('os');
const fs = require('fs');

// Simulate the exact packaged app environment
process.resourcesPath = '/Users/brahim_lk/Desktop/Pano-viewer-project/Panor-viewer/dist/mac-arm64/Advanced Panorama Viewer.app/Contents/Resources';

// Create a test user data path that matches what Electron would use
const testUserDataPath = path.join(os.homedir(), 'Library', 'Application Support', 'Advanced Panorama Viewer');

console.log('Testing ServerManager with exact packaged app environment...');
console.log('Resources path:', process.resourcesPath);
console.log('User data path:', testUserDataPath);

// Check if all required files exist
const standalonePath = path.join(process.resourcesPath, 'standalone');
const serverJsPath = path.join(standalonePath, 'server.js');
const nodePath = path.join(process.resourcesPath, 'node', 'node');

console.log('\nChecking required files:');
console.log('Standalone directory exists:', fs.existsSync(standalonePath));
console.log('Server.js exists:', fs.existsSync(serverJsPath));
console.log('Node executable exists:', fs.existsSync(nodePath));

if (!fs.existsSync(standalonePath)) {
  console.error('❌ Standalone directory not found!');
  process.exit(1);
}

if (!fs.existsSync(serverJsPath)) {
  console.error('❌ Server.js not found!');
  process.exit(1);
}

if (!fs.existsSync(nodePath)) {
  console.error('❌ Node executable not found!');
  process.exit(1);
}

console.log('✅ All required files exist');

// Create user data directory if it doesn't exist
if (!fs.existsSync(testUserDataPath)) {
  fs.mkdirSync(testUserDataPath, { recursive: true });
  console.log('Created user data directory:', testUserDataPath);
}

const serverManager = new ServerManager(testUserDataPath);

console.log('\nStarting ServerManager...');
serverManager.start()
  .then((serverUrl) => {
    console.log('✅ Server started successfully!');
    console.log('Server URL:', serverUrl);
    
    // Test the /api/hello endpoint
    const http = require('http');
    const req = http.get(serverUrl + '/api/hello', (res) => {
      console.log('✅ /api/hello endpoint is responding');
      console.log('Response status:', res.statusCode);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('Response body:', data);
        
        // Stop the server after successful test
        setTimeout(() => {
          console.log('Stopping server...');
          serverManager.stop();
          process.exit(0);
        }, 2000);
      });
    });
    
    req.on('error', (err) => {
      console.error('❌ Failed to connect to /api/hello:', err.message);
      serverManager.stop();
      process.exit(1);
    });
    
    req.setTimeout(5000, () => {
      console.error('❌ Timeout connecting to /api/hello');
      req.destroy();
      serverManager.stop();
      process.exit(1);
    });
  })
  .catch((error) => {
    console.error('❌ Server failed to start:');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    process.exit(1);
  });

// Add timeout to prevent hanging
setTimeout(() => {
  console.error('❌ Test timed out after 60 seconds');
  process.exit(1);
}, 60000);