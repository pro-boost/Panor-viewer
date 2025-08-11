const fs = require("fs-extra");
const path = require("path");

async function copyPublicAssets() {
  try {
    const publicDir = path.join(process.cwd(), "public");
    const standaloneDir = path.join(process.cwd(), ".next", "standalone");
    const targetPublicDir = path.join(standaloneDir, "public");

    // Ensure the standalone directory exists
    if (!fs.existsSync(standaloneDir)) {
      console.error(
        "Standalone build directory not found. Please run build:standalone first.",
      );
      process.exit(1);
    }

    // Copy public directory to standalone build
    if (fs.existsSync(publicDir)) {
      console.log("Copying public assets to standalone build...");
      await fs.copy(publicDir, targetPublicDir);
      console.log("Public assets copied successfully.");
    } else {
      console.log("No public directory found, skipping copy.");
    }

    // Also copy static assets from .next/static
    const staticDir = path.join(process.cwd(), ".next", "static");
    const targetStaticDir = path.join(standaloneDir, ".next", "static");

    if (fs.existsSync(staticDir)) {
      console.log("Copying static assets to standalone build...");
      await fs.copy(staticDir, targetStaticDir);
      console.log("Static assets copied successfully.");
    }

    // Scripts directory is intentionally excluded from the build for security reasons
    // (contains credential-related files that should not be distributed)
  } catch (error) {
    console.error("Error copying assets:", error);
    process.exit(1);
  }
}

copyPublicAssets();
