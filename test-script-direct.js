const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Test the generate-config.js script directly
async function testScriptDirect() {
  console.log('Testing generate-config.js script directly...');
  
  // Create test project directory and files
  const projectsPath = path.join(process.env.APPDATA || process.env.HOME, 'pano-app', 'projects');
  const projectId = 'test-direct';
  const projectPath = path.join(projectsPath, projectId);
  const configDir = path.join(projectPath, 'config');
  const csvFile = path.join(configDir, 'pano-poses.csv');
  
  // Ensure directories exist
  if (!fs.existsSync(projectsPath)) fs.mkdirSync(projectsPath, { recursive: true });
  if (!fs.existsSync(projectPath)) fs.mkdirSync(projectPath, { recursive: true });
  if (!fs.existsSync(configDir)) fs.mkdirSync(configDir, { recursive: true });
  
  // Create test CSV
  const csvContent = `filename,x,y,z,yaw,pitch,roll
test1.jpg,0,0,0,0,0,0
test2.jpg,5,0,0,90,0,0
test3.jpg,10,0,0,180,0,0`;
  fs.writeFileSync(csvFile, csvContent);
  
  console.log(`Created test CSV at: ${csvFile}`);
  
  // Test script path from packaged app
  const scriptPath = 'D:\\projects\\panno-app-1 - Copie\\dist\\PrimeZone Panorama Viewer-win32-x64\\resources\\node\\generate-config.js';
  const nodePath = 'D:\\projects\\panno-app-1 - Copie\\dist\\PrimeZone Panorama Viewer-win32-x64\\PrimeZone Panorama Viewer.exe';
  const cwd = 'D:\\projects\\panno-app-1 - Copie\\dist\\PrimeZone Panorama Viewer-win32-x64\\resources';
  
  console.log(`Script path: ${scriptPath}`);
  console.log(`Node path: ${nodePath}`);
  console.log(`Working directory: ${cwd}`);
  
  return new Promise((resolve, reject) => {
    const scriptArgs = ['--node-integration=false', '--enable-node-cli-inspect=false', scriptPath, '--project', projectId];
    
    console.log('Executing:', nodePath, scriptArgs.join(' '));
    
    const child = spawn(nodePath, scriptArgs, {
      cwd,
      env: {
        ...process.env,
        PROJECTS_PATH: projectsPath
      },
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    let stdout = '';
    let stderr = '';
    
    child.stdout.on('data', (data) => {
      stdout += data.toString();
      console.log('STDOUT:', data.toString());
    });
    
    child.stderr.on('data', (data) => {
      stderr += data.toString();
      console.log('STDERR:', data.toString());
    });
    
    child.on('close', (code) => {
      console.log(`Script exited with code: ${code}`);
      console.log('Final stdout:', stdout);
      console.log('Final stderr:', stderr);
      
      // Check if config.json was created
      const configPath = path.join(projectPath, 'config.json');
      if (fs.existsSync(configPath)) {
        console.log('✅ config.json generated successfully!');
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        console.log('Config contains', config.scenes?.length || 0, 'scenes');
        resolve(true);
      } else {
        console.log('❌ config.json not found');
        resolve(false);
      }
    });
    
    child.on('error', (error) => {
      console.error('Script execution error:', error);
      reject(error);
    });
  });
}

// Run the test
testScriptDirect().then(success => {
  console.log('Test completed:', success ? 'SUCCESS' : 'FAILED');
}).catch(console.error);