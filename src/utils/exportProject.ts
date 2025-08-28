import JSZip from 'jszip';
import { ConfigData } from '@/types/scenes';
import { POIData } from '@/types/poi';
import path from 'path';
import fs from 'fs/promises';

interface ExportProjectData {
  config: ConfigData;
  pois?: POIData[];
}

interface ExportProgressCallback {
  (step: number, totalSteps: number, message: string, details?: any): void;
}

/**
 * Export project as a standalone ZIP package
 * Creates a self-contained panorama viewer with all assets
 */
// Test function for debugging export functionality
export async function testExportWithRealProject(projectName: string): Promise<void> {
  console.log('=== TEST EXPORT: Testing with real project:', projectName);
  
  const realProjectData: ExportProjectData = {
    config: {
      projectId: projectName,
      projectName: projectName,
      scenes: [
        {
          id: 'scene1',
          name: 'Scene 1',
          floor: 1,
          position: { x: 0, y: 0, z: 0 },
          initialViewParameters: { yaw: 0, pitch: 0, fov: 75 },
          linkHotspots: [],
          initialYaw: 0,
          imageUrl: 'panorama1.jpg'
        }
      ]
    },
    pois: []
  };
  
  console.log('=== TEST EXPORT: Real project data created:', realProjectData);
  
  try {
    await exportAsZip(realProjectData);
    console.log('=== TEST EXPORT: Real project export completed successfully');
  } catch (error) {
    console.error('=== TEST EXPORT: Real project export failed:', error);
    throw error;
  }
}

