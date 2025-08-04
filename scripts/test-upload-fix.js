const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testUpload() {
  console.log('🧪 Testing upload functionality with JSON generation...');
  
  const projectId = 'test-upload-fix';
  const projectDir = path.join('projects', projectId);
  
  // Clean up any existing test project
  if (fs.existsSync(projectDir)) {
    fs.rmSync(projectDir, { recursive: true, force: true });
    console.log('🗑️ Cleaned up existing test project');
  }
  
  // Create test CSV with simple format
  const csvContent = `id,filename,x,y,z,w,x_rot,y_rot,z_rot
00000,test-image.jpg,1.5,2.0,0.5,1,0,0,0
00001,test-image2.jpg,3.0,4.0,0.5,0.707,0,0,0.707`;
  
  // Create a simple test image (1x1 pixel)
  const testImageBuffer = Buffer.from('data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/wA==', 'base64');
  
  try {
    // Create form data
    const form = new FormData();
    form.append('csv', csvContent, {
      filename: 'pano-poses.csv',
      contentType: 'text/csv'
    });
    form.append('images', testImageBuffer, {
      filename: 'test-image.jpg',
      contentType: 'image/jpeg'
    });
    form.append('images', testImageBuffer, {
      filename: 'test-image2.jpg',
      contentType: 'image/jpeg'
    });
    form.append('deleteAll', 'true');
    
    console.log('📤 Uploading files to project:', projectId);
    
    // Make upload request
    const response = await fetch(`http://localhost:3456/api/projects/${projectId}/upload`, {
      method: 'POST',
      body: form,
      headers: form.getHeaders()
    });
    
    console.log('📊 Response status:', response.status);
    console.log('📊 Response headers:', response.headers.raw());
    
    const responseText = await response.text();
    console.log('📊 Raw response:', responseText);
    
    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.log('❌ JSON parse error:', parseError.message);
      console.log('❌ Response was not valid JSON:', responseText);
      return false;
    }
    
    if (response.ok) {
      console.log('✅ Upload successful!');
      console.log('📄 Response:', result.message);
      
      // Check if config.json was created
      const configPath = path.join(projectDir, 'config.json');
      if (fs.existsSync(configPath)) {
        console.log('🎯 config.json was generated successfully!');
        
        // Read and display config content
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        console.log('📊 Generated config has', config.scenes.length, 'scenes');
        console.log('🏢 Floors:', config.floors.length);
        
        return true;
      } else {
        console.log('❌ config.json was NOT generated');
        return false;
      }
    } else {
      console.log('❌ Upload failed:', result.error || result.message);
      return false;
    }
    
  } catch (error) {
    console.error('💥 Test failed with error:', error.message);
    return false;
  }
}

if (require.main === module) {
  testUpload().then(success => {
    console.log(success ? '🎉 Test PASSED' : '💔 Test FAILED');
    process.exit(success ? 0 : 1);
  });
}

module.exports = { testUpload };