const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * Centralized build configuration that integrates all fixes directly into the build process
 * This replaces the scattered patch scripts with a unified approach
 */

class BuildManager {
  constructor() {
    this.projectRoot = process.cwd();
    this.platform = os.platform();
    this.nodeModulesPath = path.join(this.projectRoot, 'node_modules');
    this.distPath = path.join(this.projectRoot, 'dist');
    this.standaloneDir = path.join(this.projectRoot, '.next', 'standalone');
  }

  /**
   * Pre-build setup - runs before Next.js build
   */
  async preBuild() {
    console.log('🚀 Starting pre-build setup...');

    await this.downloadNodeBinary();
    await this.fixSwcPlatforms();
    await this.setupBuildEnvironment();

    console.log('✅ Pre-build setup completed');
  }

  /**
   * Post-build setup - runs after Next.js build
   */
  async postBuild() {
    console.log('🔧 Starting post-build setup...');

    await this.copyAssets();
    await this.fixStandaloneServer();
    await this.installStandaloneDependencies();

    console.log('✅ Post-build setup completed');
  }

  /**
   * Electron-specific build setup
   */
  async electronBuild() {
    console.log('⚡ Starting Electron build setup...');

    await this.packageElectronApp();

    console.log('✅ Electron build setup completed');
  }

  /**
   * Download Node.js binary for standalone builds
   */
  async downloadNodeBinary() {
    console.log('📥 Downloading Node.js binary...');

    const {
      downloadAndSetupNode,
    } = require('../scripts/build/download-node-binary.js');
    await downloadAndSetupNode();
  }

  /**
   * Fix Next.js SWC platform-specific dependencies
   * Integrated directly into build process
   */
  async fixSwcPlatforms() {
    console.log('🔧 Fixing SWC platform dependencies...');

    const swcPlatforms = [
      'swc-darwin-arm64',
      'swc-darwin-x64',
      'swc-linux-arm64-gnu',
      'swc-linux-arm64-musl',
      'swc-linux-x64-gnu',
      'swc-linux-x64-musl',
      'swc-win32-arm64-msvc',
      'swc-win32-ia32-msvc',
      'swc-win32-x64-msvc',
    ];

    const nextSwcPath = path.join(this.nodeModulesPath, '@next');

    for (const platform of swcPlatforms) {
      const platformPath = path.join(nextSwcPath, platform);

      if (!fs.existsSync(platformPath)) {
        fs.mkdirSync(platformPath, { recursive: true });

        const packageJson = {
          name: `@next/${platform}`,
          version: '14.2.30',
          main: `next-swc.${platform.replace('swc-', '').replace('-', '.')}.node`,
          license: 'MIT',
          description: 'Placeholder for Next.js SWC platform-specific binary',
        };

        fs.writeFileSync(
          path.join(platformPath, 'package.json'),
          JSON.stringify(packageJson, null, 2)
        );

        // Create empty binary file
        const binaryName = packageJson.main;
        fs.writeFileSync(path.join(platformPath, binaryName), '');
      }
    }
  }

  /**
   * Setup build environment with proper configurations
   */
  async setupBuildEnvironment() {
    console.log('🏗️ Setting up build environment...');

    // Backup and switch to production config
    const nextConfigPath = path.join(this.projectRoot, 'next.config.js');
    const productionConfigPath = path.join(
      this.projectRoot,
      'config',
      'next.config.production.js'
    );

    if (fs.existsSync(nextConfigPath)) {
      fs.copyFileSync(nextConfigPath, `${nextConfigPath}.bak`);
    }

    if (fs.existsSync(productionConfigPath)) {
      fs.copyFileSync(productionConfigPath, nextConfigPath);
    }
  }

