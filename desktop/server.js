const { spawn, execSync } = require("child_process");
const path = require("path");
const fs = require("fs");
const { app } = require("electron");
const net = require("net");
const http = require("http");
const https = require("https");
const os = require("os");

// Credential server configuration
function loadCredentialConfig() {
  // Try to load from credential config file first
  // Use process.resourcesPath for packaged apps, or __dirname for development
  let configPath;

  if (process.resourcesPath) {
    // Packaged app - data is now inside ASAR archive
    // Check if we're in ASAR mode
    const isAsar = __dirname.includes('.asar');
    
    if (isAsar) {
      // ASAR mode - data is inside the archive
      // In Electron, ASAR files are automatically handled by Node.js fs module
      try {
        // __dirname in ASAR points to app.asar/desktop, so go up one level to access data
        const configPath = path.join(__dirname, '../data/credential-config.json');
        console.log('Loading credential config from ASAR at:', configPath);
        const configData = fs.readFileSync(configPath, 'utf8');
        const config = JSON.parse(configData);
        console.log('Successfully loaded credential config from ASAR');
        if (config.credentialServer) {
          return {
            url: config.credentialServer.url,
            apiSecret: config.credentialServer.apiSecret,
          };
        }
      } catch (error) {
        console.warn('Failed to load credential config from ASAR:', error);
        console.warn('__dirname:', __dirname);
        console.warn('process.resourcesPath:', process.resourcesPath);
      }
    } else {
      // Non-ASAR packaged app - check multiple possible locations
      const possiblePaths = [
        path.join(process.resourcesPath, "app", "data", "credential-config.json"),
        path.join(process.resourcesPath, "data", "credential-config.json")
      ];
      
      for (const possiblePath of possiblePaths) {
        if (fs.existsSync(possiblePath)) {
          configPath = possiblePath;
          break;
        }
      }
    }
  } else {
    // Development mode
    configPath = path.join(__dirname, "../data/credential-config.json");
  }

  console.log("Looking for credential config at:", configPath);

  if (fs.existsSync(configPath)) {
    try {
      const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
      if (config.credentialServer) {
        return {
          url: config.credentialServer.url,
          apiSecret: config.credentialServer.apiSecret,
        };
      }
    } catch (error) {
      console.warn("Failed to load credential config:", error);
    }
  }

  // Fallback to environment variables
  return {
    url: process.env.CREDENTIAL_SERVER_URL,
    apiSecret: process.env.CREDENTIAL_API_SECRET,
  };
}

const credentialConfig = loadCredentialConfig();
const CREDENTIAL_SERVER_URL = credentialConfig.url;
const API_SECRET = credentialConfig.apiSecret;

/**
 * Fetch credentials from server with retry mechanism
 */
