# Cross-Platform Build Guide

This document explains how to build the Advanced Panorama Viewer for different platforms (Windows, macOS, and Linux).

## Overview

The application now supports cross-platform builds with the following features:

- **Platform-specific Node.js bundling**: Automatically downloads and bundles the correct Node.js runtime for each platform
- **Cross-platform file extraction**: Supports ZIP (Windows), TAR.GZ (macOS), and TAR.XZ (Linux) archives
- **Platform-aware executable detection**: Uses the correct executable name (`node.exe` on Windows, `node` on Unix-like systems)
- **Adaptive directory structures**: Handles different app packaging structures across platforms

## Platform Support

### Windows

- **Supported architectures**: x64, x86
- **Build formats**: NSIS installer, portable directory
- **Node.js format**: ZIP archive
- **Can build on**: Windows

### macOS

- **Supported architectures**: x64 (Intel), arm64 (Apple Silicon)
- **Build formats**: DMG, ZIP
- **Node.js format**: TAR.GZ archive
- **Can build on**: macOS (due to electron-builder limitations)

### Linux

- **Supported architectures**: x64, arm64
- **Build formats**: AppImage, DEB, RPM, TAR.XZ
- **Node.js format**: TAR.XZ archive
- **Can build on**: Linux (recommended), Windows/macOS with Docker

## Build Commands

### Windows Builds

```bash
# Build Windows installer (production)
npm run desktop:build:win

# Build Windows directory only (for testing)
npm run desktop:build:win:complete
```

### macOS Builds

```bash
# Build macOS DMG and ZIP (production) - requires macOS
npm run desktop:build:mac

# Build macOS directory only (for testing) - requires macOS
npm run desktop:build:mac:local
```

### Linux Builds

```bash
# Build Linux packages (production) - requires Linux
npm run desktop:build:linux

# Build Linux directory only (for testing) - requires Linux
npm run desktop:build:linux:local
```

## Cross-Platform Development Workflow

### Option 1: Native Platform Builds (Recommended)

1. **Windows developers**: Use `npm run desktop:build:win`
2. **macOS developers**: Use `npm run desktop:build:mac`
3. **Linux developers**: Use `npm run desktop:build:linux`

### Option 2: CI/CD Pipeline

Set up GitHub Actions or similar CI/CD to build on multiple platforms:

```yaml
# Example GitHub Actions workflow
strategy:
  matrix:
    os: [windows-latest, macos-latest, ubuntu-latest]
runs-on: ${{ matrix.os }}
steps:
  - name: Build for Windows
    if: matrix.os == 'windows-latest'
    run: npm run desktop:build:win

  - name: Build for macOS
    if: matrix.os == 'macos-latest'
    run: npm run desktop:build:mac

  - name: Build for Linux
    if: matrix.os == 'ubuntu-latest'
    run: npm run desktop:build:linux
```

### Option 3: Docker (Advanced)

Use Docker containers to build for Linux from any platform:

```bash
# Build Linux version using Docker
docker run --rm -ti \
  --env-file <(env | grep -iE 'DEBUG|NODE_|ELECTRON_|YARN_|NPM_|CI|CIRCLE|TRAVIS_TAG|TRAVIS|TRAVIS_REPO_|TRAVIS_BUILD_|TRAVIS_BRANCH|TRAVIS_PULL_REQUEST_|APPVEYOR_|CSC_|GH_|GITHUB_|BT_|AWS_|STRIP|BUILD_') \
  --env ELECTRON_CACHE="/root/.cache/electron" \
  --env ELECTRON_BUILDER_CACHE="/root/.cache/electron-builder" \
  -v ${PWD}:/project \
  -v ${PWD##*/}-node-modules:/project/node_modules \
  -v ~/.cache/electron:/root/.cache/electron \
  -v ~/.cache/electron-builder:/root/.cache/electron-builder \
  electronuserland/builder:wine \
  /bin/bash -c "npm install && npm run desktop:build:linux"
```

## Technical Implementation Details

### Node.js Runtime Bundling

The `scripts/download-node.js` script automatically:

1. **Detects the target platform and architecture**
2. **Downloads the appropriate Node.js binary**:
   - Windows: `node-v18.19.0-win-x64.zip`
   - macOS Intel: `node-v18.19.0-darwin-x64.tar.gz`
   - macOS Apple Silicon: `node-v18.19.0-darwin-arm64.tar.gz`
   - Linux x64: `node-v18.19.0-linux-x64.tar.xz`
   - Linux ARM64: `node-v18.19.0-linux-arm64.tar.xz`
3. **Extracts the executable** to `resources/node/`
4. **Sets appropriate permissions** on Unix-like systems

### Platform-Aware Server Management

The `desktop/server.js` file automatically:

1. **Detects the bundled Node.js executable**:
   - Windows: `resources/node/node.exe`
   - macOS/Linux: `resources/node/node`
2. **Falls back to system Node.js** if bundled version is not found
3. **Handles different app directory structures** across platforms

### Dependency Installation

The `scripts/install-packaged-deps.js` script:

1. **Detects the platform-specific build output structure**
2. **Installs production dependencies** in the correct location
3. **Handles different app bundle formats** (ASAR vs directory)

## Troubleshooting

### Common Issues

1. **"Build for macOS is supported only on macOS"**
   - This is a limitation of electron-builder
   - Use a macOS machine or CI/CD for macOS builds

2. **Node.js download fails**
   - Check internet connection
   - Verify the Node.js version exists on nodejs.org
   - Check firewall/proxy settings

3. **Permission denied on Unix systems**
   - The script automatically sets executable permissions
   - If issues persist, manually run: `chmod +x resources/node/node`

4. **Missing dependencies in packaged app**
   - Run the appropriate post-build script
   - Check that `install-packaged-deps.js` completed successfully

### Debug Information

To debug build issues, check:

1. **Platform detection**: The download script logs the detected platform
2. **Node.js bundling**: Check `resources/node/` directory
3. **Build output**: Check `dist/` directory structure
4. **Logs**: Review the complete build output for errors

## File Structure

After a successful build, the output structure will be:

```
dist/
├── win-unpacked/          # Windows build
│   └── resources/
│       ├── app/           # Application files
│       └── node/          # Bundled Node.js
├── mac/                   # macOS build
│   └── AppName.app/
│       └── Contents/
│           └── Resources/
│               ├── app/   # Application files
│               └── node/  # Bundled Node.js
└── linux-unpacked/        # Linux build
    └── resources/
        ├── app/           # Application files
        └── node/          # Bundled Node.js
```

## Next Steps

1. **Test the builds** on target platforms
2. **Set up CI/CD** for automated multi-platform builds
3. **Consider code signing** for production releases
4. **Implement auto-updates** using electron-updater
