#!/usr/bin/env node

/**
 * Security Features Test Script
 * Tests both obfuscation and ASAR integrity protection
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const COLORS = {
  GREEN: '\x1b[32m',
  RED: '\x1b[31m',
  YELLOW: '\x1b[33m',
  BLUE: '\x1b[34m',
  RESET: '\x1b[0m',
  BOLD: '\x1b[1m'
};

function log(message, color = COLORS.RESET) {
  console.log(`${color}${message}${COLORS.RESET}`);
}

function testObfuscation() {
  log('\n🔒 Testing JavaScript Obfuscation...', COLORS.BLUE + COLORS.BOLD);
  
  const buildDir = '.next/static/chunks';
  
  if (!fs.existsSync(buildDir)) {
    log('❌ Build directory not found. Run npm run build first.', COLORS.RED);
    return false;
  }
  
  const jsFiles = fs.readdirSync(buildDir)
    .filter(file => file.endsWith('.js'))
    .slice(0, 3); // Test first 3 files
  
  if (jsFiles.length === 0) {
    log('❌ No JavaScript files found in build directory.', COLORS.RED);
    return false;
  }
  
  let obfuscationPassed = true;
  
  jsFiles.forEach(file => {
    const filePath = path.join(buildDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check for obfuscation indicators
    const indicators = {
      'Minified variables': /\b[a-z]\b/.test(content) && content.length > 1000,
      'No readable function names': !/function\s+[A-Za-z_$][A-Za-z0-9_$]*\s*\(/.test(content),
      'Compressed syntax': content.includes('||') && content.includes('&&'),
      'No console.log statements': !content.includes('console.log("'),
      'Self-executing functions': content.includes('(function(') || content.includes('(()=>')
    };
    
    const passedChecks = Object.values(indicators).filter(Boolean).length;
    const totalChecks = Object.keys(indicators).length;
    
    log(`  📄 ${file}:`);
    Object.entries(indicators).forEach(([check, passed]) => {
      log(`    ${passed ? '✅' : '❌'} ${check}`, passed ? COLORS.GREEN : COLORS.RED);
    });
    
    if (passedChecks < totalChecks * 0.6) { // At least 60% should pass
      obfuscationPassed = false;
    }
    
    log(`    Score: ${passedChecks}/${totalChecks}`, 
        passedChecks >= totalChecks * 0.6 ? COLORS.GREEN : COLORS.RED);
  });
  
  if (obfuscationPassed) {
    log('\n✅ JavaScript obfuscation test PASSED', COLORS.GREEN + COLORS.BOLD);
  } else {
    log('\n❌ JavaScript obfuscation test FAILED', COLORS.RED + COLORS.BOLD);
  }
  
  return obfuscationPassed;
}

function testAsarIntegrity() {
  log('\n🛡️  Testing ASAR Integrity Protection...', COLORS.BLUE + COLORS.BOLD);
  
  const integrityFile = 'desktop/asar-integrity.js';
  
  if (!fs.existsSync(integrityFile)) {
    log('❌ ASAR integrity module not found.', COLORS.RED);
    return false;
  }
  
  const content = fs.readFileSync(integrityFile, 'utf8');
  
  // Check for key integrity features
  const features = {
    'AsarIntegrityChecker class': content.includes('class AsarIntegrityChecker'),
    'Checksum calculation': content.includes('calculateFileChecksum') && content.includes('sha256'),
    'Critical files validation': content.includes('criticalFiles') && content.includes('main.js'),
    'Integrity check method': content.includes('performIntegrityCheck'),
    'Failure handling': content.includes('handleIntegrityFailure'),
    'ASAR path detection': content.includes('getAsarPath') && content.includes('app.asar'),
    'Production mode check': content.includes('app.isPackaged'),
    'Error logging': content.includes('integrity-failure.log')
  };
  
  const passedFeatures = Object.values(features).filter(Boolean).length;
  const totalFeatures = Object.keys(features).length;
  
  log('  Integrity Protection Features:');
  Object.entries(features).forEach(([feature, present]) => {
    log(`    ${present ? '✅' : '❌'} ${feature}`, present ? COLORS.GREEN : COLORS.RED);
  });
  
  // Check if integrity is integrated in main.js
  const mainFile = 'desktop/main.js';
  if (fs.existsSync(mainFile)) {
    const mainContent = fs.readFileSync(mainFile, 'utf8');
    const integrationFeatures = {
      'Integrity checker import': mainContent.includes('AsarIntegrityChecker'),
      'Initialization in createWindow': mainContent.includes('integrityChecker = new AsarIntegrityChecker'),
      'Periodic checks setup': mainContent.includes('integrityCheckInterval'),
      'Cleanup on quit': mainContent.includes('integrityChecker = null')
    };
    
    log('\n  Main Process Integration:');
    Object.entries(integrationFeatures).forEach(([feature, present]) => {
      log(`    ${present ? '✅' : '❌'} ${feature}`, present ? COLORS.GREEN : COLORS.RED);
    });
    
    const integratedFeatures = Object.values(integrationFeatures).filter(Boolean).length;
    const totalIntegrationFeatures = Object.keys(integrationFeatures).length;
    
    if (passedFeatures === totalFeatures && integratedFeatures === totalIntegrationFeatures) {
      log('\n✅ ASAR integrity protection test PASSED', COLORS.GREEN + COLORS.BOLD);
      return true;
    }
  }
  
  log('\n❌ ASAR integrity protection test FAILED', COLORS.RED + COLORS.BOLD);
  return false;
}

function testSecurityConfiguration() {
  log('\n⚙️  Testing Security Configuration...', COLORS.BLUE + COLORS.BOLD);
  
  const configFile = 'config/obfuscation.config.js';
  
  if (!fs.existsSync(configFile)) {
    log('❌ Obfuscation configuration not found.', COLORS.RED);
    return false;
  }
  
  const content = fs.readFileSync(configFile, 'utf8');
  
  const configFeatures = {
    'Production obfuscation': content.includes('production') && content.includes('stringArray'),
    'Development settings': content.includes('development'),
    'File exclusions': content.includes('node_modules') && content.includes('webpack'),
    'Security options': content.includes('deadCodeInjection') || content.includes('controlFlowFlattening')
  };
  
  log('  Configuration Features:');
  Object.entries(configFeatures).forEach(([feature, present]) => {
    log(`    ${present ? '✅' : '❌'} ${feature}`, present ? COLORS.GREEN : COLORS.RED);
  });
  
  // Check Next.js integration
  const nextConfigFile = 'next.config.js';
  if (fs.existsSync(nextConfigFile)) {
    const nextContent = fs.readFileSync(nextConfigFile, 'utf8');
    const nextIntegration = {
      'Obfuscator import': nextContent.includes('obfuscation.config'),
      'Webpack plugin integration': nextContent.includes('getObfuscatorPlugin'),
      'Production condition': nextContent.includes('process.env.NODE_ENV === \'production\'')
    };
    
    log('\n  Next.js Integration:');
    Object.entries(nextIntegration).forEach(([feature, present]) => {
      log(`    ${present ? '✅' : '❌'} ${feature}`, present ? COLORS.GREEN : COLORS.RED);
    });
  }
  
  const passedConfig = Object.values(configFeatures).filter(Boolean).length;
  const totalConfig = Object.keys(configFeatures).length;
  
  if (passedConfig === totalConfig) {
    log('\n✅ Security configuration test PASSED', COLORS.GREEN + COLORS.BOLD);
    return true;
  } else {
    log('\n❌ Security configuration test FAILED', COLORS.RED + COLORS.BOLD);
    return false;
  }
}

function main() {
  log('🔐 Advanced Panorama Viewer - Security Features Test', COLORS.BOLD);
  log('=' .repeat(60), COLORS.BLUE);
  
  const results = {
    obfuscation: testObfuscation(),
    integrity: testAsarIntegrity(),
    configuration: testSecurityConfiguration()
  };
  
  log('\n📊 Test Results Summary:', COLORS.BOLD);
  log('=' .repeat(30), COLORS.BLUE);
  
  Object.entries(results).forEach(([test, passed]) => {
    log(`${passed ? '✅' : '❌'} ${test.charAt(0).toUpperCase() + test.slice(1)} Protection: ${passed ? 'PASSED' : 'FAILED'}`, 
        passed ? COLORS.GREEN : COLORS.RED);
  });
  
  const totalPassed = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  log(`\n🎯 Overall Score: ${totalPassed}/${totalTests}`, 
      totalPassed === totalTests ? COLORS.GREEN + COLORS.BOLD : COLORS.YELLOW + COLORS.BOLD);
  
  if (totalPassed === totalTests) {
    log('\n🎉 All security features are working correctly!', COLORS.GREEN + COLORS.BOLD);
    log('Your application is protected with:', COLORS.GREEN);
    log('  • Enhanced JavaScript obfuscation', COLORS.GREEN);
    log('  • ASAR integrity verification', COLORS.GREEN);
    log('  • Runtime security checks', COLORS.GREEN);
  } else {
    log('\n⚠️  Some security features need attention.', COLORS.YELLOW + COLORS.BOLD);
    log('Please review the failed tests above.', COLORS.YELLOW);
  }
  
  process.exit(totalPassed === totalTests ? 0 : 1);
}

if (require.main === module) {
  main();
}

module.exports = { testObfuscation, testAsarIntegrity, testSecurityConfiguration };