async function fetchCredentials(retryCount = 0) {
  const maxRetries = 3;
  const retryDelay = 1000 * Math.pow(2, retryCount); // Exponential backoff

  return new Promise((resolve, reject) => {
    // Check if we have valid server URL and API secret
    if (!CREDENTIAL_SERVER_URL || !API_SECRET) {
      console.warn("Credential server URL or API secret not configured");
      reject(new Error("Credential server not configured"));
      return;
    }

    console.log(
      `Attempting to fetch credentials (attempt ${retryCount + 1}/${maxRetries + 1})`
    );

    const url = new URL(CREDENTIAL_SERVER_URL);
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: "/api/credentials",
      method: "GET",
      headers: {
        Authorization: `Bearer ${API_SECRET}`,
        "User-Agent": "PanoramaViewer-Desktop/1.0.0",
      },
    };

    const req = https.request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        try {
          if (res.statusCode === 200) {
            const credentials = JSON.parse(data);
            console.log("Successfully fetched credentials from server");
            resolve(credentials);
          } else {
            const error = new Error(`HTTP ${res.statusCode}: ${data}`);
            console.error("Server returned error:", error.message);

            // Retry on server errors (5xx) or rate limiting (429)
            if (
              (res.statusCode >= 500 || res.statusCode === 429) &&
              retryCount < maxRetries
            ) {
              console.log(`Retrying in ${retryDelay}ms...`);
              setTimeout(() => {
                fetchCredentials(retryCount + 1)
                  .then(resolve)
                  .catch(reject);
              }, retryDelay);
            } else {
              reject(error);
            }
          }
        } catch (parseError) {
          console.error("Failed to parse server response:", parseError);
          reject(parseError);
        }
      });
    });

    req.on("error", (error) => {
      console.error("Network error:", error.message);

      // Retry on network errors
      if (retryCount < maxRetries) {
        console.log(`Retrying in ${retryDelay}ms due to network error...`);
        setTimeout(() => {
          fetchCredentials(retryCount + 1)
            .then(resolve)
            .catch(reject);
        }, retryDelay);
      } else {
        reject(error);
      }
    });

    req.setTimeout(15000, () => {
      req.destroy();
      const timeoutError = new Error("Request timeout");
      console.error("Request timed out");

      // Retry on timeout
      if (retryCount < maxRetries) {
        console.log(`Retrying in ${retryDelay}ms due to timeout...`);
        setTimeout(() => {
          fetchCredentials(retryCount + 1)
            .then(resolve)
            .catch(reject);
        }, retryDelay);
      } else {
        reject(timeoutError);
      }
    });

    req.end();
  });
}

/**
 * Cache credentials locally with expiration
 */
function cacheCredentials(credentials) {
  const cacheData = {
    credentials,
    cachedAt: Date.now(),
    expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  };

  const cacheDir = path.join(os.homedir(), ".panorama-viewer");
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(cacheDir, "credentials-cache.json"),
    JSON.stringify(cacheData, null, 2)
  );
}

/**
 * Load cached credentials if valid
 */
function loadCachedCredentials() {
  try {
    const cacheFile = path.join(
      os.homedir(),
      ".panorama-viewer",
      "credentials-cache.json"
    );
    if (fs.existsSync(cacheFile)) {
      const cacheData = JSON.parse(fs.readFileSync(cacheFile, "utf8"));
      if (Date.now() < cacheData.expiresAt) {
        return cacheData.credentials;
      }
    }
  } catch (error) {
    console.warn("Failed to load cached credentials:", error);
  }
  return null;
}

/**
 * Load expired cached credentials (better than placeholder credentials)
 */
function loadExpiredCachedCredentials() {
  try {
    const cacheFile = path.join(
      os.homedir(),
      ".panorama-viewer",
      "credentials-cache.json"
    );
    if (fs.existsSync(cacheFile)) {
      const cacheData = JSON.parse(fs.readFileSync(cacheFile, "utf8"));
      // Return credentials even if expired, as they're real credentials
      if (cacheData.credentials && cacheData.credentials.supabase) {
        const isExpired = Date.now() >= cacheData.expiresAt;
        if (isExpired) {
          console.log(
            "Found expired cached credentials from",
            new Date(cacheData.cachedAt).toISOString()
          );
        }
        return cacheData.credentials;
      }
    }
  } catch (error) {
    console.warn("Failed to load expired cached credentials:", error);
  }
  return null;
}

/**
 * Get offline credentials from config if available and enabled
 */
