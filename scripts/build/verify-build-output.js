const fs = require("fs");
const path = require("path");

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

  // Check win-unpacked folder
  const winUnpackedPath = path.join(distPath, "win-unpacked");
  if (fs.existsSync(winUnpackedPath)) {
    console.log("\n📦 Windows Unpacked Build Contents:");
    listDirectoryContents(winUnpackedPath);
  }

  // Check app resources specifically
  const appResourcesPath = path.join(winUnpackedPath, "resources", "app");
  if (fs.existsSync(appResourcesPath)) {
    console.log("\n🎯 App Resources (what clients will see):");
    listDirectoryContents(appResourcesPath, "", 4);
  }

  console.log("\n" + "=".repeat(50));
  console.log("✅ Build verification complete!");
  console.log("\n💡 Tips:");
  console.log("- Only essential runtime files should be visible");
  console.log("- No source code, scripts, or development files");
  console.log("- The app folder should contain minimal files");
}

if (require.main === module) {
  checkBuildContents();
}

module.exports = { checkBuildContents };
