const fs = require("fs");
const path = require("path");

/**
 * Script to clean up accumulated temporary files in the tmp directory
 * Handles all subdirectories including node-download, uploads, and other temp files
 */
async function cleanupTempDirectory() {
  const tmpDir = path.join(process.cwd(), "tmp");

  if (!fs.existsSync(tmpDir)) {
    console.log("No tmp directory found. Nothing to clean up.");
    return;
  }

  try {
    const files = await fs.promises.readdir(tmpDir);

    if (files.length === 0) {
      console.log("tmp directory is already empty.");
      return;
    }

    for (const file of files) {
      const filePath = path.join(tmpDir, file);
      const stats = await fs.promises.stat(filePath);

      if (stats.isDirectory()) {
        await fs.promises.rmdir(filePath, { recursive: true });
        console.log(`Removed directory: ${file}`);
      } else {
        await fs.promises.unlink(filePath);
        console.log(`Removed file: ${file}`);
      }
    }

    console.log(
      `✓ Cleaned up ${files.length} items from tmp directory (including node-download, uploads, etc.)`,
    );
  } catch (error) {
    console.error("Error cleaning up tmp directory:", error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  cleanupTempDirectory();
}

module.exports = { cleanupTempDirectory };
