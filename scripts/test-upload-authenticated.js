const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const axios = require('axios');

// Test credentials - using existing admin user
const TEST_EMAIL = 'zraib.med@gmail.com';
const TEST_PASSWORD = 'your_actual_password'; // You'll need to provide the actual password

async function authenticateAndTestUpload() {
  try {
    console.log('🔐 Authenticating user...');
    
    // Step 1: Login to get access token
    const loginResponse = await axios.post('http://localhost:3456/api/auth/login', {
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    }, {
      validateStatus: () => true // Don't throw on non-2xx status codes
    });
    
    console.log('Login response status:', loginResponse.status);
    
    if (loginResponse.status !== 200) {
      console.log('❌ Authentication failed:', loginResponse.data);
      console.log('Note: Make sure you have a test user with email:', TEST_EMAIL);
      return false;
    }
    
    console.log('✅ Authentication successful!');
    
    // Extract cookies from login response
    const cookies = loginResponse.headers['set-cookie'];
    if (!cookies) {
      console.log('❌ No cookies received from login');
      return false;
    }
    
    // Parse cookies to get access token
    let accessToken = null;
    let refreshToken = null;
    
    cookies.forEach(cookie => {
      if (cookie.startsWith('supabase-access-token=')) {
        accessToken = cookie.split(';')[0].split('=')[1];
      }
      if (cookie.startsWith('supabase-refresh-token=')) {
        refreshToken = cookie.split(';')[0].split('=')[1];
      }
    });
    
    if (!accessToken) {
      console.log('❌ No access token found in cookies');
      return false;
    }
    
    console.log('🎫 Access token obtained');
    
    // Step 2: Test upload with authentication
    const projectId = 'test-project-' + Date.now();
    console.log(`📤 Testing upload for project: ${projectId}`);
    
    // Create a simple test file
    const testContent = 'This is a test file for authenticated upload';
    const testFilePath = path.join(__dirname, 'test-file.txt');
    fs.writeFileSync(testFilePath, testContent);
    
    // Create form data
    const form = new FormData();
    form.append('files', fs.createReadStream(testFilePath), {
      filename: 'test-file.txt',
      contentType: 'text/plain'
    });
    form.append('type', 'panorama');
    
    // Make authenticated upload request
    const uploadResponse = await axios.post(`http://localhost:3456/api/projects/${projectId}/upload`, form, {
      headers: {
        ...form.getHeaders(),
        'Cookie': `supabase-access-token=${accessToken}; supabase-refresh-token=${refreshToken}`
      },
      validateStatus: () => true
    });
    
    console.log('Upload response status:', uploadResponse.status);
    console.log('Upload response headers:', uploadResponse.headers);
    
    const responseText = typeof uploadResponse.data === 'string' ? uploadResponse.data : JSON.stringify(uploadResponse.data);
    console.log('Upload response body:', responseText);
    
    if (uploadResponse.status >= 200 && uploadResponse.status < 300) {
      console.log('✅ Authenticated upload test successful!');
      try {
        const responseData = typeof uploadResponse.data === 'object' ? uploadResponse.data : JSON.parse(responseText);
        console.log('Parsed response:', responseData);
      } catch (e) {
        console.log('Response is not JSON');
      }
    } else {
      console.log('❌ Authenticated upload test failed');
      if (uploadResponse.status === 405) {
        console.log('Still getting 405 - this suggests the API route is not properly registered');
      }
    }
    
    // Cleanup
    fs.unlinkSync(testFilePath);
    
    return uploadResponse.status >= 200 && uploadResponse.status < 300;
    
  } catch (error) {
    console.error('Test error:', error.message);
    return false;
  }
}

if (require.main === module) {
  authenticateAndTestUpload().then(success => {
    console.log(success ? '🎉 Authenticated upload test PASSED' : '💔 Authenticated upload test FAILED');
    process.exit(success ? 0 : 1);
  });
}

module.exports = { authenticateAndTestUpload };