const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const axios = require('axios');

async function testUpload() {
  try {
    console.log('Testing upload endpoint...');
    
    // First, let's test if we can create a project
    const projectId = 'test-project-' + Date.now();
    console.log(`Using project ID: ${projectId}`);
    
    // Create a test CSV file
    const testContent = 'name,description,latitude,longitude\nTest Point 1,A test panorama point,40.7128,-74.0060\nTest Point 2,Another test point,40.7589,-73.9851';
    const testFilePath = path.join(__dirname, 'test-file.csv');
    fs.writeFileSync(testFilePath, testContent);
    
    // Create a simple test image file (minimal JPEG header)
    const testImagePath = path.join(__dirname, 'test-image.jpg');
    const jpegHeader = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46]);
    fs.writeFileSync(testImagePath, jpegHeader);
    
    // Create form data
    const form = new FormData();
    form.append('csv', fs.createReadStream(testFilePath), {
      filename: 'test-file.csv',
      contentType: 'text/csv'
    });
    form.append('images', fs.createReadStream(testImagePath), {
      filename: 'test-image.jpg',
      contentType: 'image/jpeg'
    });
    form.append('type', 'panorama');
    
    console.log('Sending upload request...');
    const response = await axios.post(`http://localhost:3456/api/projects/${projectId}/upload`, form, {
      headers: form.getHeaders(),
      validateStatus: () => true // Don't throw on non-2xx status codes
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    
    const responseText = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
    console.log('Response body:', responseText);
    
    if (response.status >= 200 && response.status < 300) {
      console.log('✅ Upload test successful!');
      try {
        const responseData = typeof response.data === 'object' ? response.data : JSON.parse(responseText);
        console.log('Parsed response:', responseData);
      } catch (e) {
        console.log('Response is not JSON');
      }
    } else {
      console.log('❌ Upload test failed');
    }
    
    // Cleanup
    fs.unlinkSync(testFilePath);
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
    }
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

testUpload();