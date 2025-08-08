const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Determine platform-specific directory structure
function getPlatformDirectories() {
  const platform = process.platform;
  const distDir = path.join(__dirname, "..", "dist");

  let unpackedDir, appPath;

  if (platform === "win32") {
    unpackedDir = "win-unpacked";
    appPath = path.join(distDir, unpackedDir, "resources", "app");
  } else if (platform === "darwin") {
    // macOS app structure: dist/mac/AppName.app/Contents/Resources/app
    const macDirPath = path.join(distDir, "mac");
    if (fs.existsSync(macDirPath)) {
      const macDir = fs
        .readdirSync(macDirPath)
        .find((dir) => dir.endsWith(".app"));
      if (macDir) {
        unpackedDir = path.join("mac", macDir);
        appPath = path.join(
          distDir,
          unpackedDir,
          "Contents",
          "Resources",
          "app"
        );
      } else {
        // Fallback for different macOS build structures
        unpackedDir = "mac-unpacked";
        appPath = path.join(distDir, unpackedDir, "resources", "app");
      }
    } else {
      // Default macOS structure if mac directory doesn't exist yet
      unpackedDir = "mac-unpacked";
      appPath = path.join(distDir, unpackedDir, "resources", "app");
    }
  } else if (platform === "linux") {
    unpackedDir = "linux-unpacked";
    appPath = path.join(distDir, unpackedDir, "resources", "app");
  } else {
    throw new Error(`Unsupported platform: ${platform}`);
  }

  return {
    standalonePath: path.join(appPath, ".next", "standalone"),
    appPath: appPath,
  };
}

const { standalonePath: packagedStandalonePath, appPath: packagedAppPath } =
  getPlatformDirectories();

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
      "✓ Dependencies installed successfully in packaged application"
    );
  } catch (error) {
    console.error(
      "✗ Failed to install dependencies in packaged app:",
      error.message
    );
    process.exit(1);
  }
} else if (fs.existsSync(path.join(packagedAppPath, "app.asar"))) {
  // For ASAR-packed builds, dependencies are already included
  console.log(
    "✓ Application is ASAR-packed, dependencies are already included"
  );
} else {
  console.log(
    "✗ Packaged application directory not found at:",
    packagedAppPath
  );
  process.exit(1);
}
