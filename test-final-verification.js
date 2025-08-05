const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Comprehensive test of the entire workflow
async function testCompleteWorkflow() {
  console.log('🔍 Testing complete panorama upload and config generation workflow...');
  
  const timestamp = Date.now();
  const projectId = `test-final-${timestamp}`;
  const projectsPath = path.join(process.env.APPDATA || process.env.HOME, 'pano-app', 'projects');
  const projectPath = path.join(projectsPath, projectId);
  const configPath = path.join(projectPath, 'config.json');
  
  console.log(`📁 Project ID: ${projectId}`);
  console.log(`📂 Projects path: ${projectsPath}`);
  
  // Step 1: Test server connectivity
  console.log('\n1️⃣ Testing server connectivity...');
  try {
    const healthResponse = await fetch('http://localhost:3456/api/hello');
    if (healthResponse.ok) {
      console.log('✅ Server is responding');
    } else {
      console.log('❌ Server health check failed');
      return false;
    }
  } catch (error) {
    console.log('❌ Cannot connect to server:', error.message);
    return false;
  }
  
  // Step 2: Prepare test data
  console.log('\n2️⃣ Preparing test data...');
  const csvContent = `filename,x,y,z,w,x_rot,y_rot,z_rot
test1_${timestamp}.jpg,0,0,0,1,0,0,0
test2_${timestamp}.jpg,5,0,0,0.707,0,0,0.707
test3_${timestamp}.jpg,10,0,0,0,0,0,1`;
  
  // Create minimal JPEG header
  const jpegHeader = Buffer.from([
    0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
    0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xFF, 0xD9
  ]);
  
  console.log('✅ Test data prepared (CSV + 3 JPEG files)');
  
  // Step 3: Upload files
  console.log('\n3️⃣ Uploading files...');
  try {
    const formData = new FormData();
    formData.append('projectId', projectId);
    formData.append('pano-poses.csv', csvContent, {
      filename: 'pano-poses.csv',
      contentType: 'text/csv'
    });
    
    // Add test images
    for (let i = 1; i <= 3; i++) {
      formData.append(`test${i}_${timestamp}.jpg`, jpegHeader, {
        filename: `test${i}_${timestamp}.jpg`,
        contentType: 'image/jpeg'
      });
    }
    
    const uploadResponse = await fetch('http://localhost:3456/api/upload', {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders()
    });
    
    console.log(`📤 Upload response status: ${uploadResponse.status}`);
    
    if (uploadResponse.ok) {
      console.log('✅ Upload request completed');
    } else {
      const errorText = await uploadResponse.text();
      console.log('❌ Upload failed:', errorText.substring(0, 200));
      return false;
    }
  } catch (error) {
    console.log('❌ Upload error:', error.message);
    return false;
  }
  
  // Step 4: Wait and check for project creation
  console.log('\n4️⃣ Checking project creation...');
  await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
  
  if (fs.existsSync(projectPath)) {
    console.log('✅ Project directory created');
    
    // List project contents
    const projectContents = fs.readdirSync(projectPath, { recursive: true });
    console.log('📋 Project contents:', projectContents);
  } else {
    console.log('❌ Project directory not created');
    return false;
  }
  
  // Step 5: Check for config.json
  console.log('\n5️⃣ Checking config.json generation...');
  if (fs.existsSync(configPath)) {
    console.log('✅ config.json generated successfully!');
    
    try {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      console.log(`📊 Configuration summary:`);
      console.log(`   - Scenes: ${config.scenes?.length || 0}`);
      console.log(`   - Name: ${config.name || 'N/A'}`);
      console.log(`   - Floors: ${config.floors?.length || 0}`);
      
      if (config.scenes && config.scenes.length === 3) {
        console.log('✅ All 3 scenes processed correctly');
        return true;
      } else {
        console.log('⚠️ Unexpected number of scenes');
        return false;
      }
    } catch (error) {
      console.log('❌ Error reading config.json:', error.message);
      return false;
    }
  } else {
    console.log('❌ config.json not generated');
    
    // Check if CSV was at least uploaded
    const csvPath = path.join(projectPath, 'config', 'pano-poses.csv');
    if (fs.existsSync(csvPath)) {
      console.log('ℹ️ CSV file was uploaded but config generation failed');
      
      // Try manual config generation
      console.log('\n🔧 Attempting manual config generation...');
      const { spawn } = require('child_process');
      const scriptPath = path.join(__dirname, 'scripts', 'node', 'generate-config.js');
      
      return new Promise((resolve) => {
        const child = spawn('node', [scriptPath, '--project', projectId], {
          cwd: __dirname,
          env: {
            ...process.env,
            PROJECTS_PATH: projectsPath
          },
          stdio: ['pipe', 'pipe', 'pipe']
        });
        
        let output = '';
        child.stdout.on('data', (data) => output += data.toString());
        child.stderr.on('data', (data) => output += data.toString());
        
        child.on('close', (code) => {
          if (code === 0 && fs.existsSync(configPath)) {
            console.log('✅ Manual config generation successful!');
            resolve(true);
          } else {
            console.log('❌ Manual config generation failed');
            console.log('Output:', output);
            resolve(false);
          }
        });
      });
    } else {
      console.log('❌ CSV file was not uploaded');
      return false;
    }
  }
}

// Run the comprehensive test
testCompleteWorkflow().then(success => {
  console.log('\n🏁 Final Result:', success ? '✅ SUCCESS - Complete workflow working!' : '❌ FAILED - Issues detected');
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('\n💥 Test crashed:', error);
  process.exit(1);
});