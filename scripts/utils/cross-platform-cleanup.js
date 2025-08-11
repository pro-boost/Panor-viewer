const fs = require("fs");
const path = require("path");

/**
 * Cross-platform cleanup utility that works on Windows, macOS, and Linux
 * Removes directories and files safely across all platforms
 */

async function removeDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    return;
  }

  try {
    // Use fs.rmSync for efficient recursive deletion (Node.js 14.14.0+)
    if (fs.rmSync) {
      fs.rmSync(dirPath, { recursive: true, force: true });
      console.log(`✓ Removed: ${path.basename(dirPath)}`);
    } else {
      // Fallback for older Node.js versions
      const stats = await fs.promises.stat(dirPath);

      if (stats.isDirectory()) {
        await fs.promises.rmdir(dirPath, { recursive: true });
        console.log(`✓ Removed directory: ${path.basename(dirPath)}`);
      } else {
        await fs.promises.unlink(dirPath);
        console.log(`✓ Removed file: ${path.basename(dirPath)}`);
      }
    }
  } catch (error) {
    console.warn(
      `⚠️  Warning: Could not remove ${path.basename(dirPath)}: ${error.message}`,
    );
  }
}

async function cleanupBuildArtifacts() {
  const projectRoot = process.cwd();

  // Directories and files to clean up
  const itemsToClean = [
    "dist",
    "dist-new",
    ".next",
    "out",
    "temp",
    "scripts/temp",
  ];

  console.log("🧹 Starting cross-platform cleanup...");

  for (const item of itemsToClean) {
    const itemPath = path.join(projectRoot, item);
    await removeDirectory(itemPath);
  }

  console.log("✓ Build artifacts cleanup completed");
}

// Run cleanup if called directly
if (require.main === module) {
  cleanupBuildArtifacts()
    .then(() => {
      console.log("✓ Cross-platform cleanup completed successfully");
    })
    .catch((error) => {
      console.error("❌ Cleanup failed:", error.message);
      process.exit(1);
    });
}

module.exports = { cleanupBuildArtifacts, removeDirectory };
