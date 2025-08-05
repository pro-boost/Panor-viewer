# Windows Electron Build Fixes

## Issues Fixed

### 1. Symbolic Link Permission Errors
**Problem**: `ERROR: Cannot create symbolic link : Le client ne dispose pas d'un privilège nécessaire`

**Solution**: 
- Updated electron-builder configuration to disable code signing verification
- Added custom cache directory to avoid system-level cache issues
- Created dedicated Windows build script

### 2. Configuration Validation Errors
**Problem**: Invalid electron-builder schema configuration

**Solution**:
- Fixed target configuration format
- Moved artifactName to correct nsis section
- Simplified Windows target configuration

### 3. Build Process Improvements
- Added proper error handling
- Created Windows-specific build script
- Added environment variable handling

## How to Build Successfully

### Method 1: Run as Administrator (Recommended)
1. **Right-click** on PowerShell or Command Prompt
2. **Select "Run as administrator"**
3. Run the following commands:

```bash
cd d:\projects\panno-app-1
npm run build:windows
```

### Method 2: Enable Developer Mode
1. **Open Windows Settings** → **Update & Security** → **For Developers**
2. **Enable "Developer Mode"**
3. **Restart** your terminal
4. Run:

```bash
cd d:\projects\panno-app-1
npm run build:windows
```

### Method 3: Use the Simplified Build
```bash
cd d:\projects\panno-app-1
npm run build:standalone
npm run desktop:build:win
```

## Build Scripts Available

- `npm run build:windows` - Complete Windows build with fixes
- `npm run desktop:build:win` - Quick Windows directory build
- `npm run desktop:build:win:complete` - Full Windows installer build

## Troubleshooting

### If Build Still Fails:
1. **Clear npm cache**: `npm cache clean --force`
2. **Delete node_modules**: `rimraf node_modules`
3. **Reinstall dependencies**: `npm install`
4. **Clear electron-builder cache**: 
   ```bash
   Remove-Item -Recurse -Force "$env:LOCALAPPDATA\electron-builder\Cache"
   ```

### Verify Build Output
After successful build, check:
- `dist/` directory for the installer
- `dist/win-unpacked/` for the unpacked application
- Run `dist/win-unpacked/PrimeZone Advanced Panorama Viewer.exe` to test

### Common Issues and Fixes
- **App won't start**: Check if all files are included in the build
- **Missing assets**: Verify extraResources configuration
- **White screen**: Check server.js and main.js configuration

## Configuration Files Updated
- `config/electron-builder.json` - Fixed schema and Windows-specific settings
- `scripts/build-windows-electron.js` - New Windows build script
- `package.json` - Added build:windows script

## Testing the Built App
1. After build completes, navigate to `dist/` folder
2. Run the installer: `PrimeZone Advanced Panorama Viewer-0.1.0-setup.exe`
3. Or test the unpacked version: `dist/win-unpacked/PrimeZone Advanced Panorama Viewer.exe`