function getOfflineCredentials() {
  try {
    // Try to load offline credentials from config first
    let configPath;
    let config = null;

    if (process.resourcesPath) {
      // Packaged app - data is now inside ASAR archive
      // Check if we're in ASAR mode
      const isAsar = __dirname.includes('.asar');
      
      if (isAsar) {
         // ASAR mode - data is inside the archive
          // In Electron, ASAR files are automatically handled by Node.js fs module
          try {
            const configPath = path.join(__dirname, '../data/credential-config.json');
            console.log("Loading offline credential config from ASAR at:", configPath);
            const configData = fs.readFileSync(configPath, 'utf8');
            config = JSON.parse(configData);
            console.log("Successfully loaded offline credential config from ASAR archive");
          } catch (error) {
            console.warn('Failed to load offline credential config from ASAR:', error);
            console.warn('__dirname:', __dirname);
            console.warn('process.resourcesPath:', process.resourcesPath);
          }
      } else {
        // Non-ASAR packaged app - check multiple possible locations
        const possiblePaths = [
          path.join(process.resourcesPath, "app", "data", "credential-config.json"),
          path.join(process.resourcesPath, "data", "credential-config.json")
        ];
        
        for (const possiblePath of possiblePaths) {
          if (fs.existsSync(possiblePath)) {
            configPath = possiblePath;
            console.log("Looking for offline credential config at:", configPath);
            try {
              config = JSON.parse(fs.readFileSync(configPath, "utf8"));
              break;
            } catch (error) {
              console.warn("Failed to load offline credential config:", error);
            }
          }
        }
      }
    } else {
      // Development mode
      configPath = path.join(__dirname, "../data/credential-config.json");
      console.log("Looking for offline credential config at:", configPath);
      
      if (fs.existsSync(configPath)) {
        try {
          config = JSON.parse(fs.readFileSync(configPath, "utf8"));
        } catch (error) {
          console.warn("Failed to load offline credential config:", error);
        }
      }
    }

    if (config &&
        config.offlineMode &&
        config.offlineMode.enabled &&
        config.offlineMode.fallbackCredentials &&
        config.offlineMode.fallbackCredentials.supabase
      ) {
        const supabaseConfig = config.offlineMode.fallbackCredentials.supabase;
        const isPlaceholder =
          supabaseConfig.url === "https://placeholder.supabase.co" ||
          supabaseConfig.anonKey === "placeholder-anon-key" ||
          supabaseConfig.serviceRoleKey === "placeholder-service-role-key";

        // Use credentials if they're real OR if placeholders are explicitly allowed
        if (!isPlaceholder || config.offlineMode.allowPlaceholders) {
          console.log(
            isPlaceholder
              ? "Using placeholder offline credentials (allowed by config)"
              : "Using valid offline credentials from config"
          );
          return config.offlineMode.fallbackCredentials;
        } else {
          console.log(
            "Offline credentials in config are placeholder values, skipping"
          );
        }
      }
  } catch (error) {
    console.warn("Failed to load offline config:", error);
  }
  return null;
}

/**
 * Get default/fallback credentials for offline mode
 */
function getDefaultCredentials() {
  // Try to load offline credentials from config first
  const configPath = path.join(__dirname, "../data/credential-config.json");
  if (fs.existsSync(configPath)) {
    try {
      const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
      if (
        config.offlineMode &&
        config.offlineMode.enabled &&
        config.offlineMode.fallbackCredentials
      ) {
        console.log("Using offline credentials from config");
        return config.offlineMode.fallbackCredentials;
      }
    } catch (error) {
      console.warn("Failed to load offline config:", error);
    }
  }

  // Fallback to hardcoded defaults
  return {
    supabase: {
      url: "https://placeholder.supabase.co",
      anonKey: "placeholder-anon-key",
      serviceRoleKey: "placeholder-service-role-key",
    },
  };
}

/**
 * Get credentials with intelligent caching and fallback
 */
