import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
import archiver from "archiver";
import { promisify } from "util";

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const readFile = promisify(fs.readFile);

interface ExportOptions {
  includeAssets: boolean;
  includePOI: boolean;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { projectId } = req.query;
  const { includeAssets = true, includePOI = true }: ExportOptions = req.body;

  if (!projectId || typeof projectId !== "string") {
    return res.status(400).json({ error: "Project ID is required" });
  }

  try {
    // Get platform-specific user data directory
    const getUserDataPath = () => {
      const os = require('os');
      const platform = os.platform();
      
      switch (platform) {
        case 'win32':
          return path.join(os.homedir(), 'AppData', 'Roaming', 'advanced-panorama-viewer');
        case 'darwin':
          return path.join(os.homedir(), 'Library', 'Application Support', 'advanced-panorama-viewer');
        case 'linux':
          return path.join(os.homedir(), '.config', 'advanced-panorama-viewer');
        default:
          return path.join(os.homedir(), '.advanced-panorama-viewer');
      }
    };
    
    const projectsPath =
      process.env.PROJECTS_PATH || path.join(getUserDataPath(), 'projects');
    const projectDir = path.join(projectsPath, projectId);
    const configPath = path.join(projectDir, "config.json");

    if (!fs.existsSync(projectDir)) {
      return res.status(404).json({ error: "Project not found" });
    }

    if (!fs.existsSync(configPath)) {
      return res.status(404).json({ error: "Project configuration not found" });
    }

    // Read project configuration
    const configData = JSON.parse(await readFile(configPath, "utf8"));
    
    // Read project metadata
    let projectName = projectId;
    const metadataPath = path.join(projectDir, "project-metadata.json");
    if (fs.existsSync(metadataPath)) {
      try {
        const metadata = JSON.parse(await readFile(metadataPath, "utf8"));
        if (metadata.name) projectName = metadata.name;
      } catch {
        // Ignore metadata parsing errors
      }
    }

    // Read POI data if requested
    let poiData = null;
    if (includePOI) {
      const poiDataPath = path.join(projectDir, "poi", "poi-data.json");
      if (fs.existsSync(poiDataPath)) {
        try {
          poiData = JSON.parse(await readFile(poiDataPath, "utf8"));
        } catch {
          // Ignore POI parsing errors
        }
      }
    }

    // Set response headers for file download
    const exportFileName = `${projectName.replace(/[^a-zA-Z0-9-_]/g, "-")}-export.zip`;
    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", `attachment; filename="${exportFileName}"`);

    // Create ZIP archive
    const archive = archiver("zip", {
      zlib: { level: 9 } // Maximum compression
    });

    archive.pipe(res);

    // Create base64 image data map if assets are included
    let imageDataMap: Map<string, string> | undefined;
    if (includeAssets && configData?.scenes) {
      imageDataMap = new Map();
      const imagesDir = path.join(projectDir, "images");
      
      for (const scene of configData.scenes) {
        const imagePath = path.join(imagesDir, `${scene.id}-pano.jpg`);
        if (fs.existsSync(imagePath)) {
          const base64Data = await convertImageToBase64(imagePath);
          if (base64Data) {
            imageDataMap.set(`${scene.id}-pano.jpg`, base64Data);
          }
        }
      }
    }

    // Generate standalone HTML file with embedded images
    const htmlContent = await generateStandaloneHTML({
      projectName,
      config: configData,
      poiData,
      includeAssets,
      includePOI,
      imageDataMap
    });

    archive.append(htmlContent, { name: "index.html" });

    // Add Marzipano library
    const marzipanoPath = path.join(process.cwd(), "public", "assets", "js", "marzipano.js");
    if (fs.existsSync(marzipanoPath)) {
      archive.file(marzipanoPath, { name: "assets/js/marzipano.js" });
    }

    // Add POI assets if requested (POI images still need to be separate files)
    if (includePOI && poiData) {
      await addPOIAssets(archive, projectDir, poiData);
    }

    await archive.finalize();

  } catch (error: any) {
    console.error("Export error:", error);
    res.status(500).json({
      error: "Internal server error",
      details: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

async function convertImageToBase64(imagePath: string): Promise<string> {
  try {
    const imageBuffer = await readFile(imagePath);
    const base64 = imageBuffer.toString('base64');
    const mimeType = imagePath.toLowerCase().endsWith('.jpg') || imagePath.toLowerCase().endsWith('.jpeg') ? 'image/jpeg' : 'image/png';
    return `data:${mimeType};base64,${base64}`;
  } catch (error) {
    console.error(`Failed to convert image to base64: ${imagePath}`, error);
    return '';
  }
}

async function generateStandaloneHTML(options: {
  projectName: string;
  config: any;
  poiData: any;
  includeAssets: boolean;
  includePOI: boolean;
  imageDataMap?: Map<string, string>;
}): Promise<string> {
  const { projectName, config, poiData, includeAssets, includePOI, imageDataMap } = options;

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${projectName} - Panoramic Viewer</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #000;
            overflow: hidden;
        }
        
        #pano {
            width: 100vw;
            height: 100vh;
            position: relative;
        }
        
        @keyframes poiFloat {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
        }

        @keyframes poiFloatHover {
            0%, 100% { transform: translateY(-5px); }
            50% { transform: translateY(-15px); }
        }

        .hotspot {
            --hotspot-base-size: 80px;
            --hotspot-bg-color: rgba(255, 255, 255, 0.3);
            --hotspot-bg-color-hover: rgba(255, 255, 255, 0.9);
            --distance-bg-color: rgba(0, 0, 0, 0.8);
            --distance-text-color: white;
            --zoom-offset-x: 0%;
            --zoom-offset-y: 0%;
            --scale-factor: 1;
            --oval-factor: 0.7;
            --perspective-rotation: 25deg;

            width: calc(var(--hotspot-base-size) * var(--scale-factor));
            height: calc(var(--hotspot-base-size) * var(--scale-factor));
            cursor: pointer;
            position: relative;
            opacity: 0;
            transform: translate(var(--zoom-offset-x), var(--zoom-offset-y)) scale(0.8);
            transition: opacity 0.3s ease-in-out, transform 0.3s ease-in-out;
        }

        .hotspot.visible {
            opacity: 1;
            transform: translate(var(--zoom-offset-x), var(--zoom-offset-y)) scale(1);
        }

        .hotspot .arrow {
            position: absolute;
            width: 100%;
            height: 100%;
            background: var(--hotspot-bg-color);
            border-radius: 50%;
            transform: perspective(200px) rotateX(var(--perspective-rotation)) scaleY(var(--oval-factor));
            box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
            transition: background 0.2s ease-in-out, mask-image 0.2s ease-in-out;
        }

        .hotspot:hover .arrow {
            background: var(--hotspot-bg-color-hover);
            /* Use a mask to create a cutout boomerang shape on hover */
            mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M50,0C22.4,0,0,22.4,0,50s22.4,50,50,50s50-22.4,50-50S77.6,0,50,0z M50,30L70,70L50,60L30,70z'/%3E%3C/svg%3E");
            mask-size: contain;
            mask-repeat: no-repeat;
            mask-position: center;
            -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M50,0C22.4,0,0,22.4,0,50s22.4,50,50,50s50-22.4,50-50S77.6,0,50,0z M50,30L70,70L50,60L30,70z'/%3E%3C/svg%3E");
            -webkit-mask-size: contain;
            -webkit-mask-repeat: no-repeat;
            -webkit-mask-position: center;
        }

        .hotspot .distance {
            position: absolute;
            bottom: -25px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--distance-bg-color);
            color: var(--distance-text-color);
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
            white-space: nowrap;
            opacity: 0;
            transition: opacity 0.2s ease-in-out;
        }

        .hotspot.visible:hover .distance {
            opacity: 1;
        }

        /* POI Floating Icon */
        .hotspot.poiGlow {
            position: relative;
        }

        .hotspot.poiGlow::before {
            content: "📍";
            position: absolute;
            top: -15px;
            left: 50%;
            transform: translateX(-50%);
            font-size: calc(20px * var(--scale-factor, 1));
            z-index: 100;
            animation: poiFloat 2s ease-in-out infinite;
            filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
            pointer-events: none;
            transition: font-size 0.2s ease-in-out;
        }

        .hotspot.poiGlow:hover::before {
            animation: poiFloatHover 1.5s ease-in-out infinite;
            font-size: calc(22px * var(--scale-factor, 1));
        }

        @keyframes poiFloat {
            0% {
                transform: translateX(-50%) translateY(0px);
                opacity: 0.8;
            }
            50% {
                transform: translateX(-50%) translateY(-5px);
                opacity: 1;
            }
            100% {
                transform: translateX(-50%) translateY(0px);
                opacity: 0.8;
            }
        }

        @keyframes poiFloatHover {
            0% {
                transform: translateX(-50%) translateY(-2px);
                opacity: 0.9;
            }
            50% {
                transform: translateX(-50%) translateY(-8px);
                opacity: 1;
            }
            100% {
                transform: translateX(-50%) translateY(-2px);
                opacity: 0.9;
            }
        }
        
        .poi-hotspot {
            --poi-size: 60px;
            width: var(--poi-size);
            height: var(--poi-size);
            cursor: pointer;
            position: relative;
            opacity: 0;
            transform: scale(0.8);
            transition: opacity 0.3s ease-in-out, transform 0.3s ease-in-out;
            animation: poiFloat 3s ease-in-out infinite;
        }

        .poi-hotspot.visible {
            opacity: 1;
            transform: scale(1);
        }

        .poi-hotspot:hover {
            animation: poiFloatHover 2s ease-in-out infinite;
        }

        .poi-hotspot .poi-icon {
            position: absolute;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #ff6b6b, #ee5a24);
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            transition: all 0.2s ease-in-out;
        }

        .poi-hotspot:hover .poi-icon {
            background: linear-gradient(135deg, #ff5252, #d84315);
            box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
        }

        .poi-hotspot::before {
            content: "📍";
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(45deg);
            font-size: 24px;
            z-index: 100;
            filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
            pointer-events: none;
            transition: font-size 0.2s ease-in-out;
        }

        .poi-hotspot:hover::before {
            font-size: 26px;
        }

        /* Mobile responsive styles */
        @media (max-width: 768px) {
            .hotspot {
                --hotspot-base-size: 60px;
            }
            
            .poi-hotspot {
                --poi-size: 45px;
            }
            
            .poi-hotspot::before {
                font-size: 18px;
            }
            
            .poi-hotspot:hover::before {
                font-size: 20px;
            }
        }
         
         .loading {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: #000;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 18px;
            z-index: 1000;
        }
        
        .error {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(220, 53, 69, 0.9);
            color: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            z-index: 1001;
        }
    </style>
</head>
<body>
    <div id="loading" class="loading">Loading panoramic viewer...</div>
    <div id="pano"></div>
    <div id="cors-notice" style="display: none; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(0,0,0,0.8); color: white; padding: 20px; border-radius: 8px; text-align: center; z-index: 1000;">
        <h3>CORS Error Detected</h3>
        <p>This panoramic viewer cannot be opened directly from the file system.</p>
        <p><strong>To view this export:</strong></p>
        <ol style="text-align: left; margin: 10px 0;">
            <li>Start a local web server (e.g., Python: <code>python -m http.server</code>)</li>
            <li>Or use Live Server extension in VS Code</li>
            <li>Or upload to a web server</li>
        </ol>
        <button onclick="document.getElementById('cors-notice').style.display='none'">Close</button>
    </div>
    
    <script src="assets/js/marzipano.js"></script>
    <script>
        // Configuration data
        const CONFIG = ${JSON.stringify(config, null, 2)};
        const POI_DATA = ${includePOI ? JSON.stringify(poiData, null, 2) : 'null'};
        
        // Base64 image data
        const IMAGE_DATA = ${imageDataMap ? JSON.stringify(Object.fromEntries(imageDataMap), null, 2) : '{}'};
        
        // Global variables
        let viewer;
        let scenes = {};
        let currentScene = null;
        let maxHotspots = 40; // Default max hotspots (matching main project)
        
        // Initialize the panoramic viewer
        function initViewer() {
            try {
                // Create viewer
                viewer = new Marzipano.Viewer(document.getElementById('pano'));
                
                // Create scenes
                CONFIG.scenes.forEach(sceneData => {
                    const imageKey = sceneData.id + '-pano.jpg';
                    const imageData = IMAGE_DATA[imageKey];
                    
                    if (!imageData) {
                        console.error('Missing image data for scene: ' + sceneData.id);
                        return;
                    }
                    
                    const source = Marzipano.ImageUrlSource.fromString(imageData);
                    
                    // Use EquirectGeometry with proper levels format
                    const geometry = new Marzipano.EquirectGeometry([
                        { width: 512 },
                        { width: 1024 },
                        { width: 2048 },
                        { width: 4096 }
                    ]);
                    const view = new Marzipano.RectilinearView(
                        sceneData.initialViewParameters,
                        Marzipano.RectilinearView.limit.traditional(1024, 100 * Math.PI / 180)
                    );
                    
                    const scene = viewer.createScene({
                        source: source,
                        geometry: geometry,
                        view: view,
                        pinFirstLevel: true
                    });
                    
                    scenes[sceneData.id] = {
                        scene: scene,
                        data: sceneData,
                        hotspotContainer: scene.hotspotContainer(),
                        hotspots: []
                    };
                });
                
                // Switch to first scene
                if (CONFIG.scenes.length > 0) {
                    switchToScene(CONFIG.scenes[0].id);
                }
                
                document.getElementById('loading').style.display = 'none';
                
            } catch (error) {
                console.error('Error initializing viewer:', error);
                
                // Check if it's a CORS error
                if (error.message && error.message.includes('CORS') || 
                    (typeof error === 'string' && error.includes('CORS')) ||
                    window.location.protocol === 'file:') {
                    document.getElementById('cors-notice').style.display = 'block';
                } else {
                    showError('Failed to initialize panoramic viewer: ' + error.message);
                }
            }
        }
        
        // Calculate 3D distance between two positions
        function calculate3DDistance(pos1, pos2) {
            const dx = pos1.x - pos2.x;
            const dy = pos1.y - pos2.y;
            const dz = pos1.z - pos2.z;
            return Math.sqrt(dx * dx + dy * dy + dz * dz);
        }
        
        // Switch to a specific scene with proper hotspot management
        function switchToScene(sceneId) {
            if (!scenes[sceneId]) {
                console.error('Scene not found:', sceneId);
                return;
            }
            
            const sceneInfo = scenes[sceneId];
            currentScene = sceneId;
            
            // Clear existing hotspots for all scenes
            Object.values(scenes).forEach(s => {
                if (s.hotspotContainer && s.hotspots) {
                    s.hotspots.forEach(hotspot => {
                        try {
                            s.hotspotContainer.destroyHotspot(hotspot);
                        } catch (e) {
                            console.warn('Failed to destroy hotspot:', e);
                        }
                    });
                    s.hotspots = [];
                }
            });
            
            // Switch scene
            sceneInfo.scene.switchTo();
            
            // Create hotspots with distance-based filtering (matching main project logic)
            createHotspotsForScene(sceneInfo);
            
            // Add POI hotspots if available
            if (POI_DATA && Array.isArray(POI_DATA)) {
                POI_DATA.filter(poi => poi.panoramaId === sceneId).forEach(poi => {
                    const createdHotspot = createPOIHotspot(sceneInfo.hotspotContainer, poi);
                    if (createdHotspot) sceneInfo.hotspots.push(createdHotspot);
                });
            }
        }
        
        // Create hotspots for a scene with distance-based filtering (matching useHotspotManager logic)
        function createHotspotsForScene(sceneInfo) {
            if (!sceneInfo?.scene || !sceneInfo.data?.linkHotspots) {
                console.log('No hotspots to create for scene', sceneInfo.data?.id || 'unknown');
                return;
            }
            
            const hotspotContainer = sceneInfo.hotspotContainer;
            if (!hotspotContainer) {
                console.warn('No hotspot container found');
                return;
            }
            
            // Get current scene position for distance calculation
            const currentPosition = sceneInfo.data.position;
            if (!currentPosition) {
                console.warn('Current scene position not available for distance calculation');
                return;
            }
            
            // Create hotspot data with distances and sort by distance
            const hotspotsWithDistance = sceneInfo.data.linkHotspots
                .map((hotspotData, originalIndex) => {
                    // Find target scene position
                    const targetScene = CONFIG.scenes.find(s => s.id === hotspotData.target);
                    let distance = 0;
                    
                    if (targetScene?.position) {
                        distance = calculate3DDistance(currentPosition, targetScene.position);
                    } else {
                        // Fallback: use hotspot distance if available, otherwise set high value
                        distance = hotspotData.distance || 999;
                    }
                    
                    return {
                        ...hotspotData,
                        originalIndex,
                        calculatedDistance: distance,
                    };
                })
                .sort((a, b) => a.calculatedDistance - b.calculatedDistance)
                .slice(0, maxHotspots); // Limit to maxHotspots (40 by default)
            
            // Create hotspots from the filtered and sorted list
            hotspotsWithDistance.forEach((hotspotData, index) => {
                try {
                    if (typeof hotspotData.yaw !== 'number' || typeof hotspotData.pitch !== 'number') {
                        console.warn('Invalid hotspot data at index', index, hotspotData);
                        return;
                    }
                    
                    const element = document.createElement('div');
                    element.setAttribute('data-hotspot-index', hotspotData.originalIndex.toString());
                    element.setAttribute('data-target-scene', hotspotData.target || 'unknown');
                    element.setAttribute('data-distance', hotspotData.calculatedDistance.toFixed(2));
                    
                    // Create navigation hotspot with proper styling
                    const createdHotspot = createNavigationHotspot(hotspotContainer, hotspotData, element);
                    if (createdHotspot) {
                        sceneInfo.hotspots.push(createdHotspot);
                    }
                } catch (hotspotErr) {
                    console.error('Failed to create hotspot', index, hotspotErr);
                }
            });
            
            console.log(
                'Created ' + sceneInfo.hotspots.length + '/' + sceneInfo.data.linkHotspots.length + ' hotspots for scene ' + sceneInfo.data.id + ' (limited by maxHotspots: ' + maxHotspots + ')'
            );
        }
        
        // Apply distance-based styling for realistic perspective (matching Hotspot.tsx logic)
        function applyDistanceBasedStyling(element, distance) {
            const minDistance = 1;
            const maxDistance = 20;
            
            // Scale factor: closer = very large (1.5), farther = much smaller (0.2)
            const scaleFactor = Math.max(
                0.2,
                Math.min(
                    1.5,
                    1.5 - ((distance - minDistance) / (maxDistance - minDistance)) * 1
                )
            );
            
            // Oval factor: closer = more circular (0.9), farther = more oval/flat (0.3)
            const ovalFactor = Math.max(
                0.3,
                Math.min(
                    0.9,
                    0.9 - ((distance - minDistance) / (maxDistance - minDistance)) * 0.6
                )
            );
            
            // Perspective rotation: farther objects appear more tilted
            const perspectiveRotation = Math.min(
                65,
                45 + ((distance - minDistance) / (maxDistance - minDistance)) * 20
            );
            
            // Apply CSS custom properties (matching Hotspot.module.css)
            element.style.setProperty('--scale-factor', scaleFactor);
            element.style.setProperty('--oval-factor', ovalFactor);
            element.style.setProperty('--perspective-rotation', perspectiveRotation + 'deg');
            
            // Apply zoom compensation and view-based adjustments
            element.style.setProperty('--zoom-compensation', '1');
            element.style.setProperty('--distance-opacity', Math.max(0.6, Math.min(1, 2 - distance / 10)));
        }
        
        // Create navigation hotspot (matching main project implementation)
        function createNavigationHotspot(container, hotspot, element) {
            if (!element) {
                element = document.createElement('div');
            }
            
            // Check if target scene has POIs
            const targetHasPOIs = POI_DATA && Array.isArray(POI_DATA) && 
                POI_DATA.some(poi => poi.panoramaId === hotspot.target);
            
            element.className = 'hotspot navigation visible' + (targetHasPOIs ? ' poiGlow' : '');
            element.title = hotspot.title || 'Navigate to scene';
            
            // Apply distance-based styling using calculated distance
            const distance = hotspot.calculatedDistance || hotspot.distance || 5;
            applyDistanceBasedStyling(element, distance);
            
            // Create arrow element
            const arrow = document.createElement('div');
            arrow.className = 'arrow';
            element.appendChild(arrow);
            
            // Add distance display
            const distanceElement = document.createElement('div');
            distanceElement.className = 'distance';
            distanceElement.textContent = distance.toFixed(1) + 'm';
            element.appendChild(distanceElement);
            
            element.addEventListener('click', () => {
                switchToScene(hotspot.target);
            });
            
            // Use exact yaw/pitch values (already in radians from config generation)
            return container.createHotspot(element, {
                yaw: hotspot.yaw,
                pitch: hotspot.pitch
            });
        }
        
        // Create info hotspot
        function createInfoHotspot(container, hotspot) {
            const element = document.createElement('div');
            element.className = 'hotspot info visible';
            element.title = hotspot.title || 'Information';
            
            // Create arrow element
            const arrow = document.createElement('div');
            arrow.className = 'arrow';
            element.appendChild(arrow);
            
            element.addEventListener('click', () => {
                if (hotspot.text) {
                    alert(hotspot.text);
                }
            });
            
            return container.createHotspot(element, {
                yaw: hotspot.yaw * (Math.PI / 180), // Convert degrees to radians
                pitch: hotspot.pitch * (Math.PI / 180) // Convert degrees to radians
            });
        }
        
        // Create POI hotspot
        function createPOIHotspot(container, poi) {
            const element = document.createElement('div');
            element.className = 'poi-hotspot visible';
            element.title = poi.title || poi.name || 'Point of Interest';
            
            // Create poi icon element
            const poiIcon = document.createElement('div');
            poiIcon.className = 'poi-icon';
            element.appendChild(poiIcon);
            
            element.addEventListener('click', () => {
                if (poi.description) {
                    alert(poi.description);
                }
            });
            
            return container.createHotspot(element, {
                yaw: (poi.yaw || poi.position?.yaw) * (Math.PI / 180), // Convert degrees to radians
                pitch: (poi.pitch || poi.position?.pitch) * (Math.PI / 180) // Convert degrees to radians
            });
        }
        
        // Show error message
        function showError(message) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error';
            errorDiv.textContent = message;
            document.body.appendChild(errorDiv);
            
            document.getElementById('loading').style.display = 'none';
        }
        
        // Handle image loading errors (CORS detection)
        window.addEventListener('error', function(e) {
            if (e.target && e.target.tagName === 'IMG' && window.location.protocol === 'file:') {
                document.getElementById('cors-notice').style.display = 'block';
            }
        }, true);
        
        // Initialize viewer when page loads
        window.addEventListener('load', initViewer);
    </script>
</body>
</html>`;
}

async function addProjectAssets(archive: archiver.Archiver, projectDir: string, config: any): Promise<void> {
  // Add panorama images
  for (const scene of config.scenes) {
    // Look for panorama image in images subdirectory
    const panoramaPath = path.join(projectDir, "images", `${scene.id}-pano.jpg`);
    if (fs.existsSync(panoramaPath)) {
      archive.file(panoramaPath, { name: `${scene.id}-pano.jpg` });
    }
  }
}

async function addPOIAssets(archive: archiver.Archiver, projectDir: string, poiData: any[]): Promise<void> {
  if (!Array.isArray(poiData)) return;
  
  // Add POI images if they exist
  for (const poi of poiData) {
    if (poi.imageUrl) {
      const imagePath = path.join(projectDir, "poi", "images", path.basename(poi.imageUrl));
      if (fs.existsSync(imagePath)) {
        archive.file(imagePath, { name: `poi/images/${path.basename(poi.imageUrl)}` });
      }
    }
  }
}

async function addDirectoryToArchive(archive: archiver.Archiver, dirPath: string, archivePath: string): Promise<void> {
  const items = await readdir(dirPath);
  
  for (const item of items) {
    const itemPath = path.join(dirPath, item);
    const itemStat = await stat(itemPath);
    
    if (itemStat.isDirectory()) {
      await addDirectoryToArchive(archive, itemPath, `${archivePath}/${item}`);
    } else {
      archive.file(itemPath, { name: `${archivePath}/${item}` });
    }
  }
}

export const config = {
  api: {
    responseLimit: false,
  },
};