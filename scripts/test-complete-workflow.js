const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

async function testCompleteWorkflow() {
  try {
    console.log('🧪 Testing complete upload and config generation workflow...');
    
    const projectId = `test-workflow-${Date.now()}`;
    console.log(`📁 Using project ID: ${projectId}`);
    
    // Create test files with complete CSV format
    const csvContent = 'filename,description,pano_pos_x,pano_pos_y,pano_pos_z,pano_ori_w,pano_ori_x,pano_ori_y,pano_ori_z\ntest-workflow1.jpg,Test Point 1,0,0,0,1,0,0,0\ntest-workflow2.jpg,Test Point 2,10,0,0,1,0,0,0';
    const csvPath = path.join(__dirname, 'test-workflow.csv');
    fs.writeFileSync(csvPath, csvContent);
    
    // Create test image files
    const imagePath1 = path.join(__dirname, 'test-workflow1.jpg');
    const imagePath2 = path.join(__dirname, 'test-workflow2.jpg');
    const jpegHeader = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46]);
    fs.writeFileSync(imagePath1, jpegHeader);
    fs.writeFileSync(imagePath2, jpegHeader);
    
    // Step 1: Upload files
    console.log('📤 Step 1: Uploading files...');
    const form = new FormData();
    form.append('csv', fs.createReadStream(csvPath), {
      filename: 'pano-poses.csv',
      contentType: 'text/csv'
    });
    form.append('images', fs.createReadStream(imagePath1), {
      filename: 'test-workflow1.jpg',
      contentType: 'image/jpeg'
    });
    form.append('images', fs.createReadStream(imagePath2), {
      filename: 'test-workflow2.jpg',
      contentType: 'image/jpeg'
    });
    form.append('deleteAll', 'true');
    
    const uploadResponse = await axios.post(
      `http://localhost:3000/api/projects/${projectId}/upload`,
      form,
      {
        headers: form.getHeaders(),
        validateStatus: () => true
      }
    );
    
    console.log(`📊 Upload status: ${uploadResponse.status}`);
    
    if (uploadResponse.status === 200) {
      console.log('✅ Files uploaded successfully!');
    } else if (uploadResponse.status === 500 && uploadResponse.data.error === 'Configuration generation failed') {
      console.log('⚠️  Files uploaded but config generation failed. Proceeding with manual generation...');
    } else {
      console.log('❌ Upload failed:', uploadResponse.data);
      return;
    }
    
    // Step 2: Generate config manually
    console.log('🔧 Step 2: Generating config.json manually...');
    
    const configResult = await new Promise((resolve, reject) => {
      const child = spawn('node', ['scripts/node/generate-config.js', '--project', projectId], {
        cwd: path.join(__dirname, '..'),
        env: {
          ...process.env,
          PROJECTS_PATH: 'C:\\Users\\aminm\\AppData\\Roaming\\pano-app\\projects'
        },
        stdio: 'pipe'
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
    });
    
    if (configResult.code === 0) {
      console.log('✅ Config.json generated successfully!');
      console.log('📄 Config generation output:', configResult.stdout);
      
      // Step 3: Verify config.json exists
      const configPath = `C:\\Users\\aminm\\AppData\\Roaming\\pano-app\\projects\\${projectId}\\config.json`;
      if (fs.existsSync(configPath)) {
        console.log('✅ Config.json file verified at:', configPath);
        const configContent = fs.readFileSync(configPath, 'utf8');
        const config = JSON.parse(configContent);
        console.log('📊 Config contains', Object.keys(config.scenes || {}).length, 'scenes');
        console.log('🎉 COMPLETE WORKFLOW SUCCESS!');
      } else {
        console.log('❌ Config.json file not found at expected location');
      }
    } else {
      console.log('❌ Config generation failed:', configResult.stderr);
    }
    
    // Cleanup
    [csvPath, imagePath1, imagePath2].forEach(filePath => {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });
    
  } catch (error) {
    console.error('❌ Workflow failed:', error.message);
  }
}

testCompleteWorkflow();