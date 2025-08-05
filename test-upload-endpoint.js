const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const FormData = require('form-data');
const fs = require('fs');

// Test the upload endpoint directly
async function testUploadEndpoint() {
  console.log('Testing upload endpoint directly...');
  
  const timestamp = Date.now();
  const projectId = 'test-endpoint';
  
  // Create test CSV content with proper format
  const csvContent = `filename,x,y,z,w,x_rot,y_rot,z_rot
test1_${timestamp}.jpg,0,0,0,1,0,0,0
test2_${timestamp}.jpg,5,0,0,0.707,0,0,0.707
test3_${timestamp}.jpg,10,0,0,0,0,0,1`;
  
  // Create minimal JPEG header
  const jpegHeader = Buffer.from([
    0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
    0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xFF, 0xD9
  ]);
  
  try {
    const formData = new FormData();
    formData.append('projectId', projectId);
    formData.append('pano-poses.csv', csvContent, {
      filename: 'pano-poses.csv',
      contentType: 'text/csv'
    });
    
    // Add test images
    formData.append(`test1_${timestamp}.jpg`, jpegHeader, {
      filename: `test1_${timestamp}.jpg`,
      contentType: 'image/jpeg'
    });
    formData.append(`test2_${timestamp}.jpg`, jpegHeader, {
      filename: `test2_${timestamp}.jpg`,
      contentType: 'image/jpeg'
    });
    formData.append(`test3_${timestamp}.jpg`, jpegHeader, {
      filename: `test3_${timestamp}.jpg`,
      contentType: 'image/jpeg'
    });
    
    console.log('Sending upload request...');
    
    const response = await fetch('http://localhost:3456/api/upload', {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders()
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('Response body:', responseText);
    
    if (response.ok) {
      try {
        const result = JSON.parse(responseText);
        console.log('✅ Upload successful!');
        console.log('Result:', result);
        return true;
      } catch (e) {
        console.log('✅ Upload successful (non-JSON response)');
        return true;
      }
    } else {
      console.log('❌ Upload failed');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Upload error:', error.message);
    return false;
  }
}

// Run the test
testUploadEndpoint().then(success => {
  console.log('Test completed:', success ? 'SUCCESS' : 'FAILED');
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('Test failed with error:', error);
  process.exit(1);
});