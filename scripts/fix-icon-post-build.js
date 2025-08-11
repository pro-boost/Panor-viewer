const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

/**
 * Post-build script to automatically fix Windows Explorer icon issue
 * This script runs after electron-builder and uses rcedit to embed the icon properly
 */

const EXECUTABLE_PATH = path.join(
  __dirname,
  "..",
  "dist",
  "win-unpacked",
  "Advanced Panorama Viewer.exe",
);
const ICON_PATH = path.join(
  __dirname,
  "..",
  "public",
  "icons",
  "panorama-viewer-icon-multi.ico",
);

console.log("🔧 Starting automatic icon fix...");

// Check if executable exists
if (!fs.existsSync(EXECUTABLE_PATH)) {
  console.log("❌ Executable not found:", EXECUTABLE_PATH);
  process.exit(1);
}

// Check if icon exists
if (!fs.existsSync(ICON_PATH)) {
  console.log("❌ Icon file not found:", ICON_PATH);
  process.exit(1);
}

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
      const rceditX64 = path.join(electronBuilderCache, dir, "rcedit-x64.exe");
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
      "node_modules",
      "app-builder-bin",
      "win",
      "x64",
      "rcedit.exe",
    ),
    path.join(
      __dirname,
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
console.log("🎯 Target executable:", EXECUTABLE_PATH);
console.log("🖼️  Icon file:", ICON_PATH);

// Get file size before
const sizeBefore = fs.statSync(EXECUTABLE_PATH).size;
console.log("📊 File size before:", sizeBefore, "bytes");

try {
  // Run rcedit to embed the icon with additional parameters
  const command = `"${rceditPath}" "${EXECUTABLE_PATH}" --set-icon "${ICON_PATH}" --set-version-string "FileDescription" "Advanced Panorama Viewer" --set-version-string "ProductName" "Advanced Panorama Viewer"`;
  console.log("🔨 Running command:", command);

  execSync(command, { stdio: "inherit" });

  // Get file size after
  const sizeAfter = fs.statSync(EXECUTABLE_PATH).size;
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

console.log("🎉 Automatic icon fix completed successfully!");
