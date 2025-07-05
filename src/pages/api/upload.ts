import { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm, File } from 'formidable';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export const config = {
  api: {
    bodyParser: false,
    responseLimit: false,
    // Increase timeout for large uploads (10 minutes)
    externalResolver: true,
  },
  // Increase maximum execution time
  maxDuration: 600, // 10 minutes
};

const ensureDirectoryExists = (dirPath: string) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const moveFile = (oldPath: string, newPath: string) => {
  return new Promise<void>((resolve, reject) => {
    fs.rename(oldPath, newPath, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};

const cleanupTempFiles = async (tmpDir: string) => {
  try {
    if (!fs.existsSync(tmpDir)) {
      return;
    }
    const files = await fs.promises.readdir(tmpDir);
    for (const file of files) {
      const filePath = path.join(tmpDir, file);
      try {
        const stats = await fs.promises.stat(filePath);
        if (stats.isFile()) {
          await fs.promises.unlink(filePath);
        }
      } catch (fileError) {
        console.warn(`Failed to delete temp file ${filePath}:`, fileError);
      }
    }
    console.log(`Cleaned up temporary files in ${tmpDir}`);
  } catch (error) {
    console.warn('Cleanup warning:', error);
  }
};

const getTmpSize = (dir: string): number => {
  if (!fs.existsSync(dir)) return 0;
  let size = 0;
  try {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      try {
        const stats = fs.statSync(path.join(dir, file));
        if (stats.isFile()) {
          size += stats.size;
        }
      } catch (error) {
        console.warn(`Error reading file size for ${file}:`, error);
      }
    });
  } catch (error) {
    console.warn(`Error reading directory ${dir}:`, error);
  }
  return size;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Determine base path for Electron compatibility (outside try block for error handler access)
  let basePath = process.cwd();
  
  // Check if we're in an Electron environment
  if (process.versions && process.versions.electron) {
    // In packaged Electron app, files are in resources/app/
    const electronProcess = process as any;
    if (electronProcess.resourcesPath) {
      const resourcesPath = path.join(electronProcess.resourcesPath, 'app');
      if (fs.existsSync(resourcesPath)) {
        basePath = resourcesPath;
      }
    }
  }

  try {
    
    // Ensure tmp directory exists using the correct base path
    const tmpDir = path.join(basePath, 'tmp');
    ensureDirectoryExists(tmpDir);
    
    // Log initial tmp directory size for monitoring
    const initialTmpSize = getTmpSize(tmpDir);
    if (initialTmpSize > 0) {
      console.log(`Warning: tmp directory contains ${(initialTmpSize / 1024 / 1024).toFixed(2)}MB of existing files`);
    }
    
    const form = new IncomingForm({
      maxFileSize: 200 * 1024 * 1024, // 200MB per file (for large panorama images)
      maxTotalFileSize: 2 * 1024 * 1024 * 1024, // 2GB total
      maxFields: 1000,
      maxFieldsSize: 20 * 1024 * 1024, // 20MB for fields
      allowEmptyFiles: false,
      minFileSize: 1,
      // Increase timeout for parsing
      uploadDir: tmpDir,
      keepExtensions: true,
      multiples: true,
    });
    
    // Add timeout wrapper to prevent stuck uploads
    const parseWithTimeout = (timeoutMs: number = 600000) => { // 10 minutes
      return new Promise<{ fields: any; files: any }>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Upload parsing timeout - request took too long'));
        }, timeoutMs);
        
        form.parse(req, (err, fields, files) => {
          clearTimeout(timeout);
          if (err) reject(err);
          else resolve({ fields, files });
        });
      });
    };
    
    const { fields, files } = await parseWithTimeout();

    // Use the same basePath determined earlier for consistency
    const publicDir = path.join(basePath, 'public');
    const imagesDir = path.join(publicDir, 'images');
    const dataDir = path.join(publicDir, 'data');
    
    console.log('Upload paths:', { basePath, publicDir, imagesDir, dataDir, tmpDir });
    
    ensureDirectoryExists(imagesDir);
    ensureDirectoryExists(dataDir);

    // Handle CSV file
    const csvFile = Array.isArray(files.csv) ? files.csv[0] : files.csv;
    if (!csvFile) {
      return res.status(400).json({ error: 'CSV file is required' });
    }

    const csvDestPath = path.join(dataDir, 'pano-poses.csv');
    await moveFile(csvFile.filepath, csvDestPath);

    // Handle image files
    const imageFiles = Array.isArray(files.images) ? files.images : [files.images];
    if (!imageFiles || imageFiles.length === 0) {
      return res.status(400).json({ error: 'At least one image file is required' });
    }

    // Check for overwrite flag
    const allowOverwrite = fields.overwrite && fields.overwrite[0] === 'true';
    
    // Check for duplicate file names only if overwrite is not allowed
    if (!allowOverwrite) {
      const duplicateFiles: string[] = [];
      const existingFiles = fs.readdirSync(imagesDir);
      
      for (const imageFile of imageFiles) {
        if (imageFile && imageFile.originalFilename) {
          if (existingFiles.includes(imageFile.originalFilename)) {
            duplicateFiles.push(imageFile.originalFilename);
          }
        }
      }

      // If duplicates found, return warning
      if (duplicateFiles.length > 0) {
        return res.status(409).json({ 
          error: 'Duplicate file names detected',
          duplicates: duplicateFiles,
          message: `The following files already exist: ${duplicateFiles.join(', ')}. Please rename them or choose different files.`
        });
      }
    }

    for (const imageFile of imageFiles) {
      if (imageFile && imageFile.originalFilename) {
        const imageDestPath = path.join(imagesDir, imageFile.originalFilename);
        await moveFile(imageFile.filepath, imageDestPath);
      }
    }

    // Run the configuration generation script
    try {
      console.log('Starting configuration generation...');
      
      // Add timeout to prevent hanging
      const configPromise = execAsync('npm run generate-config', {
        cwd: basePath, // Use the correct base path for Electron
        timeout: 300000, // 5 minutes timeout
      });
      
      const { stdout, stderr } = await configPromise;
      
      console.log('Script output:', stdout);
      if (stderr) {
        console.warn('Script warnings:', stderr);
      }

      // Clean up temporary files after successful processing
      await cleanupTempFiles(tmpDir);

      res.status(200).json({ 
        message: 'Files uploaded successfully and configuration generated!',
        scriptOutput: stdout,
        success: true
      });
    } catch (scriptError: any) {
      console.error('Script execution error:', scriptError);
      
      // Clean up temporary files even if script fails
      await cleanupTempFiles(tmpDir);
      
      // Provide more specific error messages
      let errorMessage = 'Configuration generation failed';
      if (scriptError.code === 'TIMEOUT') {
        errorMessage = 'Configuration generation timed out. Please try with fewer images or run "npm run generate-config" manually.';
      } else if (scriptError.message.includes('python')) {
        errorMessage = 'Python script error. Please ensure Python and required packages (numpy) are installed.';
      } else if (scriptError.message.includes('ENOENT')) {
        errorMessage = 'Required script files not found. Please check the scripts directory.';
      }
      
      res.status(500).json({ 
        message: 'Files uploaded successfully, but configuration generation failed.',
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? scriptError.message : undefined,
        success: false
      });
    }

  } catch (error: any) {
    console.error('Upload error:', error);
    
    // Clean up temporary files on error
    const tmpDir = path.join(basePath, 'tmp');
    await cleanupTempFiles(tmpDir);
    
    // Provide more specific error messages
    let errorMessage = 'Internal server error during file upload';
    let statusCode = 500;
    
    if (error.code === 'LIMIT_FILE_SIZE') {
      errorMessage = 'One or more files exceed the maximum size limit of 200MB per file.';
      statusCode = 413;
    } else if (error.code === 'LIMIT_FILE_COUNT') {
      errorMessage = 'Too many files uploaded. Please reduce the number of files.';
      statusCode = 413;
    } else if (error.code === 'LIMIT_FIELD_VALUE') {
      errorMessage = 'Form data is too large. Please reduce file sizes.';
      statusCode = 413;
    } else if (error.message && error.message.includes('timeout')) {
      errorMessage = 'Upload timeout. Please try uploading fewer files at once or reduce file sizes.';
      statusCode = 408;
    } else if (error.message && error.message.includes('ENOSPC')) {
      errorMessage = 'Server storage is full. Please contact administrator.';
      statusCode = 507;
    } else if (error.message && error.message.includes('EMFILE')) {
      errorMessage = 'Too many files being processed. Please try again in a moment.';
      statusCode = 503;
    }
    
    res.status(statusCode).json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}