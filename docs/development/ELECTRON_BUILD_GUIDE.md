# Electron Build Guide - Reproducible App Generation

## Overview
This guide provides step-by-step instructions for generating reproducible Electron builds with 32-bit and 64-bit compatibility, including unpacked folders and setup files.

## Prerequisites
- Node.js 18+ installed
- Windows development environment
- All dependencies installed (`npm install`)

## Build Configuration

### Updated Configuration Features
- **Dual Architecture Support**: Both 32-bit (ia32) and 64-bit (x64) builds
- **Multiple Output Formats**: 
  - Unpacked folders for both architectures
  - NSIS setup installers for both architectures
- **Reproducible Builds**: Consistent naming and folder structure

### Output Structure
After running the build command, the following outputs will be generated in the `dist/` folder:

```
dist/
├── PrimeZone Advanced Panorama Viewer Setup 1.0.0-ia32.exe  # 32-bit installer
├── PrimeZone Advanced Panorama Viewer Setup 1.0.0-x64.exe  # 64-bit installer
├── win-ia32-unpacked/                                      # 32-bit unpacked
│   ├── PrimeZone Advanced Panorama Viewer.exe
│   ├── resources/
│   └── ...
├── win-x64-unpacked/                                       # 64-bit unpacked
│   ├── PrimeZone Advanced Panorama Viewer.exe
│   ├── resources/
│   └── ...
└── builder-effective-config.yaml                          # Build configuration used
```

## Build Commands

### 1. Standard Build (All Platforms)
```bash
npm run build:electron
```

### 2. Windows-Only Build (Recommended)
```bash
npm run build:electron:win
```

### 3. Manual Build Process
If you need more control, you can run the build steps manually:

```bash
# 1. Build Next.js application
npm run build

# 2. Build Electron app
npm run electron:build
```

## Reproducible Build Checklist

### Pre-Build Steps
1. **Clean previous builds**:
   ```bash
   npm run clean
   ```

2. **Verify environment**:
   ```bash
   node --version
   npm --version
   ```

3. **Install dependencies**:
   ```bash
   npm ci  # Clean install for reproducibility
   ```

### Build Verification
1. **Check build outputs**:
   - Verify both 32-bit and 64-bit installers exist
   - Verify unpacked folders contain all necessary files
   - Test installers on target systems

2. **Validate file integrity**:
   - Check file sizes are reasonable (typically 100-200MB)
   - Verify digital signatures (if enabled)
   - Test application startup from unpacked folders

## Configuration Details

### Architecture-Specific Settings
- **32-bit (ia32)**: Compatible with older Windows systems
- **64-bit (x64)**: Optimized for modern systems
- **Dual Build**: Both architectures built simultaneously

### File Inclusion
The build includes:
- Desktop application files
- Next.js standalone build
- Static assets
- Project configurations
- Node.js scripts
- Credential configuration

### Exclusions
The build excludes:
- Source maps
- Development dependencies
- Test files
- Documentation
- Build artifacts
- Environment files

## Troubleshooting

### Common Issues
1. **Build fails with memory error**:
   - Increase Node.js memory limit:
     ```bash
     node --max-old-space-size=4096 node_modules/.bin/electron-builder
     ```

2. **Missing files in unpacked folder**:
   - Check `electron-builder.json` file patterns
   - Verify all required files are in the correct directories

3. **Installer fails to run**:
   - Ensure Windows Defender exclusions
   - Check for missing Visual C++ redistributables
   - Verify digital signatures (if enabled)

### Build Logs
Detailed build logs are available in:
- Console output during build
- `dist/builder-debug.yml` (debug information)
- `dist/builder-effective-config.yaml` (final configuration)

## Customization

### Changing Output Directory
Modify in `electron-builder.json`:
```json
{
  "directories": {
    "output": "custom-dist-folder"
  }
}
```

### Adding Custom Files
Add to `files` array in `electron-builder.json`:
```json
{
  "files": [
    "additional-folder/**/*",
    "custom-config.json"
  ]
}
```

## Build Scripts

### Available Scripts in package.json
```json
{
  "build:electron": "npm run build && electron-builder",
  "build:electron:win": "npm run build && electron-builder --win",
  "build:electron:mac": "npm run build && electron-builder --mac",
  "build:electron:linux": "npm run build && electron-builder --linux",
  "clean": "rimraf dist .next out"
}
```

## Testing Builds

### Quick Test
1. **Test unpacked version**:
   ```bash
   # Run from unpacked folder
   ./dist/win-x64-unpacked/PrimeZone Advanced Panorama Viewer.exe
   ```

2. **Test installer**:
   - Run installer executable
   - Verify installation completes successfully
   - Launch application from Start Menu

### System Requirements Test
Test builds on:
- Windows 10 (64-bit)
- Windows 7/8 (32-bit)
- Windows 11 (64-bit)

## Version Management

### Version Numbering
The build automatically uses the version from `package.json`:
```json
{
  "version": "1.0.0"
}
```

### Automatic Versioning
For CI/CD builds, version can be set via environment variable:
```bash
export npm_package_version=1.0.0-build.123
npm run build:electron
```

## Security Considerations

### Code Signing
For production releases, enable code signing:
1. Obtain code signing certificate
2. Configure in `electron-builder.json`:
   ```json
   {
     "win": {
       "sign": true
     }
   }
   ```

### Build Environment
- Use clean build environments
- Pin dependency versions
- Verify checksums of downloaded tools
- Use locked package versions (`package-lock.json`)