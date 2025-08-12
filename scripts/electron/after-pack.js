#!/usr/bin/env node

/**
 * After-pack script for Electron Builder
 * Ensures packaged apps are portable by installing node_modules in standalone directory
 * Supports both ASAR and non-ASAR builds across Windows, macOS, and Linux
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
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
 * Main after-pack function
 */
async function afterPack(context) {
  try {
    console.log('🚀 Starting after-pack process...');
    console.log(`Platform: ${context.electronPlatformName}`);
    console.log(`Output directory: ${context.appOutDir}`);
    
    // Detect possible app paths based on platform
    const appPaths = platformDetector.getAppPaths(context);
    console.log(`Checking app paths: ${appPaths.join(', ')}`);
    
    // Find standalone directories
    const standaloneDirs = standaloneDetector.findStandaloneDir(appPaths);
    
    if (standaloneDirs.length === 0) {
      console.warn('⚠️ No standalone directory found. Skipping dependency installation.');
      return;
    }
    
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
    
    console.log('\n🎉 After-pack process completed successfully!');
    
  } catch (error) {
    console.error('❌ After-pack process failed:', error.message);
    console.error(error.stack);
    throw error;
  }
}

module.exports = afterPack;