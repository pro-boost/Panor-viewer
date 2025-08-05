#!/usr/bin/env node

/**
 * Build script for desktop app with centralized credentials
 * This script sets the credential server environment variables and builds the app
 */

const { spawn } = require('child_process');
const path = require('path');

// Credential server configuration
const CREDENTIAL_SERVER_URL = 'https://panorama-credential-server-ind8d68x4-primezones-projects.vercel.app';
const API_SECRET = 'nuqf5CT6dXSLLcVD3NpVGZV3c6TvCg9jN7VwmflxJMJQTIPSAXvblENy2An3FXMZ';

function runCommand(command, args, env = {}) {
  return new Promise((resolve, reject) => {
    console.log(`Running: ${command} ${args.join(' ')}`);
    
    const child = spawn(command, args, {
      stdio: 'inherit',
      env: {
        ...process.env,
        ...env
      },
      cwd: process.cwd()
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });
    
    child.on('error', (error) => {
      reject(error);
    });
  });
}

async function buildApp() {
  try {
    console.log('🚀 Building Advanced Panorama Viewer with centralized credentials...');
    console.log('📡 Credential Server:', CREDENTIAL_SERVER_URL);
    console.log('');
    
    // Set environment variables for the build
    const buildEnv = {
      CREDENTIAL_SERVER_URL,
      CREDENTIAL_API_SECRET: API_SECRET,
      NODE_ENV: 'production'
    };
    
    console.log('📦 Step 1: Building Next.js application...');
    await runCommand('npm', ['run', 'build'], buildEnv);
    
    console.log('\n🖥️  Step 2: Building Electron desktop app...');
    await runCommand('npm', ['run', 'desktop:build'], buildEnv);
    
    console.log('\n✅ Build completed successfully!');
    console.log('📁 Desktop app packages are in the "dist" directory');
    console.log('');
    console.log('🔧 Configuration:');
    console.log('   • Credential Server: Enabled');
    console.log('   • Server URL:', CREDENTIAL_SERVER_URL);
    console.log('   • Credential Caching: 24 hours');
    console.log('   • Offline Fallback: Enabled');
    console.log('');
    console.log('🎉 Your app is ready for distribution!');
    console.log('   Users will not need to configure any credentials.');
    console.log('   The app will automatically fetch credentials from your server.');
    
  } catch (error) {
    console.error('\n❌ Build failed:', error.message);
    process.exit(1);
  }
}

// Check if we're running this script directly
if (require.main === module) {
  buildApp();
}

module.exports = { buildApp };