#!/usr/bin/env node

/**
 * Comprehensive After-pack script for Electron Builder
 * Combines dependency installation and icon fixing functionality
 * Ensures packaged apps are portable and have proper icons across platforms
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const standaloneObfuscator = require('./obfuscate-standalone');
const os = require('os');

/**
 * Cross-platform path utilities
 */
const pathUtils = {
  normalize: (filePath) => path.normalize(filePath).replace(/\\/g, '/'),
  join: (...paths) => path.join(...paths),
  exists: (filePath) => fs.existsSync(filePath),
  isDirectory: (filePath) => {
    try {
      return fs.statSync(filePath).isDirectory();
    } catch {
      return false;
    }
  }
};

/**
 * Platform-specific app structure detection
 */
const platformDetector = {
  getAppPaths: (context) => {
    const { appOutDir, electronPlatformName } = context;
    const paths = [];
    
    switch (electronPlatformName) {
      case 'win32':
        // Windows: app.exe in root or resources/app
        paths.push(
          pathUtils.join(appOutDir, 'resources', 'app'),
          pathUtils.join(appOutDir, 'resources', 'app.asar.unpacked'),
          appOutDir
        );
        break;
        
      case 'darwin':
        // macOS: .app/Contents/Resources/app
        const appName = context.packager.appInfo.productFilename;
        paths.push(
          pathUtils.join(appOutDir, `${appName}.app`, 'Contents', 'Resources', 'app'),
          pathUtils.join(appOutDir, `${appName}.app`, 'Contents', 'Resources', 'app.asar.unpacked'),
          pathUtils.join(appOutDir, `${appName}.app`, 'Contents', 'Resources')
        );
        break;
        
      case 'linux':
        // Linux: resources/app
        paths.push(
          pathUtils.join(appOutDir, 'resources', 'app'),
          pathUtils.join(appOutDir, 'resources', 'app.asar.unpacked'),
          appOutDir
        );
        break;
        
      default:
        console.warn(`Unknown platform: ${electronPlatformName}`);
        paths.push(appOutDir);
    }
    
    return paths;
  }
};

/**
 * Standalone directory detector
 */
const standaloneDetector = {
  findStandaloneDir: (basePaths) => {
    const possiblePaths = [];
    
    for (const basePath of basePaths) {
      if (!pathUtils.exists(basePath)) continue;
      
      // Check for .next/standalone in various locations
      const candidates = [
        pathUtils.join(basePath, '.next', 'standalone'),
        pathUtils.join(basePath, 'standalone'),
        pathUtils.join(basePath, 'resources', 'standalone'),
        pathUtils.join(basePath, 'app', '.next', 'standalone'),
        pathUtils.join(basePath, 'app', 'standalone')
      ];
      
      for (const candidate of candidates) {
        if (pathUtils.exists(candidate) && pathUtils.isDirectory(candidate)) {
          // Verify it's a valid standalone directory by checking for server.js
          const serverJs = pathUtils.join(candidate, 'server.js');
          if (pathUtils.exists(serverJs)) {
            possiblePaths.push(candidate);
          }
        }
      }
    }
    
    return possiblePaths;
  }
};

/**
 * Package.json generator for minimal production dependencies
 */
