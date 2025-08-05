const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Create a log file to capture environment variables
const logFile = path.join(process.cwd(), 'env-debug.log');
fs.writeFileSync(logFile, `Environment Debug Log - ${new Date().toISOString()}\n\n`);

// Log function
const log = (message) => {
  const logMessage = `${message}\n`;
  console.log(logMessage.trim());
  fs.appendFileSync(logFile, logMessage);
};

// Log environment variables
log('Current process.env.PROJECTS_PATH: ' + process.env.PROJECTS_PATH);

// Determine projects path
const projectsPath = process.env.PROJECTS_PATH || path.join(process.cwd(), 'projects');
log('Calculated projectsPath: ' + projectsPath);

// Create a test project ID
const projectId = `test-env-${Date.now()}`;
log('Test project ID: ' + projectId);

// Create project directory structure
const projectDir = path.join(projectsPath, projectId);
const configDir = path.join(projectDir, 'config');
const imagesDir = path.join(projectDir, 'images');

log('Creating test project structure:');
log(`- Project dir: ${projectDir}`);
log(`- Config dir: ${configDir}`);
log(`- Images dir: ${imagesDir}`);

fs.mkdirSync(projectDir, { recursive: true });
fs.mkdirSync(configDir, { recursive: true });
fs.mkdirSync(imagesDir, { recursive: true });

// Create test CSV file
const csvContent = `filename,x,y,z,w,x_rot,y_rot,z_rot\ntest1.jpg,0,0,0,1,0,0,0\ntest2.jpg,1,0,0,0.707,0,0.707,0\ntest3.jpg,2,0,0,0.5,0.5,0.5,0.5`;
const csvPath = path.join(configDir, 'pano-poses.csv');
fs.writeFileSync(csvPath, csvContent);
log(`Created CSV file at: ${csvPath}`);

// Create minimal JPEG test files
const jpegHeader = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46]);
const jpegFooter = Buffer.from([0xFF, 0xD9]);
const minimalJpeg = Buffer.concat([jpegHeader, Buffer.alloc(100, 0x00), jpegFooter]);

['test1.jpg', 'test2.jpg', 'test3.jpg'].forEach(filename => {
  const imagePath = path.join(imagesDir, filename);
  fs.writeFileSync(imagePath, minimalJpeg);
  log(`Created test image: ${imagePath}`);
});

// Test running the config generation script directly
log('\nTesting direct script execution:');

// Find the script path
let scriptPath;
let cwd;

// Check if we're in packaged app mode
if (process.resourcesPath) {
  log('Running in packaged app mode');
  const isAsar = fs.existsSync(path.join(process.resourcesPath, 'app.asar'));
  if (isAsar) {
    scriptPath = path.join(process.resourcesPath, 'app.asar.unpacked', 'scripts', 'node', 'generate-config.js');
    cwd = path.join(process.resourcesPath, 'app.asar.unpacked');
  } else {
    scriptPath = path.join(process.resourcesPath, 'node', 'generate-config.js');
    cwd = process.resourcesPath;
  }
} else {
  log('Running in development mode');
  scriptPath = path.join(process.cwd(), 'scripts', 'node', 'generate-config.js');
  cwd = process.cwd();
}

log(`Script path: ${scriptPath}`);
log(`Working directory: ${cwd}`);

// Find Node.js executable
let nodePath = process.execPath;
log(`Node executable: ${nodePath}`);

// Try to find actual node.exe
const possibleNodePaths = [
  'C:\\Program Files\\nodejs\\node.exe',
  'C:\\Program Files (x86)\\nodejs\\node.exe',
  path.join(process.env.PROGRAMFILES || 'C:\\Program Files', 'nodejs', 'node.exe'),
  path.join(process.env['PROGRAMFILES(X86)'] || 'C:\\Program Files (x86)', 'nodejs', 'node.exe')
];

for (const possiblePath of possibleNodePaths) {
  if (fs.existsSync(possiblePath)) {
    log(`Found Node.js executable: ${possiblePath}`);
    break;
  }
}

// Set environment variables for the script
const scriptEnv = {
  ...process.env,
  PROJECTS_PATH: projectsPath
};

log(`Setting PROJECTS_PATH to: ${projectsPath}`);
log(`Script environment PROJECTS_PATH: ${scriptEnv.PROJECTS_PATH}`);

// Run the script with different node executables
const runWithExecutable = (executable, name) => {
  return new Promise((resolve) => {
    log(`\nRunning with ${name}: ${executable}`);
    
    const scriptArgs = [scriptPath, '--project', projectId];
    log(`Script arguments: ${scriptArgs.join(' ')}`);
    
    const child = spawn(executable, scriptArgs, {
      cwd,
      env: scriptEnv
    });
    
    let stdout = '';
    let stderr = '';
    
    child.stdout.on('data', (data) => {
      const output = data.toString();
      stdout += output;
      log(`[${name} stdout] ${output.trim()}`);
    });
    
    child.stderr.on('data', (data) => {
      const output = data.toString();
      stderr += output;
      log(`[${name} stderr] ${output.trim()}`);
    });
    
    child.on('close', (code) => {
      log(`[${name}] Process exited with code ${code}`);
      resolve({ code, stdout, stderr });
    });
    
    child.on('error', (error) => {
      log(`[${name}] Process error: ${error.message}`);
      resolve({ code: -1, stdout, stderr, error: error.message });
    });
  });
};

// Run tests with different executables
async function runTests() {
  // Test 1: Run with process.execPath
  await runWithExecutable(process.execPath, 'process.execPath');
  
  // Test 2: Run with node.exe if found
  for (const possiblePath of possibleNodePaths) {
    if (fs.existsSync(possiblePath)) {
      await runWithExecutable(possiblePath, 'node.exe');
      break;
    }
  }
  
  log('\nAll tests completed. Check the log file for details: ' + logFile);
}

runTests().catch(error => {
  log(`Error in test execution: ${error.message}`);
});