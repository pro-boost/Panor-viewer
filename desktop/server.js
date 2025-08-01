const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const { app } = require('electron');
const net = require('net');
const http = require('http');
const https = require('https');
const os = require('os');

// Credential server configuration
function loadCredentialConfig() {
  // Try to load from credential config file first
  // Use process.resourcesPath for packaged apps, or __dirname for development
  let configPath;
  
  if (process.resourcesPath) {
    // Packaged app - look in resources/app.asar.unpacked/data
    configPath = path.join(process.resourcesPath, 'app.asar.unpacked', 'data', 'credential-config.json');
    if (!fs.existsSync(configPath)) {
      // Fallback to resources/data for non-ASAR builds
      configPath = path.join(process.resourcesPath, 'data', 'credential-config.json');
    }
  } else {
    // Development mode
    configPath = path.join(__dirname, '../data/credential-config.json');
  }
  
  console.log('Looking for credential config at:', configPath);
  
  if (fs.existsSync(configPath)) {
    try {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      if (config.credentialServer) {
        return {
          url: config.credentialServer.url,
          apiSecret: config.credentialServer.apiSecret
        };
      }
    } catch (error) {
      console.warn('Failed to load credential config:', error);
    }
  }
  
  // Fallback to environment variables
  return {
    url: process.env.CREDENTIAL_SERVER_URL,
    apiSecret: process.env.CREDENTIAL_API_SECRET
  };
}

const credentialConfig = loadCredentialConfig();
const CREDENTIAL_SERVER_URL = credentialConfig.url;
const API_SECRET = credentialConfig.apiSecret;

/**
 * Fetch credentials from server
 */