const packageGenerator = {
  createMinimalPackageJson: (standaloneDir, originalPackageJson) => {
    try {
      const originalPkg = JSON.parse(fs.readFileSync(originalPackageJson, 'utf8'));
      
      // Extract only production dependencies needed for standalone
      const productionDeps = {
        // Core Next.js runtime dependencies
        'next': originalPkg.dependencies?.['next'] || 'latest',
        'react': originalPkg.dependencies?.['react'] || 'latest',
        'react-dom': originalPkg.dependencies?.['react-dom'] || 'latest',
        
        // Server dependencies
        'compression': originalPkg.dependencies?.['compression'],
        'express': originalPkg.dependencies?.['express'],
        'helmet': originalPkg.dependencies?.['helmet'],
        
        // Utility dependencies
        'fs-extra': originalPkg.dependencies?.['fs-extra'],
        'mime-types': originalPkg.dependencies?.['mime-types'],
        'uuid': originalPkg.dependencies?.['uuid'],
        
        // Other production dependencies
        '@supabase/supabase-js': originalPkg.dependencies?.['@supabase/supabase-js'],
        'axios': originalPkg.dependencies?.['axios'],
        'formidable': originalPkg.dependencies?.['formidable'],
        'archiver': originalPkg.dependencies?.['archiver'],
        'adm-zip': originalPkg.dependencies?.['adm-zip']
      };
      
      // Filter out undefined dependencies
      const filteredDeps = Object.fromEntries(
        Object.entries(productionDeps).filter(([_, version]) => version !== undefined)
      );
      
      const minimalPackage = {
        name: originalPkg.name + '-standalone',
        version: originalPkg.version || '1.0.0',
        private: true,
        main: 'server.js',
        scripts: {
          start: 'node server.js'
        },
        dependencies: filteredDeps,
        engines: {
          node: '>=18.0.0'
        }
      };
      
      const packagePath = pathUtils.join(standaloneDir, 'package.json');
      fs.writeFileSync(packagePath, JSON.stringify(minimalPackage, null, 2));
      
      console.log(`✅ Created minimal package.json at: ${packagePath}`);
      return packagePath;
      
    } catch (error) {
      console.error('❌ Failed to create minimal package.json:', error.message);
      throw error;
    }
  }
};

/**
 * Dependency installer
 */
const dependencyInstaller = {
  installDependencies: (standaloneDir) => {
    try {
      console.log(`📦 Installing dependencies in: ${standaloneDir}`);
      
      // Determine npm command based on platform
      const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
      
      // Install with production-only flag and no optional dependencies
      const installCmd = `${npmCmd} install --production --no-optional --no-audit --no-fund --prefer-offline`;
      
      execSync(installCmd, {
        cwd: standaloneDir,
        stdio: 'inherit',
        env: {
          ...process.env,
          NODE_ENV: 'production'
        }
      });
      
      console.log('✅ Dependencies installed successfully');
      
      // Verify node_modules was created
      const nodeModulesPath = pathUtils.join(standaloneDir, 'node_modules');
      if (pathUtils.exists(nodeModulesPath)) {
        console.log(`✅ node_modules verified at: ${nodeModulesPath}`);
        return true;
      } else {
        console.warn('⚠️ node_modules directory not found after installation');
        return false;
      }
      
    } catch (error) {
      console.error('❌ Failed to install dependencies:', error.message);
      throw error;
    }
  }
};

/**
 * Icon fixing functionality
 */
