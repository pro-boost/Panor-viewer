const packager = require('electron-packager');
const path = require('path');
const fs = require('fs');

async function buildElectronApp() {
  console.log('🚀 Building Electron app with electron-packager (no symbolic link issues)...');
  
  // Clean dist directory
  const distPath = path.join(__dirname, '..', 'dist');
  if (fs.existsSync(distPath)) {
    fs.rmSync(distPath, { recursive: true, force: true });
  }
  
  try {
    // First, run the standalone build to ensure it's up to date
    console.log('📦 Building standalone version...');
    const { execSync } = require('child_process');
    execSync('npm run build:standalone', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
    
    // Verify standalone build is complete
    console.log('📦 Verifying standalone build...');
    const standalonePath = path.join(__dirname, '..', '.next', 'standalone');
    if (!fs.existsSync(standalonePath)) {
      throw new Error('Standalone build failed to generate output.');
    }
    
    const appPaths = await packager({
      dir: path.join(__dirname, '..'),
      out: path.join(__dirname, '..', 'dist'),
      name: 'PrimeZone Panorama Viewer',
      platform: 'win32',
      arch: 'x64',
      electronVersion: '27.1.3',
      overwrite: true,
      asar: false, // Disable ASAR to avoid issues
      prune: true,
      ignore: [
        /\.git/,
        /node_modules\/.*\/\.cache/,
        /\.next\/cache/,
        /\.next\/server/,
        /\.next\/static\/webpack/,
        /src/,
        /scripts\/(?!node|server-production\.js)/,
        /tests/,
        /\.env/,
        /\.gitignore/,
        /README\.md/,
        /\.prettier.*/,
        /dist/,
        /\.next\/standalone\/src/
      ],
      extraResource: [
        path.join(__dirname, '..', '.next', 'standalone'),
        path.join(__dirname, '..', '.next', 'static'),
        path.join(__dirname, '..', 'public'),
        path.join(__dirname, '..', 'package.json'),
        path.join(__dirname, '..', 'scripts', 'server-production.js'),
        path.join(__dirname, '..', 'scripts', 'node')
      ]
    });
    
    console.log('✅ Electron app built successfully!');
    console.log('📁 Output location:', appPaths[0]);
    
    // Create a simple run script
    const runScript = `@echo off
cd /d "%~dp0"
start "" "PrimeZone Panorama Viewer.exe"
`;
    
    fs.writeFileSync(path.join(appPaths[0], 'run.bat'), runScript);
    
    console.log('🎯 Build completed without symbolic link issues!');
    console.log('💡 To run the app, navigate to:', appPaths[0]);
    console.log('   and double-click "PrimeZone Panorama Viewer.exe" or run "run.bat"');
    
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
}

// Run the build
buildElectronApp();