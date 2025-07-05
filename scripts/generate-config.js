const { execSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

// Check if we're in a packaged Electron environment
function isPackagedElectron() {
  return process.versions && process.versions.electron && process.resourcesPath;
}

// Check if Python and numpy are available
function checkPythonDependencies() {
  const pythonCmd = os.platform() === 'win32' ? 'python' : 'python3';

  try {
    // Check Python
    execSync(`${pythonCmd} --version`, { stdio: 'pipe' });

    // Check numpy
    execSync(`${pythonCmd} -c "import numpy"`, { stdio: 'pipe' });

    return { available: true, pythonCmd };
  } catch (error) {
    return { available: false, error: error.message };
  }
}

// Generate a basic configuration as fallback
function generateBasicConfig() {
  console.log('Generating basic configuration without Python dependencies...');

  const csvPath = path.join('public', 'data', 'pano-poses.csv');

  if (!fs.existsSync(csvPath)) {
    throw new Error('CSV file not found at public/data/pano-poses.csv');
  }

  const csvContent = fs.readFileSync(csvPath, 'utf8');
  const lines = csvContent.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());

  const scenes = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const row = {};

    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });

    // Extract ID
    let id = row.ID || row.id || row.Id;
    if (!id && row.filename) {
      id = row.filename.split('-')[0];
    }
    if (!id) {
      id = String(i).padStart(5, '0');
    }

    const scene = {
      id: id,
      name: `Panorama ${id}`,
      floor: 0, // Default floor
      northOffset: 0,
      position: {
        x: parseFloat(row.pano_pos_x || 0),
        y: parseFloat(row.pano_pos_y || 0),
        z: parseFloat(row.pano_pos_z || 0),
      },
      orientation: {
        w: parseFloat(row.pano_ori_w || 1),
        x: parseFloat(row.pano_ori_x || 0),
        y: parseFloat(row.pano_ori_y || 0),
        z: parseFloat(row.pano_ori_z || 0),
      },
      levels: [
        { tileSize: 256, size: 256, fallbackOnly: true },
        { tileSize: 512, size: 512 },
        { tileSize: 512, size: 1024 },
        { tileSize: 512, size: 2048 },
      ],
      faceSize: 2048,
      initialViewParameters: {
        yaw: 0,
        pitch: 0,
        fov: 90,
      },
      linkHotspots: [], // Basic config without hotspots
      infoHotspots: [],
    };

    scenes.push(scene);
  }

  const config = {
    scenes: scenes,
    name: 'Panorama Tour',
    settings: {
      mouseViewMode: 'drag',
      autorotateEnabled: false,
      fullscreenButton: true,
      viewControlButtons: true,
    },
    viewer: {
      cameraToGroundOffset: 1.7,
      coordinateMode: 'standard',
      yawOffset: 0,
      pitchOffset: 0,
    },
  };

  fs.writeFileSync('public/config.json', JSON.stringify(config, null, 2));
  console.log(
    `Generated basic configuration with ${scenes.length} scenes (no hotspots)`
  );
  console.log(
    'Note: This is a simplified configuration. For full functionality with hotspots,'
  );
  console.log(
    'please install Python and numpy, then run the configuration generation again.'
  );
}

try {
  const pythonCheck = checkPythonDependencies();

  if (!pythonCheck.available) {
    console.warn('Python or numpy not available:', pythonCheck.error);

    if (isPackagedElectron()) {
      console.log(
        'Running in packaged Electron environment - using basic configuration...'
      );
      generateBasicConfig();
      return;
    } else {
      console.log(
        '\nTo enable full functionality with navigation hotspots, please install:'
      );
      console.log('1. Python 3.x');
      console.log('2. numpy: pip install numpy');
      console.log('\nFalling back to basic configuration...');
      generateBasicConfig();
      return;
    }
  }

  const pythonCmd = pythonCheck.pythonCmd;

  console.log('Generating panorama configuration with Python...');
  const output1 = execSync(
    `${pythonCmd} scripts/generate_marzipano_config.py`,
    {
      encoding: 'utf8',
      cwd: process.cwd(),
    }
  );
  console.log(output1);

  if (fs.existsSync('config.json')) {
    fs.renameSync('config.json', 'public/config.json');
    console.log('Configuration generated successfully at public/config.json');
  } else {
    throw new Error('config.json was not generated');
  }

  console.log('Calculating north offsets...');
  const output2 = execSync(`${pythonCmd} scripts/calculate_north_offsets.py`, {
    encoding: 'utf8',
    cwd: process.cwd(),
  });
  console.log(output2);

  console.log('North offsets calculated and applied successfully');
} catch (error) {
  console.error('Error in configuration process:', error.message);

  // If Python script fails, try basic config as fallback
  if (error.message.includes('python') || error.message.includes('numpy')) {
    console.log(
      '\nFalling back to basic configuration due to Python/numpy issues...'
    );
    try {
      generateBasicConfig();
    } catch (fallbackError) {
      console.error(
        'Fallback configuration also failed:',
        fallbackError.message
      );
      process.exit(1);
    }
  } else {
    process.exit(1);
  }
}
