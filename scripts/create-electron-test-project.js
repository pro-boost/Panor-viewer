const fs = require('fs');
const path = require('path');
const os = require('os');

// Get the Electron user data path
const userDataPath = path.join(os.homedir(), 'AppData', 'Roaming', 'Electron');
const projectsPath = path.join(userDataPath, 'projects');
const testProjectId = 'test-project';
const testProjectPath = path.join(projectsPath, testProjectId);

console.log('Creating test project in Electron user data path:', testProjectPath);

// Create project directory structure
fs.mkdirSync(testProjectPath, { recursive: true });
fs.mkdirSync(path.join(testProjectPath, 'images'), { recursive: true });
fs.mkdirSync(path.join(testProjectPath, 'config'), { recursive: true });

// Create sample CSV data
const csvContent = `ID;filename;timestamp;pano_pos_x;pano_pos_y;pano_pos_z;pano_ori_w;pano_ori_x;pano_ori_y;pano_ori_z
0;00000-pano.jpg;1638362862.084862;0.0;0.0;0.0;1.0;0.0;0.0;0.0
1;00001-pano.jpg;1638362862.184862;5.0;0.0;0.0;0.707;0.0;0.707;0.0
2;00002-pano.jpg;1638362862.284862;5.0;5.0;0.0;0.0;0.0;1.0;0.0
3;00003-pano.jpg;1638362862.384862;0.0;5.0;0.0;-0.707;0.0;0.707;0.0`;

fs.writeFileSync(path.join(testProjectPath, 'config', 'pano-poses.csv'), csvContent);

// Create placeholder image files (small text files to simulate panorama images)
for (let i = 0; i < 4; i++) {
  const filename = `${i.toString().padStart(5, '0')}-pano.jpg`;
  // For testing, we'll create small text files instead of actual images
  fs.writeFileSync(path.join(testProjectPath, 'images', filename), `Test panorama image ${i}`);
}

console.log('Test project created successfully in Electron user data path!');
console.log('Project path:', testProjectPath);
console.log('CSV file:', path.join(testProjectPath, 'config', 'pano-poses.csv'));
console.log('\nNext steps:');
console.log('1. Set ELECTRON_PROJECTS_PATH environment variable');
console.log('2. Run configuration generation script');
console.log('3. Start the Electron app');