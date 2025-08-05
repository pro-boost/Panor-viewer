const FormData = require('form-data');
const fs = require('fs');
const http = require('http');

console.log('🔍 Debug upload endpoint response...');

// Create test CSV content with correct column names (simple format)
const csvContent = `filename,x,y,z,w,x_rot,y_rot,z_rot
test1.jpg,0,0,0,1,0,0,0
test2.jpg,1,0,0,0.707,0,0.707,0
test3.jpg,2,0,0,0.5,0.5,0.5,0.5`;

// Create minimal JPEG test files
const jpegHeader = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46]);
const jpegFooter = Buffer.from([0xFF, 0xD9]);
const minimalJpeg = Buffer.concat([jpegHeader, Buffer.alloc(100, 0x00), jpegFooter]);

const projectId = `test-debug-${Date.now()}`;
console.log(`📁 Project ID: ${projectId}`);

// Create form data
const form = new FormData();
form.append('csv', csvContent, { filename: 'pano-poses.csv' });
form.append('images', minimalJpeg, { filename: 'test1.jpg' });
form.append('images', minimalJpeg, { filename: 'test2.jpg' });
form.append('images', minimalJpeg, { filename: 'test3.jpg' });

// Make request
const options = {
  hostname: 'localhost',
  port: 3456,
  path: `/api/projects/${projectId}/upload`,
  method: 'POST',
  headers: form.getHeaders()
};

const req = http.request(options, (res) => {
  console.log(`📤 Response status: ${res.statusCode}`);
  console.log(`📋 Response headers:`, res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('📄 Raw response:');
    console.log(data);
    
    try {
      const jsonResponse = JSON.parse(data);
      console.log('✅ Parsed JSON response:');
      console.log(JSON.stringify(jsonResponse, null, 2));
    } catch (e) {
      console.log('❌ Response is not valid JSON');
      console.log('First 500 chars:', data.substring(0, 500));
    }
    
    process.exit(res.statusCode === 200 ? 0 : 1);
  });
});

req.on('error', (e) => {
  console.error('❌ Request error:', e.message);
  process.exit(1);
});

form.pipe(req);