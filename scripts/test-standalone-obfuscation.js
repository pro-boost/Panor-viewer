#!/usr/bin/env node

/**
 * Test script for standalone obfuscation functionality
 * This script can be used to test the obfuscation of extraResources independently
 */

const fs = require('fs');
const path = require('path');
const standaloneObfuscator = require('./electron/obfuscate-standalone');

/**
 * Test configuration
 */
const testConfig = {
  // Test directory paths (adjust these based on your actual build output)
  testPaths: [
    path.join(__dirname, '..', 'dist', 'mac-arm64', 'Advanced Panorama Viewer.app', 'Contents', 'Resources', 'standalone'),
    path.join(__dirname, '..', 'dist', 'win-unpacked', 'resources', 'standalone'),
    path.join(__dirname, '..', 'dist', 'linux-unpacked', 'resources', 'standalone')
  ],
  
  // Create a test directory with sample JS files
  createTestDir: path.join(__dirname, '..', 'test-obfuscation')
};

/**
 * Create test files for obfuscation testing
 */
function createTestFiles() {
  const testDir = testConfig.createTestDir;
  const scriptsNodeDir = path.join(testDir, 'scripts', 'node');
  
  // Create directories
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }
  if (!fs.existsSync(scriptsNodeDir)) {
    fs.mkdirSync(scriptsNodeDir, { recursive: true });
  }
  
  // Create test JavaScript files
  const testFiles = {
    [path.join(scriptsNodeDir, 'test-config.js')]: `
// Test configuration file
const config = {
  apiKey: 'test-api-key-12345',
  secretToken: 'super-secret-token',
  databaseUrl: 'mongodb://localhost:27017/testdb',
  features: {
    enableLogging: true,
    debugMode: false,
    maxRetries: 3
  }
};

function getConfig() {
  return config;
}

function validateConfig(userConfig) {
  if (!userConfig.apiKey) {
    throw new Error('API key is required');
  }
  return true;
}

module.exports = {
  getConfig,
  validateConfig,
  config
};
`,
    
    [path.join(scriptsNodeDir, 'test-utils.js')]: `
// Test utility functions
const crypto = require('crypto');

class TestUtils {
  static generateHash(data) {
    return crypto.createHash('sha256').update(data).digest('hex');
  }
  
  static validateInput(input) {
    if (typeof input !== 'string' || input.length === 0) {
      return false;
    }
    return true;
  }
  
  static processData(data) {
    const processed = data.map(item => {
      return {
        id: item.id,
        name: item.name.toUpperCase(),
        hash: this.generateHash(item.name)
      };
    });
    return processed;
  }
}

function helperFunction(param1, param2) {
  const result = param1 + param2;
  console.log('Processing:', result);
  return result;
}

module.exports = {
  TestUtils,
  helperFunction
};
`,
    
    [path.join(testDir, 'main-test.js')]: `
// Main test file
const { TestUtils } = require('./scripts/node/test-utils');
const { getConfig } = require('./scripts/node/test-config');

function main() {
  console.log('Starting test application...');
  
  const config = getConfig();
  console.log('Loaded configuration:', config.features);
  
  const testData = [
    { id: 1, name: 'test1' },
    { id: 2, name: 'test2' }
  ];
  
  const processed = TestUtils.processData(testData);
  console.log('Processed data:', processed);
}

if (require.main === module) {
  main();
}

module.exports = { main };
`
  };
  
  // Write test files
  for (const [filePath, content] of Object.entries(testFiles)) {
    fs.writeFileSync(filePath, content.trim(), 'utf8');
    console.log(`✅ Created test file: ${filePath}`);
  }
  
  return testDir;
}

/**
 * Clean up test files
 */
function cleanupTestFiles() {
  const testDir = testConfig.createTestDir;
  if (fs.existsSync(testDir)) {
    fs.rmSync(testDir, { recursive: true, force: true });
    console.log(`🧹 Cleaned up test directory: ${testDir}`);
  }
}

/**
 * Test the obfuscation functionality
 */
async function testObfuscation() {
  console.log('🧪 Starting standalone obfuscation test...\n');
  
  try {
    // Create test files
    console.log('📁 Creating test files...');
    const testDir = createTestFiles();
    
    // Test obfuscation
    console.log('\n🔒 Testing obfuscation...');
    await standaloneObfuscator.obfuscateStandaloneResources([testDir]);
    
    // Verify obfuscation results
    console.log('\n🔍 Verifying obfuscation results...');
    const scriptsNodeDir = path.join(testDir, 'scripts', 'node');
    const jsFiles = standaloneObfuscator.findJavaScriptFiles(scriptsNodeDir);
    
    for (const filePath of jsFiles) {
      const obfuscatedContent = fs.readFileSync(filePath, 'utf8');
      const backupPath = filePath + '.original';
      
      if (fs.existsSync(backupPath)) {
        const originalContent = fs.readFileSync(backupPath, 'utf8');
        
        console.log(`\n📄 File: ${path.basename(filePath)}`);
        console.log(`   Original size: ${originalContent.length} characters`);
        console.log(`   Obfuscated size: ${obfuscatedContent.length} characters`);
        console.log(`   Contains readable strings: ${obfuscatedContent.includes('apiKey') ? '❌ Yes' : '✅ No'}`);
        console.log(`   Backup created: ${fs.existsSync(backupPath) ? '✅ Yes' : '❌ No'}`);
      }
    }
    
    console.log('\n✅ Obfuscation test completed successfully!');
    
  } catch (error) {
    console.error('❌ Obfuscation test failed:', error.message);
    throw error;
  }
}

/**
 * Test with actual build directories
 */
async function testWithBuildDirs() {
  console.log('\n🏗️  Testing with actual build directories...');
  
  const existingDirs = testConfig.testPaths.filter(dir => fs.existsSync(dir));
  
  if (existingDirs.length === 0) {
    console.log('ℹ️  No existing build directories found. Run a build first.');
    return;
  }
  
  console.log(`Found ${existingDirs.length} build directories:`);
  existingDirs.forEach(dir => console.log(`  - ${dir}`));
  
  try {
    await standaloneObfuscator.obfuscateStandaloneResources(existingDirs);
    console.log('✅ Build directory obfuscation completed!');
  } catch (error) {
    console.error('❌ Build directory obfuscation failed:', error.message);
  }
}

/**
 * Main test function
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'test';
  
  try {
    switch (command) {
      case 'test':
        await testObfuscation();
        break;
        
      case 'build':
        await testWithBuildDirs();
        break;
        
      case 'cleanup':
        cleanupTestFiles();
        break;
        
      case 'all':
        await testObfuscation();
        await testWithBuildDirs();
        break;
        
      default:
        console.log('Usage: node test-standalone-obfuscation.js [test|build|cleanup|all]');
        console.log('  test    - Create test files and test obfuscation');
        console.log('  build   - Test obfuscation on actual build directories');
        console.log('  cleanup - Remove test files');
        console.log('  all     - Run both test and build commands');
        break;
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  } finally {
    // Always cleanup test files unless specifically testing
    if (command === 'test' || command === 'all') {
      setTimeout(() => {
        cleanupTestFiles();
      }, 1000);
    }
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  testObfuscation,
  testWithBuildDirs,
  createTestFiles,
  cleanupTestFiles
};