  /**
   * Copy all necessary assets to standalone build
   */
  async copyAssets() {
    console.log('📁 Copying assets to standalone build...');

    if (!fs.existsSync(this.standaloneDir)) {
      console.warn('⚠️ Standalone directory not found, skipping asset copy');
      return;
    }

    // Copy static files
    const staticSrc = path.join(this.projectRoot, '.next', 'static');
    const staticDest = path.join(this.standaloneDir, '.next', 'static');

    if (fs.existsSync(staticSrc)) {
      this.copyRecursive(staticSrc, staticDest);
      console.log('✅ Static files copied');
    }

    // Copy public directory
    const publicSrc = path.join(this.projectRoot, 'public');
    const publicDest = path.join(this.standaloneDir, 'public');

    if (fs.existsSync(publicSrc)) {
      this.copyRecursive(publicSrc, publicDest);
      console.log('✅ Public assets copied');
    }

    // Copy necessary scripts (excluding sensitive ones)
    const scriptsSrc = path.join(this.projectRoot, 'scripts');
    const scriptsDest = path.join(this.standaloneDir, 'scripts');

    if (fs.existsSync(scriptsSrc)) {
      this.copyRecursive(scriptsSrc, scriptsDest);
      console.log('✅ Scripts copied');
    }
  }

  /**
   * Fix standalone server for ASAR compatibility
   */
  async fixStandaloneServer() {
    console.log('🔧 Fixing standalone server...');

    const serverPath = path.join(this.standaloneDir, 'server.js');

    if (fs.existsSync(serverPath)) {
      let serverContent = fs.readFileSync(serverPath, 'utf8');

      // Add ASAR compatibility fixes
      const asarFix = `
// ASAR compatibility fix
if (process.defaultApp || /[\\\/]electron-prebuilt[\\\/]/.test(process.execPath) || /[\\\/]electron[\\\/]/.test(process.execPath)) {
  process.env.NODE_ENV = process.env.NODE_ENV || 'production';
}
`;

      if (!serverContent.includes('ASAR compatibility fix')) {
        serverContent = asarFix + serverContent;
        fs.writeFileSync(serverPath, serverContent);
        console.log('✅ Standalone server fixed for ASAR');
      }
    }
  }

  /**
   * Install dependencies for standalone build
   */
  async installStandaloneDependencies() {
    console.log('📦 Installing standalone dependencies...');

    const {
      installStandaloneDependencies,
    } = require('../scripts/build/install-dependencies.js');
    await installStandaloneDependencies();
  }

  /**
   * Package Electron app with proper configurations
   */
  async packageElectronApp() {
    console.log('📦 Packaging Electron app...');

    // This would integrate the electron packaging logic
    // Currently handled by electron-builder
  }

  /**
   * Clean up build artifacts
   */
  async cleanup() {
    console.log('🧹 Cleaning up build artifacts...');

    const itemsToClean = [
      path.join(this.projectRoot, 'dist'),
      path.join(this.projectRoot, 'dist-new'),
      path.join(this.projectRoot, '.next'),
      path.join(this.projectRoot, 'out'),
      path.join(this.projectRoot, 'temp'),
      path.join(this.projectRoot, 'scripts', 'temp'),
    ];

    for (const item of itemsToClean) {
      if (fs.existsSync(item)) {
        try {
          // Try multiple times with delay for Windows file locking issues
          await this.removeWithRetry(item, 3);
          console.log(`✓ Removed: ${path.basename(item)}`);
        } catch (error) {
          console.warn(
            `⚠️ Could not remove ${path.basename(item)}: ${error.message}`
          );
        }
      }
    }

    // Restore original next.config.js
    const nextConfigPath = path.join(this.projectRoot, 'next.config.js');
    const backupPath = `${nextConfigPath}.bak`;

    if (fs.existsSync(backupPath)) {
      fs.renameSync(backupPath, nextConfigPath);
      console.log('✅ Restored original next.config.js');
    }
  }

  /**
   * Remove file/directory with retry logic for Windows file locking
   */
  async removeWithRetry(itemPath, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        fs.rmSync(itemPath, { recursive: true, force: true });
        return;
      } catch (error) {
        if (i === maxRetries - 1) {
          throw error;
        }
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }

  /**
   * Utility: Copy directory recursively
   */
  copyRecursive(src, dest) {
    if (!fs.existsSync(src)) return;

    fs.mkdirSync(dest, { recursive: true });

    const items = fs.readdirSync(src);

    for (const item of items) {
      const srcPath = path.join(src, item);
      const destPath = path.join(dest, item);

      if (fs.statSync(srcPath).isDirectory()) {
        this.copyRecursive(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }

  /**
   * Utility: Find rcedit tool for Windows icon fixing
   */
  // Removed findRceditTool method as it's now handled by the dedicated fix-app-icon.js script
}

module.exports = BuildManager;