const fs = require('fs');
const path = require('path');

try {
  const configPath = path.join('dist/mac-arm64/Advanced Panorama Viewer.app/Contents/Resources/app.asar', 'data', 'credential-config.json');
  console.log('Testing path:', configPath);
  const configData = fs.readFileSync(configPath, 'utf8');
  const config = JSON.parse(configData);
  console.log('✓ Config loaded successfully from ASAR');
  console.log('Has credentialServer:', !!config.credentialServer);
  console.log('Has offlineMode:', !!config.offlineMode);
} catch(e) {
  console.log('✗ Error:', e.message);
}