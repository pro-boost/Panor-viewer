import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // In Electron packaged app, we need to find the correct path to public folder
    let basePath = process.cwd();
    
    // Check if we're in an Electron environment
    if (process.versions && process.versions.electron) {
      // In packaged Electron app, files are in resources/app/public
      // Type assertion needed as resourcesPath is Electron-specific
      const electronProcess = process as any;
      if (electronProcess.resourcesPath) {
        const resourcesPath = path.join(electronProcess.resourcesPath, 'app');
        if (fs.existsSync(resourcesPath)) {
          basePath = resourcesPath;
        }
      }
    }
    
    const dataDir = path.join(basePath, 'public', 'data');
    const imagesDir = path.join(basePath, 'public', 'images');

    const csvFilePath = path.join(dataDir, 'pano-poses.csv');
    const csvFileExists = fs.existsSync(csvFilePath);

    let imageFiles: string[] = [];
    if (fs.existsSync(imagesDir)) {
      imageFiles = fs.readdirSync(imagesDir).filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.jpg', '.jpeg', '.png', '.gif'].includes(ext);
      });
    }

    const hasFiles = csvFileExists && imageFiles.length > 0;
    
    // Set cache-busting headers to prevent caching
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    res.status(200).json({
      csvFile: csvFileExists ? 'pano-poses.csv' : null,
      imageFiles: imageFiles,
      imageCount: imageFiles.length,
      hasFiles: hasFiles,
      timestamp: Date.now() // Add timestamp for debugging
    });

  } catch (error) {
    console.error('Error checking files:', error);
    res.status(500).json({ error: 'Internal server error while checking files' });
  }
}