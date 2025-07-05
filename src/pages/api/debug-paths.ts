import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get base path using same logic as upload API
    let basePath = process.cwd();
    
    // Check if we're in an Electron environment
    const isElectron = !!(process.versions && process.versions.electron);
    let electronResourcesPath = null;
    
    if (isElectron) {
      const electronProcess = process as any;
      if (electronProcess.resourcesPath) {
        electronResourcesPath = electronProcess.resourcesPath;
        const resourcesPath = path.join(electronProcess.resourcesPath, 'app');
        if (fs.existsSync(resourcesPath)) {
          basePath = resourcesPath;
        }
      }
    }
    
    const publicDir = path.join(basePath, 'public');
    const imagesDir = path.join(publicDir, 'images');
    const dataDir = path.join(publicDir, 'data');
    
    // Check directory existence
    const publicExists = fs.existsSync(publicDir);
    const imagesExists = fs.existsSync(imagesDir);
    const dataExists = fs.existsSync(dataDir);
    
    // Count files in directories
    let imageCount = 0;
    let dataFiles: string[] = [];
    
    if (imagesExists) {
      try {
        const imageFiles = fs.readdirSync(imagesDir);
        imageCount = imageFiles.filter(file => {
          const ext = path.extname(file).toLowerCase();
          return ['.jpg', '.jpeg', '.png', '.gif'].includes(ext);
        }).length;
      } catch (error) {
        console.warn('Error reading images directory:', error);
      }
    }
    
    if (dataExists) {
      try {
        dataFiles = fs.readdirSync(dataDir);
      } catch (error) {
        console.warn('Error reading data directory:', error);
      }
    }
    
    res.status(200).json({
      environment: {
        isElectron,
        nodeVersion: process.version,
        platform: process.platform,
        electronVersion: process.versions?.electron || null
      },
      paths: {
        cwd: process.cwd(),
        basePath,
        electronResourcesPath,
        publicDir,
        imagesDir,
        dataDir
      },
      directories: {
        publicExists,
        imagesExists,
        dataExists
      },
      content: {
        imageCount,
        dataFiles
      }
    });
    
  } catch (error: any) {
    console.error('Error in debug-paths:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}