async function getCredentials() {
  console.log("=== Starting credential resolution ===");

  try {
    // Try cached credentials first (even if expired, we'll use them as backup)
    const cached = loadCachedCredentials();
    const expiredCached = loadExpiredCachedCredentials();

    if (cached) {
      console.log("Using valid cached credentials");
      return cached;
    }

    // If we have expired cached credentials, try to fetch fresh ones but keep expired as backup
    if (expiredCached) {
      console.log("Found expired cached credentials, attempting to refresh...");
      try {
        console.log("Fetching fresh credentials from Vercel server...");
        const credentials = await fetchCredentials();

        // Cache for future use
        cacheCredentials(credentials);
        console.log("Successfully refreshed credentials");
        return credentials;
      } catch (fetchError) {
        console.warn(
          "Failed to refresh credentials, using expired cache:",
          fetchError.message
        );
        // Use expired credentials as they're better than placeholder ones
        return expiredCached;
      }
    }

    // No cached credentials, try to fetch fresh ones
    console.log("No cached credentials found, fetching from Vercel server...");
    const credentials = await fetchCredentials();

    // Cache for future use
    cacheCredentials(credentials);
    console.log("Successfully fetched and cached new credentials");
    return credentials;
  } catch (error) {
    console.error("Failed to fetch credentials from server:", error.message);

    // Try any cached credentials (even expired) as fallback
    const expiredCached = loadExpiredCachedCredentials();
    if (expiredCached) {
      console.log("Using expired cached credentials as fallback");
      return expiredCached;
    }

    // Check if offline mode is enabled in config
    const offlineCredentials = getOfflineCredentials();
    if (offlineCredentials) {
      console.log("Using offline mode credentials from config");
      return offlineCredentials;
    }

    // Last resort: throw error instead of using placeholder credentials
    console.error("No valid credentials available - cannot start server");
    throw new Error(
      "No valid Supabase credentials available. Please check your internet connection and credential server configuration."
    );
  }
}

class ServerManager {
  constructor(userDataPath) {
    this.userDataPath = userDataPath;
    this.projectsPath = path.join(userDataPath, "projects");
    this.serverProcess = null;
    this.port = null;
  }

