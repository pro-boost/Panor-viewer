const { app, BrowserWindow, protocol, ipcMain, shell, Menu } = require("electron");
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
app.commandLine.appendSwitch("enable-gpu-rasterization");
app.commandLine.appendSwitch("enable-webgl");
app.commandLine.appendSwitch("enable-accelerated-2d-canvas");
app.commandLine.appendSwitch("enable-accelerated-video-decode");
app.commandLine.appendSwitch("disable-background-timer-throttling");
app.commandLine.appendSwitch("disable-renderer-backgrounding");
app.commandLine.appendSwitch("disable-backgrounding-occluded-windows");
app.commandLine.appendSwitch(
  "enable-features",
  "VaapiVideoDecoder,VaapiVideoEncoder",
);
app.commandLine.appendSwitch("max_old_space_size", "4096");

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

// Function to check if a port is available
function checkPort(port) {
  return new Promise((resolve) => {
    const net = require('net');
    const server = net.createServer();
    
    server.listen(port, () => {
      server.once('close', () => {
        resolve(false); // Port is available
      });
      server.close();
    });
    
    server.on('error', () => {
      resolve(true); // Port is in use
    });
  });
}

// Function to find the Next.js dev server port
async function findDevServerPort() {
  const portsToTry = [3000, 3001, 3002, 3003, 3004, 3005];
  
  for (const port of portsToTry) {
    const isInUse = await checkPort(port);
    if (isInUse) {
      console.log(`Found server running on port ${port}`);
      return `http://localhost:${port}`;
    }
  }
  
  console.log('No dev server found, using default port 3000');
  return 'http://localhost:3000';
}

