# Scripts Documentation

This document provides detailed information about all build scripts and utilities in the project.

## Build Scripts

Refer to the `scripts/` directory for all build and utility scripts.

### Main Scripts

- `build-electron-packager.js` - Packages the application into an Electron desktop app
- `fix-standalone-asar.js` - Fixes ASAR archive issues in standalone builds
- `install-packaged-deps.js` - Installs dependencies for packaged applications
- `install-standalone-deps.js` - Installs dependencies for standalone applications
- `server-production.js` - Production server configuration and startup
- `test-credentials.js` - Tests and validates credential configurations
- `verify-build-contents.js` - Verifies the integrity and completeness of build outputs

### Node.js Utilities (`scripts/node/`)

- `calculate-north-offsets.js` - Calculates north direction offsets for panorama orientation
- `cleanup-temp.js` - Removes temporary files and cleans up build artifacts
- `copy-public.js` - Copies public assets to appropriate build directories
- `generate-config.js` - Generates panorama configuration from CSV data
- `generate-marzipano-config.js` - Creates Marzipano-specific configuration files

For more detailed information about each script, refer to the individual script files and their inline documentation.
