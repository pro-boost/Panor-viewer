#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

console.log('=== Panorama Viewer Diagnostic Tool ===\n');

// Check basic environment
console.log('1. Environment Check:');
console.log(`   OS: ${os.platform()} ${os.arch()}`);
console.log(`   Node.js: ${process.version}`);
console.log(`   Working Directory: ${process.cwd()}`);
console.log(`   Electron: ${process.versions.electron || 'Not detected'}`);
console.log();

// Check required directories and files
console.log('2. File Structure Check:');
const requiredPaths = [
  '.next',
  'node_modules',
  'public',
  'package.json',
  'electron-server.js',
];

requiredPaths.forEach(pathName => {
  const exists = fs.existsSync(path.join(process.cwd(), pathName));
  console.log(`   ${pathName}: ${exists ? '✓ Found' : '✗ Missing'}`);
});
console.log();

// Check Next.js build
console.log('3. Next.js Build Check:');
const nextBuildPath = path.join(process.cwd(), '.next');
if (fs.existsSync(nextBuildPath)) {
  const buildFiles = ['BUILD_ID', 'package.json', 'server', 'static'];

  buildFiles.forEach(file => {
    const exists = fs.existsSync(path.join(nextBuildPath, file));
    console.log(`   .next/${file}: ${exists ? '✓ Found' : '✗ Missing'}`);
  });
} else {
  console.log('   ✗ .next directory not found - run "npm run build"');
}
console.log();

// Check Python dependencies
console.log('4. Python Dependencies Check:');
const pythonCmd = os.platform() === 'win32' ? 'python' : 'python3';
try {
  const pythonVersion = execSync(`${pythonCmd} --version`, {
    encoding: 'utf8',
  }).trim();
  console.log(`   Python: ✓ ${pythonVersion}`);

  try {
    const numpyCheck = execSync(
      `${pythonCmd} -c "import numpy; print(f'numpy {numpy.__version__}')"`,
      { encoding: 'utf8' }
    ).trim();
    console.log(`   NumPy: ✓ ${numpyCheck}`);
  } catch (error) {
    console.log('   NumPy: ✗ Not installed or not working');
  }
} catch (error) {
  console.log('   Python: ✗ Not found or not working');
}
console.log();

// Check port availability
console.log('5. Port Availability Check:');
try {
  const net = require('net');
  const server = net.createServer();

  server.listen(3000, () => {
    console.log('   Port 3000: ✓ Available');
    server.close();
  });

  server.on('error', err => {
    if (err.code === 'EADDRINUSE') {
      console.log('   Port 3000: ✗ In use (this might cause issues)');
    } else {
      console.log(`   Port 3000: ✗ Error - ${err.message}`);
    }
  });
} catch (error) {
  console.log(`   Port 3000: ✗ Check failed - ${error.message}`);
}

// Check for common issues
setTimeout(() => {
  console.log();
  console.log('6. Common Issues Check:');

  // Check for corrupted config
  const configPath = path.join(process.cwd(), 'public', 'config.json');
  if (fs.existsSync(configPath)) {
    try {
      const stats = fs.statSync(configPath);
      if (stats.size < 100) {
        console.log(
          '   config.json: ⚠ File exists but is very small (possibly corrupted)'
        );
      } else {
        console.log('   config.json: ✓ Exists and has reasonable size');
      }
    } catch (error) {
      console.log('   config.json: ✗ Cannot read file');
    }
  } else {
    console.log(
      '   config.json: ℹ Not found (will be generated on first upload)'
    );
  }

  // Check cache directory
  const cacheDir = path.join(process.cwd(), '.next', 'cache');
  if (fs.existsSync(cacheDir)) {
    try {
      const files = fs.readdirSync(cacheDir);
      console.log(`   .next/cache: ℹ Contains ${files.length} files`);
    } catch (error) {
      console.log('   .next/cache: ⚠ Cannot read cache directory');
    }
  } else {
    console.log('   .next/cache: ✓ No cache directory (clean state)');
  }

  console.log();
  console.log('=== Recommendations ===');
  console.log();
  console.log("If you're experiencing blank pages:");
  console.log('1. Run: npm run clean:reset');
  console.log('2. Run: npm run build');
  console.log('3. Repackage the application');
  console.log(
    '4. If the issue persists, check the Electron console for detailed error messages'
  );
  console.log();
  console.log('For upload issues:');
  console.log('1. Ensure Python and numpy are installed');
  console.log('2. Check that port 3000 is not in use by other applications');
  console.log('3. Verify that your CSV file follows the correct format');
  console.log();
  console.log('=== End of Diagnostic ===');
}, 1000);