const iconFixer = {
  /**
   * Get platform-specific icon configuration
   */
  getPlatformIconConfig: (context) => {
    const { appOutDir, electronPlatformName } = context;
    const projectRoot = process.cwd();
    
    let config = {
      platform: electronPlatformName,
      executablePath: null,
      iconPath: null,
      needsIconFix: false,
    };
    
    switch (electronPlatformName) {
      case 'win32':
        config.executablePath = pathUtils.join(
          appOutDir,
          'Advanced Panorama Viewer.exe',
        );
        config.iconPath = pathUtils.join(
          projectRoot,
          'public',
          'icons',
          'panorama-viewer-icon-multi.ico',
        );
        config.needsIconFix = true;
        break;
        
      case 'darwin':
        // macOS apps typically don't need post-build icon fixes as electron-builder handles it
        const macDirs = ['mac-arm64', 'mac-x64', 'mac'];
        for (const dir of macDirs) {
          const macPath = pathUtils.join(appOutDir, '..', dir);
          if (pathUtils.exists(macPath)) {
            const appFiles = fs
              .readdirSync(macPath)
              .filter((f) => f.endsWith('.app'));
            if (appFiles.length > 0) {
              config.executablePath = pathUtils.join(macPath, appFiles[0]);
              break;
            }
          }
        }
        config.needsIconFix = false;
        break;
        
      case 'linux':
        config.executablePath = pathUtils.join(
          appOutDir,
          'Advanced Panorama Viewer',
        );
        config.needsIconFix = false;
        break;
        
      default:
        console.warn(`Unknown platform: ${electronPlatformName}`);
        config.needsIconFix = false;
    }
    
    return config;
  },

  /**
   * Fix Windows icon using rcedit
   */
  fixWindowsIcon: async (config) => {
    const projectRoot = process.cwd();
    
    // Find rcedit executable in electron-builder cache
    let rceditPath = null;
    const electronBuilderCache = pathUtils.join(
      process.env.LOCALAPPDATA || process.env.APPDATA,
      'electron-builder',
      'Cache',
      'winCodeSign',
    );
    
    try {
      if (pathUtils.exists(electronBuilderCache)) {
        const winCodeSignDirs = fs
          .readdirSync(electronBuilderCache)
          .filter((dir) =>
            fs.statSync(pathUtils.join(electronBuilderCache, dir)).isDirectory(),
          )
          .sort()
          .reverse(); // Get the most recent version first
          
        for (const dir of winCodeSignDirs) {
          const rceditX64 = pathUtils.join(
            electronBuilderCache,
            dir,
            'rcedit-x64.exe',
          );
          const rceditIa32 = pathUtils.join(
            electronBuilderCache,
            dir,
            'rcedit-ia32.exe',
          );
          
          if (pathUtils.exists(rceditX64)) {
            rceditPath = rceditX64;
            break;
          } else if (pathUtils.exists(rceditIa32)) {
            rceditPath = rceditIa32;
            break;
          }
        }
      }
    } catch (error) {
      console.log('⚠️  Error searching for rcedit:', error.message);
    }
    
    // Fallback: try other possible locations
    if (!rceditPath) {
      const fallbackPaths = [
        pathUtils.join(
          projectRoot,
          'node_modules',
          'app-builder-bin',
          'win',
          'x64',
          'rcedit.exe',
        ),
        pathUtils.join(
          projectRoot,
          'node_modules',
          'electron-builder',
          'node_modules',
          'app-builder-bin',
          'win',
          'x64',
          'rcedit.exe',
        ),
      ];
      
      for (const fallbackPath of fallbackPaths) {
        if (pathUtils.exists(fallbackPath)) {
          rceditPath = fallbackPath;
          break;
        }
      }
    }
    
    if (!rceditPath) {
      console.log(
        '❌ rcedit executable not found in electron-builder cache or fallback locations',
      );
      console.log('Searched in electron-builder cache:', electronBuilderCache);
      throw new Error('rcedit executable not found');
    }
    
    console.log('📁 Found rcedit at:', rceditPath);
    console.log('🎯 Target executable:', config.executablePath);
    console.log('🖼️  Icon file:', config.iconPath);
    
    // Get file size before
    const sizeBefore = fs.statSync(config.executablePath).size;
    console.log('📊 File size before:', sizeBefore, 'bytes');
    
    try {
      // Run rcedit to embed the icon with additional parameters
      const args = [
        config.executablePath,
        '--set-icon',
        config.iconPath,
        '--set-version-string',
        'FileDescription',
        'Advanced Panorama Viewer',
        '--set-version-string',
        'ProductName',
        'Advanced Panorama Viewer'
      ];
      
      console.log('🔨 Running rcedit with args:', [rceditPath, ...args]);
      
      execSync(`"${rceditPath}" ${args.map(arg => `"${arg}"`).join(' ')}`, { 
        stdio: 'inherit',
        shell: true 
      });
      
      // Get file size after
      const sizeAfter = fs.statSync(config.executablePath).size;
      console.log('📊 File size after:', sizeAfter, 'bytes');
      console.log('📈 Size increase:', sizeAfter - sizeBefore, 'bytes');
      
      if (sizeAfter > sizeBefore) {
        console.log('✅ Icon successfully embedded!');
        
        // Clear Windows icon cache
        try {
          console.log('🧹 Clearing Windows icon cache...');
          execSync('ie4uinit.exe -ClearIconCache', { stdio: 'inherit' });
          console.log('✅ Icon cache cleared!');
        } catch (cacheError) {
          console.log(
            '⚠️  Warning: Could not clear icon cache:',
            cacheError.message,
          );
        }
      } else {
        console.log(
          '⚠️  Warning: File size did not increase, icon may not have been embedded',
        );
      }
    } catch (error) {
      console.log('❌ Error running rcedit:', error.message);
      throw error;
    }
  },

  /**
   * Fix app icon for the current platform
   */
  fixAppIcon: async (context) => {
    console.log('🎨 Starting comprehensive app icon fix...');
    
    // Get platform-specific paths and configurations
    const config = iconFixer.getPlatformIconConfig(context);
    
    console.log(`🔧 Starting automatic icon fix for ${config.platform}...`);
    
    // Check if this platform needs icon fixing
    if (!config.needsIconFix) {
      console.log(`✅ Platform ${config.platform} doesn't require post-build icon fixes.`);
      console.log('Icon is handled automatically by electron-builder.');
      return;
    }
    
    // Check if executable exists
    if (!config.executablePath || !pathUtils.exists(config.executablePath)) {
      console.log('❌ Executable not found:', config.executablePath);
      throw new Error(`Executable not found: ${config.executablePath}`);
    }
    
    // Check if icon exists (only for platforms that need it)
    if (config.iconPath && !pathUtils.exists(config.iconPath)) {
      console.log('❌ Icon file not found:', config.iconPath);
      throw new Error(`Icon file not found: ${config.iconPath}`);
    }
    
    // Windows-specific icon fixing using rcedit
    if (config.platform === 'win32') {
      await iconFixer.fixWindowsIcon(config);
    } else {
      console.log(`✅ Platform ${config.platform} icon fix completed (no action needed).`);
    }
    
    console.log('🎉 Cross-platform icon fix completed successfully!');
  }
};