async function fetchCredentials() {
  return new Promise((resolve, reject) => {
    const url = new URL(CREDENTIAL_SERVER_URL);
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: '/api/credentials',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_SECRET}`,
        'User-Agent': 'PanoramaViewer-Desktop/1.0.0'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          if (res.statusCode === 200) {
            const credentials = JSON.parse(data);
            resolve(credentials);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          }
        } catch (error) {
          reject(error);
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
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
    expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
  };
  
  const cacheDir = path.join(os.homedir(), '.panorama-viewer');
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }
  
  fs.writeFileSync(
    path.join(cacheDir, 'credentials-cache.json'),
    JSON.stringify(cacheData, null, 2)
  );
}

/**
 * Load cached credentials if valid
 */
function loadCachedCredentials() {
  try {
    const cacheFile = path.join(os.homedir(), '.panorama-viewer', 'credentials-cache.json');
    if (fs.existsSync(cacheFile)) {
      const cacheData = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
      if (Date.now() < cacheData.expiresAt) {
        return cacheData.credentials;
      }
    }
  } catch (error) {
    console.warn('Failed to load cached credentials:', error);
  }
  return null;
}

/**
 * Get default/fallback credentials for offline mode
 */
function getDefaultCredentials() {
  // Try to load offline credentials from config first
  const configPath = path.join(__dirname, '../data/credential-config.json');
  if (fs.existsSync(configPath)) {
    try {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      if (config.offlineMode && config.offlineMode.enabled && config.offlineMode.fallbackCredentials) {
        console.log('Using offline credentials from config');
        return config.offlineMode.fallbackCredentials;
      }
    } catch (error) {
      console.warn('Failed to load offline config:', error);
    }
  }
  
  // Fallback to hardcoded defaults
  return {
    supabase: {
      url: 'https://placeholder.supabase.co',
      anonKey: 'placeholder-anon-key',
      serviceRoleKey: 'placeholder-service-role-key'
    }
  };
}

/**
 * Get credentials with caching and fallback
 */
async function getCredentials() {
  try {
    // Try cached credentials first
    const cached = loadCachedCredentials();
    if (cached) {
      console.log('Using cached credentials');
      return cached;
    }
    
    // Fetch fresh credentials
    console.log('Fetching credentials from server...');
    const credentials = await fetchCredentials();
    
    // Cache for future use
    cacheCredentials(credentials);
    
    return credentials;
  } catch (error) {
    console.error('Failed to fetch credentials:', error);
    
    // Try cached credentials as fallback
    const cached = loadCachedCredentials();
    if (cached) {
      console.log('Using cached credentials as fallback');
      return cached;
    }
    
    // Use default credentials for offline mode
    console.log('Using default credentials for offline mode');
    return getDefaultCredentials();
  }
}

class ServerManager {
  constructor(userDataPath) {
    this.userDataPath = userDataPath;
    this.projectsPath = path.join(userDataPath, 'projects');
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
        const credentials = await getCredentials();
        
        console.log('Starting server with fetched credentials...');
        
        // Handle ASAR packaging - get the correct path to server-production.js
        const isAsar = __dirname.includes('.asar');
        let serverPath, cwd;
        
        if (process.resourcesPath) {
          // Packaged app - use process.resourcesPath for reliable path resolution
          if (isAsar) {
            // ASAR packaged app - server-production.js should be unpacked
            serverPath = path.join(process.resourcesPath, 'app.asar.unpacked', 'scripts', 'server-production.js');
            cwd = path.join(process.resourcesPath, 'app.asar.unpacked');
          } else {
            // Non-ASAR packaged app
            serverPath = path.join(process.resourcesPath, 'scripts', 'server-production.js');
            cwd = process.resourcesPath;
          }
        } else {
          // Development mode
          serverPath = path.join(__dirname, '../scripts/server-production.js');
          cwd = path.join(__dirname, '..');
        }
        
        console.log('Server path:', serverPath);
        console.log('Working directory:', cwd);
        console.log('Node executable:', process.execPath);
        
        // Set environment variables from fetched credentials
        const env = {
          ...process.env,
          NODE_ENV: 'production',
          PORT: this.port.toString(),
          USER_DATA_PATH: this.userDataPath,
          PROJECTS_PATH: this.projectsPath,
          ELECTRON_PROJECTS_PATH: path.join(this.userDataPath, 'projects'),
          DISABLE_NEXT_TELEMETRY: '1',
          // Set Supabase credentials from server
          NEXT_PUBLIC_SUPABASE_URL: credentials.supabase.url,
          NEXT_PUBLIC_SUPABASE_ANON_KEY: credentials.supabase.anonKey,
          SUPABASE_SERVICE_ROLE_KEY: credentials.supabase.serviceRoleKey
        };

      console.log('Starting server with port:', this.port);
      
      // Set environment variables for the server
      Object.assign(process.env, env);
      
      // In packaged app, run server in-process instead of spawning
      try {
        console.log('Starting server in-process...');
        
        // For ASAR packages, don't change working directory
        // Just set the environment and require the server
        const originalCwd = process.cwd();
        
        // Only change directory if not in ASAR mode and directory exists
        if (!isAsar && fs.existsSync(cwd)) {
          console.log('Changing working directory to:', cwd);
          process.chdir(cwd);
        } else {
          console.log('Skipping directory change - ASAR mode or directory does not exist');
        }
        
        // Create a mock process object for the server
        this.serverProcess = {
          stdout: { on: () => {} },
          stderr: { on: () => {} },
          on: () => {},
          kill: () => {
            console.log('Server stopped');
          }
        };
        
        // Start the server by requiring it
        console.log('Requiring server from:', serverPath);
        require(serverPath);
        
        // Restore original working directory if it was changed
        if (!isAsar && fs.existsSync(cwd)) {
          process.chdir(originalCwd);
        }
        
        console.log('Server started in-process successfully');
      } catch (error) {
        console.error('Failed to start server in-process:', error);
        throw new Error(`Failed to start server: ${error.message}`);
      }

      // Server is now running in-process, no need for process event handlers

        // Wait for server to be ready
        this.waitForServer(this.port)
          .then(() => {
            console.log('Server is ready');
            resolve(`http://127.0.0.1:${this.port}`);
          })
          .catch((err) => {
            console.error('Server failed to start:', err);
            reject(err);
          });
      } catch (error) {
        console.error('Failed to start server:', error);
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
          this.findAvailablePort(startPort + 1).then(resolve).catch(reject);
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
          console.log('Server is responding to /api/hello');
          resolve();
        });
        
        req.on('error', (err) => {
          console.log(`Server check failed: ${err.message}`);
          if (Date.now() - startTime > timeout) {
            reject(new Error(`Server startup timeout after ${attempts} attempts`));
          } else {
            setTimeout(checkServer, 1000);
          }
        });
        
        req.setTimeout(5000, () => {
          req.destroy();
          console.log('Request timeout, retrying...');
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