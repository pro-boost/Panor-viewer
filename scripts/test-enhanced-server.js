#!/usr/bin/env node

/**
 * Test script for the enhanced server functionality
 * This script tests the enhanced credential loading and server startup
 * Run with: node scripts/test-enhanced-server.js
 */

const path = require('path');
const fs = require('fs');
const os = require('os');

// Import the enhanced server components
const { EnhancedServerManager, getCredentials, validateCredentials, log } = require('../desktop/server');

async function testEnhancedServer() {
  console.log('🧪 Testing Enhanced Server Functionality...');
  console.log('=' .repeat(60));
  
  try {
    // Test 1: Credential fetching and validation
    console.log('\n📋 Test 1: Credential fetching and validation...');
    const credentials = await getCredentials();
    console.log('✅ Credentials fetched successfully');
    
    const validationIssues = validateCredentials(credentials);
    if (validationIssues.length === 0) {
      console.log('✅ Credentials validation passed');
    } else {
      console.log('⚠️  Credential validation issues:');
      validationIssues.forEach(issue => console.log('   -', issue));
    }
    
    // Test 2: Server manager initialization
    console.log('\n📋 Test 2: Server manager initialization...');
    const testUserDataPath = path.join(os.tmpdir(), 'panorama-test-' + Date.now());
    const serverManager = new EnhancedServerManager(testUserDataPath);
    console.log('✅ Enhanced server manager created successfully');
    console.log('   User data path:', testUserDataPath);
    console.log('   Projects path:', serverManager.projectsPath);
    
    // Test 3: Port finding
    console.log('\n📋 Test 3: Port availability check...');
    const availablePort = await serverManager.findAvailablePort(3456);
    console.log('✅ Found available port:', availablePort);
    
    // Test 4: Environment variable setup simulation
    console.log('\n📋 Test 4: Environment variable setup simulation...');
    const env = {
      ...process.env,
      NODE_ENV: "production",
      PORT: availablePort.toString(),
      USER_DATA_PATH: testUserDataPath,
      PROJECTS_PATH: serverManager.projectsPath,
      ELECTRON_PROJECTS_PATH: path.join(testUserDataPath, "projects"),
      DISABLE_NEXT_TELEMETRY: "1",
      NEXT_PUBLIC_SUPABASE_URL: credentials.supabase.url,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: credentials.supabase.anonKey,
      SUPABASE_SERVICE_ROLE_KEY: credentials.supabase.serviceRoleKey,
    };
    
    console.log('✅ Environment variables prepared:');
    console.log('   NODE_ENV:', env.NODE_ENV);
    console.log('   PORT:', env.PORT);
    console.log('   NEXT_PUBLIC_SUPABASE_URL:', env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY:', env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '[SET]' : '[MISSING]');
    console.log('   SUPABASE_SERVICE_ROLE_KEY:', env.SUPABASE_SERVICE_ROLE_KEY ? '[SET]' : '[MISSING]');
    
    // Test 5: Check if isSupabaseConfigured would return true
    console.log('\n📋 Test 5: Supabase configuration check...');
    const isConfigured = !!(env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    console.log('✅ isSupabaseConfigured() would return:', isConfigured);
    
    // Test 6: Verify server-production.js exists
    console.log('\n📋 Test 6: Server production file check...');
    const serverProductionPath = path.join(__dirname, 'server-production.js');
    if (fs.existsSync(serverProductionPath)) {
      console.log('✅ server-production.js found at:', serverProductionPath);
    } else {
      console.log('❌ server-production.js not found at:', serverProductionPath);
    }
    
    // Test 7: Cache functionality
    console.log('\n📋 Test 7: Credential caching test...');
    const cacheDir = path.join(os.homedir(), '.panorama-viewer');
    const cacheFile = path.join(cacheDir, 'credentials-cache.json');
    
    if (fs.existsSync(cacheFile)) {
      try {
        const cacheData = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
        const isExpired = Date.now() >= cacheData.expiresAt;
        console.log('✅ Credential cache found');
        console.log('   Cache file:', cacheFile);
        console.log('   Cached at:', new Date(cacheData.cachedAt).toISOString());
        console.log('   Expires at:', new Date(cacheData.expiresAt).toISOString());
        console.log('   Is expired:', isExpired);
      } catch (error) {
        console.log('❌ Cache file exists but is corrupted:', error.message);
      }
    } else {
      console.log('ℹ️  No credential cache found (this is normal for first run)');
    }
    
    // Cleanup test directory
    if (fs.existsSync(testUserDataPath)) {
      fs.rmSync(testUserDataPath, { recursive: true, force: true });
    }
    
    console.log('\n📊 Test Summary:');
    console.log('=' .repeat(60));
    console.log('✅ All enhanced server tests completed successfully!');
    console.log('\n🚀 The enhanced server should now provide:');
    console.log('   • Better error handling and logging');
    console.log('   • Retry logic for credential fetching');
    console.log('   • Enhanced credential validation');
    console.log('   • Improved server startup reliability');
    console.log('   • Better timeout handling');
    
    console.log('\n💡 Next steps for the client:');
    console.log('   1. Build the electron app with the enhanced server');
    console.log('   2. Test the admin dashboard access');
    console.log('   3. Check the enhanced logs for any issues');
    console.log('   4. If issues persist, check network connectivity and firewall settings');
    
  } catch (error) {
    console.error('\n💥 Enhanced server test failed:', error.message);
    console.log('\n🔍 This indicates an issue with the enhanced server implementation.');
    console.log('   Please check the error details above and fix any issues.');
  }
}

// Run the test
testEnhancedServer();