export async function testExportWithSampleData(): Promise<void> {
  console.log('=== TEST EXPORT: Starting test with sample data...');
  
  const sampleProjectData: ExportProjectData = {
    config: {
      projectId: 'test-project',
      projectName: 'Test Project Export',
      scenes: [
        {
          id: 'scene1',
          name: 'Test Scene 1',
          floor: 1,
          position: { x: 0, y: 0, z: 0 },
          initialViewParameters: { yaw: 0, pitch: 0, fov: 75 },
          linkHotspots: [],
          initialYaw: 0,
          imageUrl: '/assets/images/carl-wang-lsxADNRNmc8-unsplash (2).jpg'
        },
        {
          id: 'scene2',
          name: 'Test Scene 2',
          floor: 1,
          position: { x: 10, y: 0, z: 0 },
          initialViewParameters: { yaw: 0, pitch: 0, fov: 75 },
          linkHotspots: [],
          initialYaw: 0,
          imageUrl: '/assets/images/everaldo-coelho-2tigIl6Tt7E-unsplash.jpg'
        }
      ]
    },
    pois: [
      {
        id: 'poi1',
        name: 'Test POI',
        description: 'Test POI description',
        panoramaId: 'scene1',
        position: { yaw: 0, pitch: 0 },
        type: 'file',
        content: 'test-file.pdf',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]
  };
  
  console.log('=== TEST EXPORT: Sample data created:', sampleProjectData);
  console.log('=== TEST EXPORT: Testing image URLs:');
  
  // Test if the images are accessible
  for (const scene of sampleProjectData.config.scenes) {
    try {
      const response = await fetch(scene.imageUrl);
      console.log(`=== TEST EXPORT: Image ${scene.imageUrl} - Status: ${response.status}`);
    } catch (error) {
      console.error(`=== TEST EXPORT: Failed to test image ${scene.imageUrl}:`, error);
    }
  }
  
  try {
    await exportAsZip(sampleProjectData);
    console.log('=== TEST EXPORT: Export completed successfully!');
  } catch (error) {
    console.error('=== TEST EXPORT: Export failed:', error);
  }
}

export async function exportAsZip(projectData: ExportProjectData, progressCallback?: ExportProgressCallback): Promise<Buffer> {
  const startTime = Date.now();
  let currentStep = 'initialization';
  
  try {
    console.log('=== EXPORT DEBUG: Starting export process ===');
    console.log('=== EXPORT DEBUG: Project data received:', {
      hasConfig: !!projectData.config,
      projectName: projectData.config?.projectName,
      projectId: projectData.config?.projectId,
      scenesCount: projectData.config?.scenes?.length || 0,
      poisCount: projectData.pois?.length || 0,
      scenes: projectData.config?.scenes?.map(scene => ({
        id: scene.id,
        imageUrl: scene.imageUrl,
        hasImageUrl: !!scene.imageUrl
      })) || []
    });
    
    // Validate project data
    if (!projectData.config) {
      throw new Error('Project configuration is missing');
    }
    if (!projectData.config.scenes || projectData.config.scenes.length === 0) {
      throw new Error('Project must contain at least one scene');
    }
    
    console.log('=== EXPORT PROGRESS: Step 1/8 - Validation completed ===');
    progressCallback?.(1, 8, 'Project validation completed');
    
    const zip = new JSZip();
    
    // Load standalone templates
    currentStep = 'loading templates';
    console.log('=== EXPORT PROGRESS: Step 2/8 - Loading templates... ===');
    progressCallback?.(2, 8, 'Loading export templates...');
    const templates = await loadStandaloneTemplates();
    console.log('=== EXPORT DEBUG: Templates loaded successfully');
    
    // Process project data for standalone viewer
    currentStep = 'processing data';
    console.log('=== EXPORT PROGRESS: Step 3/8 - Processing project data... ===');
    progressCallback?.(3, 8, 'Processing project configuration...');
    const processedData = await processProjectData(projectData);
    console.log('=== EXPORT DEBUG: Project data processed successfully');
    
    // Add core files to ZIP
    currentStep = 'adding core files';
    console.log('=== EXPORT PROGRESS: Step 4/8 - Adding core files... ===');
    progressCallback?.(4, 8, 'Adding core files to package...');
    console.log('=== EXPORT DEBUG: Adding core files...');
    await addCoreFiles(zip, templates, processedData);
    console.log('=== EXPORT DEBUG: Core files added successfully');
    
    // Add project assets (images, etc.)
    currentStep = 'adding assets';
    console.log('=== EXPORT PROGRESS: Step 5/8 - Adding project assets... ===');
    progressCallback?.(5, 8, 'Processing panorama images...');
    await addProjectAssets(zip, projectData, progressCallback);
    console.log('=== EXPORT DEBUG: Project assets added successfully');
    
    // Add Marzipano library
    console.log('=== EXPORT DEBUG: Adding Marzipano library...');
    await addMarzipanoLibrary(zip);
    console.log('=== EXPORT DEBUG: Marzipano library added successfully');
    
    // Generate ZIP buffer for API response with streaming for memory efficiency
    currentStep = 'generating zip';
    console.log('=== EXPORT PROGRESS: Step 8/8 - Generating ZIP file with streaming... ===');
    progressCallback?.(8, 8, 'Generating final export package...');
    const content = await zip.generateAsync({ 
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: {
        level: 6 // Balanced compression level
      },
      streamFiles: true // Enable streaming for large files
    });
    
    const totalTime = Date.now() - startTime;
    console.log('=== EXPORT SUCCESS: ZIP file generated successfully ===');
    console.log('=== EXPORT STATS: Size:', content.length, 'bytes, Time:', totalTime, 'ms ===');
    
    return content;
  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error('=== EXPORT ERROR: Export failed ===');
    console.error('=== EXPORT ERROR: Failed at step:', currentStep, 'after', totalTime, 'ms ===');
    console.error('=== EXPORT ERROR: Details:', error);
    
    // Re-throw with more context
    const enhancedError = new Error(`Export failed at step '${currentStep}': ${error instanceof Error ? error.message : String(error)}`);
    enhancedError.cause = error;
    throw enhancedError;
  }
}

/**
 * Load standalone viewer templates
 */
async function loadStandaloneTemplates() {
  const templates = {
    html: '',
    css: '',
    js: ''
  };
  
  try {
    // Load HTML template
    const htmlResponse = await fetch('/templates/standalone/index.html');
    if (htmlResponse.ok) {
      templates.html = await htmlResponse.text();
    } else {
      // Fallback to embedded template
      templates.html = getEmbeddedHTMLTemplate();
    }
    
    // Load CSS template
    const cssResponse = await fetch('/templates/standalone/styles.css');
    if (cssResponse.ok) {
      templates.css = await cssResponse.text();
    } else {
      templates.css = getEmbeddedCSSTemplate();
    }
    
    // Load JS template
    const jsResponse = await fetch('/templates/standalone/viewer.js');
    if (jsResponse.ok) {
      templates.js = await jsResponse.text();
    } else {
      templates.js = getEmbeddedJSTemplate();
    }
    
  } catch (error) {
    console.warn('Failed to load templates from server, using embedded versions:', error);
    templates.html = getEmbeddedHTMLTemplate();
    templates.css = getEmbeddedCSSTemplate();
    templates.js = getEmbeddedJSTemplate();
  }
  
  return templates;
}

/**
 * Get project paths for file access
 */
function getProjectPaths(projectName: string) {
  // Get the actual PROJECTS_PATH from environment or use default
  const projectsPath = process.env.PROJECTS_PATH || `C:\\Users\\${process.env.USERNAME || 'aminm'}\\AppData\\Roaming\\advanced-panorama-viewer\\projects`;
  
  const paths = {
    logoPath: path.join(process.cwd(), 'public', 'assets', 'svg', 'primezone-logo.svg'),
    projectImagesPath: path.join(projectsPath, projectName, 'images'),
    projectPoiPath: path.join(projectsPath, projectName, 'poi')
  };
  
  console.log('Using project paths:', paths);
  return paths;
}

/**
 * Process project data for standalone viewer
 * Converts absolute paths to relative paths and optimizes data structure
 */
async function processProjectData(projectData: ExportProjectData) {
  const processed = {
    config: { ...projectData.config },
    pois: projectData.pois || []
  };
  
  // Convert image URLs to relative paths
  if (processed.config.scenes) {
    processed.config.scenes = processed.config.scenes.map(scene => ({
      ...scene,
      imageUrl: scene.imageUrl ? `./assets/images/panoramas/${getImageFilename(scene.imageUrl)}` : undefined
    }));
  }

  // Convert logo path to relative
  if (processed.config.logo?.image) {
    processed.config.logo.image = `./assets/logo/primezone-logo.svg`;
  }
  
  // Process POI attachments
  processed.pois = processed.pois.map(poi => {
    if (poi.type === 'file' && poi.content) {
      return {
        ...poi,
        content: `./assets/poi/${poi.content}`
      };
    }
    return poi;
  });
  
  return processed;
}

/**
 * Add core files (HTML, CSS, JS) to ZIP
 */
async function addCoreFiles(zip: JSZip, templates: any, processedData: any) {
  // Generate index.html with injected project data
  const htmlContent = templates.html.replace(
    '{{PROJECT_DATA}}',
    JSON.stringify(processedData, null, 2)
  );
  
  zip.file('index.html', htmlContent);
  zip.file('styles.css', templates.css);
  zip.file('viewer.js', templates.js);
  
  // Add README with instructions
  const readme = generateReadme(processedData.config);
  zip.file('README.md', readme);
}

/**
 * Read file from Electron file system
 */
async function readElectronFile(filePath: string): Promise<Buffer> {
  try {
    console.log(`Attempting to read file: ${filePath}`);
    
    // Check if file exists first
    try {
      await fs.access(filePath);
      console.log(`File exists: ${filePath}`);
    } catch (accessError) {
      console.error(`File does not exist or is not accessible: ${filePath}`, {
        error: accessError.message,
        code: accessError.code
      });
      throw new Error(`File not found: ${filePath}`);
    }
    
    const buffer = await fs.readFile(filePath);
    console.log(`Successfully read file: ${filePath}, size: ${buffer.length} bytes`);
    return buffer;
  } catch (error) {
    console.error(`Failed to read file from ${filePath}:`, {
      error: error.message,
      code: error.code,
      stack: error.stack
    });
    throw error;
  }
}

/**
 * Add project assets (images, logos, POI files) to ZIP
 */
async function addProjectAssets(zip: JSZip, projectData: ExportProjectData, progressCallback?: ExportProgressCallback) {
  const assetsFolder = zip.folder('assets');
  const imagesFolder = assetsFolder!.folder('images');
  const panoramasFolder = imagesFolder!.folder('panoramas');
  const logoFolder = assetsFolder!.folder('logo');
  const poiFolder = assetsFolder!.folder('poi');
  
  const projectName = projectData.config.projectName || projectData.config.projectId || 'default';
  const projectPaths = getProjectPaths(projectName);
  
  console.log('addProjectAssets - Starting export for project:', {
    projectName,
    scenesCount: projectData.config.scenes?.length || 0,
    poisCount: projectData.pois?.length || 0
  });
  
  // Add panorama images - unified approach that works across all environments
  console.log('Processing panorama images...');
  
  let panoramasAdded = 0;
  
  // Method 1: Try to read from local project directory (works in Electron and some development scenarios)
  try {
    const panoramasPath = projectPaths.projectImagesPath;
    
    console.log(`Attempting to read panorama files from: ${panoramasPath}`);
    
    // Check if directory exists and is accessible
    const stats = await fs.stat(panoramasPath);
    if (stats.isDirectory()) {
      console.log('Local panoramas directory found, reading files...');
      
      const files = await fs.readdir(panoramasPath);
      console.log(`Found ${files.length} files in panoramas directory:`, files);
      
      // Filter for image files
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.bmp', '.tiff'];
      const imageFiles = files.filter(file => {
        const ext = path.extname(file).toLowerCase();
        return imageExtensions.includes(ext);
      });
      
      console.log(`Found ${imageFiles.length} image files:`, imageFiles);
      
      // Copy each image file to the ZIP in batches
      const BATCH_SIZE = 5; // Process 5 images at a time to reduce memory usage
      
      for (let i = 0; i < imageFiles.length; i += BATCH_SIZE) {
        const batch = imageFiles.slice(i, i + BATCH_SIZE);
        console.log(`Processing local image batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(imageFiles.length / BATCH_SIZE)} (${batch.length} images)`);
        
        // Process batch in parallel
        const batchPromises = batch.map(async (imageFile) => {
          try {
            const imagePath = path.join(panoramasPath, imageFile);
            console.log(`Reading image file: ${imagePath}`);
            
            const imageBuffer = await readElectronFile(imagePath);
            panoramasFolder!.file(imageFile, imageBuffer);
            
            console.log(`Added panorama image ${imageFile} to ZIP (${imageBuffer.length} bytes)`);
            return true;
          } catch (error) {
            console.error(`Failed to read image file ${imageFile}:`, error.message);
            return false;
          }
        });
        
        const results = await Promise.allSettled(batchPromises);
        const successCount = results.filter(result => result.status === 'fulfilled' && result.value).length;
        panoramasAdded += successCount;
        
        console.log(`Local batch ${Math.floor(i / BATCH_SIZE) + 1} completed: ${successCount}/${batch.length} images processed successfully`);
        
        // Add a small delay between batches to prevent overwhelming the file system
        if (i + BATCH_SIZE < imageFiles.length) {
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }
    }
  } catch (error) {
    console.log('Local panoramas directory not accessible, trying alternative methods:', error.message);
  }
  
  // Method 2: If no panoramas were added from local directory, process individual scene images in batches
  if (panoramasAdded === 0 && projectData.config.scenes) {
    console.log('Fallback: processing individual scene images from URLs in batches...');
    
    const scenesWithImages = projectData.config.scenes.filter(scene => scene.imageUrl);
    const BATCH_SIZE = 2; // Reduced batch size for better memory management with large images
    
    for (let i = 0; i < scenesWithImages.length; i += BATCH_SIZE) {
      const batch = scenesWithImages.slice(i, i + BATCH_SIZE);
      console.log(`=== EXPORT PROGRESS: Processing image batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(scenesWithImages.length / BATCH_SIZE)} (${batch.length} images) ===`);
      
      // Process batch in parallel but limit concurrent requests
      const batchPromises = batch.map(async (scene) => {
        const filename = getImageFilename(scene.imageUrl!);
        console.log(`Processing scene ${scene.id} with image: ${scene.imageUrl} -> ${filename}`);
        
        try {
          console.log(`Fetching image from URL: ${scene.imageUrl}`);
          const imageBlob = await fetchAsBlob(scene.imageUrl!);
          const imageBuffer = Buffer.from(await imageBlob.arrayBuffer());
          
          panoramasFolder!.file(filename, imageBuffer);
          console.log(`Added panorama image ${filename} to ZIP (${imageBuffer.length} bytes)`);
          return true;
        } catch (error) {
          console.error(`Failed to fetch image for scene ${scene.id}:`, {
            imageUrl: scene.imageUrl,
            filename: getImageFilename(scene.imageUrl!),
            error: error.message
          });
          return false;
        }
      });
      
      const results = await Promise.allSettled(batchPromises);
      const successCount = results.filter(result => result.status === 'fulfilled' && result.value).length;
      panoramasAdded += successCount;
      
      console.log(`=== EXPORT PROGRESS: Batch ${Math.floor(i / BATCH_SIZE) + 1} completed: ${successCount}/${batch.length} images processed successfully ===`);
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      // Longer delay between batches to prevent memory buildup and server overload
      if (i + BATCH_SIZE < scenesWithImages.length) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Increased delay to 1 second
      }
    }
  }
   
   console.log(`Panorama export summary: ${panoramasAdded} images added to ZIP`);
   
   if (panoramasAdded === 0) {
     console.warn('No panorama images were exported. Check that scene imageUrl values are valid or local project directory exists.');
   }
  
  // Add logo image - unified approach
  console.log('Processing logo image...');
  try {
    let logoBuffer: Buffer;
    
    // Method 1: Try to read from local file system first
    try {
      console.log(`Attempting to read logo from local path: ${projectPaths.logoPath}`);
      logoBuffer = await readElectronFile(projectPaths.logoPath);
      console.log(`Successfully read logo from local path, size: ${logoBuffer.length} bytes`);
    } catch (localError) {
      console.log('Local logo file not accessible, trying URL fetch:', localError.message);
      // Method 2: Fallback to URL fetch
      const logoUrl = '/assets/svg/primezone-logo.svg';
      console.log(`Fetching logo from URL: ${logoUrl}`);
      const logoBlob = await fetchAsBlob(logoUrl);
      logoBuffer = Buffer.from(await logoBlob.arrayBuffer());
      console.log(`Successfully fetched logo via URL, size: ${logoBuffer.length} bytes`);
    }
    
    logoFolder!.file('primezone-logo.svg', logoBuffer);
    console.log('Added logo to ZIP');
  } catch (error) {
    console.error('Failed to fetch logo image:', {
      logoPath: projectPaths.logoPath,
      error: error.message,
      stack: error.stack
    });
  }
  
  // Add POI config file
  if (projectData.pois && projectData.pois.length > 0) {
    console.log('Processing POI config file...', { poisCount: projectData.pois.length });
    progressCallback?.(6, 8, 'Processing POI data...', { poisCount: projectData.pois.length });
    try {
      let poiConfigBuffer: Buffer;
      
      // Method 1: Try to read POI config from local file system first
      try {
        const poiConfigPath = path.join(projectPaths.projectPoiPath, 'poi-data.json');
        console.log(`Attempting to read POI config from local path: ${poiConfigPath}`);
        poiConfigBuffer = await readElectronFile(poiConfigPath);
        console.log(`Successfully read POI config from local path, size: ${poiConfigBuffer.length} bytes`);
      } catch (localError) {
        console.log('Local POI config file not accessible, creating from current data:', localError.message);
        // Method 2: Fallback to creating POI config from current data
        console.log('Creating POI config from current data');
        const poiConfigData = JSON.stringify(projectData.pois, null, 2);
        poiConfigBuffer = Buffer.from(poiConfigData, 'utf-8');
        console.log(`Created POI config from current data, size: ${poiConfigBuffer.length} bytes`);
      }
      
      poiFolder!.file('poi-data.json', poiConfigBuffer);
      console.log('Added POI config to ZIP');
    } catch (error) {
      console.error('Failed to add POI config file:', {
        poiPath: projectPaths.projectPoiPath,
        error: error.message,
        stack: error.stack
      });
    }
  } else {
    console.log('No POIs found in project data');
  }
  
  // Add POI attachments
  if (projectData.pois) {
    const addedFiles = new Set<string>();
    const fileAttachments = projectData.pois.filter(poi => poi.type === 'file' && poi.content);
    
    console.log('Processing POI attachments...', { 
      totalPois: projectData.pois.length,
      fileAttachments: fileAttachments.length 
    });
    
    if (fileAttachments.length > 0) {
      progressCallback?.(6, 8, `Processing ${fileAttachments.length} POI attachments...`, { 
        totalAttachments: fileAttachments.length 
      });
      
      // Create attachments subfolder within POI folder
      const poiAttachmentsFolder = poiFolder!.folder('attachments');
      
      let processedAttachments = 0;
      for (const poi of projectData.pois) {
        if (poi.type === 'file' && poi.content && !addedFiles.has(poi.content)) {
          try {
            let fileBuffer: Buffer;
            
            console.log(`Processing POI attachment: ${poi.content}`);
            processedAttachments++;
            
            progressCallback?.(6, 8, `Processing POI attachment ${processedAttachments}/${fileAttachments.length}: ${poi.content}`, {
              currentAttachment: processedAttachments,
              totalAttachments: fileAttachments.length,
              fileName: poi.content
            });
            
            // Try to read from local app data directory first
            const poiFilePath = path.join(projectPaths.projectPoiPath, 'attachments', poi.content);
            console.log(`Attempting to read POI attachment from local path: ${poiFilePath}`);
            try {
              fileBuffer = await readElectronFile(poiFilePath);
              console.log(`Successfully read POI attachment ${poi.content}, size: ${fileBuffer.length} bytes`);
            } catch (localError) {
              console.log('Local POI attachment not accessible, trying URL fetch:', localError.message);
              // Method 2: Fallback to URL fetch
              const attachmentUrl = `/api/files/${projectData.config.projectId}/poi/attachments/${poi.content}`;
              console.log(`Fetching POI attachment from URL: ${attachmentUrl}`);
              const fileBlob = await fetchAsBlob(attachmentUrl);
              fileBuffer = Buffer.from(await fileBlob.arrayBuffer());
              console.log(`Successfully fetched POI attachment ${poi.content} via URL, size: ${fileBuffer.length} bytes`);
            }
            
            // Add file to attachments subfolder
            poiAttachmentsFolder!.file(poi.content, fileBuffer);
            addedFiles.add(poi.content);
            console.log(`Added POI attachment ${poi.content} to ZIP attachments folder`);
            
            // Update progress for completed attachment
            progressCallback?.(6, 8, `Added POI attachment: ${poi.content}`, {
              currentAttachment: processedAttachments,
              totalAttachments: fileAttachments.length,
              completed: true
            });
          } catch (error) {
            console.error(`Failed to fetch POI attachment ${poi.content}:`, {
              poiId: poi.id,
              content: poi.content,
              error: error.message,
              stack: error.stack
            });
          }
        }
      }
      
      console.log(`Processed ${addedFiles.size} unique POI attachments in attachments subfolder`);
      
      // Final POI processing step
      progressCallback?.(7, 8, `Completed processing ${addedFiles.size} POI attachments`, {
        totalProcessed: addedFiles.size,
        totalAttachments: fileAttachments.length
      });
    } else {
      console.log('No POI file attachments found');
      progressCallback?.(7, 8, 'No POI attachments to process');
    }
  } else {
    console.log('No POIs found for attachment processing');
    progressCallback?.(7, 8, 'No POI attachments to process');
  }
}

/**
 * Add Marzipano library to ZIP
 */
async function addMarzipanoLibrary(zip: JSZip) {
  try {
    const marzipanoBlob = await fetchAsBlob('/assets/js/marzipano.js');
    zip.file('marzipano.js', marzipanoBlob);
  } catch (error) {
    console.warn('Failed to fetch Marzipano library:', error);
    // Add a note in the README about manually adding Marzipano
  }
}

/**
 * Fetch a resource as blob
 */
async function fetchAsBlob(url: string): Promise<Blob> {
  // Convert relative URLs to absolute URLs if needed
  let fetchUrl = url;
  if (url.startsWith('/') && typeof window !== 'undefined') {
    fetchUrl = `${window.location.origin}${url}`;
  }
  
  console.log('=== FETCH DEBUG: Attempting to fetch URL:', url, '(resolved to:', fetchUrl, ')');
  try {
    const response = await fetch(fetchUrl);
    console.log('=== FETCH DEBUG: Response status:', response.status, response.statusText);
    if (!response.ok) {
      console.error('=== FETCH DEBUG: Fetch failed with status:', response.status);
      throw new Error(`Failed to fetch ${fetchUrl}: ${response.status} ${response.statusText}`);
    }
    const blob = await response.blob();
    console.log('=== FETCH DEBUG: Successfully fetched blob, size:', blob.size, 'bytes, type:', blob.type);
    return blob;
  } catch (error) {
    console.error('=== FETCH DEBUG: Fetch error for URL:', fetchUrl, error);
    throw error;
  }
}

/**
 * Extract filename from URL
 */
function getImageFilename(url: string): string {
  if (!url) {
    return 'default.jpg';
  }
  const urlParts = url.split('/');
  const filename = urlParts[urlParts.length - 1];
  return filename.includes('.') ? filename : `${filename}.jpg`;
}

/**
 * Generate README file for exported project
 */
function generateReadme(config: ConfigData): string {
  return `# ${config.projectName || 'Panorama Project'} - Exported Viewer

This is a standalone panorama viewer exported from the Panor-viewer application.

## How to Use

1. Extract all files to a web server directory
2. Open \`index.html\` in a web browser
3. The viewer will automatically load and display your panoramas

## Features Included

- ✅ Full panorama viewing with Marzipano
- ✅ Interactive minimap with scene navigation
- ✅ Logo branding display
- ✅ Scene hotspots for navigation
- ✅ Responsive design for mobile and desktop

## Features Excluded

- ❌ Project management tools
- ❌ POI editing and management
- ❌ Performance monitoring
- ❌ Hotspot density controls

## Technical Requirements

- Modern web browser with JavaScript enabled
- Web server (for local viewing, use a local server like Live Server, http-server, etc.)
- No additional dependencies required

## File Structure

\`\`\`
├── index.html          # Main viewer page
├── styles.css          # Viewer styles
├── viewer.js           # Viewer functionality
├── marzipano.js        # Panorama library
├── README.md           # This file
└── assets/
    ├── images/         # Panorama images
    ├── logo/           # Logo files
    └── poi/            # POI attachments
\`\`\`

## Support

This is a standalone export. For editing or management features, use the original Panor-viewer application.

Generated on: ${new Date().toISOString()}
`;
}

// Embedded templates as fallbacks
function getEmbeddedHTMLTemplate(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{PROJECT_NAME}} - Panorama Viewer</title>
    <link rel="stylesheet" href="./styles.css">
</head>
<body class="panorama-viewer">
    <div class="loading-screen" id="loadingScreen">
        <div class="spinner"></div>
        <span>Loading panorama...</span>
    </div>
    
    <div id="pano"></div>
    
    <!-- Logo Component - Matching main viewer design -->
    <div class="logo-container absolute default" id="logo-container">
        <img src="./assets/logo/primezone-logo.svg" alt="PrimeZone Logo" class="logo-image" style="cursor: pointer;">
    </div>
    
    <!-- MiniMap Component - Matching main viewer design -->
    <div class="minimap" id="minimap-container">
        <div class="minimap-header">
            <span id="floor-indicator">Floor 1</span>
            <button class="minimize-button" aria-label="Minimize minimap">−</button>
        </div>
        <div class="minimap-content" id="minimap-content">
            <div class="map-grid"></div>
            <!-- Scene hotspots will be added dynamically -->
            <div class="zoom-indicator" id="zoom-indicator">100%</div>
            <div class="hotspot-counter" id="hotspot-counter">0/0</div>
            <div class="scroll-hint">Scroll to zoom • Drag to pan</div>
        </div>
    </div>
    
    <!-- Control Panel Component - Lightweight version -->
    <div class="control-panel" id="controls-container">
        <!-- Floor Selector Panel -->
        <div class="control-button" id="floors-button">
            <svg class="control-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7v10c0 5.55 3.84 10 9 11 5.16-1 9-5.45 9-11V7l-10-5z"/>
            </svg>
            <div class="panel-content" id="floors-panel">
                <div class="panel-header">
                    <h3>Floor Navigation</h3>
                    <button class="panel-close">×</button>
                </div>
                <div class="panel-body" id="floors-list">
                    <!-- Floor buttons will be added dynamically -->
                </div>
            </div>
        </div>
    </div>
    
    <script id="project-data" type="application/json">{{PROJECT_DATA}}</script>
    <script src="./marzipano.js"></script>
    <script src="./viewer.js"></script>
</body>
</html>`;
}

function getEmbeddedCSSTemplate(): string {
  return `/* Standalone Panorama Viewer Styles */
body {
    margin: 0;
    padding: 0;
    font-family: Arial, sans-serif;
    background: #000;
    overflow: hidden;
}

#pano {
    width: 100vw;
    height: 100vh;
}

