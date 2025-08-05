const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Test the generate-config.js script in standalone mode
async function testStandaloneConfig() {
  console.log('Testing generate-config.js script in standalone mode...');
  
  // Create test project directory and files
  const projectsPath = path.join(process.env.APPDATA || process.env.HOME, 'pano-app', 'projects');
  const projectId = 'test-standalone';
  const projectPath = path.join(projectsPath, projectId);
  const configDir = path.join(projectPath, 'config');
  const csvFile = path.join(configDir, 'pano-poses.csv');
  
  // Ensure directories exist
  if (!fs.existsSync(projectsPath)) fs.mkdirSync(projectsPath, { recursive: true });
  if (!fs.existsSync(projectPath)) fs.mkdirSync(projectPath, { recursive: true });
  if (!fs.existsSync(configDir)) fs.mkdirSync(configDir, { recursive: true });
  
  // Create test CSV with proper format (x, y, z, w, x_rot, y_rot, z_rot)
  const csvContent = `filename,x,y,z,w,x_rot,y_rot,z_rot
test1.jpg,0,0,0,1,0,0,0
test2.jpg,5,0,0,0.707,0,0,0.707
test3.jpg,10,0,0,0,0,0,1`;
  fs.writeFileSync(csvFile, csvContent);
  
  console.log(`Created test CSV at: ${csvFile}`);
  
  // Use the original script from scripts/node directory
  const scriptPath = path.join(__dirname, 'scripts', 'node', 'generate-config.js');
  
  console.log(`Script path: ${scriptPath}`);
  console.log(`Working directory: ${__dirname}`);
  
  return new Promise((resolve, reject) => {
    const scriptArgs = ['--project', projectId];
    
    console.log('Executing: node', scriptPath, scriptArgs.join(' '));
    
    const child = spawn('node', [scriptPath, ...scriptArgs], {
      cwd: __dirname,
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
        console.log('Config structure:', Object.keys(config));
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
testStandaloneConfig().then(success => {
  console.log('Test completed:', success ? 'SUCCESS' : 'FAILED');
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('Test failed with error:', error);
  process.exit(1);
});