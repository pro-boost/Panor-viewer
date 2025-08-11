const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Determine platform-specific directory structure
function getPlatformDirectories() {
  const platform = process.platform;
  const distDir = path.join(__dirname, "..", "dist");

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
      } else {
        // Fallback for different macOS build structures
        unpackedDir = "mac-unpacked";
        appPath = path.join(distDir, unpackedDir, "resources", "app");
        resourcesPath = path.join(distDir, unpackedDir, "resources");
      }
    } else {
      // Default macOS structure if no mac directory exists yet
      unpackedDir = "mac-unpacked";
      appPath = path.join(distDir, unpackedDir, "resources", "app");
      resourcesPath = path.join(distDir, unpackedDir, "resources");
    }
  } else if (platform === "linux") {
    unpackedDir = "linux-unpacked";
    appPath = path.join(distDir, unpackedDir, "resources", "app");
    resourcesPath = path.join(distDir, unpackedDir, "resources");
  } else {
    throw new Error(`Unsupported platform: ${platform}`);
  }

  return {
    standalonePath: path.join(appPath, ".next", "standalone"),
    appPath: appPath,
    resourcesPath: resourcesPath,
  };
}

const {
  standalonePath: packagedStandalonePath,
  appPath: packagedAppPath,
  resourcesPath: packagedResourcesPath,
} = getPlatformDirectories();

console.log("Installing dependencies for packaged application...");

// Check if standalone directory exists (for unpacked builds)
if (fs.existsSync(packagedStandalonePath)) {
  try {
    console.log("Installing production dependencies in packaged app...");
    execSync("npm install --production --ignore-scripts", {
      stdio: "inherit",
      cwd: packagedStandalonePath,
    });

    console.log(
      "✓ Dependencies installed successfully in packaged application",
    );
  } catch (error) {
    console.error(
      "✗ Failed to install dependencies in packaged app:",
      error.message,
    );
    process.exit(1);
  }
} else if (
  fs.existsSync(path.join(packagedResourcesPath || packagedAppPath, "app.asar"))
) {
  // For ASAR-packed builds, dependencies are already included
  console.log(
    "✓ Application is ASAR-packed, dependencies are already included",
  );
} else {
  console.log(
    "✗ Packaged application directory not found at:",
    packagedAppPath,
  );
  process.exit(1);
}