#ui {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 1000;
}

/* Logo Component Styles - Matching main viewer */
.logo-container {
    z-index: 1100;
    transition: all 0.3s ease;
    pointer-events: auto;
}

.absolute {
    position: absolute;
    top: 20px;
    left: 20px;
}

.logo-image {
    height: 60px;
    width: auto;
    display: block;
    transition: all 0.3s ease;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))
        drop-shadow(0 1px 2px rgba(0, 0, 0, 0.5))
        drop-shadow(0 0 1px rgba(255, 255, 255, 0.1));
}

.logo-image:hover {
    transform: scale(1.05);
    filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.4))
        drop-shadow(0 2px 4px rgba(0, 0, 0, 0.6))
        drop-shadow(0 0 2px rgba(255, 255, 255, 0.2));
}

/* MiniMap Component Styles - Matching main viewer */
.minimap {
    position: fixed;
    right: 20px;
    bottom: 20px;
    width: 200px;
    height: 200px;
    background: rgba(0, 0, 0, 0.8);
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 10px;
    backdrop-filter: blur(10px);
    user-select: none;
    transition: all 0.3s ease;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    pointer-events: auto;
    z-index: 1050;
}

.minimap:hover {
    border-color: rgba(255, 255, 255, 0.4);
    box-shadow: 0 12px 48px rgba(0, 0, 0, 0.4);
}

