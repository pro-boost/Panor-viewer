import { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm, File } from 'formidable';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { promisify } from 'util';

// Custom spawn function that doesn't use cmd.exe
const spawnAsync = (command: string, args: string[], options: any = {}) => {
  return new Promise<{ stdout: string; stderr: string }>((resolve, reject) => {
    const child = spawn(command, args, { ...options, shell: false });
    let stdout = '';
    let stderr = '';
    
    child.stdout?.on('data', (data) => {
      stdout += data.toString();
    });
    
    child.stderr?.on('data', (data) => {
      stderr += data.toString();
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        const error = new Error(`Process exited with code ${code}`);
        (error as any).stdout = stdout;
        (error as any).stderr = stderr;
        reject(error);
      }
    });
    
    child.on('error', (error) => {
      reject(error);
    });
  });
};

export const config = {
  api: {
    bodyParser: false,
    responseLimit: false,
    externalResolver: true,
  },
};

const ensureDirectoryExists = (dirPath: string) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const moveFile = (oldPath: string, newPath: string) => {
  return new Promise<void>((resolve, reject) => {
    fs.rename(oldPath, newPath, (err) => {
      if (err) {
        // If rename fails due to cross-device link (EXDEV), use copy + delete
        if (err.code === 'EXDEV') {
          fs.copyFile(oldPath, newPath, (copyErr) => {
            if (copyErr) {
              reject(copyErr);
            } else {
              fs.unlink(oldPath, (unlinkErr) => {
                if (unlinkErr) {
                  console.warn(`Failed to delete temp file after copy: ${unlinkErr.message}`);
                }
                resolve();
              });
            }
          });
        } else {
          reject(err);
        }
      } else {
        resolve();
      }
    });
  });
};

