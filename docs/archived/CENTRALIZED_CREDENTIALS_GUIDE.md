# Credential Server Implementation Guide

This guide shows how to build the desktop app with embedded credential fetching from your own server, eliminating the need for users to configure credentials or perform additional setup.

## Overview

Instead of distributing credentials with the app, you'll:
1. **Host credentials on your server** - Secure API endpoint that serves Supabase credentials
2. **Build app with server URL** - Desktop app fetches credentials at runtime
3. **Zero user configuration** - No setup required after installation
4. **Centralized control** - Update credentials server-side without app updates

## Architecture

```
┌─────────────────┐    HTTPS Request     ┌──────────────────┐    ┌─────────────────┐
│   Desktop App   │ ──────────────────► │ Credential Server │ ──► │ Supabase Project │
│                 │                      │                  │    │                 │
│ - Fetches creds │ ◄────────────────── │ - Serves creds   │    │ - Authentication │
│ - No local keys │    Encrypted JSON    │ - Access control │    │ - User management│
└─────────────────┘                      └──────────────────┘    └─────────────────┘
```

## Step 1: Create Credential Server

### Simple Node.js Credential Server

Create a new directory for your credential server:

```bash
mkdir panorama-credential-server
cd panorama-credential-server
npm init -y
npm install express cors helmet rate-limiter-flexible dotenv
```

**server.js**:
```javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { RateLimiterMemory } = require('rate-limiter-flexible');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));

// Rate limiting
const rateLimiter = new RateLimiterMemory({
  keyGenerator: (req) => req.ip,
  points: 10, // Number of requests
  duration: 60, // Per 60 seconds
});

app.use(async (req, res, next) => {
  try {
    await rateLimiter.consume(req.ip);
    next();
  } catch (rejRes) {
    res.status(429).json({ error: 'Too many requests' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Credential endpoint
app.get('/api/credentials', async (req, res) => {
  try {
    // Optional: Add authentication/authorization here
    const authHeader = req.headers.authorization;
    if (process.env.REQUIRE_AUTH === 'true') {
      if (!authHeader || authHeader !== `Bearer ${process.env.API_SECRET}`) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
    }

    // Return Supabase credentials
    const credentials = {
      supabase: {
        url: process.env.SUPABASE_URL,
        anonKey: process.env.SUPABASE_ANON_KEY,
        serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY
      },
      version: '1.0.0',
      lastUpdated: new Date().toISOString()
    };

    res.json(credentials);
  } catch (error) {
    console.error('Error serving credentials:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Credential server running on port ${PORT}`);
});
```

**package.json**:
```json
{
  "name": "panorama-credential-server",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "rate-limiter-flexible": "^3.0.8",
    "dotenv": "^16.3.1"
  }
}
```

**.env** (for your credential server):
```env
# Server configuration
PORT=3001
ALLOWED_ORIGINS=http://localhost:3000,https://your-domain.com

# Security
REQUIRE_AUTH=true
API_SECRET=your-secure-api-secret-key

# Supabase credentials to serve
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Step 2: Modify Desktop App to Fetch Credentials

### Update Desktop App Configuration

**1. Modify `desktop/server.js`**:
```javascript
const https = require('https');
const fs = require('fs');
const path = require('path');

// Credential server configuration
const CREDENTIAL_SERVER_URL = process.env.CREDENTIAL_SERVER_URL || 'https://your-credential-server.com';
const API_SECRET = process.env.CREDENTIAL_API_SECRET || 'your-secure-api-secret-key';

/**
 * Fetch credentials from server
 */
async function fetchCredentials() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: new URL(CREDENTIAL_SERVER_URL).hostname,
      port: new URL(CREDENTIAL_SERVER_URL).port || 443,
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
  
  const cacheDir = path.join(require('os').homedir(), '.panorama-viewer');
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
    const cacheFile = path.join(require('os').homedir(), '.panorama-viewer', 'credentials-cache.json');
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
    
    throw new Error('No credentials available');
  }
}

// Modify the existing server startup code
class ServerManager {
  constructor() {
    this.serverProcess = null;
    this.isStarting = false;
  }

  async startServer() {
    if (this.isStarting || this.serverProcess) {
      return;
    }

    this.isStarting = true;

    try {
      // Fetch credentials before starting server
      const credentials = await getCredentials();
      
      console.log('Starting server with fetched credentials...');
      
      const serverPath = path.join(__dirname, '..', 'server-production.js');
      
      // Set environment variables from fetched credentials
      const env = {
        ...process.env,
        NODE_ENV: 'production',
        PORT: '3000',
        USER_DATA_PATH: app.getPath('userData'),
        PROJECTS_PATH: path.join(app.getPath('userData'), 'projects'),
        ELECTRON_PROJECTS_PATH: path.join(app.getPath('userData'), 'projects'),
        // Set Supabase credentials from server
        NEXT_PUBLIC_SUPABASE_URL: credentials.supabase.url,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: credentials.supabase.anonKey,
        SUPABASE_SERVICE_ROLE_KEY: credentials.supabase.serviceRoleKey
      };

      this.serverProcess = spawn('node', [serverPath], {
        env,
        stdio: 'pipe'
      });

      // Handle server output
      this.serverProcess.stdout.on('data', (data) => {
        console.log(`Server: ${data}`);
      });

      this.serverProcess.stderr.on('data', (data) => {
        console.error(`Server Error: ${data}`);
      });

      this.serverProcess.on('close', (code) => {
        console.log(`Server process exited with code ${code}`);
        this.serverProcess = null;
      });

      // Wait for server to be ready
      await this.waitForServer();
      
    } catch (error) {
      console.error('Failed to start server:', error);
      throw error;
    } finally {
      this.isStarting = false;
    }
  }

  // ... rest of ServerManager methods
}
```

