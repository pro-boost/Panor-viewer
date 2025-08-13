# Standalone Resources Obfuscation

This document explains the standalone resources obfuscation system that protects JavaScript files in the `extraResources` directory outside the ASAR package.

## Overview

While the main application code is protected within the ASAR package with obfuscation and integrity checking, some files need to be placed outside the ASAR as `extraResources`. These files, particularly in the `scripts/node` directory, contain sensitive logic and should also be obfuscated for security.

## How It Works

The standalone obfuscation system:

1. **Runs during the `afterPack` phase** of electron-builder
2. **Scans standalone directories** for JavaScript files
3. **Applies heavy obfuscation** to protect sensitive code
4. **Creates backups** of original files for debugging
5. **Preserves functionality** while making code unreadable

## Architecture

### Files Involved

- `scripts/electron/obfuscate-standalone.js` - Main obfuscation module
- `scripts/electron/after-pack.js` - Integration with electron-builder
- `scripts/test-standalone-obfuscation.js` - Testing utilities

### Process Flow

```
electron-builder build
  ↓
afterPack hook
  ↓
1. Install dependencies
  ↓
2. Obfuscate standalone resources
  ↓
3. Fix application icons
  ↓
Build complete
```

## Configuration

### Obfuscation Options

The system uses aggressive obfuscation settings:

```javascript
{
  compact: true,
  controlFlowFlattening: true,
  controlFlowFlatteningThreshold: 0.75,
  deadCodeInjection: true,
  debugProtection: true,
  disableConsoleOutput: true,
  identifierNamesGenerator: 'hexadecimal',
  stringArray: true,
  stringArrayEncoding: ['base64'],
  selfDefending: true,
  // ... more options
}
```

### Target Files

The system obfuscates:

- ✅ All `.js` files in `scripts/node/` directory
- ✅ Other JavaScript files in standalone directories
- ❌ Already obfuscated files (`.obfuscated.`)
- ❌ Configuration files (`package.json`, etc.)
- ❌ Files in `node_modules/`

## Usage

### Automatic Obfuscation

Obfuscation runs automatically during the build process:

```bash
# Build the application (obfuscation included)
npm run build:electron
```

### Manual Testing

Test the obfuscation system independently:

```bash
# Test with sample files
node scripts/test-standalone-obfuscation.js test

# Test with actual build directories
node scripts/test-standalone-obfuscation.js build

# Clean up test files
node scripts/test-standalone-obfuscation.js cleanup

# Run all tests
node scripts/test-standalone-obfuscation.js all
```

## File Structure

### Before Obfuscation

```
dist/mac-arm64/Advanced Panorama Viewer.app/Contents/Resources/standalone/
├── scripts/
│   └── node/
│       ├── calculate-north-offsets.js     # Readable code
│       ├── cleanup-temp-files.js          # Readable code
│       ├── generate-config.js             # Readable code
│       └── generate-marzipano-config.js   # Readable code
└── other-files...
```

### After Obfuscation

```
dist/mac-arm64/Advanced Panorama Viewer.app/Contents/Resources/standalone/
├── scripts/
│   └── node/
│       ├── calculate-north-offsets.js           # Obfuscated code
│       ├── calculate-north-offsets.js.original  # Backup (readable)
│       ├── cleanup-temp-files.js                # Obfuscated code
│       ├── cleanup-temp-files.js.original       # Backup (readable)
│       ├── generate-config.js                   # Obfuscated code
│       ├── generate-config.js.original          # Backup (readable)
│       ├── generate-marzipano-config.js         # Obfuscated code
│       └── generate-marzipano-config.js.original # Backup (readable)
└── other-files...
```

## Security Features

### Code Protection

- **String obfuscation** - All strings are encoded and hidden
- **Control flow flattening** - Logic flow is scrambled
- **Dead code injection** - Fake code paths added
- **Debug protection** - Prevents debugging attempts
- **Self-defending** - Code detects tampering attempts

### Example Transformation

**Original Code:**
```javascript
const config = {
  apiKey: 'secret-api-key',
  databaseUrl: 'mongodb://localhost:27017'
};

function getConfig() {
  return config;
}
```

**Obfuscated Code:**
```javascript
var _0x1a2b=['c2VjcmV0LWFwaS1rZXk=','bW9uZ29kYjovL2xvY2FsaG9zdDoyNzAxNw=='];
(function(_0x3c4d,_0x5e6f){var _0x7g8h=function(_0x9i0j){while(--_0x9i0j){_0x3c4d['push'](_0x3c4d['shift']());}};_0x7g8h(++_0x5e6f);}(_0x1a2b,0x123));
// ... heavily obfuscated code continues
```

## Debugging

### Backup Files

Original files are preserved as `.original` backups:

```bash
# View original code for debugging
cat scripts/node/generate-config.js.original

# Compare with obfuscated version
cat scripts/node/generate-config.js
```

### Logging

The obfuscation process provides detailed logging:

```
🔒 Starting standalone resources obfuscation...
📂 Processing standalone directory: /path/to/standalone
🎯 Obfuscating scripts/node directory: /path/to/scripts/node
🔍 Scanning for JavaScript files in: /path/to/scripts/node
📁 Found 4 JavaScript files to obfuscate
🔒 Obfuscating: /path/to/calculate-north-offsets.js
✅ Successfully obfuscated: /path/to/calculate-north-offsets.js
...
✅ Standalone resources obfuscation completed!
```

## Troubleshooting

### Common Issues

1. **Obfuscation fails**
   - Check if `javascript-obfuscator` is installed
   - Verify file permissions
   - Check for syntax errors in original files

2. **Files not found**
   - Ensure build completed successfully
   - Check `electron-builder.json` extraResources configuration
   - Verify standalone directory structure

3. **Runtime errors after obfuscation**
   - Check console for specific errors
   - Compare with `.original` backup files
   - Adjust obfuscation options if needed

### Disable Obfuscation

To temporarily disable standalone obfuscation:

```javascript
// In scripts/electron/after-pack.js
// Comment out the obfuscation step:

// Step 2: Handle standalone obfuscation
console.log('\n🔒 Step 2: Obfuscating standalone resources...');
if (standaloneDirs.length > 0) {
  // await standaloneObfuscator.obfuscateStandaloneResources(standaloneDirs);
  console.log('⚠️  Standalone obfuscation disabled for debugging');
} else {
  console.log('ℹ️  No standalone directories found for obfuscation');
}
```

## Performance Impact

- **Build time**: Adds ~10-30 seconds depending on file count
- **File size**: Obfuscated files are typically 20-40% larger
- **Runtime**: Minimal impact on execution speed
- **Memory**: Slight increase due to obfuscation overhead

## Best Practices

1. **Test thoroughly** after enabling obfuscation
2. **Keep backups** of original files for debugging
3. **Monitor logs** during build process
4. **Adjust settings** based on your security needs
5. **Document changes** when modifying obfuscation options

## Integration with Other Security Features

This standalone obfuscation works alongside:

- **ASAR obfuscation** - Main application code protection
- **Integrity checking** - Runtime verification of critical files
- **Code signing** - Application authenticity verification
- **Environment-based builds** - Different protection levels per environment

Together, these features provide comprehensive code protection for your Electron application.