  async start() {
    console.log("=== ServerManager.start() called ===");
    console.log("Platform:", process.platform);
    console.log("Architecture:", process.arch);
    console.log("Node version:", process.version);
    console.log("User data path:", this.userDataPath);
    console.log("Process resourcesPath:", process.resourcesPath);
    console.log("__dirname:", __dirname);

    // Ensure projects directory exists
    try {
      if (!fs.existsSync(this.projectsPath)) {
        console.log("Creating projects directory:", this.projectsPath);
        fs.mkdirSync(this.projectsPath, { recursive: true });
      }
      console.log("Projects directory verified:", this.projectsPath);
    } catch (error) {
      console.error("Failed to create projects directory:", error);
      throw error;
    }

    // Find available port starting from 3456
    console.log("Finding available port...");
    this.port = await this.findAvailablePort(3456);
    console.log("Selected port:", this.port);

    return new Promise(async (resolve, reject) => {
      try {
        // Fetch credentials before starting server
        console.log("Fetching credentials...");
        const credentials = await getCredentials();
        console.log("Credentials obtained successfully");

        console.log("Starting server with fetched credentials...");

        // Handle ASAR packaging - get the correct path to server.js in standalone directory
        const isAsar = __dirname.includes(".asar");
        console.log("ASAR packaging detected:", isAsar);
        let serverPath, cwd;

        if (process.resourcesPath) {
          console.log("Running in packaged mode");
          
          if (isAsar) {
            console.log("ASAR mode detected - using extraResources standalone");
            // In ASAR mode, standalone directory is in extraResources
            const standalonePath = path.join(process.resourcesPath, "standalone");
            console.log("Checking standalone path:", standalonePath);
            console.log("Standalone path exists:", fs.existsSync(standalonePath));
            
            if (!fs.existsSync(standalonePath)) {
              const error = new Error(
                `Standalone directory not found at: ${standalonePath}`
              );
              console.error("Standalone path resolution failed:", error.message);
              throw error;
            }
            
            serverPath = path.join(standalonePath, "server.js");
            cwd = standalonePath;
            
            console.log("Using standalone server path:", serverPath);
            console.log("Server.js exists:", fs.existsSync(serverPath));
          } else {
            // Non-ASAR packaged app - use process.resourcesPath for reliable path resolution
            // Always use the standalone directory which contains the Next.js server
            const standalonePath = path.join(process.resourcesPath, "standalone");
            console.log("Checking standalone path:", standalonePath);
            console.log("Standalone path exists:", fs.existsSync(standalonePath));
            
            if (!fs.existsSync(standalonePath)) {
              const error = new Error(
                `Standalone directory not found at: ${standalonePath}`
              );
              console.error("Standalone path resolution failed:", error.message);
              throw error;
            }
            
            serverPath = path.join(standalonePath, "server.js");
            cwd = standalonePath;
            
            console.log("Using standalone server path:", serverPath);
            console.log("Server.js exists:", fs.existsSync(serverPath));
          }
        } else {
          console.log("Running in development mode");
          // Development mode
          serverPath = path.join(__dirname, "../scripts/server-production.js");
          cwd = path.join(__dirname, "..");
        }

        console.log("Resolved server path:", serverPath);
        console.log("Server path exists:", fs.existsSync(serverPath));
        console.log("Resolved working directory:", cwd);
        console.log("Working directory exists:", fs.existsSync(cwd));

        // Determine Node.js executable path
        let nodeExecutable = process.execPath; // Default to current Node.js
        console.log("Default Node.js executable:", nodeExecutable);

        if (process.resourcesPath) {
          // In packaged app, try to use bundled Node.js
          // Determine the correct executable name based on platform
          const nodeExecutableName =
            process.platform === "win32" ? "node.exe" : "node";
          console.log(
            "Looking for bundled Node.js executable:",
            nodeExecutableName
          );

          const bundledNodePath = path.join(
            process.resourcesPath,
            "node",
            nodeExecutableName
          );

          console.log("Checking bundled Node.js path:", bundledNodePath);
          console.log(
            "Bundled Node.js exists:",
            fs.existsSync(bundledNodePath)
          );

          if (fs.existsSync(bundledNodePath)) {
            nodeExecutable = bundledNodePath;
            console.log("Using bundled Node.js runtime:", bundledNodePath);

            // On Windows, verify the executable is accessible
            if (process.platform === "win32") {
              try {
                const stats = fs.statSync(bundledNodePath);
                console.log("Bundled Node.js file stats:", {
                  size: stats.size,
                  isFile: stats.isFile(),
                  mode: stats.mode.toString(8),
                });
              } catch (statError) {
                console.error("Failed to stat bundled Node.js:", statError);
              }
            }
          } else {
            console.log(
              "Bundled Node.js not found, using system Node.js:",
              nodeExecutable
            );

            // On Windows, also check if system Node.js is accessible
            if (process.platform === "win32") {
              try {
                const stats = fs.statSync(nodeExecutable);
                console.log("System Node.js file stats:", {
                  size: stats.size,
                  isFile: stats.isFile(),
                  mode: stats.mode.toString(8),
                });
              } catch (statError) {
                console.error("Failed to stat system Node.js:", statError);
              }
            }
          }
        }

        console.log("Final server configuration:");
        console.log("  Server path:", serverPath);
        console.log("  Working directory:", cwd);
        console.log("  Node executable:", nodeExecutable);
        console.log("  Platform:", process.platform);
        console.log("  Port:", this.port);

        // Set environment variables from fetched credentials
        const env = {
          ...process.env,
          NODE_ENV: "production",
          PORT: this.port.toString(),
          HOSTNAME: "127.0.0.1",
          USER_DATA_PATH: this.userDataPath,
          PROJECTS_PATH: this.projectsPath,
          ELECTRON_PROJECTS_PATH: path.join(this.userDataPath, "projects"),
          DISABLE_NEXT_TELEMETRY: "1",
          // Set Supabase credentials from server
          NEXT_PUBLIC_SUPABASE_URL: credentials.supabase.url,
          NEXT_PUBLIC_SUPABASE_ANON_KEY: credentials.supabase.anonKey,
          SUPABASE_SERVICE_ROLE_KEY: credentials.supabase.serviceRoleKey,
        };

        console.log("Environment variables set:");
        console.log(
          "  NEXT_PUBLIC_SUPABASE_URL:",
          credentials.supabase.url ? "[SET]" : "[NOT SET]"
        );
        console.log(
          "  NEXT_PUBLIC_SUPABASE_ANON_KEY:",
          credentials.supabase.anonKey ? "[SET]" : "[NOT SET]"
        );
        console.log(
          "  SUPABASE_SERVICE_ROLE_KEY:",
          credentials.supabase.serviceRoleKey ? "[SET]" : "[NOT SET]"
        );
        console.log("  PORT:", this.port.toString());

        console.log("Attempting to spawn server process...");
        console.log("  Command:", nodeExecutable);
        console.log("  Args:", [serverPath]);
        console.log("  Working directory:", cwd);

        try {
          // Spawn the server process
          this.serverProcess = spawn(nodeExecutable, [serverPath], {
            cwd,
            env,
            stdio: ["pipe", "pipe", "pipe"],
            windowsHide: true,
          });

          console.log(
            "Server process spawned successfully with PID:",
            this.serverProcess.pid
          );
        } catch (spawnError) {
          console.error("Failed to spawn server process:", spawnError);
          throw spawnError;
        }

        this.serverProcess.stdout.on("data", (data) => {
          console.log(`Server stdout: ${data}`);
        });

        this.serverProcess.stderr.on("data", (data) => {
          console.error(`Server stderr: ${data}`);
        });

        this.serverProcess.on("close", (code, signal) => {
          console.log(
            `Server process exited with code ${code} and signal ${signal}`
          );
          if (code !== 0) {
            console.error(
              "Server process exited with non-zero code, indicating an error"
            );
          }
          this.serverProcess = null;
        });

        this.serverProcess.on("error", (error) => {
          console.error("Server process error:", error);
          console.error("Error details:", {
            code: error.code,
            errno: error.errno,
            syscall: error.syscall,
            path: error.path,
            spawnargs: error.spawnargs,
          });
          reject(error);
        });

        this.serverProcess.on("spawn", () => {
          console.log(
            "Server process spawn event fired - process started successfully"
          );
        });

        // Wait for server to be ready
        this.waitForServer(this.port)
          .then(() => {
            console.log("Server is ready");
            resolve(`http://127.0.0.1:${this.port}`);
          })
          .catch((err) => {
            console.error("Server failed to start:", err);
            reject(err);
          });
      } catch (error) {
        console.error("Failed to start server:", error);
        reject(error);
      }
    });
  }

