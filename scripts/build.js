#!/usr/bin/env node

/**
 * Unified build script that replaces scattered patch scripts
 * Integrates all fixes directly into the build process
 */

const BuildManager = require("../config/build.config.js");
const { execSync } = require("child_process");
const path = require("path");

class UnifiedBuildScript {
  constructor() {
    this.buildManager = new BuildManager();
    this.buildType = process.argv[2] || "web";
  }

  async run() {
    try {
      console.log(`🚀 Starting unified build process for: ${this.buildType}`);
      console.log("=".repeat(50));

      switch (this.buildType) {
        case "web":
          await this.buildWeb();
          break;
        case "electron":
          await this.buildElectron();
          break;
        case "electron-installer":
          await this.buildElectronInstaller();
          break;
        case "clean":
          await this.clean();
          break;
        default:
          console.log(
            "Usage: node scripts/build.js [web|electron|electron-installer|clean]"
          );
          process.exit(1);
      }

      console.log("=".repeat(50));
      console.log("🎉 Build process completed successfully!");
    } catch (error) {
      console.error("❌ Build process failed:", error.message);
      process.exit(1);
    }
  }

  /**
   * Build web application
   */
  async buildWeb() {
    console.log("🌐 Building web application...");

    // Pre-build setup
    await this.buildManager.preBuild();

    // Run Next.js build with integrated fixes
    console.log("⚡ Running Next.js build...");
    execSync(
      'npx cross-env NODE_OPTIONS="--max-old-space-size=4096" next build',
      {
        stdio: "inherit",
        cwd: process.cwd(),
      }
    );

    // Post-build setup
    await this.buildManager.postBuild();

    console.log("✅ Web build completed");
  }

  /**
   * Build Electron application (unpacked)
   */
  async buildElectron() {
    console.log("⚡ Building Electron application...");

    // Set production environment for obfuscation
    process.env.NODE_ENV = 'production';

    // First build the web app
    await this.buildWeb();

    // Apply Electron-specific fixes and obfuscation BEFORE packaging
    await this.buildManager.electronBuild();

    // Then build Electron with integrated fixes
    console.log("📦 Building Electron package...");
    execSync(
      "npx electron-builder --config=config/electron-builder.json --dir",
      {
        stdio: "inherit",
        cwd: process.cwd(),
      }
    );

    console.log("✅ Electron build completed");
  }

  /**
   * Build Electron installer
   */
  async buildElectronInstaller() {
    console.log("📦 Building Electron installer...");

    // Set production environment for obfuscation
    process.env.NODE_ENV = 'production';

    // First build the web app
    await this.buildWeb();

    // Apply Electron-specific fixes and obfuscation BEFORE packaging
    await this.buildManager.electronBuild();

    // Then build Electron installer with integrated fixes
    console.log("🏗️ Creating Electron installer...");
    execSync("npx electron-builder --config=config/electron-builder.json", {
      stdio: "inherit",
      cwd: process.cwd(),
    });

    console.log("✅ Electron installer build completed");
  }

  /**
   * Clean build artifacts
   */
  async clean() {
    console.log("🧹 Cleaning build artifacts...");
    await this.buildManager.cleanup();
    console.log("✅ Cleanup completed");
  }
}

// Run the build script if called directly
if (require.main === module) {
  const buildScript = new UnifiedBuildScript();
  buildScript.run();
}

module.exports = UnifiedBuildScript;