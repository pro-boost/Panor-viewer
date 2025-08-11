const { app, BrowserWindow, protocol, ipcMain, shell } = require("electron");
const path = require("path");

// Simple development mode detection without external dependency
// When running desktop:test, we want to force production mode
const forceProduction = process.argv.includes("--force-production");
const isDev = !app.isPackaged && !forceProduction;
const { ServerManager } = require("./server");
const { setupFileProtocol } = require("./file-server");
// Test project copying functionality removed - no longer auto-copies test projects

let mainWindow;
let serverManager;

// Enable GPU acceleration with modern settings for Electron 32
app.commandLine.appendSwitch('enable-gpu-rasterization');
app.commandLine.appendSwitch('enable-webgl');
app.commandLine.appendSwitch('enable-accelerated-2d-canvas');
app.commandLine.appendSwitch('enable-accelerated-video-decode');
app.commandLine.appendSwitch('disable-background-timer-throttling');
app.commandLine.appendSwitch('disable-renderer-backgrounding');
app.commandLine.appendSwitch('disable-backgrounding-occluded-windows');
app.commandLine.appendSwitch('enable-features', 'VaapiVideoDecoder,VaapiVideoEncoder');
app.commandLine.appendSwitch('max_old_space_size', '4096');

// Single instance lock
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

async function createWindow() {
  let serverUrl = "http://localhost:3456"; // Default fallback URL
  let serverStartupError = null;

  try {
    console.log("Creating window...");
    console.log("Development mode:", isDev);
    console.log("App packaged:", app.isPackaged);
    console.log("Force production:", forceProduction);

    // For development, use the Next.js dev server directly
    if (isDev) {
      serverUrl = "http://localhost:3000";
      console.log("Using development server:", serverUrl);
    } else {
      try {
        console.log("Initializing production server...");
        console.log("User data path:", app.getPath("userData"));
        console.log("App path:", app.getAppPath());
        console.log("Resource path:", process.resourcesPath || "Not available");
        
        // Initialize server manager for production
        serverManager = new ServerManager(app.getPath("userData"));
        console.log("ServerManager created, starting server...");
        
        // Add timeout for server startup
        const serverStartPromise = serverManager.start();
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error("Server startup timeout after 30 seconds")), 30000);
        });
        
        serverUrl = await Promise.race([serverStartPromise, timeoutPromise]);
        console.log(`Production server running at: ${serverUrl}`);
      } catch (serverError) {
        console.error("Failed to start production server:", serverError);
        serverStartupError = serverError;
        // Use fallback URL - the window will still be created
        console.log("Using fallback server URL:", serverUrl);
      }
    }

    console.log(`Final server URL: ${serverUrl}`);

    mainWindow = new BrowserWindow({
      width: 1600,
      height: 1000,
      minWidth: 1200,
      minHeight: 800,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, "preload.js"),
        webSecurity: false, // Required for local file access
        experimentalFeatures: false, // Keep disabled to prevent glitches
        webgl: true,
        hardwareAcceleration: true, // Re-enable with modern Electron
        enableRemoteModule: false,
        allowRunningInsecureContent: false,
      },
      icon: path.join(__dirname, "../public/icons/panorama-viewer-icon-multi.ico"),
      show: false, // Start hidden for smooth loading
      backgroundColor: "#ffffff",
      titleBarStyle: "default",
    });

    // Setup file protocol for direct file access
    setupFileProtocol(app.getPath("userData"));

    // Show window immediately if there was a server startup error
    if (serverStartupError) {
      console.log("Showing window immediately due to server startup error");
      mainWindow.show();
      mainWindow.focus();
      
      // Load the error page from file instead of data URL
      const errorPagePath = path.join(__dirname, "error.html");
      console.log("Loading error page from:", errorPagePath);
      await mainWindow.loadFile(errorPagePath);
      
      // Send error details to the renderer if needed
      mainWindow.webContents.once('did-finish-load', () => {
        mainWindow.webContents.executeJavaScript(`
          const errorElement = document.getElementById('error-details');
          if (errorElement) {
            errorElement.textContent = '${serverStartupError.message.replace(/'/g, "\\'")}';
          }
        `);
      });
    } else {
      // Load the app normally
      console.log("Loading URL:", serverUrl);
      try {
        await mainWindow.loadURL(serverUrl);
      } catch (loadError) {
        console.error("Failed to load URL:", loadError);
        // Show window anyway with error message
        mainWindow.show();
        mainWindow.focus();
      }
    }

    if (isDev) {
      mainWindow.webContents.openDevTools();
    }

    // Add error handling for failed loads
    mainWindow.webContents.on(
      "did-fail-load",
      (event, errorCode, errorDescription) => {
        console.error("Failed to load page:", errorCode, errorDescription);
        // Show window even if page failed to load
        if (!mainWindow.isVisible()) {
          console.log("Showing window due to failed page load");
          mainWindow.show();
          mainWindow.focus();
        }
      }
    );

    mainWindow.webContents.on("did-finish-load", () => {
      console.log("Page loaded successfully");
      // Show window after loading for smooth startup
      if (!mainWindow.isVisible()) {
        mainWindow.show();
        mainWindow.focus();
      }
    });

    // Reduced timeout - force show window after 1 second if not visible
    setTimeout(() => {
      if (mainWindow && !mainWindow.isVisible()) {
        console.log("Force showing window after timeout");
        mainWindow.show();
        mainWindow.focus();
      }
    }, 1000);

    mainWindow.on("closed", () => {
      mainWindow = null;
    });

    // Handle external links
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
      shell.openExternal(url);
      return { action: "deny" };
    });
  } catch (error) {
    console.error("Failed to create window:", error);
    app.quit();
  }
}

