const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const https = require('https');
const http = require('http');

/**
 * Test upload functionality with the fixed script dependencies
 */
async function testUploadWithFixedDependencies() {
  console.log('=== Testing Upload with Fixed Script Dependencies ===\n');
  
  const projectId = 'test-fixed-dependencies';
  const serverUrl = 'http://localhost:3456';
  const uploadUrl = `${serverUrl}/api/projects/${projectId}/upload`;
  
  console.log('Project ID:', projectId);
  console.log('Upload URL:', uploadUrl);
  
  // Create test files
  console.log('\n=== Creating Test Files ===');
  
  const csvContent = `ID;filename;timestamp;pano_pos_x;pano_pos_y;pano_pos_z;pano_ori_w;pano_ori_x;pano_ori_y;pano_ori_z
0;00000-pano.jpg;1638362862.084862;0.0;0.0;0.0;1.0;0.0;0.0;0.0
1;00001-pano.jpg;1638362862.184862;5.0;0.0;0.0;0.707;0.0;0.707;0.0
2;00002-pano.jpg;1638362862.284862;5.0;5.0;0.0;0.0;0.0;1.0;0.0`;
  
  const imageContent = Buffer.from('fake-image-data-for-testing');
  
  // Create form data
  const form = new FormData();
  
  // Add CSV file
  form.append('csv', csvContent, {
    filename: 'pano-poses.csv',
    contentType: 'text/csv'
  });
  
  // Add image files
  for (let i = 0; i < 3; i++) {
    const filename = `${i.toString().padStart(5, '0')}-pano.jpg`;
    form.append('images', imageContent, {
      filename: filename,
      contentType: 'image/jpeg'
    });
  }
  
  console.log('✓ Test files created');
  console.log('- CSV file: pano-poses.csv (3 panoramas)');
  console.log('- Image files: 00000-pano.jpg, 00001-pano.jpg, 00002-pano.jpg');
  
  // Send upload request
  console.log('\n=== Sending Upload Request ===');
  
  try {
    const url = new URL(uploadUrl);
    const protocol = url.protocol === 'https:' ? https : http;
    
    const response = await new Promise((resolve, reject) => {
      const req = protocol.request({
        hostname: url.hostname,
        port: url.port,
        path: url.pathname,
        method: 'POST',
        headers: {
          ...form.getHeaders(),
          'User-Agent': 'Test-Upload-Client/1.0'
        }
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          resolve({
            status: res.statusCode,
            statusText: res.statusMessage,
            headers: res.headers,
            text: () => Promise.resolve(data)
          });
        });
      });
      
      req.on('error', reject);
      form.pipe(req);
    });
    
    console.log('Response status:', response.status);
    console.log('Response status text:', response.statusText);
    
    if (response.status === 307) {
      const location = response.headers.location;
      console.log('\n❌ REDIRECT DETECTED');
      console.log('Redirected to:', location);
      console.log('This indicates an authentication issue.');
      return;
    }
    
    const responseText = await response.text();
    console.log('\nResponse body:', responseText);
    
    if (response.status >= 200 && response.status < 300) {
      console.log('\n✅ Upload request successful!');
      
      try {
        const responseData = JSON.parse(responseText);
        if (responseData.scriptOutput) {
          console.log('\n=== Script Output ===');
          console.log(responseData.scriptOutput);
        }
      } catch (parseError) {
        console.log('Response is not JSON, but upload was successful');
      }
    } else {
      console.log('\n❌ Upload request failed');
    }
    
  } catch (error) {
    console.error('\n❌ Upload request error:', error.message);
    return;
  }
  
  // Check if config.json was created
  console.log('\n=== Checking Config.json Generation ===');
  
  const productionProjectsPath = 'C:\\Users\\amin\\AppData\\Roaming\\Electron\\projects';
  const projectPath = path.join(productionProjectsPath, projectId);
  const configPath = path.join(projectPath, 'config.json');
  
  console.log('Expected project path:', projectPath);
  console.log('Expected config.json path:', configPath);
  
  // Wait a moment for file operations to complete
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  try {
    if (fs.existsSync(projectPath)) {
      console.log('\n✓ Project directory exists');
      
      // List project contents
      const projectContents = fs.readdirSync(projectPath, { recursive: true });
      console.log('Project contents:');
      projectContents.forEach(item => console.log('  -', item));
      
      if (fs.existsSync(configPath)) {
        console.log('\n🎉 SUCCESS: config.json was created!');
        
        try {
          const configContent = fs.readFileSync(configPath, 'utf8');
          const config = JSON.parse(configContent);
          
          console.log('\n=== Config.json Details ===');
          console.log('Scenes count:', config.scenes ? config.scenes.length : 0);
          console.log('Settings:', config.settings ? 'Present' : 'Missing');
          
          if (config.scenes && config.scenes.length > 0) {
            console.log('\nFirst scene details:');
            const firstScene = config.scenes[0];
            console.log('- ID:', firstScene.id);
            console.log('- Name:', firstScene.name);
            console.log('- Position:', firstScene.position);
            console.log('- North Offset:', firstScene.northOffset);
          }
          
          console.log('\nConfig preview (first 300 chars):');
          console.log(configContent.substring(0, 300) + '...');
          
        } catch (parseError) {
          console.log('\n⚠️ Config.json exists but has parsing error:', parseError.message);
        }
      } else {
        console.log('\n❌ FAILURE: config.json was NOT created');
        
        // Check if there's a config directory
        const configDir = path.join(projectPath, 'config');
        if (fs.existsSync(configDir)) {
          console.log('\nConfig directory exists, contents:');
          const configContents = fs.readdirSync(configDir);
          configContents.forEach(item => console.log('  -', item));
        } else {
          console.log('\nConfig directory does not exist');
        }
      }
    } else {
      console.log('\n❌ Project directory does not exist');
      
      // Check if the main projects directory exists
      if (fs.existsSync(productionProjectsPath)) {
        console.log('\nProduction projects directory exists, contents:');
        const projectsContents = fs.readdirSync(productionProjectsPath);
        projectsContents.forEach(item => console.log('  -', item));
      } else {
        console.log('\nProduction projects directory does not exist');
      }
    }
  } catch (error) {
    console.error('\nError checking project directory:', error.message);
  }
  
  console.log('\n=== Test Complete ===');
}

// Run the test
testUploadWithFixedDependencies().catch(console.error);