const {
  app,
  BrowserWindow,
  protocol,
  ipcMain,
  shell,
  Menu,
} = require("electron");
const path = require("path");

// Simple development mode detection without external dependency
// When running desktop:test, we want to force production mode
const forceProduction = process.argv.includes("--force-production");
const isDev = !app.isPackaged && !forceProduction;
const { ServerManager } = require("./server");
const { setupFileProtocol } = require("./file-server");
const { getLoadingManager } = require("./loading-manager");
// Test project copying functionality removed - no longer auto-copies test projects

let mainWindow;
let serverManager;
let loadingManager;

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
  "VaapiVideoDecoder,VaapiVideoEncoder"
);
app.commandLine.appendSwitch("max_old_space_size", "4096");

// Single instance lock
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  // Close loading dialog if second instance is attempted
  if (loadingManager && loadingManager.isShowing()) {
    loadingManager.forceClose().catch(console.error);
  }
  app.quit();
} else {
  app.on("second-instance", async () => {
    // Close loading dialog and focus main window if second instance is attempted
    if (loadingManager && loadingManager.isShowing()) {
      console.log("[MAIN] Closing loading dialog due to second instance");
      try {
        await loadingManager.forceClose();
      } catch (error) {
        console.error("[MAIN] Error closing loading dialog on second instance:", error);
      }
    }
    
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

// Function to check if a port is available
function checkPort(port) {
  return new Promise((resolve) => {
    const net = require("net");
    const server = net.createServer();

    server.listen(port, () => {
      server.once("close", () => {
        resolve(false); // Port is available
      });
      server.close();
    });

    server.on("error", () => {
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

  console.log("No dev server found, using default port 3000");
  return "http://localhost:3000";
}

async function createWindow() {
  serverUrl = "http://localhost:3456"; // Default fallback URL
  let serverStartupError = null;

  try {
    console.log("Creating window...");
    console.log("Development mode:", isDev);
    console.log("App packaged:", app.isPackaged);
    console.log("Force production:", forceProduction);

    // Show loading dialog immediately
    loadingManager = getLoadingManager();
    loadingManager.show();
    loadingManager.updateProgress(15, "Initializing Application", "Setting up the environment...");
    
    // Add global safety timeout to force close loading dialog after maximum time
    const globalLoadingTimeout = setTimeout(() => {
      if (loadingManager && loadingManager.isShowing()) {
        console.warn("[MAIN] Global timeout reached, force closing loading dialog");
        try {
          loadingManager.updateProgress(100, "Timeout", "Force closing loading dialog");
          setTimeout(() => {
            loadingManager.forceClose();
          }, 500);
        } catch (error) {
          console.error("[MAIN] Error in global timeout:", error);
          if (loadingManager) {
            loadingManager.forceClose();
          }
        }
      }
    }, 15000); // 15 seconds maximum
    
    // Clear global timeout when window is ready
    const clearGlobalTimeout = () => {
      if (globalLoadingTimeout) {
        clearTimeout(globalLoadingTimeout);
        console.log("[MAIN] Cleared global loading timeout");
      }
    };

    // For development, dynamically find the Next.js dev server port
    if (isDev) {
      loadingManager.updateProgress(30, "Development Mode", "Connecting to development server...");
      serverUrl = await findDevServerPort();
      console.log("Using development server:", serverUrl);
      loadingManager.updateProgress(60, "Connected to Development Server", "Preparing application interface...");
    } else {
      try {
        loadingManager.updateProgress(25, "Starting Server", "Initializing production server...");
        console.log("Initializing production server...");
        console.log("User data path:", app.getPath("userData"));
        console.log("App path:", app.getAppPath());
        console.log("Resource path:", process.resourcesPath || "Not available");

        // Initialize server manager for production
        loadingManager.updateProgress(35, "Creating Server Manager", "Setting up server configuration...");
        serverManager = new ServerManager(app.getPath("userData"));
        console.log("ServerManager created, starting server...");

        loadingManager.updateProgress(45, "Fetching Credentials", "Connecting to authentication server...");
        
        // Add timeout for server startup
        const serverStartPromise = serverManager.start();
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(
            () => reject(new Error("Server startup timeout after 30 seconds")),
            30000
          );
        });

        loadingManager.updateProgress(70, "Starting Internal Server", "Launching application server...");
        serverUrl = await Promise.race([serverStartPromise, timeoutPromise]);
        console.log(`Production server running at: ${serverUrl}`);
        loadingManager.updateProgress(85, "Server Ready", "Application server is running successfully");
      } catch (serverError) {
        console.error("Failed to start production server:", serverError);
        serverStartupError = serverError;
        // Use fallback URL - the window will still be created
        console.log("Using fallback server URL:", serverUrl);
      }
    }

    console.log(`Final server URL: ${serverUrl}`);

    // Recreate menu with the correct server URL
    loadingManager.updateProgress(90, "Preparing Interface", "Creating application menu and interface...");
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
        "../public/icons/panorama-viewer-icon-multi.ico"
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
      clearGlobalTimeout(); // Clear the global timeout
      loadingManager.updateProgress(100, "Error Occurred", "Server startup failed, showing error page...");
      
      // Hide loading dialog after a brief delay
      setTimeout(() => {
        try {
          loadingManager.hide();
          
          // Add safety check for error case
          setTimeout(() => {
            if (loadingManager && loadingManager.isShowing()) {
              console.warn("[MAIN] Loading dialog still showing after error, force closing...");
              loadingManager.forceClose();
            }
          }, 2000);
          
        } catch (error) {
          console.error("[MAIN] Error hiding loading dialog in error case:", error);
          if (loadingManager) {
            loadingManager.forceClose();
          }
        }
      }, 1000); // Slightly increased delay for error case
      
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
      loadingManager.updateProgress(95, "Loading Application", "Connecting to application interface...");
      console.log("Loading URL:", serverUrl);
      try {
        await mainWindow.loadURL(serverUrl);
      } catch (loadError) {
        console.error("Failed to load URL:", loadError);
        loadingManager.updateProgress(100, "Load Error", "Failed to load application, showing window anyway...");
        
        // Hide loading dialog immediately on error
        try {
          await loadingManager.hide();
        } catch (hideError) {
          console.error("[ERROR] Failed to hide loading dialog on load error:", hideError);
          await loadingManager.forceClose();
        }
        
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

    mainWindow.webContents.on("did-finish-load", async () => {
      console.log("Page loaded successfully");
      
      // Synchronized window transition - hide loading dialog first, then show main window
      if (loadingManager && loadingManager.isShowing()) {
        console.log("[MAIN] Starting synchronized window transition");
        clearGlobalTimeout(); // Clear the global timeout
        
        try {
          // Wait for loading dialog to close completely before showing main window
          await loadingManager.hide();
          console.log("[MAIN] Loading dialog closed, showing main window");
          
          // Show main window only after loading dialog is completely closed
          if (!mainWindow.isVisible()) {
            mainWindow.show();
            mainWindow.focus();
          }
          
        } catch (error) {
          console.error("[MAIN] Error in synchronized transition:", error);
          // Force close loading dialog and show main window as fallback
          if (loadingManager) {
            await loadingManager.forceClose();
          }
          if (!mainWindow.isVisible()) {
            mainWindow.show();
            mainWindow.focus();
          }
        }
      } else {
        // No loading dialog, show main window immediately
        if (!mainWindow.isVisible()) {
          mainWindow.show();
          mainWindow.focus();
        }
      }
    });

    // Reduced timeout - force show window after 1 second if not visible
    setTimeout(async () => {
      if (mainWindow && !mainWindow.isVisible()) {
        console.log("Force showing window after timeout");
        
        // Synchronized timeout transition - hide loading dialog first
        if (loadingManager && loadingManager.isShowing()) {
          console.log("[MAIN] Force hiding loading dialog due to timeout");
          clearGlobalTimeout(); // Clear the global timeout
          
          try {
            // Wait for loading dialog to close before showing main window
            await loadingManager.hide();
            console.log("[MAIN] Loading dialog closed by timeout, showing main window");
          } catch (error) {
            console.error("[MAIN] Error in timeout hide:", error);
            // Force close as fallback
            if (loadingManager) {
              await loadingManager.forceClose();
            }
          }
        }
        
        // Show main window only after loading dialog is handled
        if (!mainWindow.isVisible()) {
          mainWindow.show();
          mainWindow.focus();
        }
      }
    }, 1000);

    mainWindow.on("closed", async () => {
      console.log("[MAIN] Main window closed");
      
      // Ensure loading dialog is closed when main window closes
      if (loadingManager && loadingManager.isShowing()) {
        console.log("[MAIN] Closing loading dialog due to main window close");
        try {
          await loadingManager.forceClose();
        } catch (error) {
          console.error("[MAIN] Error closing loading dialog on main window close:", error);
        }
      }
      
      mainWindow = null;
    });

    // Handle external links
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
      shell.openExternal(url);
      return { action: "deny" };
    });
  } catch (error) {
    console.error("Failed to create window:", error);
    
    // Hide loading dialog immediately on error
    if (loadingManager && loadingManager.isShowing()) {
      loadingManager.updateProgress(100, "Error", "Failed to create application window");
      try {
        await loadingManager.forceClose();
      } catch (closeError) {
        console.error("[ERROR] Failed to close loading dialog on window creation error:", closeError);
      }
    }
    
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
      console.log("[MENU] Projects API response:", data);
      return data.projects || [];
    }
  } catch (error) {
    console.log("[MENU] Failed to fetch projects:", error.message);
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
        const response = await fetch(
          `${serverUrl}/api/poi/load?projectId=${encodeURIComponent(project.id)}`
        );
        if (response.ok) {
          const data = await response.json();
          if (data.pois && data.pois.length > 0) {
            // Add project info to each POI for menu navigation
            const poisWithProject = data.pois.map((poi) => ({
              ...poi,
              projectId: project.id,
              projectName: project.name,
            }));
            allPOIs.push(...poisWithProject);
          }
        }
      } catch (error) {
        console.log(
          `[MENU] Failed to fetch POIs for project ${project.id}:`,
          error.message
        );
      }
    }

    console.log("[MENU] Total POIs fetched:", allPOIs.length);
    return allPOIs;
  } catch (error) {
    console.log("[MENU] Failed to fetch POIs:", error.message);
  }
  return [];
}

// Create application menu with navigation buttons
async function createMenu() {
  // Use the exact same URL that the main window is using
  // This ensures menu navigation works consistently with the main window
  let baseUrl = serverUrl;

  // If serverUrl is not set, use fallback
  if (!baseUrl) {
    baseUrl = "http://localhost:3000";
  }

  // Store the current main window URL for comparison
  let currentWindowUrl = null;
  if (mainWindow && mainWindow.webContents) {
    try {
      currentWindowUrl = mainWindow.webContents.getURL();
      console.log("[MENU] Main window current URL:", currentWindowUrl);

      // If the main window has a different base URL, use that instead
      if (currentWindowUrl && currentWindowUrl.startsWith("http")) {
        const urlObj = new URL(currentWindowUrl);
        const windowBaseUrl = `${urlObj.protocol}//${urlObj.host}`;
        if (windowBaseUrl !== baseUrl) {
          console.log(
            "[MENU] Using main window base URL instead:",
            windowBaseUrl
          );
          baseUrl = windowBaseUrl;
        }
      }
    } catch (error) {
      console.log("[MENU] Could not get main window URL:", error.message);
    }
  }

  console.log("[MENU] Creating menu with baseUrl:", baseUrl);
  console.log("[MENU] Original serverUrl:", serverUrl);
  console.log("[MENU] isDev:", isDev);
  console.log("[MENU] isAdmin:", isAdmin);

  // Fetch dynamic data
  projectsList = await fetchProjects();
  poiList = await fetchPOIs();

  // Build Projects submenu
  const projectsSubmenu = [
    {
      label: "Create New Project",
      accelerator: "CmdOrCtrl+N",
      click: () => {
        if (mainWindow) {
          mainWindow.loadURL(`${baseUrl}/upload`);
        }
      },
    },
  ];

  // Add separator if there are projects
  if (projectsList.length > 0) {
    projectsSubmenu.push({ type: "separator" });

    // Add dynamic project items
    projectsList.forEach((project) => {
      projectsSubmenu.push({
        label: project.name || project.id,
        click: () => {
          if (mainWindow) {
            mainWindow.loadURL(`${baseUrl}/${project.id}`);
          }
        },
      });
    });
  }

  // Build POI submenu
  const poiSubmenu = [
    {
      label: "Manage POI",
      accelerator: "CmdOrCtrl+P",
      click: () => {
        if (mainWindow) {
          mainWindow.loadURL(`${baseUrl}/poi-management`);
        }
      },
    },
  ];

  // Add separator if there are POIs
  if (poiList.length > 0) {
    poiSubmenu.push({ type: "separator" });

    // Group POIs by project
    const poisByProject = {};
    poiList.forEach((poi) => {
      const projectId = poi.projectId || poi.project_id;
      const projectName = poi.projectName || `Project ${projectId}`;
      if (projectId) {
        if (!poisByProject[projectId]) {
          poisByProject[projectId] = {
            name: projectName,
            pois: [],
          };
        }
        poisByProject[projectId].pois.push(poi);
      }
    });

    // Add dynamic POI items, grouped by project
    for (const projectId in poisByProject) {
      const project = poisByProject[projectId];
      const projectPOIs = project.pois.map((poi) => ({
        label: poi.name || poi.title || `POI ${poi.id}`,
        click: () => {
          if (mainWindow) {
            const panoramaId = poi.panoramaId;
            if (projectId && panoramaId) {
              mainWindow.loadURL(
                `${baseUrl}/${projectId}?scene=${panoramaId}&poi=${poi.id}`
              );
            } else if (projectId) {
              mainWindow.loadURL(`${baseUrl}/${projectId}?poi=${poi.id}`);
            } else {
              mainWindow.loadURL(`${baseUrl}/poi-management`);
            }
          }
        },
      }));

      poiSubmenu.push({
        label: project.name,
        submenu: projectPOIs,
      });
    }
  }

  const pagesSubmenu = [
    {
      label: "Home",
      accelerator: "CmdOrCtrl+H",
      click: () => {
        if (mainWindow) {
          mainWindow.loadURL(`${baseUrl}/`);
        }
      },
    },
  ];

  // Add Admin menu item only if user is admin
  if (isAdmin) {
    pagesSubmenu.push({
      label: "Admin",
      accelerator: "CmdOrCtrl+A",
      click: () => {
        if (mainWindow) {
          const adminUrl = `${baseUrl}/admin/users`;
          console.log("[MENU] Admin menu clicked, navigating to:", adminUrl);
          console.log("[MENU] Current baseUrl:", baseUrl);
          console.log("[MENU] Current serverUrl:", serverUrl);
          mainWindow.loadURL(adminUrl);
        }
      },
    });
  }

  // Add Projects submenu
  pagesSubmenu.push({
    label: "Projects",
    submenu: projectsSubmenu,
  });

  // Add POI submenu
  pagesSubmenu.push({
    label: "POI",
    submenu: poiSubmenu,
  });

  const template = [
    {
      label: "File",
      submenu: [
        {
          label: "Quit",
          accelerator: process.platform === "darwin" ? "Cmd+Q" : "Ctrl+Q",
          click: () => {
            app.quit();
          },
        },
      ],
    },
    {
      label: "Edit",
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
        { role: "selectall" },
      ],
    },
    {
      label: "Pages",
      submenu: pagesSubmenu,
    },
    {
      label: "View",
      submenu: [
        {
          label: "Back",
          accelerator: "Alt+Left",
          click: () => {
            if (mainWindow && mainWindow.webContents.canGoBack()) {
              mainWindow.webContents.goBack();
            }
          },
        },
        {
          label: "Forward",
          accelerator: "Alt+Right",
          click: () => {
            if (mainWindow && mainWindow.webContents.canGoForward()) {
              mainWindow.webContents.goForward();
            }
          },
        },
        {
          label: "Reload",
          accelerator: "CmdOrCtrl+R",
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.reload();
            }
          },
        },
        { type: "separator" },
        { role: "resetzoom" },
        { role: "zoomin" },
        { role: "zoomout" },
        { type: "separator" },
        { role: "togglefullscreen" },
        { type: "separator" },
        {
          label: "Toggle Developer Tools",
          accelerator:
            process.platform === "darwin" ? "Alt+Cmd+I" : "Ctrl+Shift+I",
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.toggleDevTools();
            }
          },
        },
      ],
    },
    {
      label: "Window",
      submenu: [{ role: "minimize" }, { role: "close" }],
    },
    {
      label: "Help",
      submenu: [
        {
          label: "About",
          click: () => {
            // You can add an about dialog here if needed
          },
        },
      ],
    },
  ];

  // macOS specific menu adjustments
  if (process.platform === "darwin") {
    template.unshift({
      label: app.getName(),
      submenu: [
        { role: "about" },
        { type: "separator" },
        { role: "services", submenu: [] },
        { type: "separator" },
        { role: "hide" },
        { role: "hideothers" },
        { role: "unhide" },
        { type: "separator" },
        { role: "quit" },
      ],
    });

    // Window menu
    template[4].submenu = [
      { role: "close" },
      { role: "minimize" },
      { role: "zoom" },
      { type: "separator" },
      { role: "front" },
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
  console.log("[MENU] Refreshing menu with updated content");
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
  
  // Handle system shutdown gracefully
  process.on('SIGTERM', async () => {
    console.log('[SHUTDOWN] SIGTERM received, closing loading dialog');
    if (loadingManager && loadingManager.isShowing()) {
      await loadingManager.forceClose().catch(console.error);
    }
    process.exit(0);
  });
  
  process.on('SIGINT', async () => {
    console.log('[SHUTDOWN] SIGINT received, closing loading dialog');
    if (loadingManager && loadingManager.isShowing()) {
      await loadingManager.forceClose().catch(console.error);
    }
    process.exit(0);
  });
  
  createWindow().catch(async (error) => {
    console.error("Failed to start application:", error);
    // Ensure loading dialog is closed on startup failure
    if (loadingManager && loadingManager.isShowing()) {
      await loadingManager.forceClose().catch(console.error);
    }
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

app.on("window-all-closed", async () => {
  console.log("[SHUTDOWN] All windows closed, starting cleanup sequence");
  
  // Optimized shutdown sequence: loading dialog first, then server, then quit
  try {
    // 1. Close loading dialog immediately to prevent visual overlap
    if (loadingManager && loadingManager.isShowing()) {
      console.log("[SHUTDOWN] Closing loading dialog");
      await loadingManager.forceClose();
    }
    
    // 2. Stop server manager
    if (serverManager) {
      console.log("[SHUTDOWN] Stopping server manager");
      serverManager.stop();
    }
    
    // 3. Quit application (except on macOS)
    if (process.platform !== "darwin") {
      console.log("[SHUTDOWN] Quitting application");
      app.quit();
    }
  } catch (error) {
    console.error("[SHUTDOWN] Error during cleanup:", error);
    // Force quit even if cleanup fails
    if (process.platform !== "darwin") {
      app.quit();
    }
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// Cleanup on quit - optimized sequence
app.on("before-quit", async (event) => {
  console.log("[SHUTDOWN] Before quit event triggered");
  
  // Prevent default quit to allow async cleanup
  event.preventDefault();
  
  try {
    // 1. Close loading dialog first to prevent visual overlap during shutdown
    if (loadingManager && loadingManager.isShowing()) {
      console.log("[SHUTDOWN] Force closing loading dialog before quit");
      await loadingManager.forceClose();
    }
    
    // 2. Stop server manager
    if (serverManager) {
      console.log("[SHUTDOWN] Stopping server manager before quit");
      serverManager.stop();
    }
    
    // 3. Close main window if it exists
    if (mainWindow && !mainWindow.isDestroyed()) {
      console.log("[SHUTDOWN] Closing main window");
      mainWindow.close();
    }
    
    console.log("[SHUTDOWN] Cleanup complete, quitting application");
    
  } catch (error) {
    console.error("[SHUTDOWN] Error during before-quit cleanup:", error);
  } finally {
    // Always quit after cleanup attempt
    app.exit(0);
  }
});
