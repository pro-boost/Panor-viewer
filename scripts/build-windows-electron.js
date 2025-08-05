const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const log = (message) => {
  console.log(`[${new Date().toISOString()}] ${message}`);
};

const runCommand = (command, options = {}) => {
  log(`Executing: ${command}`);
  try {
    const result = execSync(command, { 
      stdio: 'inherit', 
      shell: true,
      cwd: path.join(__dirname, '..'),
      ...options 
    });
    return result;
  } catch (error) {
    log(`Command failed: ${error.message}`);
    throw error;
  }
};

async function buildElectron() {
  try {
    log('Starting Windows Electron build process...');
    
    // Set environment variables to handle Windows issues
    process.env.ELECTRON_BUILDER_DISABLE_CODE_SIGNING = 'true';
    process.env.NODE_ENV = 'production';
    
    // Clear cache to prevent symbolic link issues
    const cachePath = path.join(require('os').homedir(), 'AppData', 'Local', 'electron-builder', 'Cache');
    if (fs.existsSync(cachePath)) {
      log('Clearing electron-builder cache...');
      try {
        fs.rmSync(cachePath, { recursive: true, force: true });
        log('Cache cleared successfully');
      } catch (error) {
        log(`Warning: Could not clear cache: ${error.message}`);
      }
    }
    
    // Build Next.js application
    log('Building Next.js application...');
    runCommand('npm run build');
    
    // Build Electron application
    log('Building Electron application for Windows...');
    runCommand('npx electron-builder --win --x64 --publish=never --config config/electron-builder.json');
    
    log('✅ Windows Electron build completed successfully!');
    log('📁 Check the dist/ directory for your installer');
    
  } catch (error) {
    log('❌ Build failed');
    console.error('Build error:', error);
    
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Run PowerShell as Administrator');
    console.log('2. Enable Developer Mode in Windows Settings');
    console.log('3. Run: npm run build:windows');
    console.log('4. Check the documentation in docs/ELECTRON_BUILD_GUIDE.md');
    
    process.exit(1);
  }
}

if (require.main === module) {
  buildElectron();
}

module.exports = { buildElectron };