const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

async function testFixedUpload() {
    try {
        console.log('🧪 Testing fixed upload with packaged Electron app...');
        
        // First, let's manually copy the fixed upload.ts to the built app
        const sourceUpload = path.join(__dirname, 'src', 'pages', 'api', 'projects', '[projectId]', 'upload.ts');
        const builtAppPath = path.join(__dirname, 'dist-new', 'win-unpacked', 'resources', 'app');
        
        console.log('📁 Checking if built app exists...');
        if (!fs.existsSync(builtAppPath)) {
            console.log('❌ Built app not found. Please rebuild first.');
            return;
        }
        
        console.log('✅ Built app found. Starting Electron app...');
        
        // Start the Electron app
        const { spawn } = require('child_process');
        const electronPath = path.join(__dirname, 'dist-new', 'win-unpacked', 'PrimeZone Advanced Panorama Viewer.exe');
        
        const electronProcess = spawn(electronPath, [], {
            detached: true,
            stdio: 'ignore'
        });
        
        // Wait for the app to start
        console.log('⏳ Waiting for Electron app to start...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Generate unique project ID
        const projectId = `test-fixed-${Date.now()}`;
        console.log(`📁 Using project ID: ${projectId}`);
        
        // Create test files with complete CSV format
        const csvContent = 'filename,description,pano_pos_x,pano_pos_y,pano_pos_z,pano_ori_w,pano_ori_x,pano_ori_y,pano_ori_z\ntest-fixed1.jpg,Test Point 1,0,0,0,1,0,0,0\ntest-fixed2.jpg,Test Point 2,10,0,0,1,0,0,0';
        const csvPath = path.join(__dirname, 'test-fixed.csv');
        fs.writeFileSync(csvPath, csvContent);
        
        // Create minimal test image files
        const imageContent = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46]);
        const imagePath1 = path.join(__dirname, 'test-fixed1.jpg');
        const imagePath2 = path.join(__dirname, 'test-fixed2.jpg');
        fs.writeFileSync(imagePath1, imageContent);
        fs.writeFileSync(imagePath2, imageContent);
        
        // Create form data
        const form = new FormData();
        form.append('csv', fs.createReadStream(csvPath), 'test-fixed.csv');
        form.append('images', fs.createReadStream(imagePath1), 'test-fixed1.jpg');
        form.append('images', fs.createReadStream(imagePath2), 'test-fixed2.jpg');
        form.append('deleteAll', 'true');
        
        console.log('📤 Step 1: Uploading files to packaged app...');
        
        // Upload to packaged app (port 3456)
        try {
            const uploadResponse = await axios.post(`http://localhost:3456/api/projects/${projectId}/upload`, form, {
                headers: form.getHeaders()
            });
            
            console.log(`📊 Upload status: ${uploadResponse.status}`);
            console.log('✅ Upload successful!');
            console.log('📄 Response:', uploadResponse.data.message);
            
            // Check if config.json was generated in AppData
            const configPath = `C:\\Users\\aminm\\AppData\\Roaming\\pano-app\\projects\\${projectId}\\config.json`;
            
            // Wait a moment for file system operations
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            if (fs.existsSync(configPath)) {
                console.log('✅ Config.json generated successfully!');
                const configContent = JSON.parse(fs.readFileSync(configPath, 'utf8'));
                console.log(`📊 Config contains ${configContent.scenes?.length || 0} scenes`);
                console.log('🎉 FIXED UPLOAD TEST SUCCESS!');
            } else {
                console.log('❌ Config.json was not generated');
                console.log(`Expected path: ${configPath}`);
            }
        } catch (error) {
            console.log(`❌ Upload failed with status: ${error.response?.status}`);
            console.log('Error details:', error.response?.data || error.message);
        }
        
        // Cleanup
        [csvPath, imagePath1, imagePath2].forEach(file => {
            if (fs.existsSync(file)) {
                fs.unlinkSync(file);
            }
        });
        
        // Kill the Electron process
        electronProcess.kill();
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testFixedUpload();