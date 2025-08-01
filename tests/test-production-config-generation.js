const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

/**
 * Test configuration generation in production environment
 * This simulates the exact environment setup from ServerManager
 */
async function testProductionConfigGeneration() {
  console.log('=== Testing Production Config Generation ===\n');
  
  // Simulate production environment variables (from ServerManager)
  const userDataPath = 'C:\\Users\\amin\\AppData\\Roaming\\Electron';
  const projectsPath = path.join(userDataPath, 'projects');
  const projectId = 'test-production-config';
  const projectPath = path.join(projectsPath, projectId);
  
  console.log('Production environment setup:');
  console.log('- User data path:', userDataPath);
  console.log('- Projects path:', projectsPath);
  console.log('- Test project path:', projectPath);
  
  // Create test project structure
  console.log('\n=== Creating Test Project Structure ===');
  try {
    // Create project directories
    fs.mkdirSync(path.join(projectPath, 'config'), { recursive: true });
    fs.mkdirSync(path.join(projectPath, 'images'), { recursive: true });
    
    // Create test CSV file
    const csvContent = `ID;filename;timestamp;pano_pos_x;pano_pos_y;pano_pos_z;pano_ori_w;pano_ori_x;pano_ori_y;pano_ori_z
0;00000-pano.jpg;1638362862.084862;0.0;0.0;0.0;1.0;0.0;0.0;0.0
1;00001-pano.jpg;1638362862.184862;5.0;0.0;0.0;0.707;0.0;0.707;0.0`;
    fs.writeFileSync(path.join(projectPath, 'config', 'pano-poses.csv'), csvContent);
    
    // Create dummy image files
    for (let i = 0; i < 2; i++) {
      const filename = `${i.toString().padStart(5, '0')}-pano.jpg`;
      fs.writeFileSync(path.join(projectPath, 'images', filename), `Test image ${i}`);
    }
    
    console.log('✓ Test project structure created successfully');
  } catch (error) {
    console.error('✗ Failed to create test project structure:', error.message);
    return;
  }
  
  // Test script path resolution (simulating upload.ts logic)
  console.log('\n=== Testing Script Path Resolution ===');
  
  // Simulate the exact logic from upload.ts
  const isElectron = true; // Simulate production environment
  let scriptPath, cwd;
  
  if (isElectron) {
    // In Electron production, scripts are in the app.asar.unpacked directory
    scriptPath = path.join(process.cwd(), 'scripts', 'node', 'generate-config.js');
    cwd = process.cwd();
    
    console.log('Initial script path:', scriptPath);
    console.log('Script exists:', fs.existsSync(scriptPath));
    
    // Verify the script exists, if not, try alternative paths
    if (!fs.existsSync(scriptPath)) {
      console.log('Script not found at initial path, trying alternative paths...');
      
      // Try the resources path (available in Electron)
      const resourcesPath = process.resourcesPath;
      console.log('Resources path:', resourcesPath);
      
      if (resourcesPath) {
        const altScriptPath = path.join(resourcesPath, 'app.asar.unpacked', 'scripts', 'node', 'generate-config.js');
        console.log('Alternative script path:', altScriptPath);
        console.log('Alternative script exists:', fs.existsSync(altScriptPath));
        
        if (fs.existsSync(altScriptPath)) {
          scriptPath = altScriptPath;
          cwd = path.join(resourcesPath, 'app.asar.unpacked');
          console.log('✓ Using alternative script path');
        } else {
          console.log('✗ Alternative script path not found');
        }
      } else {
        console.log('✗ Resources path not available');
      }
    } else {
      console.log('✓ Script found at initial path');
    }
  }
  
  console.log('Final script path:', scriptPath);
  console.log('Final working directory:', cwd);
  console.log('Script exists at final path:', fs.existsSync(scriptPath));
  
  // Test Node.js executable resolution
  console.log('\n=== Testing Node.js Executable Resolution ===');
  
  let nodePath = 'node'; // Try system Node.js first
  console.log('Using Node.js executable:', nodePath);
  
  // Test if system Node.js is available
  try {
    const { execSync } = require('child_process');
    const nodeVersion = execSync('node --version', { encoding: 'utf8', timeout: 5000 }).trim();
    console.log('✓ System Node.js available, version:', nodeVersion);
  } catch (nodeTestError) {
    console.log('✗ System Node.js not available:', nodeTestError.message);
    nodePath = process.execPath; // Use current executable as fallback
    console.log('Using fallback executable:', nodePath);
  }
  
  // Set up environment variables (simulating ServerManager)
  console.log('\n=== Setting Up Environment Variables ===');
  
  const scriptEnv = {
    ...process.env,
    NODE_ENV: 'production',
    USER_DATA_PATH: userDataPath,
    PROJECTS_PATH: projectsPath,
    ELECTRON_PROJECTS_PATH: projectsPath
  };
  
  console.log('Environment variables:');
  console.log('- NODE_ENV:', scriptEnv.NODE_ENV);
  console.log('- USER_DATA_PATH:', scriptEnv.USER_DATA_PATH);
  console.log('- PROJECTS_PATH:', scriptEnv.PROJECTS_PATH);
  console.log('- ELECTRON_PROJECTS_PATH:', scriptEnv.ELECTRON_PROJECTS_PATH);
  
  // Execute the script
  console.log('\n=== Executing Configuration Script ===');
  
  try {
    const result = await new Promise((resolve, reject) => {
      const child = spawn(nodePath, [scriptPath, '--project', projectId], {
        cwd,
        env: scriptEnv,
        stdio: ['ignore', 'pipe', 'pipe']
      });
      
      let stdout = '';
      let stderr = '';
      
      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      
      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      child.on('close', (code) => {
        resolve({ code, stdout, stderr });
      });
      
      child.on('error', (error) => {
        reject(error);
      });
      
      // Timeout after 30 seconds
      setTimeout(() => {
        child.kill();
        reject(new Error('Script execution timeout'));
      }, 30000);
    });
    
    console.log('Script execution completed');
    console.log('Exit code:', result.code);
    console.log('STDOUT:', result.stdout);
    if (result.stderr) {
      console.log('STDERR:', result.stderr);
    }
    
    // Check if config.json was created
    console.log('\n=== Verifying Results ===');
    
    const configPath = path.join(projectPath, 'config.json');
    console.log('Expected config.json path:', configPath);
    
    if (fs.existsSync(configPath)) {
      console.log('✓ SUCCESS: config.json was created!');
      
      try {
        const configContent = fs.readFileSync(configPath, 'utf8');
        const config = JSON.parse(configContent);
        console.log('Config scenes count:', config.scenes ? config.scenes.length : 0);
        console.log('Config preview (first 200 chars):', configContent.substring(0, 200) + '...');
      } catch (parseError) {
        console.log('✗ Error parsing config.json:', parseError.message);
      }
    } else {
      console.log('✗ FAILURE: config.json was NOT created');
      
      // List project directory contents for debugging
      console.log('\nProject directory contents:');
      try {
        const contents = fs.readdirSync(projectPath, { recursive: true });
        contents.forEach(item => console.log('  -', item));
      } catch (listError) {
        console.log('Error listing directory:', listError.message);
      }
    }
    
  } catch (error) {
    console.error('\n✗ Script execution failed:', error.message);
  }
  
  console.log('\n=== Test Complete ===');
}

// Run the test
testProductionConfigGeneration().catch(console.error);