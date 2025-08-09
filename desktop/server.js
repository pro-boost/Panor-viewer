const { spawn, execSync } = require("child_process");
const path = require("path");
const fs = require("fs");
const { app } = require("electron");
const net = require("net");
const http = require("http");
const https = require("https");
const os = require("os");

// Enhanced logging
function log(level, message, ...args) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`, ...args);
}

// Credential server configuration
function loadCredentialConfig() {
  let configPath;

  if (process.resourcesPath) {
    configPath = path.join(
      process.resourcesPath,
      "app.asar.unpacked",
      "data",
      "credential-config.json"
    );
    if (!fs.existsSync(configPath)) {
      configPath = path.join(
        process.resourcesPath,
        "data",
        "credential-config.json"
      );
    }
  } else {
    configPath = path.join(__dirname, "../data/credential-config.json");
  }

  log("info", "Looking for credential config at:", configPath);

  if (fs.existsSync(configPath)) {
    try {
      const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
      if (config.credentialServer) {
        log("info", "Loaded credential config successfully");
        return {
          url: config.credentialServer.url,
          apiSecret: config.credentialServer.apiSecret,
        };
      }
    } catch (error) {
      log("warn", "Failed to load credential config:", error.message);
    }
  }

  log("info", "Using environment variables for credential config");
  return {
    url: process.env.CREDENTIAL_SERVER_URL,
    apiSecret: process.env.CREDENTIAL_API_SECRET,
  };
}

// Enhanced credential validation
function validateCredentials(credentials) {
  const issues = [];

  if (!credentials || typeof credentials !== "object") {
    issues.push("Credentials object is missing or invalid");
    return issues;
  }

  if (!credentials.supabase) {
    issues.push("Missing supabase configuration in credentials");
    return issues;
  }

  const { url, anonKey, serviceRoleKey } = credentials.supabase;

  // Validate URL
  if (!url) {
    issues.push("Missing Supabase URL");
  } else if (url === "https://placeholder.supabase.co") {
    issues.push(
      "Supabase URL is still placeholder - server may be returning default credentials"
    );
  } else if (!url.includes(".supabase.co")) {
    issues.push(`Supabase URL format looks unusual: ${url}`);
  }

  // Validate anon key
  if (!anonKey) {
    issues.push("Missing Supabase anon key");
  } else if (anonKey === "placeholder-anon-key") {
    issues.push(
      "Supabase anon key is still placeholder - server may be returning default credentials"
    );
  } else if (anonKey.length < 100) {
    issues.push(`Supabase anon key seems too short: ${anonKey.length} chars`);
  }

  // Validate service role key
  if (!serviceRoleKey) {
    issues.push("Missing Supabase service role key");
  } else if (serviceRoleKey === "placeholder-service-role-key") {
    issues.push(
      "Supabase service role key is still placeholder - server may be returning default credentials"
    );
  } else if (serviceRoleKey.length < 100) {
    issues.push(
      `Supabase service role key seems too short: ${serviceRoleKey.length} chars`
    );
  }

  return issues;
}

// Enhanced credential fetching with retry logic
async function fetchCredentials(retries = 3, delay = 2000) {
  const credentialConfig = loadCredentialConfig();

  if (!credentialConfig.url || !credentialConfig.apiSecret) {
    throw new Error("Credential server configuration is incomplete");
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      log("info", `Fetching credentials from ${credentialConfig.url} (attempt ${attempt}/${retries})...`);

      const credentials = await new Promise((resolve, reject) => {
        const url = new URL(credentialConfig.url);
        const options = {
          hostname: url.hostname,
          port: url.port || 443,
          path: "/api/credentials",
          method: "GET",
          headers: {
            Authorization: `Bearer ${credentialConfig.apiSecret}`,
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
                log("info", "Credentials fetched successfully");
                resolve(credentials);
              } else {
                reject(new Error(`HTTP ${res.statusCode}: ${data}`));
              }
            } catch (error) {
              reject(
                new Error(
                  `Failed to parse credentials response: ${error.message}`
                )
              );
            }
          });
        });

        req.on("error", (error) => {
          reject(new Error(`Network error: ${error.message}`));
        });

        req.setTimeout(15000, () => {
          req.destroy();
          reject(new Error("Request timeout after 15 seconds"));
        });

        req.end();
      });

      // Validate fetched credentials
      const validationIssues = validateCredentials(credentials);
      if (validationIssues.length > 0) {
        log("warn", "Credential validation issues:", validationIssues);

        // If we have critical issues (placeholder values), treat as failure
        const hasCriticalIssues = validationIssues.some(
          (issue) => issue.includes("placeholder") || issue.includes("Missing")
        );

        if (hasCriticalIssues && attempt < retries) {
          log("warn", "Critical credential issues detected, retrying...");
          await new Promise((resolve) => setTimeout(resolve, delay * attempt));
          continue;
        }
      }

      return credentials;
    } catch (error) {
      log(
        "error",
        `Credential fetch attempt ${attempt} failed:`,
        error.message
      );

      if (attempt === retries) {
        throw error;
      }

      // Wait before retrying with exponential backoff
      const waitTime = delay * Math.pow(2, attempt - 1);
      log("info", `Waiting ${waitTime}ms before retry...`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }
}

// Cache credentials locally with expiration
function cacheCredentials(credentials) {
  try {
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

    log("info", "Credentials cached successfully");
  } catch (error) {
    log("warn", "Failed to cache credentials:", error.message);
  }
}

// Load cached credentials if valid
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
        log("info", "Using valid cached credentials");
        return cacheData.credentials;
      } else {
        log("info", "Cached credentials have expired");
      }
    }
  } catch (error) {
    log("warn", "Failed to load cached credentials:", error.message);
  }
  return null;
}

// Get default/fallback credentials for offline mode
function getDefaultCredentials() {
  const configPath = path.join(__dirname, "../data/credential-config.json");
  if (fs.existsSync(configPath)) {
    try {
      const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
      if (
        config.offlineMode &&
        config.offlineMode.enabled &&
        config.offlineMode.fallbackCredentials
      ) {
        log("info", "Using offline credentials from config");
        return config.offlineMode.fallbackCredentials;
      }
    } catch (error) {
      log("warn", "Failed to load offline config:", error.message);
    }
  }

  log(
    "warn",
    "Using hardcoded fallback credentials - app will be in offline mode"
  );
  return {
    supabase: {
      url: "https://placeholder.supabase.co",
      anonKey: "placeholder-anon-key",
      serviceRoleKey: "placeholder-service-role-key",
    },
  };
}

// Enhanced credential getter with better error handling
async function getCredentials() {
  // In development mode, check if environment variables are already set
  if (
    !process.resourcesPath &&
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    log("info", "Using environment variables for development mode");
    return {
      supabase: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      },
    };
  }

  try {
    // Try cached credentials first
    const cached = loadCachedCredentials();
    if (cached) {
      const validationIssues = validateCredentials(cached);
      if (validationIssues.length === 0) {
        return cached;
      } else {
        log(
          "warn",
          "Cached credentials have validation issues, fetching fresh ones"
        );
      }
    }

    // Fetch fresh credentials with retry logic
    const credentials = await fetchCredentials();

    // Cache for future use
    cacheCredentials(credentials);

    return credentials;
  } catch (error) {
    log("error", "Failed to fetch credentials:", error.message);

    // Try cached credentials as fallback (even if expired)
    const cached = loadCachedCredentials();
    if (cached) {
      log("info", "Using cached credentials as fallback");
      return cached;
    }

    // Use default credentials for offline mode
    log("warn", "Using default credentials - app will be in offline mode");
    return getDefaultCredentials();
  }
}

class EnhancedServerManager {
  constructor(userDataPath) {
    this.userDataPath = userDataPath;
    this.projectsPath = path.join(userDataPath, "projects");
    this.serverProcess = null;
    this.port = null;
  }

  async start() {
    // Ensure projects directory exists
    if (!fs.existsSync(this.projectsPath)) {
      fs.mkdirSync(this.projectsPath, { recursive: true });
    }

    // Find available port starting from 3456
    this.port = await this.findAvailablePort(3456);

    return new Promise(async (resolve, reject) => {
      try {
        // Fetch credentials before starting server
        log("info", "Fetching credentials before starting server...");
        const credentials = await getCredentials();

        // Final validation before starting server
        const validationIssues = validateCredentials(credentials);
        if (validationIssues.length > 0) {
          log(
            "warn",
            "Starting server with credential validation issues:",
            validationIssues
          );
        }

        log("info", "Starting server with fetched credentials...");
        log("info", "Supabase URL:", credentials.supabase.url);
        log(
          "info",
          "Anon key length:",
          credentials.supabase.anonKey?.length || 0
        );
        log(
          "info",
          "Service key length:",
          credentials.supabase.serviceRoleKey?.length || 0
        );

        // Handle ASAR packaging - get the correct path to server-production.js
        const isAsar = __dirname.includes(".asar");
        let serverPath, cwd;

        if (process.resourcesPath) {
          if (isAsar) {
            serverPath = path.join(
              process.resourcesPath,
              "app.asar.unpacked",
              "scripts",
              "server-production.js"
            );
            cwd = path.join(process.resourcesPath, "app.asar.unpacked");
          } else {
            const possiblePaths = [
              path.join(process.resourcesPath, "server-production.js"),
              path.join(
                process.resourcesPath,
                "scripts",
                "server-production.js"
              ),
              path.join(
                process.resourcesPath,
                "app",
                "scripts",
                "server-production.js"
              ),
              path.join(
                process.resourcesPath,
                "standalone",
                "scripts",
                "server-production.js"
              ),
            ];

            serverPath = possiblePaths.find((p) => fs.existsSync(p));
            if (!serverPath) {
              throw new Error(
                `server-production.js not found in any of: ${possiblePaths.join(", ")}`
              );
            }

            const possibleStandalonePaths = [
              path.join(process.resourcesPath, "standalone"),
              path.join(process.resourcesPath, "app", ".next", "standalone"),
              path.join(process.resourcesPath, ".next", "standalone"),
            ];
            const standalonePath = possibleStandalonePaths.find((p) =>
              fs.existsSync(p)
            );
            if (!standalonePath) {
              throw new Error(
                `Standalone directory not found in any of: ${possibleStandalonePaths.join(", ")}`
              );
            }
            cwd = standalonePath;
          }
        } else {
          serverPath = path.join(__dirname, "../scripts/server-production.js");
          cwd = path.join(__dirname, "..");
        }

        // Determine Node.js executable path
        let nodeExecutable = process.execPath;

        if (process.resourcesPath) {
          const nodeExecutableName =
            process.platform === "win32" ? "node.exe" : "node";
          const bundledNodePath = path.join(
            process.resourcesPath,
            "node",
            nodeExecutableName
          );
          if (fs.existsSync(bundledNodePath)) {
            nodeExecutable = bundledNodePath;
            log("info", "Using bundled Node.js runtime:", bundledNodePath);
          } else {
            log(
              "info",
              "Bundled Node.js not found, using system Node.js:",
              nodeExecutable
            );
          }
        }

        log("info", "Server path:", serverPath);
        log("info", "Working directory:", cwd);
        log("info", "Node executable:", nodeExecutable);

        // Set environment variables from fetched credentials
        const env = {
          ...process.env,
          NODE_ENV: "production",
          PORT: this.port.toString(),
          USER_DATA_PATH: this.userDataPath,
          PROJECTS_PATH: this.projectsPath,
          ELECTRON_PROJECTS_PATH: path.join(this.userDataPath, "projects"),
          DISABLE_NEXT_TELEMETRY: "1",
          // Set Supabase credentials from server
          NEXT_PUBLIC_SUPABASE_URL: credentials.supabase.url,
          NEXT_PUBLIC_SUPABASE_ANON_KEY: credentials.supabase.anonKey,
          SUPABASE_SERVICE_ROLE_KEY: credentials.supabase.serviceRoleKey,
        };

        log("info", "Starting server with port:", this.port);

        // Spawn the server process
        this.serverProcess = spawn(nodeExecutable, [serverPath], {
          cwd,
          env,
          stdio: ["pipe", "pipe", "pipe"],
          windowsHide: true,
        });

        this.serverProcess.stdout.on("data", (data) => {
          log("info", `Server stdout: ${data.toString().trim()}`);
        });

        this.serverProcess.stderr.on("data", (data) => {
          log("error", `Server stderr: ${data.toString().trim()}`);
        });

        this.serverProcess.on("close", (code) => {
          log("info", `Server process exited with code ${code}`);
          this.serverProcess = null;
        });

        this.serverProcess.on("error", (error) => {
          log("error", "Server process error:", error.message);
          reject(error);
        });

        // Wait for server to be ready with enhanced checking
        this.waitForServer(this.port)
          .then(() => {
            log("info", "Server is ready and responding");
            resolve(`http://127.0.0.1:${this.port}`);
          })
          .catch((err) => {
            log("error", "Server failed to start:", err.message);
            reject(err);
          });
      } catch (error) {
        log("error", "Failed to start server:", error.message);
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

  waitForServer(port, timeout = 120000) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      let attempts = 0;

      const checkServer = () => {
        attempts++;
        log("info", `Checking server readiness (attempt ${attempts})...`);

        // Test multiple endpoints to ensure server is fully ready
        const endpoints = [`/api/hello`, `/api/admin/config-status`];

        let completedChecks = 0;
        let hasError = false;

        endpoints.forEach((endpoint) => {
          const req = http.get(`http://127.0.0.1:${port}${endpoint}`, (res) => {
            completedChecks++;
            log(
              "info",
              `Server responding to ${endpoint} with status ${res.statusCode}`
            );

            if (completedChecks === endpoints.length && !hasError) {
              log("info", "All server endpoints are responding");
              resolve();
            }
          });

          req.on("error", (err) => {
            if (!hasError) {
              hasError = true;
              log(
                "info",
                `Server check failed for ${endpoint}: ${err.message}`
              );

              if (Date.now() - startTime > timeout) {
                reject(new Error(`Server failed to start within ${timeout}ms`));
              } else {
                setTimeout(checkServer, 2000);
              }
            }
          });

          req.setTimeout(5000, () => {
            req.destroy();
          });
        });
      };

      checkServer();
    });
  }

  stop() {
    if (this.serverProcess) {
      log("info", "Stopping server process...");
      this.serverProcess.kill();
      this.serverProcess = null;
    }
  }
}

module.exports = {
  EnhancedServerManager,
  getCredentials,
  validateCredentials,
  log,
};
