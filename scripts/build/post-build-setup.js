const fs = require("fs-extra");
const path = require("path");

/**
 * Consolidated post-build setup script that:
 * 1. Copies public and static assets to standalone build
 * 2. Fixes standalone server.js for ASAR compatibility
 */

async function copyPublicAssets() {
  try {
    const publicDir = path.join(process.cwd(), "public");
    const standaloneDir = path.join(process.cwd(), ".next", "standalone");
    const targetPublicDir = path.join(standaloneDir, "public");

    // Ensure the standalone directory exists
    if (!fs.existsSync(standaloneDir)) {
      console.error(
        "Standalone build directory not found. Please run build first.",
      );
      process.exit(1);
    }

    // Copy public directory to standalone build
    if (fs.existsSync(publicDir)) {
      console.log("📁 Copying public assets to standalone build...");
      await fs.copy(publicDir, targetPublicDir);
      console.log("✅ Public assets copied successfully.");
    } else {
      console.log("⚠️  No public directory found, skipping copy.");
    }

    // Also copy static assets from .next/static
    const staticDir = path.join(process.cwd(), ".next", "static");
    const targetStaticDir = path.join(standaloneDir, ".next", "static");

    if (fs.existsSync(staticDir)) {
      console.log("📁 Copying static assets to standalone build...");
      await fs.copy(staticDir, targetStaticDir);
      console.log("✅ Static assets copied successfully.");
    }

    // Scripts directory is intentionally excluded from the build for security reasons
    // (contains credential-related files that should not be distributed)
  } catch (error) {
    console.error("❌ Error copying assets:", error);
    process.exit(1);
  }
}

function fixStandaloneAsar() {
  // Path to the standalone server.js file
  const serverPath = path.join(
    process.cwd(),
    ".next",
    "standalone",
    "server.js",
  );

  console.log("🔧 Fixing standalone server.js for ASAR compatibility...");

  if (fs.existsSync(serverPath)) {
    let content = fs.readFileSync(serverPath, "utf8");

    // Replace the problematic chdir line
    const oldChdir = "process.chdir(__dirname)";
    const newChdir = `// Check if we're in ASAR mode and skip chdir if so
const isAsar = __dirname.includes('.asar')
if (!isAsar) {
  process.chdir(__dirname)
} else {
  console.log('> Skipping chdir in ASAR mode')
}`;

    if (content.includes(oldChdir)) {
      content = content.replace(oldChdir, newChdir);
      fs.writeFileSync(serverPath, content, "utf8");
      console.log("✅ Fixed standalone server.js for ASAR compatibility");
    } else {
      console.log("⚠️  No chdir found to replace in standalone server.js");
    }
  } else {
    console.log("❌ Standalone server.js not found");
  }
}

async function runPostBuildSetup() {
  console.log("🚀 Starting post-build setup...");

  await copyPublicAssets();
  fixStandaloneAsar();

  console.log("✅ Post-build setup completed successfully!");
}

if (require.main === module) {
  runPostBuildSetup();
}

module.exports = {
  copyPublicAssets,
  fixStandaloneAsar,
  runPostBuildSetup,
};
