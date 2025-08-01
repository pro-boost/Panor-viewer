const { app, BrowserWindow, protocol, ipcMain, shell } = require('electron');
const path = require('path');

// Simple development mode detection without external dependency
// When running desktop:test, we want to force production mode
const forceProduction = process.argv.includes('--force-production');
const isDev = !app.isPackaged && !forceProduction;
const { ServerManager } = require('./server');
const { setupFileProtocol } = require('./file-server');
// Test project copying functionality removed - no longer auto-copies test projects

let mainWindow;
let serverManager;

// Single instance lock
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

async function createWindow() {
  try {
    console.log('Creating window...');
    
    // For development, use the Next.js dev server directly
    const serverUrl = isDev ? 'http://localhost:3000' : await (async () => {
      // Initialize server manager for production
      serverManager = new ServerManager(app.getPath('userData'));
      console.log('Starting server...');
      const url = await serverManager.start();
      console.log(`Server running at: ${url}`);
      return url;
    })();
    
    console.log(`Using server URL: ${serverUrl}`);

  mainWindow = new BrowserWindow({
    width: 1600,
    height: 1000,
    minWidth: 1200,
    minHeight: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: false, // Required for local file access
      experimentalFeatures: true,
      webgl: true,
      enableRemoteModule: false,
      allowRunningInsecureContent: false
    },
    // icon: path.join(__dirname, '../public/icon.svg'), // Temporarily disabled
    show: true,
    backgroundColor: '#ffffff',
    titleBarStyle: 'default'
  });

  // Setup file protocol for direct file access
  setupFileProtocol(app.getPath('userData'));

  // Load the app
  console.log('Loading URL:', serverUrl);
  await mainWindow.loadURL(serverUrl);
  
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }
  
  // Add error handling for failed loads
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load page:', errorCode, errorDescription);
  });
  
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('Page loaded successfully');
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
  
  } catch (error) {
    console.error('Failed to create window:', error);
    app.quit();
  }
}

// Enable WebGL with software-only rendering
app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('disable-gpu-sandbox');
app.commandLine.appendSwitch('enable-webgl');
app.commandLine.appendSwitch('enable-software-rasterizer');
app.commandLine.appendSwitch('disable-features', 'VizDisplayCompositor');
app.commandLine.appendSwitch('use-gl', 'swiftshader');

// IPC handlers for file operations
ipcMain.handle('app:getPath', (event, name) => {
  return app.getPath(name);
});

ipcMain.handle('app:getProjectsPath', () => {
  return path.join(app.getPath('userData'), 'projects');
});

app.whenReady().then(() => {
  console.log('App is ready, creating window...');
  createWindow().catch(error => {
    console.error('Failed to start application:', error);
    app.quit();
  });
});

app.on('window-all-closed', () => {
  if (serverManager) {
    serverManager.stop();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// Cleanup on quit
app.on('before-quit', () => {
  if (serverManager) {
    serverManager.stop();
  }
});