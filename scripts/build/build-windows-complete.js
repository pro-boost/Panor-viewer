const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting complete Windows build process...');

try {
  // Step 0: Clean up any existing dist directory
  console.log('🧹 Cleaning up existing dist directory...');
  if (fs.existsSync('dist')) {
    try {
      execSync(`Remove-Item -Path 'dist' -Recurse -Force -ErrorAction SilentlyContinue`, { 
        stdio: 'inherit',
        shell: 'powershell'
      });
      console.log('✅ Removed existing dist directory');
    } catch (cleanupError) {
      console.warn('⚠️ Could not fully clean dist directory, but continuing...');
      // Try to remove specific subdirectories that might be problematic
      try {
        execSync(`Get-ChildItem -Path 'dist' -Recurse | Remove-Item -Force -Recurse -ErrorAction SilentlyContinue`, { 
          stdio: 'inherit',
          shell: 'powershell'
        });
      } catch (subCleanupError) {
        console.warn('⚠️ Partial cleanup completed');
      }
    }
  }
  
  // Step 1: Build standalone application
  console.log('🔨 Building standalone application...');
  execSync('npm run build:standalone', { stdio: 'inherit' });
  
  // Step 1.5: Clean up standalone build (remove source files)
  console.log('🧹 Cleaning up standalone build...');
  const standaloneSrcPath = '.next\\standalone\\src';
  if (fs.existsSync(standaloneSrcPath)) {
    execSync(`Remove-Item -Path '${standaloneSrcPath}' -Recurse -Force`, { 
      stdio: 'inherit',
      shell: 'powershell'
    });
    console.log('✅ Removed source files from standalone build');
  }
  
  // Also remove other unnecessary directories
  const unnecessaryDirs = ['.next\\standalone\\config', '.next\\standalone\\docs', '.next\\standalone\\tests'];
  unnecessaryDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      execSync(`Remove-Item -Path '${dir}' -Recurse -Force`, { 
        stdio: 'inherit',
        shell: 'powershell'
      });
      console.log(`✅ Removed ${dir} from standalone build`);
    }
  });
  
  // Step 1.7: Create manual electron app structure
  console.log('📦 Creating electron app structure...');
  
  // Create dist directory structure
  const electronAppDir = 'dist\\electron-app';
  if (!fs.existsSync(electronAppDir)) {
    fs.mkdirSync(electronAppDir, { recursive: true });
  }
  
  // Copy standalone build to electron app
  const standaloneSource = '.next\\standalone';
  const electronAppTarget = `${electronAppDir}\\app`;
  
  if (fs.existsSync(standaloneSource)) {
    execSync(`robocopy "${standaloneSource}" "${electronAppTarget}" /E /R:3 /W:1 /NP /NDL /NC /NS /NJH /NJS`, { stdio: 'inherit' });
    console.log('✅ Standalone build copied to electron app');
  }
  
  // Copy desktop files
  const desktopSource = 'desktop';
  const desktopTarget = `${electronAppDir}\\desktop`;
  
  if (fs.existsSync(desktopSource)) {
    execSync(`robocopy "${desktopSource}" "${desktopTarget}" /E /R:3 /W:1 /NP /NDL /NC /NS /NJH /NJS`, { stdio: 'inherit' });
    console.log('✅ Desktop files copied to electron app');
  }
  
  // Copy package.json
  if (fs.existsSync('package.json')) {
    fs.copyFileSync('package.json', `${electronAppDir}\\package.json`);
    console.log('✅ Package.json copied to electron app');
  }
  
  // Step 2: Verify manually created application
  console.log('📁 Verifying electron application...');
  const appDir = `${electronAppDir}\\app`;
  const desktopDir = `${electronAppDir}\\desktop`;
  
  // Verify the manually created electron app structure
  if (!fs.existsSync(electronAppDir)) {
    throw new Error('Electron application directory not found.');
  }
  if (!fs.existsSync(appDir)) {
    throw new Error('Application files not found.');
  }
  if (!fs.existsSync(desktopDir)) {
    throw new Error('Desktop files not found.');
  }
  if (!fs.existsSync(`${electronAppDir}\\package.json`)) {
    throw new Error('Package.json not found.');
  }
  console.log('✅ Electron application structure verified');
  console.log('✅ All required files found');
  
  // Step 3: Install dependencies in the electron app
  console.log('📦 Installing dependencies in electron app...');
  
  const originalDir = process.cwd();
  process.chdir(appDir);
  
  try {
    execSync('npm install --production --no-optional', { stdio: 'inherit' });
    console.log('✅ Dependencies installed successfully in electron app');
  } catch (error) {
    console.warn('⚠️ Some dependencies may have failed to install:', error.message);
  }
  
  // Return to original directory
  process.chdir(originalDir);
  
  // Step 4: Create startup script
  console.log('📝 Creating startup script...');
  
  const startupScript = `@echo off
echo Starting PrimeZone Advanced Panorama Viewer...
cd /d "%~dp0"
node desktop\\main.js
pause`;
  
  fs.writeFileSync(`${electronAppDir}\\start.bat`, startupScript);
  console.log('✅ Startup script created');
  
  console.log('✅ Windows build completed successfully!');
  console.log('🎯 Application ready at: dist\\electron-app\\start.bat');
  console.log('📁 Full application directory: dist\\electron-app\\');
  console.log('🔧 To run the application, execute: dist\\electron-app\\start.bat');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}