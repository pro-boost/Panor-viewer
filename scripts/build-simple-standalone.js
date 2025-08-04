const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Starting simple standalone build process...');

function copyDirSync(src, dest) {
  if (!fs.existsSync(src)) return;
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

try {
  // Step 1: Build standalone Next.js
  console.log('🔨 Building standalone Next.js application...');
  execSync('npm run build:standalone', { stdio: 'inherit' });

  // Step 2: Create dist directory
  console.log('📁 Creating distribution directory...');
  const distDir = 'dist';
  const electronAppDir = path.join(distDir, 'panorama-viewer-standalone');
  
  if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true, force: true });
  }
  fs.mkdirSync(electronAppDir, { recursive: true });

  // Step 3: Copy standalone build
  console.log('📦 Copying standalone build...');
  const standaloneSource = '.next/standalone';
  const appTarget = path.join(electronAppDir, 'app');
  
  if (fs.existsSync(standaloneSource)) {
    copyDirSync(standaloneSource, appTarget);
    console.log('✅ Standalone build copied');
  }

  // Step 4: Copy desktop files
  console.log('🖥️  Copying desktop files...');
  const desktopSource = 'desktop';
  const desktopTarget = path.join(electronAppDir, 'desktop');
  
  if (fs.existsSync(desktopSource)) {
    copyDirSync(desktopSource, desktopTarget);
    console.log('✅ Desktop files copied');
  }

  // Step 5: Copy package.json
  console.log('📋 Copying package.json...');
  if (fs.existsSync('package.json')) {
    fs.copyFileSync('package.json', path.join(electronAppDir, 'package.json'));
    console.log('✅ Package.json copied');
  }

  // Step 6: Install production dependencies
  console.log('📦 Installing production dependencies...');
  const originalDir = process.cwd();
  process.chdir(appTarget);
  
  try {
    execSync('npm install --production --no-optional', { stdio: 'inherit' });
    console.log('✅ Dependencies installed');
  } catch (error) {
    console.warn('⚠️  Some dependencies may have failed to install:', error.message);
  }
  
  process.chdir(originalDir);

  // Step 7: Create startup script
  console.log('📝 Creating startup scripts...');
  
  const batScript = `@echo off
echo Starting PrimeZone Advanced Panorama Viewer...
cd /d "%~dp0"
node desktop\\main.js
pause`;

  const shScript = `#!/bin/bash
echo "Starting PrimeZone Advanced Panorama Viewer..."
cd "$(dirname "$0")"
node desktop/main.js`;

  fs.writeFileSync(path.join(electronAppDir, 'start.bat'), batScript);
  fs.writeFileSync(path.join(electronAppDir, 'start.sh'), shScript);

  // Make shell script executable on Unix systems
  try {
    execSync(`chmod +x "${path.join(electronAppDir, 'start.sh')}"`, { stdio: 'ignore' });
  } catch (e) {
    // Ignore on Windows
  }

  console.log('✅ Build completed successfully!');
  console.log('📁 Standalone application created at:', electronAppDir);
  console.log('🚀 To run the application:');
  console.log('   Windows: double-click start.bat');
  console.log('   Linux/Mac: run ./start.sh');

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}