// Optimized GPU settings for Electron 27 - performance focused
app.commandLine.appendSwitch("enable-webgl");
app.commandLine.appendSwitch("enable-accelerated-2d-canvas");
app.commandLine.appendSwitch("disable-gpu-sandbox");
app.commandLine.appendSwitch("disable-software-rasterizer");
app.commandLine.appendSwitch("disable-background-timer-throttling");
app.commandLine.appendSwitch("disable-renderer-backgrounding");
app.commandLine.appendSwitch("disable-backgrounding-occluded-windows");
app.commandLine.appendSwitch("disable-dev-shm-usage");
app.commandLine.appendSwitch("max_old_space_size=4096"); // Increase memory limit
// Keep GPU acceleration enabled but avoid problematic switches
// app.commandLine.appendSwitch("disable-gpu"); // Removed - was causing slowness
// app.commandLine.appendSwitch("disable-software-rasterizer"); // Removed
// app.commandLine.appendSwitch("enable-gpu-rasterization"); // Avoid - can cause glitches
// app.commandLine.appendSwitch("enable-zero-copy"); // Avoid - can cause glitches
// app.commandLine.appendSwitch("use-angle", "gl"); // Avoid - can cause glitches
// app.commandLine.appendSwitch("enable-features", "VaapiVideoDecoder"); // Avoid
// app.commandLine.appendSwitch("ignore-gpu-blacklist"); // Avoid

// IPC handlers for file operations
ipcMain.handle("app:getPath", (event, name) => {
  return app.getPath(name);
});

ipcMain.handle("app:getProjectsPath", () => {
  return path.join(app.getPath("userData"), "projects");
});

app.whenReady().then(() => {
  console.log("App is ready, creating window...");
  createWindow().catch((error) => {
    console.error("Failed to start application:", error);
    app.quit();
  });
});

app.on("window-all-closed", () => {
  if (serverManager) {
    serverManager.stop();
  }
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// Cleanup on quit
app.on("before-quit", () => {
  if (serverManager) {
    serverManager.stop();
  }
});