.minimap-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    font-size: 12px;
    color: white;
    font-weight: 500;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 10px 10px 0 0;
}

.minimap-content {
    position: relative;
    width: 100%;
    height: calc(100% - 40px);
    overflow: hidden;
    border-radius: 0 0 10px 10px;
    cursor: grab;
    will-change: transform;
    transform: translateZ(0);
}

.minimap-content:active {
    cursor: grabbing;
}

.map-grid {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image:
        linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
    background-size: 20px 20px;
    opacity: 0.5;
}

.scene-hotspot {
    position: absolute;
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    will-change: transform, opacity;
    transform: translateZ(0);
}

.scene-hotspot:hover {
    transform: translate(-50%, -50%) scale(1.3) !important;
}

.scene-hotspot.current {
    background: #ff4444 !important;
    border: 2px solid white !important;
    width: 12px;
    height: 12px;
    z-index: 20;
    animation: pulse 2s infinite;
}

.scene-hotspot.other {
    background: #0099ff;
    border: 1.5px solid white;
    width: 8px;
    height: 8px;
    z-index: 5;
}

@keyframes pulse {
    0% {
        box-shadow: 0 0 0 0 rgba(255, 68, 68, 0.7);
    }
    70% {
        box-shadow: 0 0 0 10px rgba(255, 68, 68, 0);
    }
    100% {
        box-shadow: 0 0 0 0 rgba(255, 68, 68, 0);
    }
}

