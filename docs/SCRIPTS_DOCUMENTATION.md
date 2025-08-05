# Package.json Scripts Documentation

This document explains all the scripts available in the `package.json` file and their purposes.

## Development Scripts

### `dev`
```bash
npm run dev
```
Starts the Next.js development server on `http://localhost:3000` with hot reloading enabled.

### `dev:desktop`
```bash
npm run dev:desktop
```
Starts both the Next.js development server and Electron desktop application concurrently. Waits for the web server to be ready before launching Electron.

### `dev:config`
```bash
npm run dev:config
```
Generates configuration files and then starts the development server. Useful when you need fresh config before development.

## Build Scripts

### `build`
```bash
npm run build
```
Builds the Next.js application for production with optimized memory allocation (4GB) and runs post-build tasks.

### `postbuild`
```bash
npm run postbuild
```
Automatically runs after `build`. Copies static files and scripts directory to the standalone build output.

### `build:standalone`
```bash
npm run build:standalone
```
Builds a standalone Next.js application using production configuration. Temporarily replaces `next.config.js` with production settings.

### `postbuild:standalone`
```bash
npm run postbuild:standalone
```
Runs after standalone build. Copies public assets, fixes ASAR packaging issues, and installs standalone dependencies.

## Desktop/Electron Scripts

### `desktop:test`
```bash
npm run desktop:test
```
Builds standalone version and tests the Electron application in production mode.

### `desktop:build`
```bash
npm run desktop:build
```
Builds the complete Electron application using electron-builder with the main configuration.

### `build:electron`
```bash
npm run build:electron
```
Builds an unpacked Electron application using the electron-packager script.

### `desktop:build:credentials`
```bash
npm run desktop:build:credentials
```
Builds Electron application with credential handling using a specialized build script.

### `desktop:build:win`
```bash
npm run desktop:build:win
```
Builds Windows Electron application in directory format and installs packaged dependencies.

### `desktop:build:win:complete`
```bash
npm run desktop:build:win:complete
```
Runs a complete Windows build process using a specialized script.

### `desktop:build:reproducible`
```bash
npm run desktop:build:reproducible
```
Builds a reproducible Electron application with consistent output.

### `desktop:build:reproducible:clean`
```bash
npm run desktop:build:reproducible:clean
```
Same as reproducible build but with clean flag to remove previous builds.

### `desktop:build:win32`
```bash
npm run desktop:build:win32
```
Builds Electron application specifically for 32-bit Windows architecture.

### `desktop:build:x64`
```bash
npm run desktop:build:x64
```
Builds Electron application specifically for 64-bit architecture.

### `desktop:build:mac`
```bash
npm run desktop:build:mac
```
Builds Electron application for macOS platform.

### `desktop:build:linux`
```bash
npm run desktop:build:linux
```
Builds Electron application for Linux platform.

### `desktop:build:windows-safe`
```bash
npm run desktop:build:windows-safe
```
Builds Windows Electron application using a PowerShell script for enhanced compatibility.

## Testing Scripts

### `test`
```bash
npm run test
```
Runs Jest test suite with the project's Jest configuration.

### `test:watch`
```bash
npm run test:watch
```
Runs Jest in watch mode, automatically re-running tests when files change.

### `test:coverage`
```bash
npm run test:coverage
```
Runs Jest tests and generates code coverage reports.

### `test:credentials`
```bash
npm run test:credentials
```
Tests credential functionality using a specialized test script.

### `test:all`
```bash
npm run test:all
```
Runs all available tests (currently just the main test suite).

## Utility Scripts

### `start`
```bash
npm run start
```
Starts the Next.js application in production mode (requires prior build).

### `export`
```bash
npm run export
```
Exports the Next.js application as static files.

### `clean`
```bash
npm run clean
```
Removes build artifacts (`.next` and `out` directories).

### `cleanup-temp`
```bash
npm run cleanup-temp
```
Cleans up temporary files using a Node.js script.

### `generate-config`
```bash
npm run generate-config
```
Generates configuration files needed for the application.

## Code Quality Scripts

### `lint`
```bash
npm run lint
```
Runs ESLint to check for code quality issues and style violations.

### `type-check`
```bash
npm run type-check
```
Runs TypeScript compiler to check for type errors without emitting files.

### `format`
```bash
npm run format
```
Formats all code files using Prettier.

### `format:check`
```bash
npm run format:check
```
Checks if code is properly formatted without making changes.

## Verification Scripts

### `verify-build`
```bash
npm run verify-build
```
Verifies the contents of the build output to ensure completeness.

### `prepare`
```bash
npm run prepare
```
Automatically runs during npm install to set up Husky git hooks.

## Script Categories Summary

- **Development**: `dev`, `dev:desktop`, `dev:config`
- **Building**: `build`, `build:standalone`, `build:electron`
- **Desktop/Electron**: All `desktop:build:*` scripts
- **Testing**: `test`, `test:watch`, `test:coverage`, `test:credentials`, `test:all`
- **Utilities**: `start`, `export`, `clean`, `cleanup-temp`, `generate-config`
- **Code Quality**: `lint`, `type-check`, `format`, `format:check`
- **Verification**: `verify-build`, `prepare`

## Common Workflows

1. **Development**: `npm run dev` or `npm run dev:desktop`
2. **Production Build**: `npm run build`
3. **Electron Development**: `npm run dev:desktop`
4. **Electron Production**: `npm run desktop:build`
5. **Testing**: `npm run test` or `npm run test:watch`
6. **Code Quality Check**: `npm run lint && npm run type-check && npm run format:check`