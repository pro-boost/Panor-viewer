const fs = require("fs");
const path = require("path");

// Path to the standalone server.js file
const serverPath = path.join(
  __dirname,
  "..",
  ".next",
  "standalone",
  "server.js",
);

console.log("Fixing standalone server.js for ASAR compatibility...");

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
    console.log("✓ Fixed standalone server.js for ASAR compatibility");
  } else {
    console.log("⚠ No chdir found to replace in standalone server.js");
  }
} else {
  console.log("✗ Standalone server.js not found");
}
