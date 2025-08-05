const https = require("https");
const fs = require("fs");
const path = require("path");
const { createWriteStream, createReadStream } = require("fs");
const { pipeline } = require("stream");
const { promisify } = require("util");
const AdmZip = require("adm-zip");

const pipelineAsync = promisify(pipeline);

// Node.js version and platform detection
const NODE_VERSION = "v18.19.0";

// Detect platform and architecture
function getPlatformInfo() {
  const platform = process.platform;
  const arch = process.arch;
  
  let nodePlatform, fileExtension, executable;
  
  if (platform === 'win32') {
    nodePlatform = arch === 'x64' ? 'win-x64' : 'win-x86';
    fileExtension = 'zip';
    executable = 'node.exe';
  } else if (platform === 'darwin') {
    nodePlatform = arch === 'arm64' ? 'darwin-arm64' : 'darwin-x64';
    fileExtension = 'tar.gz';
    executable = 'node';
  } else if (platform === 'linux') {
    nodePlatform = arch === 'x64' ? 'linux-x64' : 'linux-arm64';
    fileExtension = 'tar.xz';
    executable = 'node';
  } else {
    throw new Error(`Unsupported platform: ${platform}`);
  }
  
  return { nodePlatform, fileExtension, executable };
}

const { nodePlatform: NODE_PLATFORM, fileExtension: FILE_EXTENSION, executable: NODE_EXECUTABLE } = getPlatformInfo();
const NODE_FILENAME = `node-${NODE_VERSION}-${NODE_PLATFORM}.${FILE_EXTENSION}`;
const NODE_URL = `https://nodejs.org/dist/${NODE_VERSION}/${NODE_FILENAME}`;

// Paths
const TEMP_DIR = path.join(__dirname, "..", "temp");
const RESOURCES_DIR = path.join(__dirname, "..", "resources");
const NODE_DIR = path.join(RESOURCES_DIR, "node");
const DOWNLOAD_PATH = path.join(TEMP_DIR, NODE_FILENAME);
const NODE_EXECUTABLE_PATH = path.join(NODE_DIR, NODE_EXECUTABLE);

/**
 * Download file from URL
 */
function downloadFile(url, destination) {
  return new Promise((resolve, reject) => {
    console.log(`Downloading ${url}...`);

    const file = createWriteStream(destination);
    const request = https.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        // Handle redirect
        file.close();
        fs.unlinkSync(destination);
        return downloadFile(response.headers.location, destination)
          .then(resolve)
          .catch(reject);
      }

      if (response.statusCode !== 200) {
        file.close();
        fs.unlinkSync(destination);
        return reject(
          new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`)
        );
      }

      const totalSize = parseInt(response.headers["content-length"], 10);
      let downloadedSize = 0;

      response.on("data", (chunk) => {
        downloadedSize += chunk.length;
        const progress = ((downloadedSize / totalSize) * 100).toFixed(1);
        process.stdout.write(`\rDownload progress: ${progress}%`);
      });

      response.pipe(file);

      file.on("finish", () => {
        console.log("\nDownload completed!");
        file.close(resolve);
      });
    });

    request.on("error", (error) => {
      file.close();
      fs.unlinkSync(destination);
      reject(error);
    });

    file.on("error", (error) => {
      fs.unlinkSync(destination);
      reject(error);
    });
  });
}

/**
 * Extract Node.js executable from the downloaded archive
 */
function extractNodeExecutable(archivePath, outputPath) {
  console.log(`Extracting ${NODE_EXECUTABLE}...`);

  try {
    if (FILE_EXTENSION === 'zip') {
      // Handle ZIP files (Windows)
      const zip = new AdmZip(archivePath);
      const entries = zip.getEntries();

      // Find node.exe in the zip
      const nodeEntry = entries.find((entry) =>
        entry.entryName.endsWith(NODE_EXECUTABLE)
      );

      if (!nodeEntry) {
        throw new Error(`${NODE_EXECUTABLE} not found in the downloaded archive`);
      }

      // Extract node executable
      const nodeBuffer = nodeEntry.getData();
      fs.writeFileSync(outputPath, nodeBuffer);
      
      // Make executable on Unix-like systems
      if (process.platform !== 'win32') {
        fs.chmodSync(outputPath, 0o755);
      }
    } else {
      // Handle TAR.GZ and TAR.XZ files (macOS/Linux)
      const { execSync } = require('child_process');
      const extractDir = path.join(TEMP_DIR, 'extract');
      
      // Create extraction directory
      if (!fs.existsSync(extractDir)) {
        fs.mkdirSync(extractDir, { recursive: true });
      }
      
      // Extract archive
      if (FILE_EXTENSION === 'tar.gz') {
        execSync(`tar -xzf "${archivePath}" -C "${extractDir}"`);
      } else if (FILE_EXTENSION === 'tar.xz') {
        execSync(`tar -xJf "${archivePath}" -C "${extractDir}"`);
      }
      
      // Find the node executable in the extracted files
      const extractedNodePath = findNodeExecutable(extractDir);
      if (!extractedNodePath) {
        throw new Error(`${NODE_EXECUTABLE} not found in extracted archive`);
      }
      
      // Copy to final location
      fs.copyFileSync(extractedNodePath, outputPath);
      
      // Make executable
      fs.chmodSync(outputPath, 0o755);
      
      // Cleanup extraction directory
      fs.rmSync(extractDir, { recursive: true, force: true });
    }

    console.log(`✓ ${NODE_EXECUTABLE} extracted to: ${outputPath}`);
  } catch (error) {
    throw new Error(`Failed to extract ${NODE_EXECUTABLE}: ${error.message}`);
  }
}

/**
 * Find Node.js executable in extracted directory
 */
function findNodeExecutable(dir) {
  const files = fs.readdirSync(dir, { recursive: true });
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isFile() && 
        (path.basename(fullPath) === NODE_EXECUTABLE) &&
        fullPath.includes('/bin/')) {
      return fullPath;
    }
  }
  
  return null;
}

/**
 * Main download and setup function
 */
async function downloadAndSetupNode() {
  try {
    console.log("Setting up bundled Node.js runtime...");

    // Create directories
    if (!fs.existsSync(TEMP_DIR)) {
      fs.mkdirSync(TEMP_DIR, { recursive: true });
    }

    if (!fs.existsSync(NODE_DIR)) {
      fs.mkdirSync(NODE_DIR, { recursive: true });
    }

    // Check if Node.js executable already exists
    if (fs.existsSync(NODE_EXECUTABLE_PATH)) {
      console.log("✓ Node.js runtime already exists, skipping download");
      return;
    }

    // Download Node.js
    await downloadFile(NODE_URL, DOWNLOAD_PATH);

    // Extract Node.js executable
    extractNodeExecutable(DOWNLOAD_PATH, NODE_EXECUTABLE_PATH);

    // Cleanup temp file
    fs.unlinkSync(DOWNLOAD_PATH);
    console.log("✓ Temporary files cleaned up");

    // Verify the extracted file
    if (fs.existsSync(NODE_EXECUTABLE_PATH)) {
      const stats = fs.statSync(NODE_EXECUTABLE_PATH);
      console.log(
        `✓ Node.js runtime ready (${(stats.size / 1024 / 1024).toFixed(1)} MB)`
      );
      console.log(`✓ Location: ${NODE_EXECUTABLE_PATH}`);
    } else {
      throw new Error(`Failed to verify extracted ${NODE_EXECUTABLE}`);
    }
  } catch (error) {
    console.error("✗ Failed to setup Node.js runtime:", error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  downloadAndSetupNode();
}

module.exports = { downloadAndSetupNode };
