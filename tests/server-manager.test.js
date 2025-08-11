const { ServerManager } = require("../desktop/server.js");
const path = require("path");
const os = require("os");
const fs = require("fs");

describe("ServerManager", () => {
  let testUserDataPath;
  let serverManager;

  beforeAll(() => {
    // Simulate the exact packaged app environment
    process.resourcesPath =
      "/Users/brahim_lk/Desktop/Pano-viewer-project/Panor-viewer/dist/mac-arm64/Advanced Panorama Viewer.app/Contents/Resources";

    // Create a test user data path that matches what Electron would use
    testUserDataPath = path.join(
      os.homedir(),
      "Library",
      "Application Support",
      "Advanced Panorama Viewer Test",
    );
  });

  afterEach(async () => {
    if (serverManager) {
      await serverManager.stop();
      serverManager = null;
    }
  });

  it("should have all required files in packaged environment", () => {
    const standalonePath = path.join(process.resourcesPath, "standalone");
    const serverJsPath = path.join(standalonePath, "server.js");
    const nodePath = path.join(process.resourcesPath, "node", "node");

    // Skip test if not in packaged environment
    if (!fs.existsSync(process.resourcesPath)) {
      console.log("Skipping packaged environment test - not in packaged mode");
      return;
    }

    expect(fs.existsSync(standalonePath)).toBe(true);
    expect(fs.existsSync(serverJsPath)).toBe(true);
    expect(fs.existsSync(nodePath)).toBe(true);
  });

  it("should start server and respond to API requests", async () => {
    // Skip test if not in packaged environment
    if (!fs.existsSync(process.resourcesPath)) {
      console.log("Skipping server test - not in packaged mode");
      return;
    }

    // Create user data directory if it doesn't exist
    if (!fs.existsSync(testUserDataPath)) {
      fs.mkdirSync(testUserDataPath, { recursive: true });
    }

    serverManager = new ServerManager(testUserDataPath);

    const serverUrl = await serverManager.start();
    expect(serverUrl).toBeDefined();
    expect(serverUrl).toMatch(/^http:\/\/localhost:\d+$/);

    // Test the /api/hello endpoint
    const http = require("http");

    return new Promise((resolve, reject) => {
      const req = http.get(serverUrl + "/api/hello", (res) => {
        expect(res.statusCode).toBe(200);

        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          expect(data).toBeDefined();
          resolve();
        });
      });

      req.on("error", (err) => {
        reject(new Error(`Failed to connect to /api/hello: ${err.message}`));
      });

      req.setTimeout(5000, () => {
        req.destroy();
        reject(new Error("Timeout connecting to /api/hello"));
      });
    });
  }, 60000);
});