/**
 * Main after-pack function
 */
async function afterPack(context) {
  try {
    console.log('🚀 Starting comprehensive after-pack process...');
    console.log(`Platform: ${context.electronPlatformName}`);
    console.log(`Output directory: ${context.appOutDir}`);
    
    // Step 1: Handle dependency installation
    console.log('\n📦 Step 1: Installing standalone dependencies...');
    
    // Detect possible app paths based on platform
    const appPaths = platformDetector.getAppPaths(context);
    console.log(`Checking app paths: ${appPaths.join(', ')}`);
    
    // Find standalone directories
    const standaloneDirs = standaloneDetector.findStandaloneDir(appPaths);
    
    if (standaloneDirs.length === 0) {
      console.warn('⚠️ No standalone directory found. Skipping dependency installation.');
    } else {
      console.log(`Found standalone directories: ${standaloneDirs.join(', ')}`);
      
      // Process each standalone directory
      for (const standaloneDir of standaloneDirs) {
        console.log(`\n📁 Processing: ${standaloneDir}`);
        
        // Check if node_modules already exists
        const existingNodeModules = pathUtils.join(standaloneDir, 'node_modules');
        if (pathUtils.exists(existingNodeModules)) {
          console.log('✅ node_modules already exists, skipping installation');
          continue;
        }
        
        // Find original package.json
        const originalPackageJson = pathUtils.join(process.cwd(), 'package.json');
        if (!pathUtils.exists(originalPackageJson)) {
          console.error('❌ Original package.json not found');
          continue;
        }
        
        // Generate minimal package.json
        packageGenerator.createMinimalPackageJson(standaloneDir, originalPackageJson);
        
        // Install dependencies
        dependencyInstaller.installDependencies(standaloneDir);
      }
    }
    
    // Step 2: Handle standalone obfuscation
    console.log('\n🔒 Step 2: Obfuscating standalone resources...');
    if (standaloneDirs.length > 0) {
      await standaloneObfuscator.obfuscateStandaloneResources(standaloneDirs);
    } else {
      console.log('ℹ️  No standalone directories found for obfuscation');
    }
    
    // Step 3: Handle icon fixing
    console.log('\n🎨 Step 3: Fixing application icons...');
    await iconFixer.fixAppIcon(context);
    
    console.log('\n🎉 Comprehensive after-pack process completed successfully!');
    
  } catch (error) {
    console.error('❌ After-pack process failed:', error.message);
    console.error(error.stack);
    throw error;
  }
}

module.exports = afterPack;