.zoom-indicator {
    position: absolute;
    bottom: 8px;
    right: 8px;
    background: rgba(0, 0, 0, 0.6);
    color: white;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 10px;
    font-weight: 500;
    border: 1px solid rgba(255, 255, 255, 0.3);
    z-index: 20;
}

.hotspot-counter {
    position: absolute;
    bottom: 8px;
    left: 8px;
    background: rgba(0, 0, 0, 0.6);
    color: white;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 10px;
    font-weight: 500;
    border: 1px solid rgba(255, 255, 255, 0.3);
    z-index: 20;
}

.scroll-hint {
    position: absolute;
    bottom: 8px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 10px;
    white-space: nowrap;
    opacity: 0.7;
    pointer-events: none;
    z-index: 20;
    transition: opacity 0.3s ease;
}

.minimap:hover .scroll-hint {
    opacity: 1;
}

.minimize-button {
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    font-size: 14px;
    padding: 4px 6px;
    border-radius: 4px;
    transition: background 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 24px;
    height: 24px;
}

.minimize-button:hover {
    background: rgba(255, 255, 255, 0.2);
}

/* Control Panel Styles - Matching main viewer */
.control-panel {
    position: fixed;
    left: 20px;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    flex-direction: column;
    gap: 8px;
    z-index: 1050;
    pointer-events: auto;
}

