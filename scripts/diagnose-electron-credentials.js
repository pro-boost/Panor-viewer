#!/usr/bin/env node

/**
 * Comprehensive diagnostic script for electron credential issues
 * This script simulates the exact credential flow used in the electron app
 * Run with: node scripts/diagnose-electron-credentials.js
 */

const https = require('https');
const path = require('path');
const fs = require('fs');

// Load credential config (same as electron app)
function loadCredentialConfig() {
  const configPath = path.join(__dirname, '../data/credential-config.json');
  
  console.log('Loading credential config from:', configPath);
  
  if (fs.existsSync(configPath)) {
    try {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      if (config.credentialServer) {
        return {
          url: config.credentialServer.url,
          apiSecret: config.credentialServer.apiSecret,
        };
      }
    } catch (error) {
      console.warn('Failed to load credential config:', error);
    }
  }
  
  return {
    url: process.env.CREDENTIAL_SERVER_URL,
    apiSecret: process.env.CREDENTIAL_API_SECRET,
  };
}

// Fetch credentials (same as electron app)
async function fetchCredentials(credentialConfig) {
  return new Promise((resolve, reject) => {
    const url = new URL(credentialConfig.url);
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: '/api/credentials',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${credentialConfig.apiSecret}`,
        'User-Agent': 'PanoramaViewer-Desktop/1.0.0'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          if (res.statusCode === 200) {
            const credentials = JSON.parse(data);
            resolve(credentials);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          }
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

// Validate Supabase credentials
function validateSupabaseCredentials(credentials) {
  const issues = [];
  
  if (!credentials.supabase) {
    issues.push('❌ Missing supabase object in credentials');
    return issues;
  }
  
  const { url, anonKey, serviceRoleKey } = credentials.supabase;
  
  // Check URL
  if (!url) {
    issues.push('❌ Missing Supabase URL');
  } else if (url === 'https://placeholder.supabase.co') {
    issues.push('❌ Supabase URL is still placeholder value');
  } else if (!url.includes('.supabase.co')) {
    issues.push(`⚠️  Supabase URL format looks unusual: ${url}`);
  } else {
    issues.push(`✅ Supabase URL looks valid: ${url}`);
  }
  
  // Check anon key
  if (!anonKey) {
    issues.push('❌ Missing Supabase anon key');
  } else if (anonKey === 'placeholder-anon-key') {
    issues.push('❌ Supabase anon key is still placeholder value');
  } else if (anonKey.length < 100) {
    issues.push(`⚠️  Supabase anon key seems too short (expected ~100+ chars): ${anonKey.length} chars`);
  } else {
    issues.push(`✅ Supabase anon key looks valid (length: ${anonKey.length} chars)`);
  }
  
  // Check service role key
  if (!serviceRoleKey) {
    issues.push('❌ Missing Supabase service role key');
  } else if (serviceRoleKey === 'placeholder-service-role-key') {
    issues.push('❌ Supabase service role key is still placeholder value');
  } else if (serviceRoleKey.length < 100) {
    issues.push(`⚠️  Supabase service role key seems too short (expected ~100+ chars): ${serviceRoleKey.length} chars`);
  } else {
    issues.push(`✅ Supabase service role key looks valid (length: ${serviceRoleKey.length} chars)`);
  }
  
  return issues;
}

// Test Supabase connectivity
async function testSupabaseConnectivity(credentials) {
  console.log('\n🔍 Testing Supabase connectivity...');
  
  if (!credentials.supabase || !credentials.supabase.url || !credentials.supabase.anonKey) {
    console.log('❌ Cannot test connectivity - missing credentials');
    return false;
  }
  
  return new Promise((resolve) => {
    const url = new URL(credentials.supabase.url);
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: '/rest/v1/',
      method: 'GET',
      headers: {
        'apikey': credentials.supabase.anonKey,
        'Authorization': `Bearer ${credentials.supabase.anonKey}`
      }
    };

    const req = https.request(options, (res) => {
      console.log('Supabase API response status:', res.statusCode);
      if (res.statusCode === 200 || res.statusCode === 404) {
        console.log('✅ Supabase API is reachable');
        resolve(true);
      } else {
        console.log('❌ Supabase API returned unexpected status:', res.statusCode);
        resolve(false);
      }
    });

    req.on('error', (error) => {
      console.log('❌ Supabase connectivity test failed:', error.message);
      resolve(false);
    });

    req.setTimeout(10000, () => {
      req.destroy();
      console.log('❌ Supabase connectivity test timeout');
      resolve(false);
    });

    req.end();
  });
}

// Simulate environment variable setup
function simulateEnvironmentSetup(credentials) {
  console.log('\n🔧 Simulating environment variable setup...');
  
  const env = {
    NEXT_PUBLIC_SUPABASE_URL: credentials.supabase.url,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: credentials.supabase.anonKey,
    SUPABASE_SERVICE_ROLE_KEY: credentials.supabase.serviceRoleKey,
  };
  
  console.log('Environment variables that would be set:');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', env.NEXT_PUBLIC_SUPABASE_URL);
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '[SET]' : '[MISSING]');
  console.log('SUPABASE_SERVICE_ROLE_KEY:', env.SUPABASE_SERVICE_ROLE_KEY ? '[SET]' : '[MISSING]');
  
  // Test isSupabaseConfigured logic
  const isConfigured = !!(env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  console.log('isSupabaseConfigured() would return:', isConfigured);
  
  return env;
}

// Main diagnostic function
async function runDiagnostics() {
  console.log('🔍 Starting Electron Credential Diagnostics...');
  console.log('=' .repeat(60));
  
  try {
    // Step 1: Load credential config
    console.log('\n📋 Step 1: Loading credential configuration...');
    const credentialConfig = loadCredentialConfig();
    console.log('Credential server URL:', credentialConfig.url);
    console.log('API secret configured:', !!credentialConfig.apiSecret);
    
    if (!credentialConfig.url || !credentialConfig.apiSecret) {
      console.log('❌ Credential configuration is incomplete!');
      return;
    }
    
    // Step 2: Fetch credentials
    console.log('\n📡 Step 2: Fetching credentials from server...');
    const credentials = await fetchCredentials(credentialConfig);
    console.log('✅ Credentials fetched successfully');
    console.log('Credential structure:', Object.keys(credentials));
    
    // Step 3: Validate credentials
    console.log('\n🔍 Step 3: Validating Supabase credentials...');
    const validationIssues = validateSupabaseCredentials(credentials);
    validationIssues.forEach(issue => console.log(issue));
    
    // Step 4: Test connectivity
    await testSupabaseConnectivity(credentials);
    
    // Step 5: Simulate environment setup
    const env = simulateEnvironmentSetup(credentials);
    
    // Step 6: Summary and recommendations
    console.log('\n📊 Summary and Recommendations:');
    console.log('=' .repeat(60));
    
    const hasErrors = validationIssues.some(issue => issue.includes('❌'));
    const hasWarnings = validationIssues.some(issue => issue.includes('⚠️'));
    
    if (!hasErrors && !hasWarnings) {
      console.log('✅ All checks passed! Credentials appear to be working correctly.');
      console.log('\n🤔 If the client still cannot access admin dashboard, the issue might be:');
      console.log('   1. Network connectivity issues on client machine');
      console.log('   2. Firewall blocking Supabase connections');
      console.log('   3. Timing issues during app startup');
      console.log('   4. User role/permission issues in Supabase');
      console.log('\n💡 Recommended next steps:');
      console.log('   1. Ask client to check browser dev tools for network errors');
      console.log('   2. Verify the admin user exists and has correct role in Supabase');
      console.log('   3. Check if client can access Supabase directly from their network');
    } else if (hasErrors) {
      console.log('❌ Critical issues found with credentials!');
      console.log('\n💡 Recommended fixes:');
      console.log('   1. Check your Vercel credential server configuration');
      console.log('   2. Verify Supabase project settings and API keys');
      console.log('   3. Ensure credential server is returning real Supabase values');
    } else {
      console.log('⚠️  Some warnings found, but credentials might still work.');
      console.log('\n💡 Monitor for any issues and consider addressing warnings.');
    }
    
  } catch (error) {
    console.error('\n💥 Diagnostic failed:', error.message);
    console.log('\n💡 This suggests the same error would occur in the electron app.');
    console.log('   Check network connectivity and credential server status.');
  }
}

// Run diagnostics
runDiagnostics();