  findAvailablePort(startPort) {
    return new Promise((resolve, reject) => {
      const server = net.createServer();
      server.listen(startPort, (err) => {
        if (err) {
          server.close();
          this.findAvailablePort(startPort + 1)
            .then(resolve)
            .catch(reject);
        } else {
          const port = server.address().port;
          server.close(() => resolve(port));
        }
      });
    });
  }

  waitForServer(port, timeout = 90000) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      let attempts = 0;
      const checkServer = () => {
        attempts++;
        console.log(`Checking server readiness (attempt ${attempts})...`);

        // Use 127.0.0.1 instead of localhost to force IPv4
        const req = http.get(`http://127.0.0.1:${port}/api/hello`, (res) => {
          console.log("Server is responding to /api/hello");
          resolve();
        });

        req.on("error", (err) => {
          console.log(`Server check failed: ${err.message}`);
          if (Date.now() - startTime > timeout) {
            reject(
              new Error(`Server startup timeout after ${attempts} attempts`)
            );
          } else {
            setTimeout(checkServer, 1000);
          }
        });

        req.setTimeout(5000, () => {
          req.destroy();
          console.log("Request timeout, retrying...");
        });
      };

      // Wait a bit before first check to let server start
      setTimeout(checkServer, 2000);
    });
  }

  stop() {
    if (this.serverProcess) {
      this.serverProcess.kill();
      this.serverProcess = null;
    }
  }
}

module.exports = { ServerManager };
