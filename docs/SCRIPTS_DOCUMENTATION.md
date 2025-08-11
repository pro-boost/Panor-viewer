# Scripts Documentation

This document provides detailed information about all npm scripts and utilities in the project.

## Development Scripts

### `dev`

**Command:** `next dev`
**Purpose:** Starts the Next.js development server with hot reloading
**Importance:** Essential for local development and testing changes in real-time

### `dev:desktop`

**Command:** `concurrently "npm run dev" "wait-on http://localhost:3000 && electron desktop/main.js"`
**Purpose:** Runs both the Next.js dev server and Electron app simultaneously
**Importance:** Allows testing the desktop application during development

## Build Scripts

### `build`

**Command:** `cross-env NODE_OPTIONS='--max-old-space-size=4096' next build && npm run postbuild`
**Purpose:** Creates an optimized production build of the Next.js application
**Importance:** Generates the production-ready web application with performance optimizations

### `postbuild`

**Command:** Copies static files and scripts to standalone build directory
**Purpose:** Post-processing step that ensures all necessary assets are available in the standalone build
**Importance:** Critical for ensuring the standalone build has all required files

### `build:standalone`

**Command:** Switches to production config, builds Next.js, then restores original config
**Purpose:** Creates a standalone Next.js build optimized for Electron packaging
**Importance:** Essential for creating self-contained applications that don't require external servers

### `postbuild:standalone`

**Command:** `node scripts/node/copy-public.js && node scripts/fix-standalone-asar.js && node scripts/install-standalone-deps.js`
**Purpose:** Post-processing for standalone builds including asset copying and dependency installation
**Importance:** Ensures standalone builds are complete and functional

## Desktop Application Build Scripts

### `desktop:build`

**Command:** `npm run download-node && npm run build:standalone && electron-builder --config=config/electron-builder.json`
**Purpose:** Complete desktop application build with installer creation
**Importance:** Creates production-ready desktop installers for distribution

### `desktop:build:win`

**Command:** `npm run download-node && npm run build:standalone && electron-builder --config=config/electron-builder.json --win --dir && node scripts/install-packaged-deps.js`
**Purpose:** Windows-specific desktop build with unpacked directory output
**Importance:** Creates Windows desktop application for testing and development

### `build:electron`

**Command:** `node scripts/build-electron-packager.js`
**Purpose:** Quick Electron packaging using electron-packager (faster alternative)
**Importance:** Provides faster build option for development and testing

### `desktop:build:linux:local`

**Command:** `npm run download-node && npm run build:standalone && electron-builder --config=config/electron-builder.json --linux --dir`
**Purpose:** Linux-specific desktop build for local development
**Importance:** Enables cross-platform development and testing on Linux

## Utility Scripts

### `start`

**Command:** `next start`
**Purpose:** Starts the production Next.js server
**Importance:** Used for testing production builds locally

### `clean`

**Command:** `rimraf dist .next out`
**Purpose:** Removes all build artifacts and temporary directories (including old temp, scripts/temp, and standardized tmp)
**Importance:** Essential for clean rebuilds and troubleshooting build issues

### `download-node`

**Command:** `node scripts/download-node.js`
**Purpose:** Downloads the appropriate Node.js runtime for Electron builds
**Importance:** Ensures consistent Node.js version across different build environments

### `cleanup-temp-files`

**Command:** `node scripts/node/cleanup-temp-files.js`
**Purpose:** Removes temporary files from the standardized tmp directory (including node-download, uploads, and other temp files)
**Importance:** Maintains clean workspace and prevents disk space issues

### `generate-config`

**Command:** `node scripts/node/generate-config.js`
**Purpose:** Generates panorama configuration from CSV data
**Importance:** Automates the creation of panorama viewer configurations from data files

## Testing Scripts

### `test`

**Command:** `cd . && jest --config=config/jest.config.js`
**Purpose:** Runs the complete test suite
**Importance:** Ensures code quality and prevents regressions

### `test:watch`

**Command:** `cd . && jest --config=config/jest.config.js --watch`
**Purpose:** Runs tests in watch mode for continuous testing during development
**Importance:** Provides immediate feedback on code changes

### `test:coverage`

**Command:** `cd . && jest --config=config/jest.config.js --coverage`
**Purpose:** Runs tests and generates code coverage reports
**Importance:** Helps identify untested code and improve test coverage

### `test:credentials`

**Command:** `node scripts/test-credentials.js`
**Purpose:** Tests and validates credential configurations
**Importance:** Ensures authentication and API credentials are properly configured

### `verify-build`

**Command:** `node scripts/verify-build-contents.js`
**Purpose:** Verifies the integrity and completeness of build outputs
**Importance:** Quality assurance for build artifacts before distribution

## Code Quality Scripts

### `lint`

**Command:** `next lint`
**Purpose:** Runs ESLint to check for code quality issues
**Importance:** Maintains consistent code style and catches potential bugs

### `type-check`

**Command:** `tsc --noEmit`
**Purpose:** Runs TypeScript compiler to check for type errors without generating output
**Importance:** Ensures type safety and catches TypeScript errors

### `format`

**Command:** `prettier --write .`
**Purpose:** Automatically formats all code files according to Prettier rules
**Importance:** Maintains consistent code formatting across the project

### `format:check`

**Command:** `prettier --check .`
**Purpose:** Checks if code formatting matches Prettier rules without making changes
**Importance:** Used in CI/CD to ensure code is properly formatted

### `prepare`

**Command:** `husky install`
**Purpose:** Installs Git hooks for pre-commit checks
**Importance:** Ensures code quality checks run automatically before commits

## Script Files in `scripts/` Directory

### Main Scripts

- `build-electron-packager.js` - Packages the application using electron-packager (faster alternative to electron-builder)
- `download-node.js` - Downloads Node.js runtime for Electron builds
- `fix-standalone-asar.js` - Fixes ASAR archive issues in standalone builds
- `install-packaged-deps.js` - Installs dependencies for packaged applications
- `install-standalone-deps.js` - Installs dependencies for standalone applications
- `test-credentials.js` - Tests and validates credential configurations
- `verify-build-contents.js` - Verifies build integrity and completeness

### Node.js Utilities (`scripts/node/`)

- `cleanup-temp.js` - Removes temporary files and build artifacts
- `copy-public.js` - Copies public assets to build directories
- `generate-config.js` - Generates panorama configuration from CSV data

For more detailed information about each script, refer to the individual script files and their inline documentation.
