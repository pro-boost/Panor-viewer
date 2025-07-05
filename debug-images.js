const fs = require('fs');
const path = require('path');

// Debug script to check image files and naming patterns
function debugImageFiles() {
  const imagesDir = path.join(__dirname, 'public', 'images');

  console.log('=== IMAGE DEBUG REPORT ===');
  console.log(`Checking directory: ${imagesDir}`);

  if (!fs.existsSync(imagesDir)) {
    console.error('Images directory does not exist!');
    return;
  }

  const files = fs.readdirSync(imagesDir);
  console.log(`\nTotal files found: ${files.length}`);

  // Filter panorama images
  const panoFiles = files.filter(file => file.includes('-pano.jpg'));
  console.log(`Panorama files found: ${panoFiles.length}`);

  // Extract scene IDs
  const sceneIds = panoFiles.map(file => file.replace('-pano.jpg', ''));

  console.log('\n=== SCENE ID ANALYSIS ===');
  console.log('Scene IDs found:', sceneIds.slice(0, 10), '...'); // Show first 10

  // Check specific scenes mentioned in the issue
  const testScenes = ['0', '41', '227'];
  console.log('\n=== SPECIFIC SCENE CHECK ===');

  testScenes.forEach(sceneId => {
    const filename = `${sceneId}-pano.jpg`;
    const exists = files.includes(filename);
    const fullPath = path.join(imagesDir, filename);

    console.log(`Scene ${sceneId}:`);
    console.log(`  - File: ${filename}`);
    console.log(`  - Exists: ${exists}`);

    if (exists) {
      const stats = fs.statSync(fullPath);
      console.log(`  - Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
      console.log(`  - Modified: ${stats.mtime}`);
    }
    console.log('');
  });

  // Check for naming patterns
  console.log('=== NAMING PATTERN ANALYSIS ===');
  const patterns = {
    numeric: /^\d+-pano\.jpg$/,
    padded: /^\d{3,}-pano\.jpg$/,
    mixed: /^[a-zA-Z0-9]+-pano\.jpg$/,
  };

  Object.entries(patterns).forEach(([name, pattern]) => {
    const matches = panoFiles.filter(file => pattern.test(file));
    console.log(`${name} pattern matches: ${matches.length}`);
  });

  // Check for potential issues
  console.log('\n=== POTENTIAL ISSUES ===');

  // Check for files without proper extension
  const nonJpgPanos = files.filter(
    file => file.includes('pano') && !file.endsWith('.jpg')
  );
  if (nonJpgPanos.length > 0) {
    console.log('Files with "pano" but not .jpg extension:', nonJpgPanos);
  }

  // Check for very small files (potentially corrupted)
  const smallFiles = [];
  panoFiles.forEach(file => {
    const fullPath = path.join(imagesDir, file);
    const stats = fs.statSync(fullPath);
    if (stats.size < 100000) {
      // Less than 100KB
      smallFiles.push({ file, size: stats.size });
    }
  });

  if (smallFiles.length > 0) {
    console.log('Suspiciously small files (< 100KB):');
    smallFiles.forEach(({ file, size }) => {
      console.log(`  - ${file}: ${size} bytes`);
    });
  }

  console.log('\n=== DEBUG COMPLETE ===');
}

// Run the debug
debugImageFiles();
