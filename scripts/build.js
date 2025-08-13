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

    // Run security validation
    await this.validateSecurity();

    console.log("✅ Web build completed");
  }

  /**
   * Build Electron application (unpacked)
   */
  async buildElectron() {
    console.log("⚡ Building Electron application...");

    // First build the web app
    await this.buildWeb();

    // Then build Electron with integrated fixes
    console.log("📦 Building Electron package...");
    execSync(
      "npx electron-builder --config=config/electron-builder.json --dir",
      {
        stdio: "inherit",
        cwd: process.cwd(),
      }
    );

    // Apply Electron-specific fixes
    await this.buildManager.electronBuild();

    // Final security validation for packaged app
    await this.validatePackagedSecurity();

    console.log("✅ Electron build completed");
  }

  /**
   * Build Electron installer
   */
  async buildElectronInstaller() {
    console.log("📦 Building Electron installer...");

    // First build the web app
    await this.buildWeb();

    // Then build Electron installer with integrated fixes
    console.log("🏗️ Creating Electron installer...");
    execSync("npx electron-builder --config=config/electron-builder.json", {
      stdio: "inherit",
      cwd: process.cwd(),
    });

    // Apply Electron-specific fixes
    await this.buildManager.electronBuild();

    console.log("✅ Electron installer build completed");
  }

  /**
   * Validate security features
   */
  async validateSecurity() {
    console.log("🔐 Validating security features...");
    try {
      execSync("node test-security.js", {
        stdio: "inherit",
        cwd: process.cwd(),
      });
      console.log("✅ Security validation passed");
    } catch (error) {
      console.warn("⚠️ Security validation failed, but continuing build");
      console.warn("Run 'npm run test:security' for detailed results");
    }
  }

  /**
   * Validate packaged application security
   */
  async validatePackagedSecurity() {
    console.log("🛡️ Validating packaged application security...");
    
    // Check if ASAR archive exists
    const fs = require('fs');
    const asarPath = path.join(process.cwd(), 'dist/mac-arm64/Advanced Panorama Viewer.app/Contents/Resources/app.asar');
    
    if (fs.existsSync(asarPath)) {
      console.log("✅ ASAR archive created successfully");
      
      // Check ASAR size (should be reasonable but not too small)
      const stats = fs.statSync(asarPath);
      const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
      console.log(`📦 ASAR archive size: ${sizeMB} MB`);
      
      if (stats.size > 1024 * 1024) { // At least 1MB
        console.log("✅ ASAR archive size validation passed");
      } else {
        console.warn("⚠️ ASAR archive seems unusually small");
      }
    } else {
      console.warn("⚠️ ASAR archive not found at expected location");
    }
    
    // Check if integrity checker is included
    const integrityPath = path.join(process.cwd(), 'desktop/asar-integrity.js');
    if (fs.existsSync(integrityPath)) {
      console.log("✅ ASAR integrity checker included");
    } else {
      console.warn("⚠️ ASAR integrity checker not found");
    }
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