async function createWindow() {
  serverUrl = "http://localhost:3456"; // Default fallback URL
  let serverStartupError = null;

  try {
    console.log("Creating window...");
    console.log("Development mode:", isDev);
    console.log("App packaged:", app.isPackaged);
    console.log("Force production:", forceProduction);

    // For development, dynamically find the Next.js dev server port
    if (isDev) {
      serverUrl = await findDevServerPort();
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
          setTimeout(
            () => reject(new Error("Server startup timeout after 30 seconds")),
            30000,
          );
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
    
    // Recreate menu with the correct server URL
    await createMenu();

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
      icon: path.join(
        __dirname,
        "../public/icons/panorama-viewer-icon-multi.ico",
      ),
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
      mainWindow.webContents.once("did-finish-load", () => {
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
      },
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

// Store menu template for dynamic updates
let currentMenuTemplate = null;
let isAdmin = false;
let serverUrl = null; // Will be set dynamically

// Store dynamic menu data
let projectsList = [];
let poiList = [];

// Function to fetch projects dynamically
async function fetchProjects() {
  try {
    if (!serverUrl) return [];
    const response = await fetch(`${serverUrl}/api/projects`);
    if (response.ok) {
      const data = await response.json();
      console.log('[MENU] Projects API response:', data);
      return data.projects || [];
    }
  } catch (error) {
    console.log('[MENU] Failed to fetch projects:', error.message);
  }
  return [];
}

// Function to fetch POIs dynamically from all projects
async function fetchPOIs() {
  try {
    if (!serverUrl || projectsList.length === 0) return [];
    
    const allPOIs = [];
    
    // Fetch POIs from each project
    for (const project of projectsList) {
      try {
        const response = await fetch(`${serverUrl}/api/poi/load?projectId=${encodeURIComponent(project.id)}`);
        if (response.ok) {
          const data = await response.json();
          if (data.pois && data.pois.length > 0) {
            // Add project info to each POI for menu navigation
            const poisWithProject = data.pois.map(poi => ({
              ...poi,
              projectId: project.id,
              projectName: project.name
            }));
            allPOIs.push(...poisWithProject);
          }
        }
      } catch (error) {
        console.log(`[MENU] Failed to fetch POIs for project ${project.id}:`, error.message);
      }
    }
    
    console.log('[MENU] Total POIs fetched:', allPOIs.length);
    return allPOIs;
  } catch (error) {
    console.log('[MENU] Failed to fetch POIs:', error.message);
  }
  return [];
}

// Create application menu with navigation buttons
async function createMenu() {
  // Fallback URL if serverUrl is not set yet
  const baseUrl = serverUrl || 'http://localhost:3000';
  
  // Fetch dynamic data
  projectsList = await fetchProjects();
  poiList = await fetchPOIs();
  
  // Build Projects submenu
  const projectsSubmenu = [
    {
      label: 'Create New Project',
      accelerator: 'CmdOrCtrl+N',
      click: () => {
        if (mainWindow) {
          mainWindow.loadURL(`${baseUrl}/upload`);
        }
      }
    }
  ];
  
  // Add separator if there are projects
  if (projectsList.length > 0) {
    projectsSubmenu.push({ type: 'separator' });
    
    // Add dynamic project items
    projectsList.forEach(project => {
      projectsSubmenu.push({
        label: project.name || project.id,
        click: () => {
          if (mainWindow) {
            mainWindow.loadURL(`${baseUrl}/${project.id}`);
          }
        }
      });
    });
  }
  
  // Build POI submenu
  const poiSubmenu = [
    {
      label: 'Manage POI',
      accelerator: 'CmdOrCtrl+P',
      click: () => {
        if (mainWindow) {
          mainWindow.loadURL(`${baseUrl}/poi-management`);
        }
      }
    }
  ];
  
  // Add separator if there are POIs
  if (poiList.length > 0) {
    poiSubmenu.push({ type: 'separator' });
    
    // Add dynamic POI items
    poiList.forEach(poi => {
      poiSubmenu.push({
        label: poi.name || poi.title || `POI ${poi.id}`,
        click: () => {
          if (mainWindow) {
            // Navigate to the project containing this POI
            const projectId = poi.projectId || poi.project_id;
            if (projectId) {
              mainWindow.loadURL(`${baseUrl}/${projectId}?poi=${poi.id}`);
            } else {
              mainWindow.loadURL(`${baseUrl}/poi-management`);
            }
          }
        }
      });
    });
  }
  
  const pagesSubmenu = [
    {
      label: 'Home',
      accelerator: 'CmdOrCtrl+H',
      click: () => {
        if (mainWindow) {
          mainWindow.loadURL(`${baseUrl}/`);
        }
      }
    }
  ];

  // Add Admin menu item only if user is admin
  if (isAdmin) {
    pagesSubmenu.push({
      label: 'Admin',
      accelerator: 'CmdOrCtrl+A',
      click: () => {
        if (mainWindow) {
          mainWindow.loadURL(`${baseUrl}/admin`);
        }
      }
    });
  }
  
  // Add Projects submenu
  pagesSubmenu.push({
    label: 'Projects',
    submenu: projectsSubmenu
  });
  
  // Add POI submenu
  pagesSubmenu.push({
    label: 'POI',
    submenu: poiSubmenu
  });



  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Quit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectall' }
      ]
    },
    {
      label: 'Pages',
      submenu: pagesSubmenu
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Back',
          accelerator: 'Alt+Left',
          click: () => {
            if (mainWindow && mainWindow.webContents.canGoBack()) {
              mainWindow.webContents.goBack();
            }
          }
        },
        {
          label: 'Forward',
          accelerator: 'Alt+Right',
          click: () => {
            if (mainWindow && mainWindow.webContents.canGoForward()) {
              mainWindow.webContents.goForward();
            }
          }
        },
        {
          label: 'Reload',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.reload();
            }
          }
        },
        { type: 'separator' },
        { role: 'resetzoom' },
        { role: 'zoomin' },
        { role: 'zoomout' },
         { type: 'separator' },
         { role: 'togglefullscreen' },
         { type: 'separator' },
         {
           label: 'Toggle Developer Tools',
           accelerator: process.platform === 'darwin' ? 'Alt+Cmd+I' : 'Ctrl+Shift+I',
           click: () => {
             if (mainWindow) {
               mainWindow.webContents.toggleDevTools();
             }
           }
         }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'close' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About',
          click: () => {
            // You can add an about dialog here if needed
          }
        }
      ]
    }
  ];

  // macOS specific menu adjustments
  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services', submenu: [] },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideothers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    });

    // Window menu
    template[4].submenu = [
      { role: 'close' },
      { role: 'minimize' },
      { role: 'zoom' },
      { type: 'separator' },
      { role: 'front' }
    ];
  }

  currentMenuTemplate = template;
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Function to update menu dynamically
async function updateMenu(adminStatus = null) {
  console.log("[MENU] updateMenu called with:", { adminStatus });
  if (adminStatus !== null) {
    isAdmin = adminStatus;
    console.log("[MENU] Updated isAdmin to:", isAdmin);
  }
  console.log("[MENU] Current state before createMenu:", { isAdmin });
  await createMenu();
  console.log("[MENU] Menu recreated");
}

// Function to refresh menu with updated dynamic content
async function refreshMenu() {
  console.log('[MENU] Refreshing menu with updated content');
  await createMenu();
}

// Set up periodic menu refresh to update dynamic content
function setupMenuRefresh() {
  // Refresh menu every 30 seconds to update projects and POIs
  setInterval(async () => {
    if (serverUrl && mainWindow) {
      await refreshMenu();
    }
  }, 30000);
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

// IPC handlers for menu updates
ipcMain.handle("update-menu-admin-status", async (event, adminStatus) => {
  console.log("[IPC] update-menu-admin-status called with:", adminStatus);
  await updateMenu(adminStatus);
});

app.whenReady().then(async () => {
  console.log("App is ready, creating window...");
  createWindow().catch((error) => {
    console.error("Failed to start application:", error);
    app.quit();
  });
  await createMenu();
  setupMenuRefresh();
  // Test menu update on startup
  console.log("[STARTUP] Testing menu update...");
  setTimeout(async () => {
    console.log("[STARTUP] Calling updateMenu with admin=true...");
    await updateMenu(true);
  }, 3000);
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