**2. Update Build Configuration**:

Modify `electron-builder.json` to include the credential server URL:

```json
{
  "appId": "com.yourcompany.panorama-viewer",
  "productName": "Advanced Panorama Viewer",
  "directories": {
    "output": "dist"
  },
  "files": [
    "desktop/**/*",
    ".next/standalone/**/*",
    "server-production.js",
    "!**/.env*"
  ],
  "extraMetadata": {
    "credentialServerUrl": "https://your-credential-server.com"
  },
  "mac": {
    "category": "public.app-category.photography",
    "target": "dmg"
  },
  "win": {
    "target": "nsis"
  },
  "linux": {
    "target": "AppImage"
  }
}
```

## Step 3: Build and Deploy

### Deploy Credential Server

**Option A: Vercel Deployment**

Create `vercel.json`:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/server.js"
    }
  ],
  "env": {
    "SUPABASE_URL": "@supabase-url",
    "SUPABASE_ANON_KEY": "@supabase-anon-key",
    "SUPABASE_SERVICE_ROLE_KEY": "@supabase-service-role-key",
    "API_SECRET": "@api-secret"
  }
}
```

Deploy:
```bash
vercel --prod
```

**Option B: Railway Deployment**

```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

**Option C: Your Own Server**

```bash
# On your server
git clone your-credential-server-repo
cd panorama-credential-server
npm install
npm install -g pm2

# Set environment variables
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_ANON_KEY="your_anon_key"
export SUPABASE_SERVICE_ROLE_KEY="your_service_key"
export API_SECRET="your-secure-secret"

# Start with PM2
pm2 start server.js --name "credential-server"
pm2 save
pm2 startup
```

### Build Desktop App

```bash
# Set credential server URL
export CREDENTIAL_SERVER_URL="https://your-credential-server.com"
export CREDENTIAL_API_SECRET="your-secure-api-secret-key"

# Build the app
npm run build
npm run desktop:build
```

## Step 4: Security Enhancements

### 1. Add Device Authentication

**Enhanced credential server with device registration**:

```javascript
// Add to server.js
const deviceTokens = new Map(); // In production, use a database

// Device registration endpoint
app.post('/api/register-device', (req, res) => {
  const { deviceId, appVersion } = req.body;
  
  if (!deviceId || !appVersion) {
    return res.status(400).json({ error: 'Missing device information' });
  }
  
  // Generate device token
  const deviceToken = require('crypto').randomBytes(32).toString('hex');
  deviceTokens.set(deviceId, {
    token: deviceToken,
    appVersion,
    registeredAt: new Date(),
    lastAccess: new Date()
  });
  
  res.json({ deviceToken });
});

// Modify credentials endpoint to require device token
app.get('/api/credentials', (req, res) => {
  const deviceToken = req.headers['x-device-token'];
  
  if (!deviceToken || !Array.from(deviceTokens.values()).some(d => d.token === deviceToken)) {
    return res.status(401).json({ error: 'Invalid device token' });
  }
  
  // Update last access
  const device = Array.from(deviceTokens.entries()).find(([_, d]) => d.token === deviceToken);
  if (device) {
    device[1].lastAccess = new Date();
  }
  
  // Return credentials...
});
```

### 2. Add Credential Rotation

```javascript
// Add to server.js
let credentialVersion = 1;

app.get('/api/credentials', (req, res) => {
  const credentials = {
    supabase: {
      url: process.env.SUPABASE_URL,
      anonKey: process.env.SUPABASE_ANON_KEY,
      serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY
    },
    version: credentialVersion,
    lastUpdated: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
  };
  
  res.json(credentials);
});

// Endpoint to rotate credentials
app.post('/api/rotate-credentials', (req, res) => {
  // Verify admin access
  const adminSecret = req.headers['x-admin-secret'];
  if (adminSecret !== process.env.ADMIN_SECRET) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  credentialVersion++;
  res.json({ message: 'Credentials rotated', version: credentialVersion });
});
```

## Step 5: Monitoring and Maintenance

### Server Monitoring

```javascript
// Add to server.js
const stats = {
  requests: 0,
  errors: 0,
  startTime: Date.now()
};

app.use((req, res, next) => {
  stats.requests++;
  next();
});

app.use((err, req, res, next) => {
  stats.errors++;
  next(err);
});

app.get('/api/stats', (req, res) => {
  res.json({
    ...stats,
    uptime: Date.now() - stats.startTime,
    activeDevices: deviceTokens.size
  });
});
```

### Health Checks

```javascript
app.get('/health', async (req, res) => {
  try {
    // Test Supabase connection
    const supabaseHealthy = await testSupabaseConnection();
    
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        supabase: supabaseHealthy ? 'healthy' : 'unhealthy'
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message
    });
  }
});
```

## Benefits of This Approach

✅ **Zero User Configuration**: Users just install and run  
✅ **Centralized Control**: Update credentials without app updates  
✅ **Secure Distribution**: No credentials in the app binary  
✅ **Automatic Updates**: Credentials refresh automatically  
✅ **Offline Support**: Cached credentials work offline  
✅ **Device Management**: Track and control device access  
✅ **Scalable**: Handle unlimited installations  

## Security Considerations

🔒 **HTTPS Only**: Always use HTTPS for credential server  
🔒 **API Authentication**: Secure the credential endpoint  
🔒 **Rate Limiting**: Prevent abuse and DoS attacks  
🔒 **Device Registration**: Track and control device access  
🔒 **Credential Rotation**: Regular credential updates  
🔒 **Monitoring**: Log access and detect anomalies  
🔒 **Fallback**: Cached credentials for offline use  

This approach gives you complete control over credential distribution while providing a seamless user experience with zero configuration required after installation.