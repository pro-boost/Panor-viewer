# Quick Start - Reproducible Electron Builds

## One-Command Build Process

### Full Reproducible Build (All Architectures)
```bash
npm run desktop:build:reproducible
```

### Clean Build (Remove Previous Builds)
```bash
npm run desktop:build:reproducible:clean
```

### Architecture-Specific Builds
```bash
# 32-bit only
npm run desktop:build:win32

# 64-bit only  
npm run desktop:build:x64
```

## Expected Output
After running any build command, you'll find these files in the `dist/` folder:

### Complete Build (All Architectures)
```
dist/
├── PrimeZone Advanced Panorama Viewer Setup 1.0.0-ia32.exe  # 32-bit installer
├── PrimeZone Advanced Panorama Viewer Setup 1.0.0-x64.exe  # 64-bit installer
├── win-ia32-unpacked/                                      # 32-bit portable version
│   ├── PrimeZone Advanced Panorama Viewer.exe
│   └── resources/
├── win-x64-unpacked/                                       # 64-bit portable version
│   ├── PrimeZone Advanced Panorama Viewer.exe
│   └── resources/
├── build-report.json                                       # Build verification report
└── builder-effective-config.yaml                           # Build configuration used
```

## Manual Steps (If Needed)

### 1. Clean Environment
```bash
npm run clean
```

### 2. Install Dependencies
```bash
npm ci
```

### 3. Build Application
```bash
npm run build
```

### 4. Build Electron
```bash
npm run desktop:build:reproducible
```

## Verification

### Check Build Success
The build script automatically verifies:
- ✅ Both 32-bit and 64-bit installers exist
- ✅ Unpacked folders contain all necessary files
- ✅ File sizes are reasonable (100-200MB)
- ✅ Build report is generated

### Manual Testing
1. **Test 32-bit version**: Run `dist/win-ia32-unpacked/PrimeZone Advanced Panorama Viewer.exe`
2. **Test 64-bit version**: Run `dist/win-x64-unpacked/PrimeZone Advanced Panorama Viewer.exe`
3. **Test installers**: Run both setup files and verify installation

## Troubleshooting

### Build Issues
- **Memory errors**: Use `node --max-old-space-size=4096 npm run desktop:build:reproducible`
- **Missing files**: Check `build-report.json` for details
- **Permission errors**: Run terminal as Administrator on Windows

### Environment Requirements
- Node.js 18+
- Windows 10/11 (for Windows builds)
- 4GB+ RAM recommended
- 2GB+ free disk space

## Configuration Files Updated
- ✅ `config/electron-builder.json` - Updated for 32/64-bit support
- ✅ `scripts/build-reproducible-electron.js` - Reproducible build script
- ✅ `package.json` - Added new build commands
- ✅ `docs/development/ELECTRON_BUILD_GUIDE.md` - Comprehensive documentation
- ✅ `docs/BUILD_QUICK_START.md` - This quick reference

## Ready to Use
The build system is now configured for reproducible Electron app generation with:
- **32-bit compatibility** (ia32)
- **64-bit optimization** (x64)
- **Unpacked folders** (portable versions)
- **Setup files** (installers)
- **Comprehensive documentation**