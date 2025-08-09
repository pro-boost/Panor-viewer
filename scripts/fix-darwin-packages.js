#!/usr/bin/env node

/**
 * Fix for ENOENT error with @next/swc-darwin packages during Windows builds
 * 
 * This script creates empty directories for darwin packages that are referenced
 * in package-lock.json but don't exist in node_modules on Windows systems.
 * This prevents electron-builder from failing with ENOENT errors.
 */

const fs = require('fs');
const path = require('path');

const darwinPackages = [
  'node_modules/@next/swc-darwin-arm64',
  'node_modules/@next/swc-darwin-x64'
];

console.log('🔧 Fixing darwin package directories for Windows build...');

darwinPackages.forEach(packagePath => {
  const fullPath = path.resolve(packagePath);
  
  if (!fs.existsSync(fullPath)) {
    try {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`✅ Created directory: ${packagePath}`);
    } catch (error) {
      console.warn(`⚠️ Failed to create directory ${packagePath}:`, error.message);
    }
  } else {
    console.log(`ℹ️ Directory already exists: ${packagePath}`);
  }
});

console.log('✅ Darwin package fix completed');