// electron-server.js
const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

// Clean up temporary files on startup
const cleanupTmpOnStartup = () => {
  const tmpDir = path.join(__dirname, 'tmp');
  if (fs.existsSync(tmpDir)) {
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
      console.log('Cleaned up temporary files from previous session');
    } catch (error) {
      console.warn(
        'Warning: Could not clean tmp directory on startup:',
        error.message
      );
      // Force cleanup if normal cleanup fails
      try {
        const files = fs.readdirSync(tmpDir);
        files.forEach(file => {
          const filePath = path.join(tmpDir, file);
          try {
            fs.unlinkSync(filePath);
          } catch (e) {
            console.warn(`Could not delete ${file}:`, e.message);
          }
        });
      } catch (e) {
        console.warn('Force cleanup also failed:', e.message);
      }
    }
  }
};

// Clean up cache and session data
const cleanupCacheOnStartup = () => {
  try {
    // Clear any stuck session files
    const sessionFiles = [
      path.join(__dirname, 'public', 'config.json'),
      path.join(__dirname, '.next', 'cache'),
    ];

    sessionFiles.forEach(filePath => {
      if (fs.existsSync(filePath)) {
        try {
          if (fs.statSync(filePath).isDirectory()) {
            fs.rmSync(filePath, { recursive: true, force: true });
          } else {
            // Only remove config.json if it's corrupted (very small size)
            if (filePath.includes('config.json')) {
              const stats = fs.statSync(filePath);
              if (stats.size < 100) {
                // Less than 100 bytes likely corrupted
                fs.unlinkSync(filePath);
                console.log('Removed corrupted config.json');
              }
            }
          }
        } catch (error) {
          console.warn(`Could not clean ${filePath}:`, error.message);
        }
      }
    });
  } catch (error) {
    console.warn('Cache cleanup warning:', error.message);
  }
};

// Clean logs directory on startup
const cleanupLogsOnStartup = () => {
  const logsDir = path.join(__dirname, 'logs');
  if (fs.existsSync(logsDir)) {
    try {
      const files = fs.readdirSync(logsDir);
      files.forEach(file => {
        const filePath = path.join(logsDir, file);
        try {
          fs.unlinkSync(filePath);
        } catch (error) {
          console.warn(`Could not delete log file ${file}:`, error.message);
        }
      });
      console.log('Cleaned up log files from previous session');
    } catch (error) {
      console.warn(
        'Warning: Could not clean logs directory on startup:',
        error.message
      );
    }
  }
};

// Periodic cleanup during runtime
const startPeriodicCleanup = () => {
  // Clean tmp folder every 30 minutes
  setInterval(
    () => {
      const tmpDir = path.join(__dirname, 'tmp');
      if (fs.existsSync(tmpDir)) {
        try {
          const files = fs.readdirSync(tmpDir);
          if (files.length > 0) {
            files.forEach(file => {
              const filePath = path.join(tmpDir, file);
              try {
                const stats = fs.statSync(filePath);
                // Delete files older than 10 minutes
                const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
                if (stats.mtime.getTime() < tenMinutesAgo) {
                  fs.unlinkSync(filePath);
                  console.log(`Cleaned up old temp file: ${file}`);
                }
              } catch (error) {
                console.warn(
                  `Could not process temp file ${file}:`,
                  error.message
                );
              }
            });
          }
        } catch (error) {
          console.warn('Periodic cleanup warning:', error.message);
        }
      }
    },
    30 * 60 * 1000
  ); // 30 minutes
};

let mainWindow;
let serverProcess;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      webSecurity: true,
      contextIsolation: true,
      enableRemoteModule: false,
      // Clear cache on startup to prevent black screen issues
      partition: 'persist:main',
    },
    icon: path.join(__dirname, 'public', 'icon.ico'), // optional icon
  });

  // Clear browser cache and storage to prevent stuck states
  mainWindow.webContents.session
    .clearCache()
    .then(() => {
      console.log('Browser cache cleared');
    })
    .catch(err => {
      console.warn('Could not clear browser cache:', err);
    });

  mainWindow.webContents.session
    .clearStorageData({
      storages: ['localstorage', 'sessionstorage', 'websql', 'indexdb'],
    })
    .then(() => {
      console.log('Browser storage cleared');
    })
    .catch(err => {
      console.warn('Could not clear browser storage:', err);
    });

  // Wait for server to be ready with retry logic
  let retryCount = 0;
  const maxRetries = 10;
  const retryDelay = 2000;

  const tryLoadURL = () => {
    console.log(
      `Attempting to load URL (attempt ${retryCount + 1}/${maxRetries})`
    );

    mainWindow
      .loadURL('http://localhost:3000')
      .then(() => {
        console.log('Successfully loaded application');
      })
      .catch(err => {
        console.error(
          `Failed to load URL (attempt ${retryCount + 1}):`,
          err.message
        );

        retryCount++;
        if (retryCount < maxRetries) {
          console.log(`Retrying in ${retryDelay}ms...`);
          setTimeout(tryLoadURL, retryDelay);
        } else {
          console.error('Max retries reached. Showing error page.');
          // Show detailed error page
          const errorHtml = `
          <html>
            <head><title>Server Error</title></head>
            <body style="font-family: Arial, sans-serif; padding: 20px; text-align: center;">
              <h1>Application Server Error</h1>
              <p>The application server failed to start after ${maxRetries} attempts.</p>
              <h3>Troubleshooting Steps:</h3>
              <ol style="text-align: left; display: inline-block;">
                <li>Close this application completely</li>
                <li>Run: <code>npm run clean:reset</code></li>
                <li>Restart the application</li>
                <li>If the problem persists, run: <code>npm run build</code> and repackage</li>
              </ol>
              <p><strong>Error:</strong> ${err.message}</p>
            </body>
          </html>
        `;
          mainWindow.loadURL(
            `data:text/html;charset=utf-8,${encodeURIComponent(errorHtml)}`
          );
        }
      });
  };

  // Start trying to load after initial delay
  setTimeout(tryLoadURL, 3000);

  mainWindow.on('closed', () => {
    mainWindow = null;
    if (serverProcess) serverProcess.kill();
  });
}

