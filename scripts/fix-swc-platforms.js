const fs = require('fs');
const path = require('path');

/**
 * Fix Next.js SWC platform-specific dependencies issue
 * Creates placeholder directories and files for missing SWC platforms
 * This prevents build errors when electron-builder scans node_modules
 */
function fixSwcPlatforms() {
  console.log('🔧 Fixing Next.js SWC platform dependencies...');
  
  const nodeModulesPath = path.join(process.cwd(), 'node_modules', '@next');
  
  // List of SWC platforms that might be missing
  const swcPlatforms = [
    'swc-darwin-arm64',
    'swc-darwin-x64',
    'swc-linux-arm64-gnu',
    'swc-linux-arm64-musl',
    'swc-linux-x64-gnu',
    'swc-linux-x64-musl',
    'swc-win32-arm64-msvc',
    'swc-win32-ia32-msvc',
    'swc-win32-x64-msvc'
  ];
  
  let created = 0;
  
  swcPlatforms.forEach(platform => {
    const platformPath = path.join(nodeModulesPath, platform);
    
    if (!fs.existsSync(platformPath)) {
      try {
        // Create directory
        fs.mkdirSync(platformPath, { recursive: true });
        
        // Create package.json
        const packageJson = {
          name: `@next/${platform}`,
          version: "14.2.30",
          main: `next-swc.${platform.replace('swc-', '').replace('-', '.')}.node`,
          license: "MIT",
          description: "Placeholder for Next.js SWC platform-specific binary"
        };
        
        fs.writeFileSync(
          path.join(platformPath, 'package.json'),
          JSON.stringify(packageJson, null, 2)
        );
        
        // Create placeholder binary file
        const binaryName = `next-swc.${platform.replace('swc-', '').replace('-', '.')}.node`;
        fs.writeFileSync(
          path.join(platformPath, binaryName),
          '// Placeholder binary file for electron-builder compatibility'
        );
        
        created++;
        console.log(`✅ Created placeholder for ${platform}`);
      } catch (error) {
        console.warn(`⚠️ Failed to create ${platform}:`, error.message);
      }
    }
  });
  
  if (created > 0) {
    console.log(`🎉 Successfully created ${created} SWC platform placeholders`);
  } else {
    console.log('✅ All SWC platforms already exist');
  }
}

// Run if called directly
if (require.main === module) {
  fixSwcPlatforms();
}

module.exports = { fixSwcPlatforms };