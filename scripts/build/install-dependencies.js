const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

/**
 * Unified dependency installer for both standalone and packaged builds
 * Usage: node install-dependencies.js [--type=standalone|packaged]
 */

// Determine platform-specific directory structure for packaged apps
function getPlatformDirectories() {
  const platform = process.platform;
  const distDir = path.join(process.cwd(), "dist");

  let unpackedDir, appPath, resourcesPath;

  if (platform === "win32") {
    unpackedDir = "win-unpacked";
    appPath = path.join(distDir, unpackedDir, "resources", "app");
    resourcesPath = path.join(distDir, unpackedDir, "resources");
  } else if (platform === "darwin") {
    // macOS app structure: check for architecture-specific directories first
    const macArm64DirPath = path.join(distDir, "mac-arm64");
    const macX64DirPath = path.join(distDir, "mac-x64");
    const macDirPath = path.join(distDir, "mac");

    let macDirToUse = null;
    if (fs.existsSync(macArm64DirPath)) {
      macDirToUse = macArm64DirPath;
      unpackedDir = "mac-arm64";
    } else if (fs.existsSync(macX64DirPath)) {
      macDirToUse = macX64DirPath;
      unpackedDir = "mac-x64";
    } else if (fs.existsSync(macDirPath)) {
      macDirToUse = macDirPath;
      unpackedDir = "mac";
    }

    if (macDirToUse) {
      const macDir = fs
        .readdirSync(macDirToUse)
        .find((dir) => dir.endsWith(".app"));
      if (macDir) {
        unpackedDir = path.join(unpackedDir, macDir);
        appPath = path.join(
          distDir,
          unpackedDir,
          "Contents",
          "Resources",
          "app",
        );
        resourcesPath = path.join(
          distDir,
          unpackedDir,
          "Contents",
          "Resources",
        );
      }
    }
  } else if (platform === "linux") {
    unpackedDir = "linux-unpacked";
    appPath = path.join(distDir, unpackedDir, "resources", "app");
    resourcesPath = path.join(distDir, unpackedDir, "resources");
  }

  return {
    standalonePath: path.join(appPath, ".next", "standalone"),
    appPath,
    resourcesPath,
    unpackedDir,
  };
}

function installStandaloneDependencies() {
  const standalonePath = path.join(process.cwd(), ".next", "standalone");

  console.log("📦 Installing dependencies for standalone build...");

  if (fs.existsSync(standalonePath)) {
    try {
      console.log("📥 Installing production dependencies...");
      execSync("npm install --production --ignore-scripts", {
        stdio: "inherit",
        cwd: standalonePath,
      });

      console.log("✅ Dependencies installed successfully in standalone build");
    } catch (error) {
      console.error("❌ Failed to install dependencies:", error.message);
      process.exit(1);
    }
  } else {
    console.log("❌ Standalone directory not found");
    process.exit(1);
  }
}

function installPackagedDependencies() {
  const {
    standalonePath: packagedStandalonePath,
    appPath: packagedAppPath,
    resourcesPath: packagedResourcesPath,
  } = getPlatformDirectories();

  console.log("📦 Installing dependencies for packaged application...");

  if (fs.existsSync(packagedStandalonePath)) {
    try {
      console.log("📥 Installing production dependencies in packaged app...");
      execSync("npm install --production --ignore-scripts", {
        stdio: "inherit",
        cwd: packagedStandalonePath,
      });
      console.log("✅ Dependencies installed successfully in packaged app");
    } catch (error) {
      console.error(
        "❌ Failed to install dependencies in packaged app:",
        error.message,
      );
      process.exit(1);
    }
  } else if (
    fs.existsSync(
      path.join(packagedResourcesPath || packagedAppPath, "app.asar"),
    )
  ) {
    console.log(
      "✅ Application is ASAR-packed, dependencies are already included",
    );
  } else {
    console.log(
      "❌ Packaged application directory not found at:",
      packagedAppPath,
    );
    process.exit(1);
  }
}

function main() {
  const args = process.argv.slice(2);
  const typeArg = args.find((arg) => arg.startsWith("--type="));
  const installType = typeArg ? typeArg.split("=")[1] : "standalone";

  console.log(`🚀 Starting dependency installation (${installType} mode)...`);

  switch (installType) {
    case "standalone":
      installStandaloneDependencies();
      break;
    case "packaged":
      installPackagedDependencies();
      break;
    default:
      console.error(
        "❌ Invalid install type. Use --type=standalone or --type=packaged",
      );
      process.exit(1);
  }

  console.log("✅ Dependency installation completed!");
}

if (require.main === module) {
  main();
}

module.exports = {
  installStandaloneDependencies,
  installPackagedDependencies,
  getPlatformDirectories,
};
