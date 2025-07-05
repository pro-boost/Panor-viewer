# Fresh Electron Installation Prompt

## Context
I have a Next.js panoramic image viewer application that needs to be packaged as an Electron desktop app. I want to start fresh with Electron installation and avoid all the caching, packaging, and refresh issues I've encountered.

## Requirements

### 1. Clean Electron Setup
```bash
# Remove existing Electron installations
npm uninstall electron electron-packager electron-builder
rm -rf node_modules package-lock.json

# Install stable Electron version (NOT the latest)
npm install --save-dev electron@28.0.0
npm install --save-dev electron-packager@17.1.1
```

### 2. Essential Configuration Files

#### main.js (Electron entry point)
```javascript
const { app, BrowserWindow } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: true
    }
  });

  const startUrl = isDev 
    ? 'http://localhost:3000' 
    : `file://${path.join(__dirname, '../out/index.html')}`;
  
  mainWindow.loadURL(startUrl);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
```

#### package.json updates
```json
{
  "main": "main.js",
  "scripts": {
    "electron": "electron .",
    "electron-dev": "ELECTRON_IS_DEV=true electron .",
    "build-electron": "npm run build && npm run package",
    "package": "electron-packager . panoramaviewer --platform=win32 --arch=x64 --out=dist --overwrite"
  }
}
```

### 3. Critical .electronignore Configuration
```
# Development files
node_modules/
.git/
.github/
src/
tests/
docs/
scripts/
.next/
.swc/
.husky/

# Dynamic data files (CRITICAL - prevents caching issues)
public/data/
public/images/
public/debug-packaged-images.html

# Temporary and cache files
tmp/
.tmp/
cache/
.cache/
*.log
*.tmp

# Configuration files
.env*
.eslintrc*
.prettierrc*
jest.config.js
next.config.js
tsconfig.json

# Documentation
README.md
TROUBLESHOOTING*.md
*.md

# Test files
__tests__/
*.test.*
*.spec.*
test-data/
```

### 4. Next.js Configuration for Electron
```javascript
// next.config.js
module.exports = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  assetPrefix: process.env.NODE_ENV === 'production' ? './' : '',
  experimental: {
    esmExternals: false
  }
};
```

### 5. Essential Dependencies
```bash
npm install --save-dev electron@28.0.0
npm install --save-dev electron-packager@17.1.1
npm install --save electron-is-dev
```

## Critical Prevention Measures

### 1. Storage Optimization
- **Always clear tmp/ directory** before packaging
- **Exclude all dynamic data** from packages
- **Use .electronignore** to prevent bloated packages
- **Clean node_modules** regularly

### 2. Caching Prevention
```javascript
// In API routes, always add cache-busting headers
res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
res.setHeader('Pragma', 'no-cache');
res.setHeader('Expires', '0');
```

### 3. File Detection Logic
```javascript
// Implement proper file detection with debouncing
const checkForFiles = useCallback(async () => {
  const response = await fetch('/api/check-files', {
    cache: 'no-cache',
    headers: { 'Cache-Control': 'no-cache' }
  });
  // Handle response with proper state management
}, []);
```

### 4. Refresh Loop Prevention
```javascript
// Implement circuit breaker pattern
const refreshCount = useRef(0);
const lastRefreshTime = useRef(0);

// Limit refreshes to prevent infinite loops
if (refreshCount.current > 3 || Date.now() - lastRefreshTime.current < 2000) {
  return; // Skip refresh
}
```

## Packaging Best Practices

### 1. Pre-packaging Checklist
- [ ] Clear tmp/ directory: `rm -rf tmp/`
- [ ] Remove dynamic data: `rm -rf public/data/* public/images/*`
- [ ] Build Next.js: `npm run build`
- [ ] Verify .electronignore is correct
- [ ] Test in development mode first

### 2. Packaging Command
```bash
# Clean packaging
npm run build
electron-packager . panoramaviewer --platform=win32 --arch=x64 --out=dist --overwrite --ignore="public/data|public/images|tmp"
```

### 3. Post-packaging Verification
```bash
# Check package size
du -sh dist/panoramaviewer-win32-x64/

# Verify excluded files
ls dist/panoramaviewer-win32-x64/resources/app/public/
```

## Common Issues to Avoid

### 1. Version Conflicts
- **Use stable Electron version** (28.x, not latest)
- **Pin dependency versions** in package.json
- **Avoid mixing Electron versions**

### 2. Path Issues
```javascript
// Use proper path resolution
const publicPath = app.isPackaged 
  ? path.join(process.resourcesPath, 'app', 'public')
  : path.join(__dirname, 'public');
```

### 3. Security Configuration
```javascript
// Proper security settings
webPreferences: {
  nodeIntegration: false,
  contextIsolation: true,
  enableRemoteModule: false,
  webSecurity: true
}
```

## Testing Strategy

### 1. Development Testing
```bash
npm run dev          # Test Next.js
npm run electron-dev # Test Electron in dev mode
```

### 2. Production Testing
```bash
npm run build        # Build Next.js
npm run electron     # Test built version
npm run package      # Create package
```

### 3. Package Validation
- Test with empty data directories
- Verify file upload functionality
- Check refresh behavior
- Monitor memory usage

## Final Recommendations

1. **Always use Electron 28.x** (stable version)
2. **Test packaging with empty directories** first
3. **Implement proper error boundaries**
4. **Use comprehensive logging** for debugging
5. **Regular cleanup** of temporary files
6. **Version control** your .electronignore file
7. **Document any custom configurations**

This setup will give you a clean, optimized Electron application that avoids the caching, packaging, and refresh issues we encountered.