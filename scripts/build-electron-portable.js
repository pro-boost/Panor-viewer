const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Building Electron app with portable configuration...');

// Set environment variables to skip signing and cache issues
process.env.ELECTRON_BUILDER_DISABLE_CODE_SIGNING = 'true';
process.env.ELECTRON_SKIP_NOTARIZE = 'true';

// Clean dist directory
const distPath = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distPath)) {
  fs.rmSync(distPath, { recursive: true, force: true });
}

// Clean cache to avoid symbolic link issues
const cachePath = path.join(require('os').homedir(), 'AppData', 'Local', 'electron-builder');
if (fs.existsSync(cachePath)) {
  try {
    fs.rmSync(cachePath, { recursive: true, force: true });
    console.log('🗑️  Cleared electron-builder cache');
  } catch (error) {
    console.log('⚠️  Could not clear cache:', error.message);
  }
}

try {
  // Build standalone Next.js
  console.log('📦 Building Next.js standalone...');
  execSync('npm run build:standalone', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
  
  // Create portable configuration
  const portableConfig = {
    appId: 'com.fribouz.panoramaviewer',
    productName: 'PrimeZone Panorama Viewer',
    directories: {
      output: 'dist'
    },
    files: [
      'desktop/**/*',
      '.next/standalone/**/*',
      '.next/static/**/*',
      'public/**/*',
      'package.json'
    ],
    win: {
      target: 'portable'
    },
    portable: {
      artifactName: '${productName}-${version}-portable.exe'
    }
  };
  
  const configPath = path.join(__dirname, '..', 'config', 'electron-builder-portable.json');
  fs.writeFileSync(configPath, JSON.stringify(portableConfig, null, 2));
  
  // Build with portable target
  console.log('🚀 Building portable Electron app...');
  execSync(`npx electron-builder --win portable --config ${configPath}`, { 
    stdio: 'inherit', 
    cwd: path.join(__dirname, '..') 
  });
  
  console.log('✅ Portable build completed successfully!');
  console.log('📁 Output location:', path.join(__dirname, '..', 'dist'));
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  
  // Fallback to directory build
  console.log('🔄 Trying directory build as fallback...');
  try {
    execSync(`npx electron-builder --win dir --config ${path.join(__dirname, '..', 'config', 'electron-builder-minimal.json')}`, { 
      stdio: 'inherit', 
      cwd: path.join(__dirname, '..') 
    });
    console.log('✅ Directory build completed successfully!');
  } catch (fallbackError) {
    console.error('❌ Directory build also failed:', fallbackError.message);
    process.exit(1);
  }
}