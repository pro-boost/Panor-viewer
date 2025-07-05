# Blank Page Troubleshooting Guide

## Overview

This guide addresses the blank page issue that can affect all versions of the Panorama Viewer
application.

## Root Cause Analysis

The blank page issue is typically caused by:

1. **Port 3000 conflicts** - Another process is using the port needed by the Next.js server
2. **Corrupted cache files** - Stuck or corrupted cache preventing proper startup
3. **Server startup failures** - The Next.js server fails to start in the packaged environment
4. **Missing build files** - Required .next directory or dependencies not properly included

## Quick Fix (Try This First)

### Step 1: Kill Port 3000 Processes

```bash
# Check what's using port 3000
netstat -ano | findstr :3000

# Kill the processes (replace PID with actual process ID)
taskkill /F /PID <PID>

# Or use our automated script
npm run kill-port
```

### Step 2: Clean and Reset

```bash
# Clean all cache and temporary files
npm run clean:reset

# Rebuild the application
npm run build

# Repackage (if using packaged version)
npm run package:clean
```

### Step 3: Test

Try running the application again. If it still shows a blank page, continue to the detailed
troubleshooting.

## Detailed Troubleshooting

### 1. Run Diagnostic Tool

```bash
npm run diagnose
```

This will check:

- Environment setup
- Required files and directories
- Next.js build status
- Python dependencies
- Port availability
- Common issues

### 2. Check Electron Console

If running a packaged version:

1. Open the application
2. Press `Ctrl+Shift+I` to open developer tools
3. Check the Console tab for error messages
4. Look for specific errors like:
   - `EADDRINUSE` (port in use)
   - `MODULE_NOT_FOUND` (missing dependencies)
   - `Failed to load URL` (server not starting)

### 3. Manual Server Test

Test if the Next.js server can start independently:

```bash
# In development
npm run dev

# In production mode
npm run build
npm start
```

Then visit `http://localhost:3000` in your browser.

### 4. Check for Conflicting Processes

```bash
# List all processes using port 3000
netstat -ano | findstr :3000

# Check for Node.js processes
tasklist | findstr node

# Check for Electron processes
tasklist | findstr electron
```

## Version-Specific Solutions

### For All Versions (v1-v9)

The blank page issue affects all versions because it's typically an environment problem, not a code
problem.

### Version 9 (Latest)

Includes the most robust error handling:

- Automatic retry logic (up to 10 attempts)
- Detailed error messages
- Better server startup detection
- Comprehensive logging

## Advanced Solutions

### 1. Change Default Port

If port 3000 is consistently occupied:

1. Edit `electron-server.js`:

```javascript
// Change all instances of 3000 to 3001 (or another free port)
server.listen(3001, (err) => {
```

2. Update the window loading URL:

```javascript
mainWindow.loadURL('http://localhost:3001');
```

### 2. Use Standalone Next.js Build

For persistent issues, configure Next.js for standalone output:

1. Edit `next.config.js`:

```javascript
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
};
```

2. Rebuild and repackage

### 3. Alternative Server Startup

If the current server startup method fails, try:

```javascript
// In electron-server.js, replace the server startup with:
const { createServer } = require('http');
const next = require('next');

const app = next({ dev: false, dir: __dirname });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(handle).listen(3000, () => {
    console.log('Server ready on http://localhost:3000');
  });
});
```

## Prevention

### 1. Clean Shutdown

Always close the application properly to avoid leaving processes running.

### 2. Regular Cleanup

Run cleanup commands periodically:

```bash
npm run clean:reset
```

### 3. Check Before Starting

Before starting the application:

```bash
npm run diagnose
```

## Emergency Recovery

If nothing else works:

1. **Complete Reset**:

```bash
npm run clean:all
npm install
npm run build
```

2. **Repackage from Scratch**:

```bash
rm -rf dist
npm run package:clean
```

3. **Check System Resources**:
   - Ensure sufficient disk space
   - Check available memory
   - Verify no antivirus interference

## Getting Help

If the issue persists:

1. Run `npm run diagnose` and save the output
2. Check the Electron console for errors
3. Note your operating system and Node.js version
4. Document the exact steps that lead to the blank page

## Summary

The blank page issue is almost always related to:

- **Port conflicts** (most common)
- **Cache corruption**
- **Server startup failures**

The v9 package includes the most comprehensive fixes, but the issue can still occur due to
environment factors. The diagnostic tool and cleanup scripts should resolve most cases.