.control-button {
    position: relative;
    width: 48px;
    height: 48px;
    background: rgba(0, 0, 0, 0.8);
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
}

.control-button:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.5);
    transform: scale(1.05);
}

.control-icon {
    width: 24px;
    height: 24px;
    color: white;
    transition: color 0.3s ease;
}

.panel-content {
    position: absolute;
    left: 60px;
    top: 0;
    min-width: 200px;
    background: rgba(0, 0, 0, 0.9);
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 12px;
    backdrop-filter: blur(15px);
    opacity: 0;
    visibility: hidden;
    transform: translateX(-10px);
    transition: all 0.3s ease;
    z-index: 1100;
}

.control-button.expanded .panel-content {
    opacity: 1;
    visibility: visible;
    transform: translateX(0);
}

.panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.panel-header h3 {
    margin: 0;
    color: white;
    font-size: 14px;
    font-weight: 600;
}

.panel-close {
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    font-size: 18px;
    padding: 0;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: background 0.2s ease;
}

.panel-close:hover {
    background: rgba(255, 255, 255, 0.2);
}

.panel-body {
    padding: 16px;
}

.floor-button {
    display: block;
    width: 100%;
    padding: 8px 12px;
    margin-bottom: 8px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 6px;
    color: white;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 12px;
}

.floor-button:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.4);
}

.floor-button.active {
    background: rgba(0, 153, 255, 0.3);
    border-color: #0099ff;
}

/* Loading Screen Styles */
.loading-screen {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    color: white;
    font-size: 18px;
}

.loading-screen.hidden {
    display: none;
}