app.whenReady().then(() => {
  // Clean up temporary files from previous sessions
  cleanupTmpOnStartup();
  cleanupLogsOnStartup();
  cleanupCacheOnStartup();

  // Start periodic cleanup for runtime
  startPeriodicCleanup();

  // Start Next.js server with improved error handling
  const hasNodeModules = fs.existsSync(path.join(__dirname, 'node_modules'));
  const hasNextBuild = fs.existsSync(path.join(__dirname, '.next'));

  console.log('Server startup check:', {
    hasNodeModules,
    hasNextBuild,
    cwd: __dirname,
  });

  if (hasNodeModules && hasNextBuild) {
    // Use the most reliable method - direct Next.js server
    try {
      console.log('Starting Next.js server...');

      // Create a server script with proper static file handling
      const serverScript = `
        const next = require('next');
        const http = require('http');
        const path = require('path');
        const fs = require('fs');
        const url = require('url');
        
        const app = next({ 
          dev: false, 
          dir: '${__dirname.replace(/\\/g, '\\\\\\\\')}',
          quiet: false
        });
        
        const handle = app.getRequestHandler();
        
        app.prepare().then(() => {
          const server = http.createServer((req, res) => {
            const parsedUrl = url.parse(req.url, true);
            const { pathname } = parsedUrl;
            
            // Handle static image files from the packaged location
            if (pathname.startsWith('/images/')) {
              const imagePath = path.join('${__dirname.replace(/\\/g, '\\\\\\\\')}', 'public', pathname);
              
              if (fs.existsSync(imagePath)) {
                const ext = path.extname(imagePath).toLowerCase();
                const mimeTypes = {
                  '.jpg': 'image/jpeg',
                  '.jpeg': 'image/jpeg',
                  '.png': 'image/png',
                  '.gif': 'image/gif',
                  '.webp': 'image/webp'
                };
                
                res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
                res.setHeader('Cache-Control', 'public, max-age=31536000');
                
                const stream = fs.createReadStream(imagePath);
                stream.pipe(res);
                
                stream.on('error', (err) => {
                  console.error('Error serving image:', err);
                  res.statusCode = 500;
                  res.end('Internal Server Error');
                });
                
                return;
              } else {
                console.log('Image not found:', imagePath);
                res.statusCode = 404;
                res.end('Image not found');
                return;
              }
            }
            
            // Handle all other requests with Next.js
            handle(req, res);
          });
          
          server.listen(3000, (err) => {
            if (err) {
              console.error('Server failed to start:', err);
              process.exit(1);
            }
            console.log('> Ready on http://localhost:3000');
            console.log('> Static files served from: ${__dirname.replace(/\\/g, '\\\\\\\\')}\\\\\\\\public');
          });
        }).catch((err) => {
          console.error('Next.js app preparation failed:', err);
          process.exit(1);
        });
      `;

      serverProcess = spawn('node', ['-e', serverScript], {
        cwd: __dirname,
        env: { ...process.env, PORT: '3000', NODE_ENV: 'production' },
        stdio: ['pipe', 'pipe', 'pipe'],
      });
    } catch (error) {
      console.error('Failed to start Next.js server:', error);
    }
  } else {
    console.error('Missing dependencies:', { hasNodeModules, hasNextBuild });
    console.error('Current directory:', __dirname);
    console.error('Please ensure the app is properly built and packaged.');
  }

  if (serverProcess) {
    serverProcess.stdout.on('data', data => {
      const output = data.toString().trim();
      console.log(`[Next.js]: ${output}`);

      // Check if server is ready
      if (output.includes('Ready on') || output.includes('server started on')) {
        console.log('Next.js server is ready!');
      }
    });

    serverProcess.stderr.on('data', data => {
      const error = data.toString().trim();
      console.error(`[Next.js Error]: ${error}`);

      // Check for common errors
      if (error.includes('EADDRINUSE')) {
        console.error(
          'Port 3000 is already in use. Trying to kill existing process...'
        );
      } else if (error.includes('MODULE_NOT_FOUND')) {
        console.error(
          'Missing Node.js modules. The app may not be properly packaged.'
        );
      }
    });

    serverProcess.on('error', error => {
      console.error('Failed to start Next.js server process:', error);
    });

    serverProcess.on('exit', (code, signal) => {
      console.log(
        `Next.js server process exited with code ${code} and signal ${signal}`
      );
      if (code !== 0) {
        console.error(
          'Next.js server crashed. This may cause the blank page issue.'
        );
      }
    });
  } else {
    console.error('Server process was not created!');
  }

  // Wait longer for server to start
  setTimeout(() => {
    createWindow();
  }, 3000);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (serverProcess) serverProcess.kill();
    app.quit();
  }
});
