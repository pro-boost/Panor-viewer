const FormData = require('form-data');
const fs = require('fs');
const http = require('http');
const path = require('path');
const { spawn } = require('child_process');

console.log('🔍 Testing upload with manual config generation...');

// Create test CSV content with correct column names (simple format)
const csvContent = `filename,x,y,z,w,x_rot,y_rot,z_rot
test1.jpg,0,0,0,1,0,0,0
test2.jpg,1,0,0,0.707,0,0.707,0
test3.jpg,2,0,0,0.5,0.5,0.5,0.5`;

// Create minimal JPEG test files
const jpegHeader = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46]);
const jpegFooter = Buffer.from([0xFF, 0xD9]);
const minimalJpeg = Buffer.concat([jpegHeader, Buffer.alloc(100, 0x00), jpegFooter]);

const projectId = `test-manual-${Date.now()}`;
console.log(`📁 Project ID: ${projectId}`);

// Create form data
const form = new FormData();
form.append('csv', csvContent, { filename: 'pano-poses.csv' });
form.append('images', minimalJpeg, { filename: 'test1.jpg' });
form.append('images', minimalJpeg, { filename: 'test2.jpg' });
form.append('images', minimalJpeg, { filename: 'test3.jpg' });

// Function to run the config generation script manually
const runConfigScript = (projectId) => {
  return new Promise((resolve, reject) => {
    const projectsPath = process.env.APPDATA ? path.join(process.env.APPDATA, 'pano-app', 'projects') : null;
    
    if (!projectsPath) {
      return reject(new Error('Could not determine projects path'));
    }
    
    console.log(`📂 Projects path: ${projectsPath}`);
    
    // Check if project directory exists
    const projectDir = path.join(projectsPath, projectId);
    if (!fs.existsSync(projectDir)) {
      return reject(new Error(`Project directory does not exist: ${projectDir}`));
    }
    
    console.log(`📂 Project directory exists: ${projectDir}`);
    
    // Run the config generation script
    console.log('🔧 Running config generation script...');
    
    const scriptPath = path.join(process.cwd(), 'scripts', 'node', 'generate-config.js');
    const child = spawn('node', [scriptPath, '--project', projectId], {
      env: { ...process.env, PROJECTS_PATH: projectsPath }
    });
    
    let stdout = '';
    let stderr = '';
    
    child.stdout.on('data', (data) => {
      stdout += data.toString();
      console.log(`📤 Script output: ${data.toString().trim()}`);
    });
    
    child.stderr.on('data', (data) => {
      stderr += data.toString();
      console.error(`❌ Script error: ${data.toString().trim()}`);
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Config generation successful');
        resolve({ success: true, stdout, stderr });
      } else {
        console.error(`❌ Config generation failed with code ${code}`);
        reject(new Error(`Config generation failed with code ${code}: ${stderr}`));
      }
    });
  });
};

// Make upload request
const options = {
  hostname: 'localhost',
  port: 3456,
  path: `/api/projects/${projectId}/upload`,
  method: 'POST',
  headers: form.getHeaders()
};

const req = http.request(options, (res) => {
  console.log(`📤 Upload response status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', async () => {
    try {
      const jsonResponse = JSON.parse(data);
      console.log('📄 Upload response:', jsonResponse);
      
      if (res.statusCode === 200) {
        console.log('✅ Upload successful');
      } else if (jsonResponse.error === 'Configuration generation failed') {
        console.log('⚠️ Upload successful but config generation failed, running manually...');
        
        try {
          await runConfigScript(projectId);
          
          // Verify config.json was created
          const projectsPath = process.env.APPDATA ? path.join(process.env.APPDATA, 'pano-app', 'projects') : null;
          const configPath = path.join(projectsPath, projectId, 'config.json');
          
          if (fs.existsSync(configPath)) {
            console.log(`✅ Config file created successfully: ${configPath}`);
            console.log('📄 Config content:', fs.readFileSync(configPath, 'utf8').substring(0, 200) + '...');
            process.exit(0);
          } else {
            console.error(`❌ Config file not created: ${configPath}`);
            process.exit(1);
          }
        } catch (error) {
          console.error('❌ Manual config generation failed:', error.message);
          process.exit(1);
        }
      } else {
        console.error('❌ Upload failed:', jsonResponse.error || 'Unknown error');
        process.exit(1);
      }
    } catch (e) {
      console.error('❌ Failed to parse response:', e.message);
      console.log('Raw response:', data.substring(0, 500));
      process.exit(1);
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Request error:', e.message);
  process.exit(1);
});

form.pipe(req);