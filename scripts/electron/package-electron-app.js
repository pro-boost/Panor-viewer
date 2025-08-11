const packager = require("electron-packager");
const path = require("path");
const fs = require("fs");
const os = require("os");

// Create platform-specific run scripts
function createPlatformRunScripts(outputPath, platform) {
  const appName = "Advanced Panorama Viewer";

  switch (platform) {
    case "win32":
      const batScript = `@echo off
cd /d "%~dp0"
start "" "${appName}.exe"
`;
      fs.writeFileSync(path.join(outputPath, "run.bat"), batScript);
      console.log("✅ Created Windows run script (run.bat)");
      break;

    case "darwin":
      const macScript = `#!/bin/bash
cd "$(dirname "$0")"
open "${appName}.app"
`;
      fs.writeFileSync(path.join(outputPath, "run.sh"), macScript);
      fs.chmodSync(path.join(outputPath, "run.sh"), 0o755);
      console.log("✅ Created macOS run script (run.sh)");
      break;

    case "linux":
      const linuxScript = `#!/bin/bash
cd "$(dirname "$0")"
./${appName}
`;
      fs.writeFileSync(path.join(outputPath, "run.sh"), linuxScript);
      fs.chmodSync(path.join(outputPath, "run.sh"), 0o755);
      console.log("✅ Created Linux run script (run.sh)");
      break;

    default:
      console.log(`⚠️  No run script created for platform: ${platform}`);
  }
}

async function buildElectronApp() {
  console.log(
    "🚀 Building Electron app with electron-packager (no symbolic link issues)...",
  );

  // Clean dist directory
  const distPath = path.join(__dirname, "..", "..", "dist");
  if (fs.existsSync(distPath)) {
    fs.rmSync(distPath, { recursive: true, force: true });
  }

  try {
    // Ensure standalone build is complete
    console.log("📦 Verifying standalone build...");
    const standalonePath = path.join(__dirname, "..", ".next", "standalone");
    if (!fs.existsSync(standalonePath)) {
      throw new Error(
        'Standalone build not found. Run "npm run build:standalone" first.',
      );
    }

    // Detect current platform and architecture
    const currentPlatform = os.platform();
    const currentArch = os.arch();

    // Map Node.js arch to Electron arch
    const electronArch =
      currentArch === "x64"
        ? "x64"
        : currentArch === "arm64"
          ? "arm64"
          : "ia32";

    console.log(
      `📋 Building for platform: ${currentPlatform}, architecture: ${electronArch}`,
    );

    const appPaths = await packager({
      dir: path.join(__dirname, "..", ".."),
      out: path.join(__dirname, "..", "..", "dist"),
      name: "Advanced Panorama Viewer",
      platform: currentPlatform,
      arch: electronArch,
      electronVersion: "27.1.3",
      overwrite: true,
      asar: false, // Disable ASAR to avoid issues
      prune: true,
      ignore: [
        /\.git/,
        /node_modules\/.*\/\.cache/,
        /\.next\/cache/,
        /\.next\/server/,
        /\.next\/static\/webpack/,
        /src/,
        /scripts/,
        /tests/,
        /\.env/,
        /\.gitignore/,
        /README\.md/,
        /\.prettier.*/,
      ],
      extraResource: [
        path.join(__dirname, "..", ".next", "standalone"),
        path.join(__dirname, "..", ".next", "static"),
        path.join(__dirname, "..", "public"),
        path.join(__dirname, "..", "package.json"),
        path.join(__dirname, "..", "scripts", "server-production.js"),
        path.join(__dirname, "..", "scripts", "node"),
      ],
    });

    console.log("✅ Electron app built successfully!");
    console.log("📁 Output location:", appPaths[0]);

    // Create platform-specific run scripts
    createPlatformRunScripts(appPaths[0], currentPlatform);

    console.log("🎯 Build completed without symbolic link issues!");
    console.log("💡 To run the app, navigate to:", appPaths[0]);

    if (currentPlatform === "win32") {
      console.log(
        '   and double-click "Advanced Panorama Viewer.exe" or run "run.bat"',
      );
    } else if (currentPlatform === "darwin") {
      console.log(
        '   and double-click "Advanced Panorama Viewer.app" or run "run.sh"',
      );
    } else {
      console.log(
        '   and double-click "Advanced Panorama Viewer" or run "run.sh"',
      );
    }
  } catch (error) {
    console.error("❌ Build failed:", error.message);
    process.exit(1);
  }
}

// Run the build
buildElectronApp();
