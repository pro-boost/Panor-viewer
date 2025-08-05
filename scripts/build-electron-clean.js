#!/usr/bin/env node

/**
 * Simple Electron Build Script - Clean and Build
 * Automatically empties dist folder and builds fresh Electron app
 * 
 * Usage:
 *   node scripts/build-electron-clean.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Simple logging
const log = (message, type = 'info') => {
  const colors = {
    info: '\x1b[36m',
    success: '\x1b[32m',
    error: '\x1b[31m',
    reset: '\x1b[0m'
  };
  
  const color = colors[type] || colors.info;
  console.log(`${color}[${new Date().toLocaleTimeString()}] ${message}${colors.reset}`);
};

// Clean dist folder
const cleanDist = () => {
  log('🧹 Cleaning dist folder...', 'info');
  const distPath = path.join(__dirname, '..', 'dist');
  
  if (fs.existsSync(distPath)) {
    fs.rmSync(distPath, { recursive: true, force: true });
    log('✅ Dist folder cleaned', 'success');
  } else {
    log('📁 Dist folder does not exist, creating...', 'info');
  }
};

// Build Electron app
const buildApp = () => {
  log('🔨 Building Electron application...', 'info');
  
  try {
    // Build Next.js first
    log('📦 Building Next.js...');
    execSync('npm run build', { 
      stdio: 'inherit', 
      cwd: path.join(__dirname, '..') 
    });
    
    // Build Electron with clean configuration
    log('🖥️  Building Electron app...');
    execSync('npm run desktop:build:reproducible:clean', { 
      stdio: 'inherit', 
      cwd: path.join(__dirname, '..') 
    });
    
    log('🎉 Build completed successfully!', 'success');
    log('📂 Check the dist/ folder for your builds', 'info');
    
  } catch (error) {
    log(`❌ Build failed: ${error.message}`, 'error');
    process.exit(1);
  }
};

// Main execution
const main = () => {
  log('🚀 Starting clean Electron build...', 'info');
  
  cleanDist();
  buildApp();
};

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { cleanDist, buildApp };