.spinner {
    border: 3px solid rgba(255, 255, 255, 0.3);
    border-top: 3px solid #fff;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
    margin-right: 15px;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

/* Responsive Design */
@media (max-width: 768px) {
    .logo-container.absolute {
        top: 16px;
        left: 16px;
    }
    
    .logo-image {
        height: 50px;
    }
    
    .minimap {
        right: 10px;
        bottom: 10px;
        width: 150px;
        height: 150px;
    }
    
    .control-panel {
        left: 10px;
    }
}

@media (max-width: 480px) {
    .logo-container.absolute {
        top: 12px;
        left: 12px;
    }
    
    .logo-image {
        height: 45px;
    }
    
    .minimap {
        right: 5px;
        bottom: 5px;
        width: 120px;
        height: 120px;
    }
}`;
}

function getEmbeddedJSTemplate(): string {
  return `// Standalone Panorama Viewer with MiniMap, Floor Navigation, and POI Support
class StandalonePanoramaViewer {
  constructor() {
    this.viewer = null;
    this.scenes = {};
    this.currentScene = null;
    this.projectData = null;
    this.miniMap = null;
    this.controlPanel = null;
    this.init();
  }
  
  async init() {
    try {
      const projectDataElement = document.getElementById('project-data');
      this.projectData = JSON.parse(projectDataElement.textContent);
      
      if (typeof Marzipano === 'undefined') {
        await this.waitForMarzipano();
      }
      
      this.initViewer();
      this.initMiniMap();
      this.initControlPanel();
      this.initLogo();
      
      if (this.projectData.config && this.projectData.config.scenes.length > 0) {
        const initialScene = this.projectData.config.scenes[0];
        await this.loadScene(initialScene.id);
      }
      
      this.hideLoadingScreen();
    } catch (error) {
      console.error('Failed to initialize viewer:', error);
      this.showError('Failed to load panorama viewer');
    }
  }
  
  waitForMarzipano() {
    return new Promise((resolve) => {
      const checkMarzipano = () => {
        if (typeof Marzipano !== 'undefined') {
          resolve();
        } else {
          setTimeout(checkMarzipano, 100);
        }
      };
      checkMarzipano();
    });
  }
  
  initViewer() {
    const panoElement = document.getElementById('pano');
    const viewerOpts = { controls: { mouseViewMode: 'drag' } };
    this.viewer = new Marzipano.Viewer(panoElement, viewerOpts);
  }

  initLogo() {
    const logo = document.querySelector('.logo-image');
    if (logo) {
      logo.addEventListener('click', () => {
        console.log('Logo clicked');
      });
    }
  }

  initMiniMap() {
    this.miniMap = {
      element: document.getElementById('minimap-container'),
      content: document.getElementById('minimap-content'),
      isMinimized: false,
      zoomLevel: 1,
      panOffset: { x: 0, y: 0 },
      isDragging: false,
      isPanning: false
    };

    const minimizeBtn = this.miniMap.element?.querySelector('.minimize-button');
    if (minimizeBtn) {
      minimizeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleMiniMapMinimize();
      });
    }

    this.initMiniMapInteractions();
  }

  initMiniMapInteractions() {
    const content = this.miniMap.content;
    if (!content) return;

    content.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.15 : 0.15;
      this.miniMap.zoomLevel = Math.max(0.5, Math.min(4, this.miniMap.zoomLevel + delta));
      this.updateZoomIndicator();
    }, { passive: false });

    let startPos = { x: 0, y: 0 };
    let startPan = { x: 0, y: 0 };

    content.addEventListener('mousedown', (e) => {
      if (e.target.classList.contains('scene-hotspot')) return;
      this.miniMap.isPanning = true;
      startPos = { x: e.clientX, y: e.clientY };
      startPan = { ...this.miniMap.panOffset };
      content.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', (e) => {
      if (!this.miniMap.isPanning) return;
      const deltaX = e.clientX - startPos.x;
      const deltaY = e.clientY - startPos.y;
      this.miniMap.panOffset.x = startPan.x + deltaX * 0.5;
      this.miniMap.panOffset.y = startPan.y + deltaY * 0.5;
      this.updateMiniMap();
    });

    document.addEventListener('mouseup', () => {
      this.miniMap.isPanning = false;
      content.style.cursor = 'grab';
    });
  }

  toggleMiniMapMinimize() {
    this.miniMap.isMinimized = !this.miniMap.isMinimized;
    const element = this.miniMap.element;
    const button = element.querySelector('.minimize-button');
    
    if (this.miniMap.isMinimized) {
      element.style.width = '60px';
      element.style.height = '60px';
      element.querySelector('.minimap-content').style.display = 'none';
      button.textContent = '📍';
    } else {
      element.style.width = '200px';
      element.style.height = '200px';
      element.querySelector('.minimap-content').style.display = 'block';
      button.textContent = '−';
    }
  }

  updateMiniMap() {
    if (!this.currentScene || this.miniMap.isMinimized) return;

    const content = this.miniMap.content;
    const currentSceneData = this.projectData.config.scenes.find(s => s.id === this.currentScene);
    const currentFloorScenes = this.projectData.config.scenes.filter(s => s.floor === currentSceneData?.floor);
    
    content.querySelectorAll('.scene-hotspot').forEach(el => el.remove());
    
    const bounds = this.calculateSceneBounds(currentFloorScenes);
    
    currentFloorScenes.forEach(scene => {
      const coords = this.sceneToMapCoords(scene, bounds);
      const hotspot = document.createElement('div');
      hotspot.className = \`scene-hotspot \${scene.id === this.currentScene ? 'current' : 'other'}\`;
      hotspot.style.left = \`\${coords.x}%\`;
      hotspot.style.top = \`\${coords.y}%\`;
      hotspot.style.transform = 'translate(-50%, -50%)';
      hotspot.title = \`\${scene.name} (Floor \${scene.floor})\`;
      
      if (scene.id !== this.currentScene) {
        hotspot.addEventListener('click', (e) => {
          e.stopPropagation();
          this.loadScene(scene.id);
        });
      }
      
      content.appendChild(hotspot);
    });
    
    this.updateHotspotCounter(currentFloorScenes.length, currentFloorScenes.length);
  }

  calculateSceneBounds(scenes) {
    if (scenes.length === 0) return { minX: 0, maxX: 1, minY: 0, maxY: 1 };
    
    const positions = scenes.map(s => s.position || { x: 0, y: 0 });
    const minX = Math.min(...positions.map(p => p.x));
    const maxX = Math.max(...positions.map(p => p.x));
    const minY = Math.min(...positions.map(p => p.y));
    const maxY = Math.max(...positions.map(p => p.y));
    
    const paddingX = Math.max((maxX - minX) * 0.2, 1);
    const paddingY = Math.max((maxY - minY) * 0.2, 1);
    
    return {
      minX: minX - paddingX,
      maxX: maxX + paddingX,
      minY: minY - paddingY,
      maxY: maxY + paddingY
    };
  }

  sceneToMapCoords(scene, bounds) {
    const position = scene.position || { x: 0, y: 0 };
    const mapWidth = bounds.maxX - bounds.minX;
    const mapHeight = bounds.maxY - bounds.minY;
    
    if (mapWidth === 0 || mapHeight === 0) return { x: 50, y: 50 };
    
    const normalizedX = (position.x - bounds.minX) / mapWidth;
    const normalizedY = (position.y - bounds.minY) / mapHeight;
    
    let x = 50 + (normalizedX * 100 - 50) * this.miniMap.zoomLevel;
    let y = 50 + ((1 - normalizedY) * 100 - 50) * this.miniMap.zoomLevel;
    
    x += this.miniMap.panOffset.x * 0.1;
    y += this.miniMap.panOffset.y * 0.1;
    
    return { x, y };
  }

  updateZoomIndicator() {
    const indicator = document.getElementById('zoom-indicator');
    if (indicator) {
      indicator.textContent = \`\${Math.round(this.miniMap.zoomLevel * 100)}%\`;
    }
  }

  updateHotspotCounter(visible, total) {
    const counter = document.getElementById('hotspot-counter');
    if (counter) {
      counter.textContent = \`\${visible}/\${total}\`;
    }
  }

  updateFloorIndicator() {
    const indicator = document.getElementById('floor-indicator');
    const currentSceneData = this.projectData.config.scenes.find(s => s.id === this.currentScene);
    if (indicator && currentSceneData) {
      indicator.textContent = \`Floor \${currentSceneData.floor || 1}\`;
    }
  }

  initControlPanel() {
    this.controlPanel = {
      element: document.getElementById('controls-container'),
      expandedPanel: null
    };

    const floorsButton = document.getElementById('floors-button');
    const floorsPanel = document.getElementById('floors-panel');
    
    if (floorsButton && floorsPanel) {
      floorsButton.addEventListener('click', (e) => {
        e.stopPropagation();
        this.togglePanel('floors');
      });
      
      const closeBtn = floorsPanel.querySelector('.panel-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.closePanel();
        });
      }
      
      this.populateFloorsList();
    }
    
    document.addEventListener('click', (e) => {
      if (!this.controlPanel.element?.contains(e.target)) {
        this.closePanel();
      }
    });
  }

  togglePanel(panelId) {
    if (this.controlPanel.expandedPanel === panelId) {
      this.closePanel();
    } else {
      this.openPanel(panelId);
    }
  }

  openPanel(panelId) {
    this.closePanel();
    this.controlPanel.expandedPanel = panelId;
    const button = document.getElementById(\`\${panelId}-button\`);
    if (button) {
      button.classList.add('expanded');
    }
  }

  closePanel() {
    if (this.controlPanel.expandedPanel) {
      const button = document.getElementById(\`\${this.controlPanel.expandedPanel}-button\`);
      if (button) {
        button.classList.remove('expanded');
      }
    }
    this.controlPanel.expandedPanel = null;
  }

  populateFloorsList() {
    const floorsList = document.getElementById('floors-list');
    if (!floorsList) return;
    
    const floors = [...new Set(this.projectData.config.scenes.map(s => s.floor || 1))].sort((a, b) => a - b);
    
    floorsList.innerHTML = '';
    floors.forEach(floor => {
      const button = document.createElement('button');
      button.className = 'floor-button';
      button.textContent = \`Floor \${floor}\`;
      button.addEventListener('click', () => {
        this.navigateToFloor(floor);
        this.closePanel();
      });
      floorsList.appendChild(button);
    });
    
    this.updateActiveFloorButton();
  }

  updateActiveFloorButton() {
    const buttons = document.querySelectorAll('.floor-button');
    const currentSceneData = this.projectData.config.scenes.find(s => s.id === this.currentScene);
    buttons.forEach(btn => {
      btn.classList.remove('active');
      if (currentSceneData && btn.textContent === \`Floor \${currentSceneData.floor || 1}\`) {
        btn.classList.add('active');
      }
    });
  }

  navigateToFloor(floor) {
    const floorScenes = this.projectData.config.scenes.filter(s => (s.floor || 1) === floor);
    if (floorScenes.length > 0) {
      this.loadScene(floorScenes[0].id);
    }
  }
  
  async loadScene(sceneId) {
    try {
      const sceneData = this.projectData.config.scenes.find(s => s.id === sceneId);
      if (!sceneData) throw new Error(\`Scene \${sceneId} not found\`);
      
      if (!this.scenes[sceneId]) {
        const source = Marzipano.ImageUrlSource.fromString(sceneData.imageUrl);
        const geometry = new Marzipano.EquirectGeometry([{ width: 4096 }]);
        const view = new Marzipano.RectilinearView(sceneData.initialViewParameters || { yaw: 0, pitch: 0, fov: Math.PI / 4 });
        
        const scene = this.viewer.createScene({ source: source, geometry: geometry, view: view, pinFirstLevel: true });
        this.scenes[sceneId] = { scene: scene, data: sceneData, hotspots: [] };
      }
      
      this.scenes[sceneId].scene.switchTo();
      this.currentScene = sceneId;
      
      this.updateMiniMap();
      this.updateFloorIndicator();
      this.updateActiveFloorButton();
      this.loadPOIsForScene(sceneId);
    } catch (error) {
      console.error('Failed to load scene:', error);
      this.showError(\`Failed to load scene: \${sceneId}\`);
    }
  }

  loadPOIsForScene(sceneId) {
    const scenePOIs = (this.projectData.pois || []).filter(poi => poi.panoramaId === sceneId);
    
    document.querySelectorAll('.poi-hotspot').forEach(el => el.remove());
    
    scenePOIs.forEach(poi => {
      this.createPOIHotspot(poi);
    });
  }

  createPOIHotspot(poi) {
    if (!this.viewer || !poi.position) return;
    
    const hotspot = document.createElement('div');
    hotspot.className = 'poi-hotspot';
    hotspot.innerHTML = '📍';
    hotspot.style.cssText = \`
      position: absolute;
      background: rgba(255, 255, 255, 0.9);
      border: 2px solid #0099ff;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 12px;
      z-index: 100;
    \`;
    
    hotspot.addEventListener('click', () => {
      this.showPOIModal(poi);
    });
    
    const scene = this.viewer.scene();
    if (scene) {
      scene.hotspotContainer().createHotspot(hotspot, {
        yaw: poi.position.yaw || 0,
        pitch: poi.position.pitch || 0
      });
    }
  }

  showPOIModal(poi) {
    const modal = document.createElement('div');
    modal.style.cssText = \`
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
    \`;
    
    const content = document.createElement('div');
    content.style.cssText = \`
      background: white;
      padding: 20px;
      border-radius: 8px;
      max-width: 500px;
      max-height: 70vh;
      overflow-y: auto;
    \`;
    
    content.innerHTML = \`
      <h3>\${poi.title || 'Point of Interest'}</h3>
      <p>\${poi.description || ''}</p>
      \${poi.type === 'file' && poi.content ? \`<a href="\${poi.content}" target="_blank">View Attachment</a>\` : ''}
      <br><br>
      <button onclick="this.parentElement.parentElement.remove()" style="padding: 8px 16px; background: #0099ff; color: white; border: none; border-radius: 4px; cursor: pointer;">Close</button>
    \`;
    
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  }
  
  hideLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) loadingScreen.classList.add('hidden');
  }
  
  showError(message) {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
      loadingScreen.innerHTML = \`<div style="text-align: center;"><div style="color: #ef4444; font-size: 24px; margin-bottom: 10px;">⚠</div><div>\${message}</div><button onclick="location.reload()" style="margin-top: 15px; padding: 8px 16px; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.3); border-radius: 6px; color: white; cursor: pointer;">Retry</button></div>\`;
    }
  }
}

let viewer;
document.addEventListener('DOMContentLoaded', () => {
  viewer = new StandalonePanoramaViewer();
});
window.viewer = viewer;`;
}