const cleanupTempFiles = async (tempFiles: (File | File[])[]) => {
  for (const fileOrArray of tempFiles) {
    const files = Array.isArray(fileOrArray) ? fileOrArray : [fileOrArray];
    for (const file of files) {
      if (file && file.filepath && fs.existsSync(file.filepath)) {
        try {
          await fs.promises.unlink(file.filepath);
          console.log(`Cleaned up temp file: ${file.filepath}`);
        } catch (error) {
          console.warn(`Failed to cleanup temp file ${file.filepath}:`, error);
        }
      }
    }
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { projectId } = req.query;
  
  if (!projectId || typeof projectId !== 'string') {
    return res.status(400).json({ error: 'Project ID is required' });
  }

  let tempFilesToCleanup: (File | File[])[] = [];

  try {
    // Ensure tmp directory exists
    const tmpDir = path.join(process.cwd(), 'tmp');
    ensureDirectoryExists(tmpDir);
    
    const form = new IncomingForm({
      maxFields: 1000,
      allowEmptyFiles: false,
      minFileSize: 1,
      uploadDir: tmpDir,
      keepExtensions: true,
      multiples: true,
      // Remove all size limitations
      maxFileSize: Infinity,
      maxTotalFileSize: Infinity,
      maxFieldsSize: Infinity,
    });
    
    const { fields, files } = await new Promise<{ fields: any; files: any }>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    });

    // Ensure project directories exist
    const projectsPath = process.env.PROJECTS_PATH || path.join(process.cwd(), 'projects');
    const projectDir = path.join(projectsPath, projectId);
    const imagesDir = path.join(projectDir, 'images');
    const poiDir = path.join(projectDir, 'poi');
    const configDir = path.join(projectDir, 'config');

    const deleteAll = fields.deleteAll && fields.deleteAll[0] === 'true';

    if (deleteAll) {
      // Check if we have image files to determine if we need to delete the images directory
      const hasImageFiles = Array.isArray(files.images) ? files.images.length > 0 : !!files.images;
      
      // Check if we have POI file to determine if we need to delete the POI directory
      const hasPoiFile = Array.isArray(files.poiFile) ? files.poiFile.length > 0 : !!files.poiFile;
      
      // Check if we have CSV file to determine if we need to delete the CSV file
      const hasCsvFile = Array.isArray(files.csv) ? files.csv.length > 0 : !!files.csv;
      
      // Only delete the images directory if we have new image files
      if (hasImageFiles && fs.existsSync(imagesDir)) {
        console.log('Deleting images directory due to duplicate images');
        fs.rmSync(imagesDir, { recursive: true, force: true });
      }
      
      // Only delete the POI directory if we have a new POI file
      if (hasPoiFile && fs.existsSync(poiDir)) {
        console.log('Deleting POI directory due to duplicate POI file');
        fs.rmSync(poiDir, { recursive: true, force: true });
      }
      
      // Only delete the CSV file if we have a new CSV file
      if (hasCsvFile && fs.existsSync(configDir)) {
        const csvPath = path.join(configDir, 'pano-poses.csv');
        if (fs.existsSync(csvPath)) {
          console.log('Deleting CSV file due to duplicate CSV file');
          fs.unlinkSync(csvPath);
        }
      }
    }
    
    ensureDirectoryExists(projectDir);
    ensureDirectoryExists(imagesDir);
    ensureDirectoryExists(poiDir);
    ensureDirectoryExists(configDir);

    // Handle CSV file
    const csvFile = Array.isArray(files.csv) ? files.csv[0] : files.csv;
    const existingCsv = fields.existing_csv ? fields.existing_csv[0] : null;
    let csvDestPath = '';

    if (csvFile) {
      tempFilesToCleanup.push(csvFile);
      csvDestPath = path.join(configDir, 'pano-poses.csv');
      await moveFile(csvFile.filepath, csvDestPath);
    } else if (existingCsv) {
      csvDestPath = path.join(configDir, existingCsv);
    } else {
      return res.status(400).json({ error: 'CSV file is required' });
    }
    
    // Verify CSV file was moved successfully
    if (!fs.existsSync(csvDestPath)) {
      throw new Error(`Failed to move CSV file to ${csvDestPath}`);
    }
    console.log(`CSV file successfully moved to: ${csvDestPath}`);

    // Handle image files
    const imageFiles = Array.isArray(files.images) ? files.images : (files.images ? [files.images] : []);
    const existingImages = fields.existing_images ? (Array.isArray(fields.existing_images) ? fields.existing_images : [fields.existing_images]) : [];

    if (imageFiles.length === 0 && existingImages.length === 0) {
      return res.status(400).json({ error: 'At least one image file is required' });
    }
    if (imageFiles.length > 0) {
        tempFilesToCleanup.push(files.images);
    }

    // Check for overwrite flag
    const allowOverwrite = fields.overwrite && fields.overwrite[0] === 'true';
    
    // Check for duplicate file names only if overwrite is not allowed
    if (!allowOverwrite) {
      const duplicateFiles: string[] = [];
      const existingFiles = fs.existsSync(imagesDir) ? fs.readdirSync(imagesDir) : [];
      
      for (const imageFile of imageFiles) {
        if (imageFile && imageFile.originalFilename) {
          if (existingFiles.includes(imageFile.originalFilename)) {
            duplicateFiles.push(imageFile.originalFilename);
          }
        }
      }

      // If duplicates found, return warning
      if (duplicateFiles.length > 0) {
        await cleanupTempFiles(tempFilesToCleanup);
        return res.status(409).json({ 
          error: 'Duplicate file names detected',
          duplicates: duplicateFiles,
          message: `The following files already exist: ${duplicateFiles.join(', ')}. Please rename them or choose different files.`
        });
      }
    }

    const movedImages: string[] = [];
    for (const imageFile of imageFiles) {
      if (imageFile && imageFile.originalFilename) {
        const imageDestPath = path.join(imagesDir, imageFile.originalFilename);
        await moveFile(imageFile.filepath, imageDestPath);
        
        // Verify image file was moved successfully
        if (!fs.existsSync(imageDestPath)) {
          throw new Error(`Failed to move image file to ${imageDestPath}`);
        }
        movedImages.push(imageFile.originalFilename);
      }
    }
    // Add existing images to the list of moved images
    existingImages.forEach((imageName: string) => movedImages.push(imageName));
    
    console.log(`Successfully moved ${movedImages.length} image files:`, movedImages);

    // Handle POI file
    console.log('Backend - checking for POI file in files object:', Object.keys(files));
    const poiFile = Array.isArray(files.poiFile) ? files.poiFile[0] : files.poiFile;
    console.log('Backend - POI file found:', !!poiFile, poiFile ? poiFile.originalFilename : 'none');
    if (poiFile) {
      tempFilesToCleanup.push(poiFile);
      ensureDirectoryExists(poiDir);
      
      const originalFilename = poiFile.originalFilename || 'poi-data.json';
      
      // Check if it's a ZIP file that needs extraction
      if (originalFilename.toLowerCase().endsWith('.zip')) {
        console.log('Backend - Processing ZIP file for POI data');
        const AdmZip = require('adm-zip');
        
        try {
          const zip = new AdmZip(poiFile.filepath);
          const zipEntries = zip.getEntries();
          
          // Look for poi-data.json in the ZIP
          const poiDataEntry = zipEntries.find((entry: any) => 
            entry.entryName.toLowerCase().includes('poi-data.json') || 
            entry.entryName.toLowerCase().endsWith('.json')
          );
          
          if (poiDataEntry) {
            const poiDataContent = poiDataEntry.getData().toString('utf8');
            const poiDataPath = path.join(poiDir, 'poi-data.json');
            fs.writeFileSync(poiDataPath, poiDataContent);
            console.log(`POI data extracted and saved to: ${poiDataPath}`);
            
            // Extract any attachment files
            const attachmentsDir = path.join(poiDir, 'attachments');
            ensureDirectoryExists(attachmentsDir);
            
            zipEntries.forEach((entry: any) => {
              if (!entry.isDirectory && !entry.entryName.toLowerCase().includes('poi-data.json')) {
                const fileName = path.basename(entry.entryName);
                const attachmentPath = path.join(attachmentsDir, fileName);
                fs.writeFileSync(attachmentPath, entry.getData());
                console.log(`Attachment extracted: ${fileName}`);
              }
            });
          } else {
            console.log('No POI data found in ZIP file');
          }
        } catch (zipError) {
          console.error('Error processing ZIP file:', zipError);
          // Fallback: save the ZIP file as-is
          const poiDestPath = path.join(poiDir, originalFilename);
          await moveFile(poiFile.filepath, poiDestPath);
        }
      } else {
        // Handle non-ZIP files (JSON, etc.)
        const poiDestPath = path.join(poiDir, originalFilename.endsWith('.json') ? originalFilename : 'poi-data.json');
        console.log(`Backend - Moving POI file from ${poiFile.filepath} to ${poiDestPath}`);
        await moveFile(poiFile.filepath, poiDestPath);
        
        // Verify POI file was moved successfully
        if (!fs.existsSync(poiDestPath)) {
          throw new Error(`Failed to move POI file to ${poiDestPath}`);
        }
        console.log(`POI file successfully moved to: ${poiDestPath}`);
      }
    } else {
      console.log('Backend - No POI file received');
    }

    // Add a small delay to ensure all file operations are completed
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Final verification before running config script
    console.log(`Final verification for project ${projectId}:`);
    console.log(`- CSV exists: ${fs.existsSync(csvDestPath)}`);
    console.log(`- Images directory exists: ${fs.existsSync(imagesDir)}`);
    console.log(`- Images in directory: ${fs.readdirSync(imagesDir).length}`);
    
    // Run the configuration generation script for this specific project
    try {
      console.log(`Starting configuration generation for project: ${projectId}`);
      
      // In Electron environment, scripts are in the standalone directory
      const isElectron = process.env.ELECTRON_PROJECTS_PATH;
      let scriptPath, cwd;
      
      if (isElectron) {
        // In Electron production, use process.resourcesPath for reliable path resolution
        const resourcesPath = (process as any).resourcesPath;
        
        if (resourcesPath) {
          // Packaged app - try ASAR unpacked first, then fallback
          const asarUnpackedPath = path.join(resourcesPath, 'app.asar.unpacked', 'scripts', 'node', 'generate-config.js');
          const regularPath = path.join(resourcesPath, 'scripts', 'node', 'generate-config.js');
          
          if (fs.existsSync(asarUnpackedPath)) {
            scriptPath = asarUnpackedPath;
            cwd = path.join(resourcesPath, 'app.asar.unpacked');
            console.log(`Using ASAR unpacked script path: ${scriptPath}`);
          } else if (fs.existsSync(regularPath)) {
            scriptPath = regularPath;
            cwd = resourcesPath;
            console.log(`Using regular resources script path: ${scriptPath}`);
          } else {
            // Fallback to process.cwd() for development or unusual setups
            scriptPath = path.join(process.cwd(), 'scripts', 'node', 'generate-config.js');
            cwd = process.cwd();
            console.log(`Fallback to process.cwd() script path: ${scriptPath}`);
          }
        } else {
          // Development mode or no resourcesPath available
          scriptPath = path.join(process.cwd(), 'scripts', 'node', 'generate-config.js');
          cwd = process.cwd();
          console.log(`Development mode script path: ${scriptPath}`);
        }
      } else {
        // Development or standalone mode - find the correct project root
        // The API file is in src/pages/api/projects/[projectId]/upload.ts
        // We need to go up to the project root where scripts/ directory is located
        const currentDir = __dirname;
        const projectRoot = path.resolve(currentDir, '../../../../../..');
        scriptPath = path.join(projectRoot, 'scripts', 'node', 'generate-config.js');
        cwd = projectRoot;
        
        // Verify the script exists at the calculated path
        if (!fs.existsSync(scriptPath)) {
          console.log(`Script not found at calculated path ${scriptPath}, trying alternative paths...`);
          
          // Try relative to the current working directory (Panor-viewer)
          const altScriptPath1 = path.join(process.cwd(), 'scripts', 'node', 'generate-config.js');
          if (fs.existsSync(altScriptPath1)) {
            scriptPath = altScriptPath1;
            cwd = process.cwd();
            console.log(`Using process.cwd() script path: ${scriptPath}`);
          } else {
            // Try going up one level from process.cwd() (in case we're in a subdirectory)
            const altScriptPath2 = path.join(path.dirname(process.cwd()), 'Panor-viewer', 'scripts', 'node', 'generate-config.js');
            if (fs.existsSync(altScriptPath2)) {
              scriptPath = altScriptPath2;
              cwd = path.join(path.dirname(process.cwd()), 'Panor-viewer');
              console.log(`Using parent directory script path: ${scriptPath}`);
            } else {
              console.error(`Script not found at any of the attempted paths:`);
              console.error(`- ${scriptPath}`);
              console.error(`- ${altScriptPath1}`);
              console.error(`- ${altScriptPath2}`);
            }
          }
        }
      }
      
      console.log(`Script path: ${scriptPath}`);
      console.log(`Working directory: ${cwd}`);
      
      // Get the correct Node.js executable path with fallback logic
      let nodePath;
      console.log(`Environment check - isElectron: ${isElectron}`);
      console.log(`Environment check - process.execPath: ${process.execPath}`);
      console.log(`Environment check - process.argv0: ${process.argv0}`);
      
      if (isElectron) {
        // In Electron environment, try system Node.js first, then fallback to Electron executable
        const commonNodePaths = [
          'C:\\Program Files\\nodejs\\node.exe',
          'C:\\Program Files (x86)\\nodejs\\node.exe',
          'node' // Fallback to PATH
        ];
        
        // Try to use system Node.js first
        nodePath = 'node';
        console.log(`Attempting to use system Node.js executable for Electron: ${nodePath}`);
        
        // Test if system Node.js is available
        try {
          const { execSync } = require('child_process');
          execSync('node --version', { stdio: 'ignore', timeout: 5000 });
          console.log('System Node.js is available');
        } catch (nodeTestError) {
          console.log('System Node.js not available, falling back to Electron executable');
          nodePath = process.execPath; // Use Electron executable as fallback
        }
      } else {
        // Development or standalone mode
        nodePath = process.execPath;
        console.log(`Using development Node.js executable: ${nodePath}`);
      }
      
      console.log(`Final Node executable: ${nodePath}`);
      
      // Additional debug info
      console.log(`Process platform: ${process.platform}`);
      console.log(`Process version: ${process.version}`);
      console.log(`Process versions: ${JSON.stringify(process.versions)}`);
      
      // Set the environment variables for the script
      const scriptEnv = {
        ...process.env,
        PROJECTS_PATH: projectsPath
      };
      
      const { stdout, stderr } = await spawnAsync(nodePath, [scriptPath, '--project', projectId], {
         cwd,
         env: scriptEnv
       });
       
      console.log('Script output:', stdout);
      if (stderr) {
        console.warn('Script warnings:', stderr);
      }

      res.status(200).json({ 
        message: `Files uploaded successfully to project "${projectId}" and configuration generated!`,
        projectId,
        scriptOutput: stdout
      });
    } catch (scriptError: any) {
      console.error('Script execution error:', scriptError);
      
      // Provide more specific error messages based on the script error
      let errorDetails = 'Unknown configuration error';
      if (scriptError.message) {
        if (scriptError.message.includes('CSV file not found')) {
          errorDetails = 'CSV file was not properly uploaded or moved';
        } else if (scriptError.message.includes('python')) {
          errorDetails = 'Python or required packages (numpy) are not installed';
        } else if (scriptError.message.includes('Permission denied')) {
          errorDetails = 'File permission error - check directory permissions';
        } else {
          errorDetails = scriptError.message;
        }
      }
      
      res.status(500).json({ 
        error: 'Configuration generation failed',
        message: `Files uploaded successfully to project "${projectId}", but configuration generation failed: ${errorDetails}`,
        projectId,
        details: process.env.NODE_ENV === 'development' ? scriptError.message : undefined,
        manualCommand: `node scripts/node/generate-config.js --project "${projectId}"`
      });
    }

    // Clean up temp files after successful processing
    await cleanupTempFiles(tempFilesToCleanup);

  } catch (error: any) {
    console.error('Upload error:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Internal server error during file upload';
    let statusCode = 500;
    
    if (error.code === 1009 || error.httpCode === 413) {
      errorMessage = 'File upload failed due to size restrictions. Please try with smaller files.';
      statusCode = 413;
    } else if (error.message && error.message.includes('timeout')) {
      errorMessage = 'Upload timeout. Please try again.';
      statusCode = 408;
    } else if (error.message && error.message.includes('ENOSPC')) {
      errorMessage = 'Server storage is full. Please contact administrator.';
      statusCode = 507;
    } else if (error.message && error.message.includes('EMFILE')) {
      errorMessage = 'Too many files being processed. Please try again in a moment.';
      statusCode = 503;
    } else if (error.code && error.code >= 1000 && error.code <= 1999) {
      errorMessage = `File upload error: ${error.message || 'Unknown formidable error'}`;
      statusCode = 400;
    }
    
    res.status(statusCode).json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });

    // Clean up temp files even on error
    try {
      await cleanupTempFiles(tempFilesToCleanup);
    } catch (cleanupError) {
      console.error('Error during temp file cleanup:', cleanupError);
    }
  }
}