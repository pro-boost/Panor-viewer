#!/usr/bin/env node

/**
 * Reproducible Electron Build Script
 * Generates 32-bit and 64-bit compatible builds with unpacked folders and setup files
 * 
 * Usage:
 *   node scripts/build-reproducible-electron.js
 *   node scripts/build-reproducible-electron.js --clean
 *   node scripts/build-reproducible-electron.js --arch=x64
 *   node scripts/build-reproducible-electron.js --arch=ia32
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  outputDir: 'dist',
  appName: 'PrimeZone Advanced Panorama Viewer',
  appId: 'com.fribouz.panoramaviewer',
  platforms: {
    win32: { arch: ['x64', 'ia32'] },
    darwin: { arch: ['x64'] },
    linux: { arch: ['x64'] }
  }
};

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  clean: args.includes('--clean'),
  arch: args.find(arg => arg.startsWith('--arch='))?.split('=')[1] || 'all',
  skipBuild: args.includes('--skip-build'),
  verbose: args.includes('--verbose')
};

// Utility functions
const log = (message, type = 'info') => {
  const timestamp = new Date().toISOString();
  const colors = {
    info: '\x1b[36m',
    success: '\x1b[32m',
    warning: '\x1b[33m',
    error: '\x1b[31m',
    reset: '\x1b[0m'
  };
  
  const color = colors[type] || colors.info;
  console.log(`${color}[${timestamp}] ${message}${colors.reset}`);
};

const execCommand = (command, options = {}) => {
  try {
    log(`Executing: ${command}`, 'info');
    const result = execSync(command, {
      stdio: options.verbose ? 'inherit' : 'pipe',
      cwd: process.cwd(),
      env: { ...process.env, NODE_ENV: 'production' },
      ...options
    });
    return result?.toString() || '';
  } catch (error) {
    log(`Command failed: ${command}`, 'error');
    log(error.message, 'error');
    throw error;
  }
};

const cleanBuild = () => {
  log('Cleaning previous builds...', 'info');
  const dirsToClean = [
    CONFIG.outputDir,
    '.next',
    'out',
    'build'
  ];
  
  dirsToClean.forEach(dir => {
    if (fs.existsSync(dir)) {
      log(`Removing ${dir}...`, 'warning');
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
};

const validateEnvironment = () => {
  log('Validating build environment...', 'info');
  
  // Check Node.js version
  const nodeVersion = process.version;
  log(`Node.js version: ${nodeVersion}`, 'info');
  
  // Check npm version
  const npmVersion = execCommand('npm --version', { verbose: false }).trim();
  log(`npm version: ${npmVersion}`, 'info');
  
  // Check if package.json exists
  if (!fs.existsSync('package.json')) {
    throw new Error('package.json not found');
  }
  
  // Check if electron-builder is installed
  try {
    execCommand('npx electron-builder --version', { verbose: false });
    log('electron-builder is available', 'success');
  } catch (error) {
    log('electron-builder not found, installing...', 'warning');
    execCommand('npm install -D electron-builder');
  }
};

const buildNextJS = () => {
  log('Building Next.js application...', 'info');
  execCommand('npm run build');
  log('Next.js build completed', 'success');
};

const buildElectron = (arch = 'all') => {
  log(`Building Electron application for architecture: ${arch}`, 'info');
  
  const platform = process.platform;
  const isWindows = platform === 'win32';
  
  if (!isWindows) {
    log('Building for Windows only (current platform is not Windows)', 'warning');
  }
  
  let buildCommand = 'npx electron-builder';
  
  // Set platform and architecture
  if (isWindows) {
    buildCommand += ' --win';
  }
  
  if (arch !== 'all') {
    buildCommand += ` --${arch}`;
  }
  
  buildCommand += ' --publish=never';
  
  if (options.verbose) {
    buildCommand += ' --verbose';
  }
  
  log(`Executing: ${buildCommand}`, 'info');
  execCommand(buildCommand);
  
  log('Electron build completed', 'success');
};

const verifyBuildOutputs = () => {
  log('Verifying build outputs...', 'info');
  
  const expectedFiles = [
    'PrimeZone Advanced Panorama Viewer Setup 1.0.0-ia32.exe',
    'PrimeZone Advanced Panorama Viewer Setup 1.0.0-x64.exe',
    'win-ia32-unpacked/PrimeZone Advanced Panorama Viewer.exe',
    'win-x64-unpacked/PrimeZone Advanced Panorama Viewer.exe'
  ];
  
  const missingFiles = [];
  
  expectedFiles.forEach(file => {
    const filePath = path.join(CONFIG.outputDir, file);
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      log(`✓ ${file} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`, 'success');
    } else {
      log(`✗ ${file} - Missing`, 'error');
      missingFiles.push(file);
    }
  });
  
  if (missingFiles.length > 0) {
    log(`Missing ${missingFiles.length} expected files`, 'error');
    return false;
  }
  
  log('All expected build outputs verified', 'success');
  return true;
};

const generateBuildReport = () => {
  log('Generating build report...', 'info');
  
  const report = {
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
    npmVersion: execCommand('npm --version', { verbose: false }).trim(),
    buildOutputs: [],
    fileSizes: {}
  };
  
  const distDir = CONFIG.outputDir;
  if (fs.existsSync(distDir)) {
    const files = fs.readdirSync(distDir, { recursive: true });
    files.forEach(file => {
      const filePath = path.join(distDir, file);
      if (fs.statSync(filePath).isFile()) {
        const size = fs.statSync(filePath).size;
        report.fileSizes[file] = size;
        report.buildOutputs.push(file);
      }
    });
  }
  
  const reportPath = path.join(CONFIG.outputDir, 'build-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  log(`Build report saved to ${reportPath}`, 'success');
  
  return report;
};

const main = async () => {
  try {
    log('Starting reproducible Electron build process...', 'info');
    
    // Clean if requested
    if (options.clean) {
      cleanBuild();
    }
    
    // Validate environment
    validateEnvironment();
    
    // Build Next.js (unless skipped)
    if (!options.skipBuild) {
      buildNextJS();
    }
    
    // Build Electron
    buildElectron(options.arch);
    
    // Verify outputs
    const verified = verifyBuildOutputs();
    
    // Generate report
    const report = generateBuildReport();
    
    if (verified) {
      log('Build process completed successfully!', 'success');
      log(`Build outputs available in: ${path.resolve(CONFIG.outputDir)}`, 'success');
    } else {
      log('Build completed with missing outputs', 'warning');
      process.exit(1);
    }
    
  } catch (error) {
    log(`Build process failed: ${error.message}`, 'error');
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGINT', () => {
  log('Build process interrupted by user', 'warning');
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  log(`Uncaught exception: ${error.message}`, 'error');
  process.exit(1);
});

// Run main function
if (require.main === module) {
  main();
}

module.exports = {
  buildElectron: main,
  CONFIG,
  execCommand,
  validateEnvironment,
  verifyBuildOutputs
};