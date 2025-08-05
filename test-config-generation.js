const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Test config.json generation
async function testConfigGeneration() {
  const serverUrl = 'http://localhost:3456';
  const projectId = 'test-project';
  
  console.log('Testing config.json generation...');
  
  // Create test CSV content with unique filenames and proper format
  const timestamp = Date.now();
  const csvContent = `filename,x,y,z,w,x_rot,y_rot,z_rot
test1_${timestamp}.jpg,0,0,0,1,0,0,0
test2_${timestamp}.jpg,5,0,0,0.707,0,0,0.707
test3_${timestamp}.jpg,10,0,0,0,0,0,1`;
  
  // Create test image (minimal valid JPEG)
  const testImageBuffer = Buffer.from('/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/wA==', 'base64');
  
  try {
    // Create form data
    const formData = new FormData();
    formData.append('csv', csvContent, {
      filename: 'pano-poses.csv',
      contentType: 'text/csv'
    });
    formData.append('images', testImageBuffer, {
      filename: `test1_${timestamp}.jpg`,
      contentType: 'image/jpeg'
    });
    formData.append('images', testImageBuffer, {
      filename: `test2_${timestamp}.jpg`, 
      contentType: 'image/jpeg'
    });
    formData.append('images', testImageBuffer, {
      filename: `test3_${timestamp}.jpg`,
      contentType: 'image/jpeg'
    });
    
    console.log('Uploading files to project:', projectId);
    
    // Send upload request
    const response = await fetch(`${serverUrl}/api/projects/${projectId}/upload`, {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Upload successful:', result.message);
      console.log('Script output:', result.scriptOutput);
      
      // Check if config.json was created
      const projectsPath = path.join(process.env.APPDATA || process.env.HOME, 'pano-app', 'projects');
      const configPath = path.join(projectsPath, projectId, 'config.json');
      
      if (fs.existsSync(configPath)) {
        console.log('✅ config.json generated successfully at:', configPath);
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        console.log('Config contains', config.scenes?.length || 0, 'scenes');
      } else {
        console.log('❌ config.json not found at:', configPath);
      }
    } else {
      console.log('❌ Upload failed:', result.error || result.message);
      console.log('Details:', result.details);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testConfigGeneration().catch(console.error);