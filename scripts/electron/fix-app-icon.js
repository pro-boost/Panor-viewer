const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

/**
 * Cross-platform post-build script to fix app icons
 * This script runs after electron-builder and handles platform-specific icon fixes
 */

// Get platform-specific paths and configurations
function getPlatformConfig() {
  const platform = os.platform();
  const distPath = path.join(__dirname, "..", "..", "dist");

  let config = {
    platform,
    executablePath: null,
    iconPath: null,
    needsIconFix: false,
  };

  switch (platform) {
    case "win32":
      config.executablePath = path.join(
        distPath,
        "win-unpacked",
        "Advanced Panorama Viewer.exe",
      );
      config.iconPath = path.join(
        __dirname,
        "..",
        "..",
        "public",
        "icons",
        "panorama-viewer-icon-multi.ico",
      );
      config.needsIconFix = true;
      break;

    case "darwin":
      // macOS apps typically don't need post-build icon fixes as electron-builder handles it
      const macDirs = ["mac-arm64", "mac-x64", "mac"];
      for (const dir of macDirs) {
        const macPath = path.join(distPath, dir);
        if (fs.existsSync(macPath)) {
          const appFiles = fs
            .readdirSync(macPath)
            .filter((f) => f.endsWith(".app"));
          if (appFiles.length > 0) {
            config.executablePath = path.join(macPath, appFiles[0]);
            break;
          }
        }
      }
      config.needsIconFix = false;
      break;

    case "linux":
      config.executablePath = path.join(
        distPath,
        "linux-unpacked",
        "Advanced Panorama Viewer",
      );
      config.needsIconFix = false;
      break;

    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }

  return config;
}

const platformConfig = getPlatformConfig();

console.log(`🔧 Starting automatic icon fix for ${platformConfig.platform}...`);

// Check if this platform needs icon fixing
if (!platformConfig.needsIconFix) {
  console.log(
    `✅ Platform ${platformConfig.platform} doesn't require post-build icon fixes.`,
  );
  console.log("Icon is handled automatically by electron-builder.");
  process.exit(0);
}

// Check if executable exists
if (
  !platformConfig.executablePath ||
  !fs.existsSync(platformConfig.executablePath)
) {
  console.log("❌ Executable not found:", platformConfig.executablePath);
  process.exit(1);
}

// Check if icon exists (only for platforms that need it)
if (platformConfig.iconPath && !fs.existsSync(platformConfig.iconPath)) {
  console.log("❌ Icon file not found:", platformConfig.iconPath);
  process.exit(1);
}

// Windows-specific icon fixing using rcedit
if (platformConfig.platform === "win32") {
  // Find rcedit executable in electron-builder cache
  let rceditPath = null;
  const electronBuilderCache = path.join(
    process.env.LOCALAPPDATA || process.env.APPDATA,
    "electron-builder",
    "Cache",
    "winCodeSign",
  );

  try {
    if (fs.existsSync(electronBuilderCache)) {
      const winCodeSignDirs = fs
        .readdirSync(electronBuilderCache)
        .filter((dir) =>
          fs.statSync(path.join(electronBuilderCache, dir)).isDirectory(),
        )
        .sort()
        .reverse(); // Get the most recent version first

      for (const dir of winCodeSignDirs) {
        const rceditX64 = path.join(
          electronBuilderCache,
          dir,
          "rcedit-x64.exe",
        );
        const rceditIa32 = path.join(
          electronBuilderCache,
          dir,
          "rcedit-ia32.exe",
        );

        if (fs.existsSync(rceditX64)) {
          rceditPath = rceditX64;
          break;
        } else if (fs.existsSync(rceditIa32)) {
          rceditPath = rceditIa32;
          break;
        }
      }
    }
  } catch (error) {
    console.log("⚠️  Error searching for rcedit:", error.message);
  }

  // Fallback: try other possible locations
  if (!rceditPath) {
    const fallbackPaths = [
      path.join(
        __dirname,
        "..",
        "..",
        "node_modules",
        "app-builder-bin",
        "win",
        "x64",
        "rcedit.exe",
      ),
      path.join(
        __dirname,
        "..",
        "..",
        "node_modules",
        "electron-builder",
        "node_modules",
        "app-builder-bin",
        "win",
        "x64",
        "rcedit.exe",
      ),
    ];

    for (const fallbackPath of fallbackPaths) {
      if (fs.existsSync(fallbackPath)) {
        rceditPath = fallbackPath;
        break;
      }
    }
  }

  if (!rceditPath) {
    console.log(
      "❌ rcedit executable not found in electron-builder cache or fallback locations",
    );
    console.log("Searched in electron-builder cache:", electronBuilderCache);
    process.exit(1);
  }

  console.log("📁 Found rcedit at:", rceditPath);
  console.log("🎯 Target executable:", platformConfig.executablePath);
  console.log("🖼️  Icon file:", platformConfig.iconPath);

  // Get file size before
  const sizeBefore = fs.statSync(platformConfig.executablePath).size;
  console.log("📊 File size before:", sizeBefore, "bytes");

  try {
    // Run rcedit to embed the icon with additional parameters
    const command = `"${rceditPath}" "${platformConfig.executablePath}" --set-icon "${platformConfig.iconPath}" --set-version-string "FileDescription" "Advanced Panorama Viewer" --set-version-string "ProductName" "Advanced Panorama Viewer"`;
    console.log("🔨 Running command:", command);

    execSync(command, { stdio: "inherit" });

    // Get file size after
    const sizeAfter = fs.statSync(platformConfig.executablePath).size;
    console.log("📊 File size after:", sizeAfter, "bytes");
    console.log("📈 Size increase:", sizeAfter - sizeBefore, "bytes");

    if (sizeAfter > sizeBefore) {
      console.log("✅ Icon successfully embedded!");

      // Clear Windows icon cache
      try {
        console.log("🧹 Clearing Windows icon cache...");
        execSync("ie4uinit.exe -ClearIconCache", { stdio: "inherit" });
        console.log("✅ Icon cache cleared!");
      } catch (cacheError) {
        console.log(
          "⚠️  Warning: Could not clear icon cache:",
          cacheError.message,
        );
      }
    } else {
      console.log(
        "⚠️  Warning: File size did not increase, icon may not have been embedded",
      );
    }
  } catch (error) {
    console.log("❌ Error running rcedit:", error.message);
    process.exit(1);
  }
} else {
  console.log(
    `✅ Platform ${platformConfig.platform} icon fix completed (no action needed).`,
  );
}

console.log("🎉 Cross-platform icon fix completed successfully!");
