# Windows Build Solution for Electron-Builder Symbolic Link Issues

This document explains the Windows-specific permission issues with symbolic links in electron-builder and provides a comprehensive solution.

## Problem Description

Electron-builder on Windows often fails with symbolic link permission errors, particularly when:
- Running without administrator privileges
- Windows Developer Mode is not enabled
- Code signing cache contains symbolic links from macOS/Linux builds
- Windows security policies restrict symbolic link creation

### Common Error Messages
```
ERROR: Cannot create symbolic link : Le client ne dispose pas d'un privilège nécessaire
ERROR: Cannot create symbolic link : Client does not have required privilege
```

## Root Causes

1. **Code Signing Cache**: Electron-builder downloads code signing tools that contain symbolic links
2. **Cross-Platform Cache**: Cache files from macOS/Linux builds contain symbolic links
3. **Windows Permissions**: Standard users cannot create symbolic links by default
4. **Auto-Discovery**: Electron-builder automatically attempts code signing operations

## Solution Components

### 1. Updated Electron-Builder Configuration

The `config/electron-builder.json` has been updated with:

```json
{
  "win": {
    "target": [
      {
        "target": "nsis",
        "arch": ["x64"]
      },
      {
        "target": "portable",
        "arch": ["x64"]
      }
    ],
    "signAndEditExecutable": false,
    "verifyUpdateCodeSignature": false,
    "forceCodeSigning": false
  }
}
```

**Key Changes:**
- Explicitly disable all code signing operations
- Create both NSIS installer and portable executable
- Target only x64 architecture for consistency

### 2. Windows-Safe Build Scripts

#### PowerShell Script (`scripts/build-electron-windows-safe.ps1`)
- Sets environment variables to disable code signing
- Clears problematic cache directories
- Runs electron-builder with safe configuration

#### Batch Script (`scripts/build-electron-windows-safe.bat`)
- Alternative for environments where PowerShell is restricted
- Same functionality as PowerShell script
- Compatible with older Windows versions

### 3. NPM Script Integration

New package.json script:
```json
{
  "scripts": {
    "desktop:build:windows-safe": "npm run build:standalone && powershell -ExecutionPolicy Bypass -File scripts/build-electron-windows-safe.ps1"
  }
}
```

## Usage Instructions

### Method 1: NPM Script (Recommended)
```bash
npm run desktop:build:windows-safe
```

### Method 2: PowerShell Script
```powershell
.\scripts\build-electron-windows-safe.ps1
```

### Method 3: Batch Script
```cmd
scripts\build-electron-windows-safe.bat
```

### Method 4: Manual Environment Setup
```powershell
# Set environment variables
$env:CSC_IDENTITY_AUTO_DISCOVERY = "false"
$env:WIN_CSC_LINK = ""
$env:WIN_CSC_KEY_PASSWORD = ""
$env:ELECTRON_BUILDER_ALLOW_UNRESOLVED_DEPENDENCIES = "true"

# Clear cache
Remove-Item -Recurse -Force "$env:LOCALAPPDATA\electron-builder\Cache" -ErrorAction SilentlyContinue

# Build
npx electron-builder --config config/electron-builder.json --win --publish=never
```

## Environment Variables Explained

| Variable | Purpose |
|----------|----------|
| `CSC_IDENTITY_AUTO_DISCOVERY` | Disables automatic code signing certificate discovery |
| `WIN_CSC_LINK` | Clears Windows code signing certificate path |
| `WIN_CSC_KEY_PASSWORD` | Clears code signing key password |
| `ELECTRON_BUILDER_ALLOW_UNRESOLVED_DEPENDENCIES` | Allows build with missing optional dependencies |

## Troubleshooting

### If Build Still Fails

1. **Clear All Caches**:
   ```powershell
   Remove-Item -Recurse -Force "$env:LOCALAPPDATA\electron-builder\Cache"
   Remove-Item -Recurse -Force "$env:APPDATA\npm-cache"
   Remove-Item -Recurse -Force "node_modules"
   npm install
   ```

2. **Run as Administrator** (if absolutely necessary):
   - Right-click PowerShell/Command Prompt
   - Select "Run as Administrator"
   - Navigate to project directory
   - Run build script

3. **Enable Developer Mode** (Windows 10/11):
   - Settings → Update & Security → For Developers
   - Enable "Developer Mode"
   - Restart computer

4. **Use Alternative Build Tool**:
   ```bash
   # Fallback to electron-packager
   npx electron-packager . "PrimeZone Advanced Panorama Viewer" --platform=win32 --arch=x64 --out=dist --overwrite
   ```

### Common Issues and Solutions

| Issue | Solution |
|-------|----------|
| PowerShell execution policy | Use `-ExecutionPolicy Bypass` flag |
| Cache permission errors | Delete cache directory manually |
| Missing dependencies | Run `npm install` after clearing node_modules |
| Antivirus interference | Add project folder to antivirus exclusions |

## Build Output

Successful builds will create:
- `dist-new/win-unpacked/` - Unpacked application directory
- `dist-new/PrimeZone Advanced Panorama Viewer Setup.exe` - NSIS installer
- `dist-new/PrimeZone Advanced Panorama Viewer.exe` - Portable executable

## Security Considerations

- Code signing is disabled for development builds
- For production releases, consider using a proper code signing certificate
- The portable executable may trigger Windows SmartScreen warnings
- Users may need to click "More info" → "Run anyway" for unsigned executables

## Alternative Solutions

If the above solutions don't work:

1. **Use WSL2**: Build in Windows Subsystem for Linux
2. **Docker**: Use a containerized build environment
3. **CI/CD**: Use GitHub Actions or similar for automated builds
4. **Virtual Machine**: Build in a Linux VM

## Contributing

If you encounter new Windows build issues:
1. Document the error message
2. Note your Windows version and configuration
3. Test the provided solutions
4. Submit an issue with detailed information

---

**Note**: This solution prioritizes build reliability over code signing. For production releases requiring code signing, additional configuration may be needed.