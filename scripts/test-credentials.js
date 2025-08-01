#!/usr/bin/env node

/**
 * Test script to verify credential server connectivity
 * Run with: node scripts/test-credentials.js
 */

const https = require('https');

const CREDENTIAL_SERVER_URL = 'https://panorama-credential-server-ind8d68x4-primezones-projects.vercel.app';
const API_SECRET = 'nuqf5CT6dXSLLcVD3NpVGZV3c6TvCg9jN7VwmflxJMJQTIPSAXvblENy2An3FXMZ';

async function testCredentialServer() {
  console.log('Testing credential server connectivity...');
  console.log('Server URL:', CREDENTIAL_SERVER_URL);
  
  return new Promise((resolve, reject) => {
    const url = new URL(CREDENTIAL_SERVER_URL);
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: '/api/credentials',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_SECRET}`,
        'User-Agent': 'PanoramaViewer-Desktop/1.0.0'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('Response status:', res.statusCode);
        console.log('Response headers:', res.headers);
        
        try {
          if (res.statusCode === 200) {
            const credentials = JSON.parse(data);
            console.log('✅ Credentials fetched successfully!');
            console.log('Supabase URL:', credentials.supabase?.url || 'Not found');
            console.log('Has Anon Key:', !!credentials.supabase?.anonKey);
            console.log('Has Service Key:', !!credentials.supabase?.serviceRoleKey);
            console.log('Version:', credentials.version);
            console.log('Last Updated:', credentials.lastUpdated);
            resolve(credentials);
          } else {
            console.log('❌ Failed to fetch credentials');
            console.log('Response body:', data);
            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          }
        } catch (error) {
          console.log('❌ Failed to parse response');
          console.log('Raw response:', data);
          reject(error);
        }
      });
    });
    
    req.on('error', (error) => {
      console.log('❌ Request failed:', error.message);
      reject(error);
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      console.log('❌ Request timeout');
      reject(new Error('Request timeout'));
    });
    
    req.end();
  });
}

// Test health endpoint first
async function testHealthEndpoint() {
  console.log('\nTesting health endpoint...');
  
  return new Promise((resolve, reject) => {
    const url = new URL(CREDENTIAL_SERVER_URL);
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: '/health',
      method: 'GET'
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('Health check status:', res.statusCode);
        if (res.statusCode === 200) {
          console.log('✅ Server is healthy');
          try {
            const health = JSON.parse(data);
            console.log('Health response:', health);
          } catch (e) {
            console.log('Health response (raw):', data);
          }
        } else {
          console.log('❌ Server health check failed');
          console.log('Response:', data);
        }
        resolve();
      });
    });
    
    req.on('error', (error) => {
      console.log('❌ Health check failed:', error.message);
      resolve(); // Don't fail the whole test
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      console.log('❌ Health check timeout');
      resolve();
    });
    
    req.end();
  });
}

// Run tests
async function runTests() {
  try {
    await testHealthEndpoint();
    await testCredentialServer();
    console.log('\n🎉 All tests completed successfully!');
  } catch (error) {
    console.error('\n💥 Test failed:', error.message);
    process.exit(1);
  }
}

runTests();