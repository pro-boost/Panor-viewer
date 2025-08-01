const fs = require('fs');
const path = require('path');

// Get the projects path from environment or use default
const projectsPath = process.env.ELECTRON_PROJECTS_PATH || 
                    process.env.PROJECTS_PATH || 
                    path.join(__dirname, 'projects');

const testProjectId = 'test-project';
const testProjectPath = path.join(projectsPath, testProjectId);

console.log('Creating test project at:', testProjectPath);

// Create project directory structure
fs.mkdirSync(testProjectPath, { recursive: true });
fs.mkdirSync(path.join(testProjectPath, 'images'), { recursive: true });
fs.mkdirSync(path.join(testProjectPath, 'data'), { recursive: true });

// Create sample CSV data
const csvContent = `ID;filename;timestamp;pano_pos_x;pano_pos_y;pano_pos_z;pano_ori_w;pano_ori_x;pano_ori_y;pano_ori_z
0;00000-pano.jpg;1638362862.084862;0.0;0.0;0.0;1.0;0.0;0.0;0.0
1;00001-pano.jpg;1638362862.184862;5.0;0.0;0.0;0.707;0.0;0.707;0.0
2;00002-pano.jpg;1638362862.284862;5.0;5.0;0.0;0.0;0.0;1.0;0.0
3;00003-pano.jpg;1638362862.384862;0.0;5.0;0.0;-0.707;0.0;0.707;0.0`;

fs.writeFileSync(path.join(testProjectPath, 'data', 'pano-poses.csv'), csvContent);

// Create placeholder image files (small SVG files to simulate panorama images)
const placeholderSVG = `<svg width="100" height="50" xmlns="http://www.w3.org/2000/svg">
  <rect width="100" height="50" fill="#4a90e2"/>
  <text x="50" y="30" text-anchor="middle" fill="white" font-family="Arial" font-size="12">Panorama</text>
</svg>`;

for (let i = 0; i < 4; i++) {
  const filename = `${i.toString().padStart(5, '0')}-pano.jpg`;
  // For testing, we'll create small text files instead of actual images
  fs.writeFileSync(path.join(testProjectPath, 'images', filename), `Test panorama image ${i}`);
}

console.log('Test project created successfully!');
console.log('Project path:', testProjectPath);
console.log('CSV file:', path.join(testProjectPath, 'data', 'pano-poses.csv'));
console.log('\nNext steps:');
console.log('1. Run: node scripts/node/generate-config.js --project test-project');
console.log('2. Check the generated config.json file');
console.log('3. Start the Electron app and navigate to the test project');