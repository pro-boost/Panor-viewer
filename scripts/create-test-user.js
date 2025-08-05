const axios = require('axios');

// Test credentials
const TEST_EMAIL = 'admin@test.com';
const TEST_PASSWORD = 'testpassword123';

async function createTestUser() {
  try {
    console.log('🔧 Creating test user for authentication...');
    
    // First check if setup is needed
    const setupCheckResponse = await axios.get('http://localhost:3456/api/auth/setup', {
      validateStatus: () => true
    });
    
    console.log('Setup check response:', setupCheckResponse.status, setupCheckResponse.data);
    
    if (setupCheckResponse.data.hasUsers) {
      console.log('✅ Admin users already exist, test user should be available');
      return true;
    }
    
    // Create admin user via setup endpoint
    const setupResponse = await axios.post('http://localhost:3456/api/auth/setup', {
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      confirmPassword: TEST_PASSWORD
    }, {
      validateStatus: () => true
    });
    
    console.log('Setup response status:', setupResponse.status);
    console.log('Setup response data:', setupResponse.data);
    
    if (setupResponse.status === 201 || setupResponse.status === 409) {
      console.log('✅ Test user created or already exists');
      return true;
    } else {
      console.log('❌ Failed to create test user:', setupResponse.data);
      return false;
    }
    
  } catch (error) {
    console.error('Error creating test user:', error.message);
    return false;
  }
}

if (require.main === module) {
  createTestUser().then(success => {
    console.log(success ? '🎉 Test user setup COMPLETED' : '💔 Test user setup FAILED');
    process.exit(success ? 0 : 1);
  });
}

module.exports = { createTestUser, TEST_EMAIL, TEST_PASSWORD };