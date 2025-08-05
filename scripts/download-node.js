const https = require("https");
const fs = require("fs");
const path = require("path");
const { createWriteStream, createReadStream } = require("fs");
const { pipeline } = require("stream");
const { promisify } = require("util");
const AdmZip = require("adm-zip");

const pipelineAsync = promisify(pipeline);

// Node.js version and download URL
const NODE_VERSION = "v18.19.0";
const NODE_PLATFORM = "win-x64";
const NODE_FILENAME = `node-${NODE_VERSION}-${NODE_PLATFORM}.zip`;
const NODE_URL = `https://nodejs.org/dist/${NODE_VERSION}/${NODE_FILENAME}`;

// Paths
const TEMP_DIR = path.join(__dirname, "..", "temp");
const RESOURCES_DIR = path.join(__dirname, "..", "resources");
const NODE_DIR = path.join(RESOURCES_DIR, "node");
const DOWNLOAD_PATH = path.join(TEMP_DIR, NODE_FILENAME);
const NODE_EXE_PATH = path.join(NODE_DIR, "node.exe");

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
 * Extract node.exe from the downloaded zip
 */
function extractNodeExe(zipPath, outputPath) {
  console.log("Extracting node.exe...");

  try {
    const zip = new AdmZip(zipPath);
    const entries = zip.getEntries();

    // Find node.exe in the zip
    const nodeEntry = entries.find((entry) =>
      entry.entryName.endsWith("node.exe")
    );

    if (!nodeEntry) {
      throw new Error("node.exe not found in the downloaded archive");
    }

    // Extract node.exe
    const nodeBuffer = nodeEntry.getData();
    fs.writeFileSync(outputPath, nodeBuffer);

    console.log(`✓ node.exe extracted to: ${outputPath}`);
  } catch (error) {
    throw new Error(`Failed to extract node.exe: ${error.message}`);
  }
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

    // Check if node.exe already exists
    if (fs.existsSync(NODE_EXE_PATH)) {
      console.log("✓ Node.js runtime already exists, skipping download");
      return;
    }

    // Download Node.js
    await downloadFile(NODE_URL, DOWNLOAD_PATH);

    // Extract node.exe
    extractNodeExe(DOWNLOAD_PATH, NODE_EXE_PATH);

    // Cleanup temp file
    fs.unlinkSync(DOWNLOAD_PATH);
    console.log("✓ Temporary files cleaned up");

    // Verify the extracted file
    if (fs.existsSync(NODE_EXE_PATH)) {
      const stats = fs.statSync(NODE_EXE_PATH);
      console.log(
        `✓ Node.js runtime ready (${(stats.size / 1024 / 1024).toFixed(1)} MB)`
      );
      console.log(`✓ Location: ${NODE_EXE_PATH}`);
    } else {
      throw new Error("Failed to verify extracted node.exe");
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
