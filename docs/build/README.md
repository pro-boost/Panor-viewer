# Build Documentation

This folder contains all documentation related to building and distributing the Advanced Panorama Viewer application.

## Files in this folder:

### ELECTRON_BUILD_GUIDE.md
**Purpose**: Comprehensive Electron build guide with detailed instructions
**Contents**:
- Step-by-step build process
- Architecture-specific settings (32-bit/64-bit)
- Build verification and testing
- Troubleshooting common build issues
- Configuration details and customization

### CROSS_PLATFORM_BUILD.md
**Purpose**: Cross-platform build setup and platform-specific considerations
**Contents**:
- Platform support overview (Windows, macOS, Linux)
- Node.js bundling for different platforms
- Platform-aware build commands
- Cross-platform file handling

### SECURE_DISTRIBUTION.md
**Purpose**: Security considerations for app distribution
**Contents**:
- Electron build optimization
- File inclusion/exclusion rules
- ASAR packaging and security
- Distribution best practices

## Quick Start

For most users, start with **ELECTRON_BUILD_GUIDE.md** for detailed build instructions, then refer to **CROSS_PLATFORM_BUILD.md** if you need to build for multiple platforms.

## Build Commands Summary

```bash
# Build installer for current platform
npm run desktop:build:installer

# Build unpacked directory for testing
npm run desktop:build:unpack

# Clean previous builds
npm run clean
```

## Related Documentation

- **Scripts Documentation**: `../SCRIPTS_DOCUMENTATION.md`
- **Configuration**: `../configuration/CONFIGURATION.md`
- **Troubleshooting**: `../configuration/TROUBLESHOOTING.md`