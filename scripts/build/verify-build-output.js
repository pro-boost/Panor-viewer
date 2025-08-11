const fs = require("fs");
const path = require("path");
const os = require("os");

/**
 * Script to verify what files will be included in the Electron build
 * Run this after building to see the contents of your distribution
 */

function listDirectoryContents(
  dirPath,
  prefix = "",
  maxDepth = 3,
  currentDepth = 0,
) {
  if (currentDepth >= maxDepth) return;

  try {
    const items = fs.readdirSync(dirPath);

    items.forEach((item) => {
      const itemPath = path.join(dirPath, item);
      const stats = fs.statSync(itemPath);

      console.log(`${prefix}${stats.isDirectory() ? "📁" : "📄"} ${item}`);

      if (stats.isDirectory() && currentDepth < maxDepth - 1) {
        listDirectoryContents(
          itemPath,
          prefix + "  ",
          maxDepth,
          currentDepth + 1,
        );
      }
    });
  } catch (error) {
    console.error(`Error reading directory ${dirPath}:`, error.message);
  }
}

function checkBuildContents() {
  const distPath = path.join(__dirname, "..", "..", "dist");

  if (!fs.existsSync(distPath)) {
    console.log('❌ No dist folder found. Run "npm run desktop:build" first.');
    return;
  }

  console.log("🔍 Checking Electron build contents...");
  console.log("=".repeat(50));

  // Get platform-specific build directories
  const platformDirs = getPlatformBuildDirs(distPath);

  if (platformDirs.length === 0) {
    console.log("❌ No platform-specific build directories found.");
    return;
  }

  platformDirs.forEach(({ platform, dirPath, appResourcesPath }) => {
    console.log(`\n📦 ${platform} Build Contents:`);
    listDirectoryContents(dirPath);

    if (fs.existsSync(appResourcesPath)) {
      console.log(`\n🎯 ${platform} App Resources (what clients will see):`);
      listDirectoryContents(appResourcesPath, "", 4);
    }
  });

  console.log("\n" + "=".repeat(50));
  console.log("✅ Build verification complete!");
  console.log("\n💡 Tips:");
  console.log("- Only essential runtime files should be visible");
  console.log("- No source code, scripts, or development files");
  console.log("- The app folder should contain minimal files");
}

// Get platform-specific build directories
function getPlatformBuildDirs(distPath) {
  const platformDirs = [];

  // Check for different platform build directories
  const possibleDirs = [
    {
      name: "win-unpacked",
      platform: "Windows",
      resourcesPath: ["resources", "app"],
    },
    {
      name: "mac",
      platform: "macOS",
      resourcesPath: [
        "Advanced Panorama Viewer.app",
        "Contents",
        "Resources",
        "app",
      ],
    },
    {
      name: "mac-arm64",
      platform: "macOS (ARM64)",
      resourcesPath: [
        "Advanced Panorama Viewer.app",
        "Contents",
        "Resources",
        "app",
      ],
    },
    {
      name: "mac-x64",
      platform: "macOS (x64)",
      resourcesPath: [
        "Advanced Panorama Viewer.app",
        "Contents",
        "Resources",
        "app",
      ],
    },
    {
      name: "linux-unpacked",
      platform: "Linux",
      resourcesPath: ["resources", "app"],
    },
  ];

  possibleDirs.forEach(({ name, platform, resourcesPath }) => {
    const dirPath = path.join(distPath, name);

    if (fs.existsSync(dirPath)) {
      let appResourcesPath;

      if (platform.includes("macOS")) {
        // For macOS, find the .app directory first
        const appFiles = fs
          .readdirSync(dirPath)
          .filter((f) => f.endsWith(".app"));
        if (appFiles.length > 0) {
          appResourcesPath = path.join(
            dirPath,
            appFiles[0],
            "Contents",
            "Resources",
            "app",
          );
        }
      } else {
        appResourcesPath = path.join(dirPath, ...resourcesPath);
      }

      platformDirs.push({
        platform,
        dirPath,
        appResourcesPath:
          appResourcesPath || path.join(dirPath, "resources", "app"),
      });
    }
  });

  return platformDirs;
}

if (require.main === module) {
  checkBuildContents();
}

module.exports = { checkBuildContents };
