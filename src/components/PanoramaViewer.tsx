'use client';

import { useState, useEffect, useRef, useCallback, MouseEvent } from 'react';
import Script from 'next/script';
import FloorSelector from './FloorSelector';
import MiniMap from './MiniMap';
import LoadingScreen from './LoadingScreen';
import POIDialog from './POIDialog';
import POIDetailsModal from './POIDetailsModal';
import POIHotspot from './POIHotspot';
import POIPreview from './POIPreview';

import Hotspot from './Hotspot';
import { checkWebGLSupport, createRipple } from '@/lib/panoramaUtils';
import { poiDB } from '@/lib/poiDatabase';
import { detectContentType } from '@/utils/contentTypeUtils';
import {
  ConfigData,
  SceneInfo as SceneInfoType,
  LinkHotspot,
  InfoHotspot,
  POIWithFiles,
} from '@/types/scenes';

// Using types imported from @/types/scenes.ts

// Utility to convert yaw/pitch to 2D screen coordinates
function yawPitchToScreen(
  yaw: number,
  pitch: number,
  width: number,
  height: number,
  fov: number,
  currentYaw: number = 0,
  currentPitch: number = 0
) {
  // Calculate relative yaw/pitch from current view
  const relativeYaw = yaw - currentYaw;
  const relativePitch = pitch - currentPitch;
  
  // Calculate aspect ratio
  const aspectRatio = width / height;
  
  // Convert FOV from degrees to radians if needed
  const fovRadians = typeof fov === 'number' ? fov : fov * Math.PI / 180;
  
  // Calculate horizontal and vertical FOV
  const verticalFov = fovRadians;
  const horizontalFov = 2 * Math.atan(Math.tan(verticalFov / 2) * aspectRatio);
  
  // Convert angular coordinates to normalized coordinates using perspective projection
  const normalizedX = relativeYaw / (horizontalFov / 2);
  const normalizedY = -relativePitch / (verticalFov / 2);
  
  // Convert to screen coordinates
  const x = ((normalizedX + 1) / 2) * width;
  const y = ((normalizedY + 1) / 2) * height;
  
  return { x, y };
}

// Utility to convert screen coordinates to yaw/pitch
function screenToYawPitch(
  screenX: number,
  screenY: number,
  width: number,
  height: number,
  fov: number,
  currentYaw: number,
  currentPitch: number,
  debug: boolean = false
) {
  // Convert screen coordinates to normalized coordinates (-1 to 1)
  const normalizedX = ((screenX / width) * 2) - 1;
  const normalizedY = ((screenY / height) * 2) - 1;
  
  // Calculate aspect ratio
  const aspectRatio = width / height;
  
  // Convert FOV from degrees to radians if needed
  const fovRadians = typeof fov === 'number' ? fov : fov * Math.PI / 180;
  
  // Calculate horizontal and vertical FOV
  const verticalFov = fovRadians;
  const horizontalFov = 2 * Math.atan(Math.tan(verticalFov / 2) * aspectRatio);
  
  // Calculate angular offsets using proper perspective projection
  const yawOffset = Math.atan(normalizedX * Math.tan(horizontalFov / 2));
  const pitchOffset = Math.atan(normalizedY * Math.tan(verticalFov / 2));
  
  // Apply to current view parameters
  const targetYaw = currentYaw + yawOffset;
  const targetPitch = Math.max(-Math.PI/2, Math.min(Math.PI/2, currentPitch + pitchOffset));
  
  if (debug) {
    console.log('screenToYawPitch debug:', {
      input: { screenX, screenY, width, height },
      normalized: { x: normalizedX, y: normalizedY },
      fov: {
        input: fov,
        inputDegrees: (fov * 180 / Math.PI).toFixed(1) + '°',
        verticalFov: verticalFov,
        horizontalFov: horizontalFov,
        verticalFovDegrees: (verticalFov * 180 / Math.PI).toFixed(1) + '°',
        horizontalFovDegrees: (horizontalFov * 180 / Math.PI).toFixed(1) + '°'
      },
      offsets: {
        yawOffset: yawOffset,
        pitchOffset: pitchOffset,
        yawOffsetDegrees: (yawOffset * 180 / Math.PI).toFixed(1) + '°',
        pitchOffsetDegrees: (pitchOffset * 180 / Math.PI).toFixed(1) + '°'
      },
      result: {
        targetYaw: targetYaw,
        targetPitch: targetPitch,
        targetYawDegrees: (targetYaw * 180 / Math.PI).toFixed(1) + '°',
        targetPitchDegrees: (targetPitch * 180 / Math.PI).toFixed(1) + '°'
      }
    });
  }
  
  return { yaw: targetYaw, pitch: targetPitch };
}

// Utility to validate and normalize yaw/pitch coordinates
function validateCoordinates(yaw: number, pitch: number) {
  // Normalize yaw to [-π, π] range
  let normalizedYaw = yaw;
  while (normalizedYaw > Math.PI) normalizedYaw -= 2 * Math.PI;
  while (normalizedYaw < -Math.PI) normalizedYaw += 2 * Math.PI;
  
  // Clamp pitch to [-π/2, π/2] range
  const normalizedPitch = Math.max(-Math.PI/2, Math.min(Math.PI/2, pitch));
  
  return {
    yaw: normalizedYaw,
    pitch: normalizedPitch,
    isValid: !isNaN(normalizedYaw) && !isNaN(normalizedPitch)
  };
}

// Utility to format coordinates for display
function formatCoordinates(yaw: number, pitch: number) {
  const yawDegrees = (yaw * 180 / Math.PI).toFixed(1);
  const pitchDegrees = (pitch * 180 / Math.PI).toFixed(1);
  return {
    yaw: `${yawDegrees}°`,
    pitch: `${pitchDegrees}°`,
    yawRadians: yaw.toFixed(4),
    pitchRadians: pitch.toFixed(4)
  };
}

// Advanced coordinate utilities based on the Python config generator
// These functions implement the same coordinate transformation logic
// used for generating navigation hotspots from 3D world coordinates

// Quaternion utilities for proper 3D transformations
function quaternionConjugate(q: [number, number, number, number]): [number, number, number, number] {
  const [w, x, y, z] = q;
  return [w, -x, -y, -z];
}

function quaternionMultiply(
  a: [number, number, number, number], 
  b: [number, number, number, number]
): [number, number, number, number] {
  const [w1, x1, y1, z1] = a;
  const [w2, x2, y2, z2] = b;
  return [
    w1*w2 - x1*x2 - y1*y2 - z1*z2,
    w1*x2 + x1*w2 + y1*z2 - z1*y2,
    w1*y2 - x1*z2 + y1*w2 + z1*x2,
    w1*z2 + x1*y2 - y1*x2 + z1*w2
  ];
}

function quaternionRotateVector(
  q: [number, number, number, number], 
  v: [number, number, number]
): [number, number, number] {
  const qConj = quaternionConjugate(q);
  const qV: [number, number, number, number] = [0, ...v];
  const rotated = quaternionMultiply(quaternionMultiply(q, qV), qConj);
  return [rotated[1], rotated[2], rotated[3]];
}

// Convert 3D world coordinates to spherical coordinates (yaw/pitch)
// This implements the same logic as the Python script for accurate positioning
function worldToSpherical(
  targetPos: [number, number, number],
  cameraPos: [number, number, number],
  cameraOrientation: [number, number, number, number], // quaternion [w, x, y, z]
  cameraHeight: number = 1.5
): { yaw: number; pitch: number; distance: number } {
  // Calculate eye position using camera height and orientation
  const eyeOffsetLocal: [number, number, number] = [0, 0, cameraHeight];
  const eyeOffsetWorld = quaternionRotateVector(cameraOrientation, eyeOffsetLocal);
  const eyePos: [number, number, number] = [
    cameraPos[0] + eyeOffsetWorld[0],
    cameraPos[1] + eyeOffsetWorld[1],
    cameraPos[2] + eyeOffsetWorld[2]
  ];
  
  // Calculate relative vector from eye position to target
  const relVec: [number, number, number] = [
    targetPos[0] - eyePos[0],
    targetPos[1] - eyePos[1],
    targetPos[2] - eyePos[2]
  ];
  
  // Transform to local coordinate system
  const localVec = quaternionRotateVector(quaternionConjugate(cameraOrientation), relVec);
  
  // Remap from NavVis to Marzipano coordinate frame
  // This is the key transformation from the Python script
  const xM = -localVec[1];  // navvis y → marzipano x
  const yM = localVec[2];   // navvis z → marzipano y  
  const zM = localVec[0];   // navvis x → marzipano z
  
  // Calculate spherical coordinates
  const yaw = Math.atan2(xM, zM);
  const pitch = -Math.atan2(yM, Math.sqrt(xM*xM + zM*zM));
  const distance = Math.sqrt(relVec[0]*relVec[0] + relVec[1]*relVec[1] + relVec[2]*relVec[2]);
  
  return { yaw, pitch, distance };
}

// Enhanced screen to yaw/pitch conversion that can optionally use scene orientation data
function enhancedScreenToYawPitch(
  screenX: number,
  screenY: number,
  width: number,
  height: number,
  fov: number,
  currentYaw: number,
  currentPitch: number,
  sceneOrientation?: [number, number, number, number] // optional quaternion for advanced positioning
): { yaw: number; pitch: number } {
  // For now, use the corrected basic function since it now handles perspective projection properly
  // The scene orientation feature can be re-implemented later if needed for world-coordinate positioning
  const result = screenToYawPitch(screenX, screenY, width, height, fov, currentYaw, currentPitch, false);
  
  if (sceneOrientation) {
    console.log('Enhanced POI positioning (using corrected basic function):', {
      screenCoords: { x: screenX, y: screenY },
      result: {
        yaw: (result.yaw * 180 / Math.PI).toFixed(2) + '°',
        pitch: (result.pitch * 180 / Math.PI).toFixed(2) + '°'
      },
      sceneOrientation: {
        w: sceneOrientation[0].toFixed(3),
        x: sceneOrientation[1].toFixed(3),
        y: sceneOrientation[2].toFixed(3),
        z: sceneOrientation[3].toFixed(3)
      },
      note: 'Using corrected perspective projection - scene orientation integration available for future enhancement'
    });
  }
  
  return result;
}

export default function PanoramaViewer() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<ConfigData | null>(null);
  const [currentScene, setCurrentScene] = useState<string | null>(null);
  const [hotspotsVisible, setHotspotsVisible] = useState<boolean>(false);

  const [showTapHint, setShowTapHint] = useState<boolean>(false);
  const [viewerSize, setViewerSize] = useState({ width: 0, height: 0 });
  const [arrowStyle, setArrowStyle] = useState<{ transform?: string }>({});
  const [currentYaw, setCurrentYaw] = useState<number>(0);
  const [rotationAngle, setRotationAngle] = useState<number>(-90);
  const [currentViewParams, setCurrentViewParams] = useState<{
    yaw: number;
    pitch: number;
    fov: number;
  } | null>(null);

  // POI-related state
  const [poiCreationMode, setPoiCreationMode] = useState<boolean>(false);
  const [pendingPOI, setPendingPOI] = useState<{yaw: number, pitch: number} | null>(null);
  const [showPOIDialog, setShowPOIDialog] = useState<boolean>(false);
  const [editingPOI, setEditingPOI] = useState<InfoHotspot | null>(null);
  const [selectedPOI, setSelectedPOI] = useState<POIWithFiles | null>(null);
  const [showPOIDetails, setShowPOIDetails] = useState<boolean>(false);
  const [scenePOIs, setScenePOIs] = useState<POIWithFiles[]>([]);
  const [poisVisible, setPoisVisible] = useState<boolean>(true);
  const [previewPosition, setPreviewPosition] = useState<{x: number, y: number} | null>(null);
  const [hoveredPOI, setHoveredPOI] = useState<POIWithFiles | null>(null);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [previewMode, setPreviewMode] = useState<'hover' | 'click'>('hover');

  const viewerRef = useRef<Marzipano.Viewer | null>(null);
  const scenesRef = useRef<Record<string, SceneInfoType>>({});
  const panoRef = useRef<HTMLDivElement>(null);
  const hotspotTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const marzipanoRef = useRef<boolean>(false);
  const poiElementsRef = useRef<Record<string, Record<string, { element: HTMLElement; hotspot: any }>>>({});

  // Initialize POI database
  useEffect(() => {
    poiDB.init().catch(err => {
      console.error('Failed to initialize POI database:', err);
    });
  }, []);

  // Load POIs for current scene
  const loadPOIsForScene = useCallback(async (sceneId: string) => {
    try {
      const pois = await poiDB.getPOIsForScene(sceneId);
      setScenePOIs(pois);
    } catch (error) {
      console.error('Error loading POIs for scene:', error);
      setScenePOIs([]);
    }
  }, []);

  // Clear hotspots for a scene
  const clearHotspotsForScene = useCallback(
    (sceneInfo: SceneInfoType): void => {
      if (!sceneInfo.scene) return;

      try {
        const hotspotContainer = sceneInfo.scene.hotspotContainer();

        // Destroy all hotspots
        const hotspots = hotspotContainer.listHotspots();
        hotspots.forEach((hotspot: Marzipano.Hotspot) => {
          hotspotContainer.destroyHotspot(hotspot);
        });

        // Clear our references
        sceneInfo.hotspotElements = [];
      } catch (err) {
        // Ignore errors during cleanup
        sceneInfo.hotspotElements = [];
      }
    },
    []
  );

  // Clear POI hotspots for a scene
  const clearPOIHotspotsForScene = useCallback(
    (sceneId: string): void => {
      const sceneInfo = scenesRef.current[sceneId];
      if (!sceneInfo?.scene) return;

      try {
        const hotspotContainer = sceneInfo.scene.hotspotContainer();
        
        // Remove POI hotspots for this specific scene
        const scenePoiElements = poiElementsRef.current[sceneId];
        if (scenePoiElements) {
          Object.values(scenePoiElements).forEach((poiData: any) => {
            try {
              hotspotContainer.destroyHotspot(poiData.hotspot);
            } catch (err) {
              // Ignore errors during cleanup
            }
          });
        }
        
        // Clear POI elements reference for this scene only
        delete poiElementsRef.current[sceneId];
      } catch (err) {
        console.error('Error clearing POI hotspots:', err);
      }
    },
    []
  );

  // Handle POI hover events
  const handlePOIHover = useCallback((poi: POIWithFiles, event: MouseEvent) => {
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    setPreviewPosition({
      x: rect.left + rect.width / 2,
      y: rect.top
    });
    setHoveredPOI(poi);
    setShowPreview(true);
  }, []);

  const handlePOIHoverEnd = useCallback(() => {
    setShowPreview(false);
    setHoveredPOI(null);
    setPreviewPosition(null);
  }, []);

  // Create POI hotspots for a scene
  const createPOIHotspotsForScene = useCallback(
    (sceneId: string, pois: POIWithFiles[]): void => {
      const sceneInfo = scenesRef.current[sceneId];
      if (!sceneInfo?.scene) return;

      try {
        const hotspotContainer = sceneInfo.scene.hotspotContainer();
        
        // Clear existing POI hotspots first
        clearPOIHotspotsForScene(sceneId);
        
        // Create new POI hotspots
        if (!poiElementsRef.current[sceneId]) {
          poiElementsRef.current[sceneId] = {};
        }
        
        pois.forEach((poi: POIWithFiles) => {
          const element = document.createElement('div');
          element.className = 'poi-hotspot-element';
          
          // Add click handler to the POI element
          const handlePOIElementClick = (e: Event) => {
            e.stopPropagation();
            handlePOIClick(poi);
          };
          
          // Add hover handlers for preview
          const handlePOIElementHover = (e: Event) => {
            const mouseEvent = e as unknown as MouseEvent;
            handlePOIHover(poi, mouseEvent);
          };
          
          const handlePOIElementHoverEnd = (e: Event) => {
            handlePOIHoverEnd();
          };
          
          element.addEventListener('click', handlePOIElementClick);
          element.addEventListener('mouseenter', handlePOIElementHover);
          element.addEventListener('mouseleave', handlePOIElementHoverEnd);
          
          // Create enhanced POI marker with dynamic icon
          // Detect content type for dynamic icon
          let dynamicIcon = '📍'; // default
          if (poi.files && poi.files.length > 0) {
            const primaryFile = poi.files[0];
            const contentType = detectContentType(primaryFile.name, primaryFile.type);
            switch (contentType.category) {
              case 'image': dynamicIcon = '🖼️'; break;
              case 'video': dynamicIcon = '🎥'; break;
              case 'audio': dynamicIcon = '🎵'; break;
              case 'document': dynamicIcon = '📄'; break;
              case 'web': dynamicIcon = '🌐'; break;
              default: dynamicIcon = '📍';
            }
          } else if (poi.contentUrls && poi.contentUrls.length > 0) {
            const url = poi.contentUrls[0];
            const contentType = detectContentType(url);
            switch (contentType.category) {
              case 'video': dynamicIcon = '🎥'; break;
              case 'web': dynamicIcon = '🌐'; break;
              default: dynamicIcon = '🌐';
            }
          }
          
          const hasFiles = poi.files && poi.files.length > 0;
          const hasImages = poi.imageUrls && poi.imageUrls.length > 0;
          const fileCount = poi.files ? poi.files.length : 0;
          
          element.innerHTML = `
            <div class="poi-marker" style="
              position: relative;
              background: linear-gradient(135deg, #4CAF50, #45a049);
              border: 3px solid white;
              border-radius: 50%;
              width: 40px;
              height: 40px;
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              transition: all 0.3s ease;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3), 0 2px 4px rgba(0, 0, 0, 0.2);
              z-index: 100;
              animation: poiAppear 0.5s ease-out;
            ">
              <div class="poi-icon" style="
                font-size: 18px;
                line-height: 1;
                filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.5));
                color: white;
                text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
              ">${dynamicIcon}</div>
              ${hasFiles ? `<div class="file-count-badge" style="
                position: absolute;
                top: -8px;
                right: -8px;
                background: #ff5722;
                color: white;
                border-radius: 50%;
                width: 18px;
                height: 18px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 10px;
                font-weight: bold;
                border: 2px solid white;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
              ">${fileCount}</div>` : ''}
              ${hasImages ? '<div class="image-indicator" style="position: absolute; bottom: -6px; right: -6px; background: #2196F3; border-radius: 50%; width: 16px; height: 16px; display: flex; align-items: center; justify-content: center; font-size: 8px; border: 2px solid white; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);">🖼️</div>' : ''}
              <div class="poi-tooltip" style="
                position: absolute;
                bottom: 100%;
                left: 50%;
                transform: translateX(-50%) translateY(-5px);
                background: rgba(0, 0, 0, 0.9);
                color: white;
                padding: 12px 16px;
                border-radius: 8px;
                font-size: 14px;
                white-space: nowrap;
                max-width: 250px;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
                pointer-events: none;
                z-index: 1000;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
              ">
                <div class="poi-title" style="
                  font-weight: 600;
                  margin-bottom: 4px;
                  color: white;
                ">${poi.title}</div>
                ${poi.description ? `<div class="poi-description" style="
                  font-size: 12px;
                  color: #ccc;
                  margin-bottom: 4px;
                  white-space: normal;
                  max-width: 200px;
                  line-height: 1.3;
                ">${poi.description}</div>` : ''}
                ${hasFiles ? `<div class="poi-file-info" style="
                  font-size: 11px;
                  color: #4CAF50;
                  font-weight: 500;
                ">${fileCount} file${fileCount !== 1 ? 's' : ''} attached</div>` : ''}
              </div>
            </div>
            <style>
              .poi-marker:hover {
                transform: scale(1.2);
                box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4), 0 3px 6px rgba(0, 0, 0, 0.3);
              }
              .poi-marker:hover .poi-tooltip {
                opacity: 1;
                visibility: visible;
                transform: translateX(-50%) translateY(-10px);
              }
              .poi-tooltip::after {
                content: '';
                position: absolute;
                top: 100%;
                left: 50%;
                transform: translateX(-50%);
                border: 6px solid transparent;
                border-top-color: rgba(0, 0, 0, 0.9);
              }
              @keyframes poiAppear {
                0% { transform: scale(0); opacity: 0; }
                50% { transform: scale(1.3); }
                100% { transform: scale(1); opacity: 1; }
              }
            </style>
          `;
          
          const hotspot = hotspotContainer.createHotspot(element, {
            yaw: poi.yaw,
            pitch: poi.pitch,
          });
          
          // Store both element and hotspot for proper cleanup and access
          poiElementsRef.current[sceneId][poi.id] = {
            element: element,
            hotspot: hotspot
          };
        });
      } catch (err) {
        console.error('Error creating POI hotspots:', err);
      }
    },
    [clearPOIHotspotsForScene]
  );

  // Create hotspots for a scene
  const createHotspotsForScene = useCallback(
    (sceneInfo: SceneInfoType): void => {
      if (!sceneInfo.scene) return;

      try {
        const hotspotContainer = sceneInfo.scene.hotspotContainer();

        // Clear any existing hotspots first
        clearHotspotsForScene(sceneInfo);

        // Create new hotspots
        sceneInfo.data.linkHotspots.forEach((hotspotData: LinkHotspot) => {
          const element = document.createElement('div');

          hotspotContainer.createHotspot(element, {
            yaw: hotspotData.yaw,
            pitch: hotspotData.pitch,
          });

          sceneInfo.hotspotElements.push(element);
        });
      } catch (err) {
        console.error('Error creating hotspots:', err);
      }
    },
    [clearHotspotsForScene]
  );

  // Load a single scene on demand
  const loadScene = useCallback(async (sceneId: string): Promise<void> => {
    const sceneInfo = scenesRef.current[sceneId];
    if (!sceneInfo || sceneInfo.loaded) return;

    const viewer = viewerRef.current;
    const { Marzipano } = window;

    try {
      // Create source
      const source = Marzipano.ImageUrlSource.fromString(
        `/images/${sceneInfo.data.id}-pano.jpg`
      );

      // Create geometry with lower resolution for better performance
      const geometry = new Marzipano.EquirectGeometry([
        { width: 512 },
        { width: 1024 },
        { width: 2048 },
        { width: 4096 },
      ]);

      // Create view with more conservative limits
      const limiter = Marzipano.RectilinearView.limit.traditional(
        4096,
        (120 * Math.PI) / 180
      );
      const view = new Marzipano.RectilinearView(
        sceneInfo.data.initialViewParameters,
        limiter
      );

      // Create scene
      if (!viewer) {
        throw new Error('Viewer not initialized');
      }
      const scene = viewer.createScene({
        source: source,
        geometry: geometry,
        view: view,
        pinFirstLevel: true,
      });

      // Update scene info
      sceneInfo.scene = scene;
      sceneInfo.loaded = true;
    } catch (err) {
      console.error(`Failed to load scene ${sceneId}:`, err);
    }
  }, []);

  // Preload adjacent scenes more aggressively
  const preloadAdjacentScenes = useCallback(
    async (sceneId: string): Promise<void> => {
      const sceneInfo = scenesRef.current[sceneId];
      if (!sceneInfo) return;

      // Preload all connected scenes immediately
      const connections = sceneInfo.data.linkHotspots.map(h => h.target);

      // Create image elements to preload in background
      connections.forEach(targetId => {
        const img = new Image();
        img.src = `/images/${targetId}-pano.jpg`;
      });

      // Also load the scenes properly in Marzipano
      for (const targetId of connections) {
        if (
          scenesRef.current[targetId] &&
          !scenesRef.current[targetId].loaded
        ) {
          try {
            await loadScene(targetId);
          } catch (err) {
            console.error(`Failed to preload scene ${targetId}:`, err);
          }
        }
      }
    },
    [loadScene]
  );

  // Switch scene
  const switchScene = useCallback(
    async (
      sceneId: string,
      isInitial: boolean = false,
      preserveViewDirection: boolean = false
    ): Promise<void> => {
      const sceneInfo = scenesRef.current[sceneId];
      if (!sceneInfo || !viewerRef.current) return;

      // Load scene if not already loaded
      if (!sceneInfo.loaded) {
        await loadScene(sceneId);
      }

      if (!sceneInfo.scene) return;

      // Use tracked view direction if preserving and available
      let currentView = null;
      if (preserveViewDirection && !isInitial && currentViewParams) {
        // Apply north offset correction when preserving view direction
        const currentSceneData = currentScene
          ? scenesRef.current[currentScene]?.data
          : null;
        const targetSceneData = sceneInfo.data;

        if (currentSceneData && targetSceneData) {
          // Calculate the difference in north offsets between scenes
          const northOffsetDiff =
            (targetSceneData.northOffset || 0) -
            (currentSceneData.northOffset || 0);
          // Convert to radians and apply to yaw
          const adjustedYaw =
            currentViewParams.yaw + (northOffsetDiff * Math.PI) / 180;

          currentView = {
            ...currentViewParams,
            yaw: adjustedYaw,
          };
        } else {
          currentView = currentViewParams;
        }
      }

      // Clear existing hotspots before switching
      if (currentScene && scenesRef.current[currentScene]) {
        clearHotspotsForScene(scenesRef.current[currentScene]);
        clearPOIHotspotsForScene(currentScene);
      }

      // Hide hotspots immediately for clean transition
      setHotspotsVisible(false);

      // Switch scene with smooth transition
      const transitionDuration = isInitial ? 0 : 1200; // Longer for smoother effect
      
      sceneInfo.scene.switchTo({
        transitionDuration: transitionDuration,
      });

      // Coordinate view change with slight delay
      setTimeout(() => {
        const viewParams = currentView || sceneInfo.data.initialViewParameters;
        if (viewerRef.current) {
          viewerRef.current.lookTo(viewParams, {
            transitionDuration: 0, // Apply instantly without rotation
          });
        }
      }, 0);

      setCurrentScene(sceneId);

      // Create hotspots but don't show them yet
      createHotspotsForScene(sceneInfo);

      // Load and create POI hotspots for this scene
      loadPOIsForScene(sceneId).then(() => {
        // Create POI hotspots in Marzipano
        createPOIHotspotsForScene(sceneId, scenePOIs);
      }).catch(err => {
        console.error('Error loading POIs for scene:', err);
      });

      // Show hotspots only after transition completes
      if (!isInitial) {
        setTimeout(() => {
          setHotspotsVisible(true);
          // Auto-hide after 5 seconds
          if (hotspotTimeoutRef.current) {
            clearTimeout(hotspotTimeoutRef.current);
          }
          hotspotTimeoutRef.current = setTimeout(() => {
            setHotspotsVisible(false);
          }, 5000);
        }, 1300); // Wait for transition to complete
      }

      // Preload adjacent scenes in background after transition
      setTimeout(() => {
        preloadAdjacentScenes(sceneId).catch(err => {
          console.error('Error preloading adjacent scenes:', err);
        });
      }, transitionDuration + 300); // Wait for transition to complete
    },
    [
      currentScene,
      loadScene,
      clearHotspotsForScene,
      clearPOIHotspotsForScene,
      createHotspotsForScene,
      createPOIHotspotsForScene,
      preloadAdjacentScenes,
      currentViewParams,
    ]
  );

  // Initialize viewer
  const initializeViewer = useCallback(async () => {
    try {
      // Check WebGL support
      if (!checkWebGLSupport()) {
        throw new Error('WebGL is not supported or disabled in your browser');
      }

      // Load configuration
      const response = await fetch('/config.json');
      if (!response.ok) {
        throw new Error(`Failed to load config.json: ${response.statusText}`);
      }

      const configData = (await response.json()) as ConfigData;
      setConfig(configData);

      // Initialize Marzipano viewer
      const Marzipano = (window as any).Marzipano;
      if (!Marzipano) {
        throw new Error('Marzipano library not loaded');
      }

      const viewerOpts = {
        controls: {
          mouseViewMode: 'drag',
        },
        stage: {
          progressive: true,
        },
      };

      if (!panoRef.current) {
        throw new Error('Panorama container not found');
      }

      const viewer = new Marzipano.Viewer(panoRef.current, viewerOpts);
      viewerRef.current = viewer;

      // Add view change listener to track current viewing direction
      const updateViewParams = () => {
        try {
          if (viewer) {
            const view = viewer.view();
            setCurrentViewParams({
              yaw: view.yaw(),
              pitch: view.pitch(),
              fov: view.fov(),
            });
          }
        } catch (err) {
          // Silently ignore errors during view tracking
        }
      };

      // Listen for view changes
      if (viewer.addEventListener) {
        viewer.addEventListener('viewChange', updateViewParams);
      }

      // Also update on mouse/touch interactions
      if (panoRef.current) {
        panoRef.current.addEventListener('mouseup', updateViewParams);
        panoRef.current.addEventListener('touchend', updateViewParams);
      }

      // Initialize scenes object (but don't create them yet)
      configData.scenes.forEach(sceneData => {
        scenesRef.current[sceneData.id] = {
          data: sceneData,
          scene: null,
          hotspotElements: [],
          loaded: false,
        };
      });

      // Load and display first scene
      if (configData.scenes.length > 0) {
        const firstScene = configData.scenes[0];
        await loadScene(firstScene.id);
        switchScene(firstScene.id, true, false);
      }

      setIsLoading(false);

      // Show tap hint after a delay
      setTimeout(() => setShowTapHint(true), 1000);
      setTimeout(() => setShowTapHint(false), 4000);
    } catch (err) {
      console.error('Initialization error:', err);
      setError(err instanceof Error ? err.message : String(err));
      setIsLoading(false);
    }
  }, [loadScene, switchScene]);

  // Navigate to scene
  const navigateToScene = useCallback(
    async (sceneId: string, sourceHotspotYaw?: number): Promise<void> => {
      if (sceneId === currentScene) return;

      // First ensure the target scene is fully loaded
      const sceneInfo = scenesRef.current[sceneId];
      if (sceneInfo) {
        // Create image element to force preload
        const img = new Image();
        img.src = `/images/${sceneId}-pano.jpg`;

        // Wait for image to load
        await new Promise<void>(resolve => {
          img.onload = () => resolve();
          img.onerror = () => resolve(); // Continue even if error
        });

        // Load scene in Marzipano if not already loaded
        if (!sceneInfo.loaded) {
          await loadScene(sceneId);
        }
      }

      // Switch scene directly
      await switchScene(sceneId, false, true);
    },
    [switchScene, currentScene, loadScene]
  );

  // POI Management Functions
  const savePOI = useCallback(async (poi: InfoHotspot, files: File[]) => {
    try {
      await poiDB.savePOI(poi, files);
      // Reload POIs for current scene
      if (currentScene) {
        await loadPOIsForScene(currentScene);
        createPOIHotspotsForScene(currentScene, scenePOIs);
      }
    } catch (error) {
      console.error('Error saving POI:', error);
      alert('Failed to save POI. Please try again.');
    }
  }, [currentScene, loadPOIsForScene, createPOIHotspotsForScene]);

  const updatePOI = useCallback(async (poi: InfoHotspot, newFiles?: File[]) => {
    try {
      await poiDB.updatePOI(poi, newFiles);
      // Reload POIs for current scene
      if (currentScene) {
        await loadPOIsForScene(currentScene);
        createPOIHotspotsForScene(currentScene, scenePOIs);
      }
    } catch (error) {
      console.error('Error updating POI:', error);
      alert('Failed to update POI. Please try again.');
    }
  }, [currentScene, loadPOIsForScene, createPOIHotspotsForScene]);

  const deletePOI = useCallback(async (poiId: string) => {
    try {
      await poiDB.deletePOI(poiId);
      // Reload POIs for current scene
      if (currentScene) {
        await loadPOIsForScene(currentScene);
        createPOIHotspotsForScene(currentScene, scenePOIs);
      }
    } catch (error) {
      console.error('Error deleting POI:', error);
      alert('Failed to delete POI. Please try again.');
    }
  }, [currentScene, loadPOIsForScene, createPOIHotspotsForScene]);

  const handlePOIClick = useCallback((poi: POIWithFiles) => {
    setSelectedPOI(poi);
    setShowPOIDetails(true);
  }, []);

  const handleEditPOI = useCallback((poi: POIWithFiles) => {
    setEditingPOI(poi);
    setShowPOIDetails(false);
    setShowPOIDialog(true);
  }, []);

  const exportPOIs = useCallback(async () => {
    try {
      const blob = await poiDB.exportData();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pois_export_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting POIs:', error);
      alert('Failed to export POIs. Please try again.');
    }
  }, []);

  // Toggle hotspots
  const toggleHotspots = useCallback((): void => {
    if (hotspotsVisible) {
      setHotspotsVisible(false);
      if (hotspotTimeoutRef.current) {
        clearTimeout(hotspotTimeoutRef.current);
      }
    } else {
      setHotspotsVisible(true);
      // Auto-hide after 5 seconds
      if (hotspotTimeoutRef.current) {
        clearTimeout(hotspotTimeoutRef.current);
      }
      hotspotTimeoutRef.current = setTimeout(() => {
        setHotspotsVisible(false);
      }, 5000);
    }
  }, [hotspotsVisible]);

  // Mouse position tracking for precise POI placement
  const mousePositionRef = useRef<{ x: number; y: number; yaw: number; pitch: number } | null>(null);
  const isMouseOverPanoRef = useRef(false);

  // Track mouse position over panorama for accurate POI placement
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isMouseOverPanoRef.current && panoRef.current && currentViewParams) {
      // Use getBoundingClientRect() for accurate bounds
      const bounds = panoRef.current.getBoundingClientRect();
      const mouseX = e.clientX - bounds.left;
      const mouseY = e.clientY - bounds.top;
      
      // Convert screen coordinates to yaw/pitch using the coordinate system
      const coords = screenToYawPitch(
        mouseX,
        mouseY,
        bounds.width,
        bounds.height,
        currentViewParams.fov,
        currentViewParams.yaw,
        currentViewParams.pitch
      );
      
      // Store both pixel and spherical coordinates
      mousePositionRef.current = {
        x: mouseX,
        y: mouseY,
        yaw: coords.yaw,
        pitch: coords.pitch
      };
      
      // Show preview marker when in POI creation mode
      if (poiCreationMode) {
        setPreviewPosition({
          x: mouseX,
          y: mouseY
        });
      } else {
        setPreviewPosition(null);
      }
    }
  }, [poiCreationMode, currentViewParams]);

  const handleMouseEnter = useCallback(() => {
    isMouseOverPanoRef.current = true;
  }, []);

  const handleMouseLeave = useCallback(() => {
    isMouseOverPanoRef.current = false;
    mousePositionRef.current = null;
    setPreviewPosition(null);
  }, []);









  // Enhanced POI creation using the yaw/pitch coordinate system
  const createPOIAtClick = useCallback((e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    const viewer = viewerRef.current;
    const container = panoRef.current;
    
    if (!viewer || !container || !poiCreationMode || !currentViewParams) return;
    
    try {
      // Use the tracked mouse position if available for better accuracy
      let coords;
      
      if (mousePositionRef.current) {
        // Use pre-calculated coordinates from mouse tracking
        coords = {
          yaw: mousePositionRef.current.yaw,
          pitch: mousePositionRef.current.pitch
        };
      } else {
        // Fallback: calculate coordinates from click event
        const bounds = container.getBoundingClientRect();
        const mouseX = e.clientX - bounds.left;
        const mouseY = e.clientY - bounds.top;
        
        // Use enhanced positioning with scene orientation if available
        const sceneOrientation = currentScene && scenesRef.current[currentScene]?.data?.orientation ? 
          [scenesRef.current[currentScene].data.orientation.w, scenesRef.current[currentScene].data.orientation.x, scenesRef.current[currentScene].data.orientation.y, scenesRef.current[currentScene].data.orientation.z] as [number, number, number, number] : 
          undefined;
          
        coords = enhancedScreenToYawPitch(
          mouseX,
          mouseY,
          bounds.width,
          bounds.height,
          currentViewParams.fov,
          currentViewParams.yaw,
          currentViewParams.pitch,
          sceneOrientation
        );
      }
      
      // Validate and normalize coordinates
      const validatedCoords = validateCoordinates(coords.yaw, coords.pitch);
      
      if (validatedCoords.isValid) {
        // Create POI at validated coordinates
        setPendingPOI({
          yaw: validatedCoords.yaw,
          pitch: validatedCoords.pitch
        });
        
        // Show creation dialog
        setShowPOIDialog(true);
        
        // Log formatted coordinates for debugging
        const formatted = formatCoordinates(validatedCoords.yaw, validatedCoords.pitch);
        console.log('POI coordinates (yaw/pitch system):', {
          display: `Yaw: ${formatted.yaw}, Pitch: ${formatted.pitch}`,
          radians: `Yaw: ${formatted.yawRadians}, Pitch: ${formatted.pitchRadians}`,
          raw: { yaw: validatedCoords.yaw, pitch: validatedCoords.pitch },
          coordinateSystem: 'Spherical (Yaw: ±180°, Pitch: ±90°)',
          viewParams: {
            currentYaw: (currentViewParams.yaw * 180 / Math.PI).toFixed(1) + '°',
            currentPitch: (currentViewParams.pitch * 180 / Math.PI).toFixed(1) + '°',
            currentFOV: (currentViewParams.fov * 180 / Math.PI).toFixed(1) + '°',
            fovRadians: currentViewParams.fov.toFixed(4)
          },
          mousePosition: mousePositionRef.current ? {
            screenX: mousePositionRef.current.x,
            screenY: mousePositionRef.current.y
          } : 'Not available'
        });
      } else {
        console.error('Invalid coordinates calculated:', coords);
      }
    } catch (error) {
      console.error('Failed to calculate POI position using coordinate system:', error);
    }
  }, [poiCreationMode, currentViewParams]);

  // Handle panorama click - delegates to createPOIAtClick for POI creation
  const handlePanoClick = useCallback(
    (e: MouseEvent<HTMLDivElement>): void => {
      // Don't handle if clicking a hotspot or POI
      if ((e.target as HTMLElement).closest('.hotspot') || 
          (e.target as HTMLElement).closest('.poi-hotspot-element')) {
        return;
      }

      if (poiCreationMode) {
        createPOIAtClick(e);
      } else {
        // Show touch ripple effect
        createRipple(e.clientX, e.clientY, panoRef.current);

        // Toggle hotspots
        toggleHotspots();
      }
    },
    [poiCreationMode, createPOIAtClick, toggleHotspots]
  );

  // Handle keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent): void => {
      if (e.key === ' ') {
        e.preventDefault();
        toggleHotspots();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [toggleHotspots]);

  // Initialize when Marzipano loads
  const handleMarzipanoLoad = (): void => {
    marzipanoRef.current = true;
    initializeViewer();
  };

  // Check if Marzipano is already loaded on mount
  useEffect(() => {
    // If Marzipano is already available (e.g., when navigating back)
    if ((window as any).Marzipano && !marzipanoRef.current) {
      handleMarzipanoLoad();
    }
  }, []);

  useEffect(() => {
    function updateSize() {
      if (panoRef.current) {
        setViewerSize({
          width: panoRef.current.offsetWidth,
          height: panoRef.current.offsetHeight,
        });
      }
    }
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Update arrow rotation on view change
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || isLoading) return;

    const updateArrowRotation = () => {
      const yaw = viewer.view().yaw();
      let rotation = yaw * (180 / Math.PI); // Convert radians to degrees

      // Apply north offset correction for compass arrow
      if (currentScene && scenesRef.current[currentScene]?.data?.northOffset) {
        rotation += scenesRef.current[currentScene].data.northOffset;
      }

      setCurrentYaw(yaw);
      setArrowStyle({
        transform: `rotate(${rotation}deg)`,
      });
    };

    if (viewer.addEventListener) {
      viewer.addEventListener('viewChange', updateArrowRotation);
    }

    return () => {
      if (viewer && viewer.removeEventListener) {
        viewer.removeEventListener('viewChange', updateArrowRotation);
      }
    };
  }, [isLoading, currentScene]);

  // Cleanup on unmount
  useEffect(() => {
    // Store reference to scenes for cleanup function
    const scenes = scenesRef.current;

    return () => {
      // Clear all hotspots
      Object.values(scenes).forEach(sceneInfo => {
        if (sceneInfo.scene) {
          clearHotspotsForScene(sceneInfo);
        }
      });

      // Don't destroy viewer or scenes - let browser handle cleanup
    };
  }, [clearHotspotsForScene]);

  // Create POI hotspots when scenePOIs changes
  useEffect(() => {
    if (currentScene && scenePOIs.length > 0) {
      createPOIHotspotsForScene(currentScene, scenePOIs);
    }
  }, [currentScene, scenePOIs, createPOIHotspotsForScene]);

  if (error) {
    return <LoadingScreen error={error} />;
  }

  return (
    <>
      <Script
        src='/assets/js/marzipano.js'
        strategy='afterInteractive'
        onLoad={handleMarzipanoLoad}
      />

      {isLoading && <LoadingScreen />}

      <div
        ref={panoRef}
        id='pano'
        className={`panorama-container ${isLoading ? 'loading' : ''} ${poiCreationMode ? 'poi-creation-mode' : ''}`}
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          cursor: poiCreationMode ? 'crosshair' : 'grab',
        }}
        onClick={handlePanoClick}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseDown={e =>
          ((e.currentTarget as HTMLElement).style.cursor = poiCreationMode ? 'crosshair' : 'grabbing')
        }
        onMouseUp={e =>
          ((e.currentTarget as HTMLElement).style.cursor = poiCreationMode ? 'crosshair' : 'grab')
        }
      />

      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: 'white',
          fontSize: '14px',
          fontWeight: '500',
          textShadow: '0 2px 4px rgba(0,0,0,0.8)',
          zIndex: 1600,
          pointerEvents: 'none',
        }}
      />

      {showTapHint && (
        <div className='tap-hint show'>Tap anywhere to show navigation</div>
      )}

      {config && currentScene && scenesRef.current[currentScene] && (
        <>
          <FloorSelector
            scenes={config.scenes}
            currentScene={scenesRef.current[currentScene]?.data}
            onFloorChange={navigateToScene}
          />

          <MiniMap
            scenes={config.scenes}
            currentScene={scenesRef.current[currentScene]?.data}
            viewer={viewerRef.current}
            onSelectScene={navigateToScene}
            rotationAngle={rotationAngle}
          />

          {/* Render hotspots */}
          {scenesRef.current[currentScene]?.hotspotElements?.map(
            (element, index) => {
              const hotspotData =
                scenesRef.current[currentScene]?.data?.linkHotspots[index];
              if (!hotspotData) return null;

              return (
                <Hotspot
                  key={`${currentScene}-${index}-${hotspotData.target}`}
                  element={element}
                  data={hotspotData}
                  visible={hotspotsVisible}
                  onNavigate={navigateToScene}
                />
              );
            }
          )}

          {/* Render POI hotspots */}
          {poisVisible && currentScene && scenePOIs.map((poi) => {
            const scenePoiElements = poiElementsRef.current[currentScene];
            const poiData = scenePoiElements?.[poi.id];
            if (!poiData || !poiData.element) return null;

            return (
               <POIHotspot
                 key={poi.id}
                 element={poiData.element}
                 poi={poi}
                 visible={true}
                 onClick={() => handlePOIClick(poi)}
               />
             );
          })}
        </>
      )}

      {/* POI UI Controls */}
      <div className="poi-controls">
        <button
          className={`poi-toggle-btn ${poiCreationMode ? 'active' : ''}`}
          onClick={() => setPoiCreationMode(!poiCreationMode)}
          title={poiCreationMode ? 'Exit POI creation mode' : 'Enter POI creation mode'}
        >
          {poiCreationMode ? '✕' : '📍'}
        </button>
        
        <button
          className={`poi-visibility-btn ${!poisVisible ? 'hidden' : ''}`}
          onClick={() => setPoisVisible(!poisVisible)}
          title={poisVisible ? 'Hide POIs' : 'Show POIs'}
        >
          {poisVisible ? '👁️' : '👁️‍🗨️'}
        </button>
        
        <button
           className="poi-export-btn"
           onClick={exportPOIs}
           title="Export POIs"
         >
           💾
         </button>
         
         {/* POI Counter */}
         <div className="poi-counter" title={`${scenePOIs.length} POIs in this scene`}>
           📍 {scenePOIs.length}
         </div>
       </div>

      {/* POI Creation/Edit Dialog */}
      {showPOIDialog && (
        <POIDialog
          isOpen={showPOIDialog}
          onClose={() => {
            setShowPOIDialog(false);
            setPendingPOI(null);
            setEditingPOI(null);
            setPoiCreationMode(false);
          }}
          onSave={editingPOI ? updatePOI : savePOI}
          initialData={pendingPOI ? {
             yaw: pendingPOI.yaw,
             pitch: pendingPOI.pitch,
             sceneId: currentScene || '',
           } : undefined}
          editingPOI={editingPOI || undefined}
        />
      )}

      {/* POI Details Modal */}
      {showPOIDetails && selectedPOI && (
        <POIDetailsModal
          poi={selectedPOI}
          isOpen={showPOIDetails}
          onClose={() => {
            setShowPOIDetails(false);
            setSelectedPOI(null);
          }}
          onEdit={() => handleEditPOI(selectedPOI)}
          onDelete={() => {
            if (confirm('Are you sure you want to delete this POI?')) {
              deletePOI(selectedPOI.id);
              setShowPOIDetails(false);
              setSelectedPOI(null);
            }
          }}
        />
      )}

      {/* POI Preview */}
      {showPreview && hoveredPOI && previewPosition && (
        <POIPreview
          poi={hoveredPOI}
          isVisible={showPreview}
          mode={previewMode}
          position={previewPosition}
          onClose={() => {
            setShowPreview(false);
            setHoveredPOI(null);
          }}
        />
      )}

      {/* Enhanced POI Preview Marker with Coordinate System */}
      {previewPosition && poiCreationMode && mousePositionRef.current && (
        <div
          className="poi-preview-marker"
          style={{
            position: 'absolute',
            left: previewPosition.x - 20,
            top: previewPosition.y - 20,
            width: 40,
            height: 40,
            borderRadius: '50%',
            border: '3px solid #4CAF50',
            backgroundColor: 'rgba(76, 175, 80, 0.2)',
            pointerEvents: 'none',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            animation: 'poiPreviewPulse 1.5s infinite'
          }}
        >
          📍
          {/* Coordinate tooltip */}
          <div
            className="poi-preview-tooltip"
            style={{
              position: 'absolute',
              bottom: '100%',
              left: '50%',
              transform: 'translateX(-50%) translateY(-8px)',
              background: 'rgba(0, 0, 0, 0.9)',
              color: 'white',
              padding: '6px 10px',
              borderRadius: '6px',
              fontSize: '11px',
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
            }}
          >
            {(() => {
              const formatted = formatCoordinates(mousePositionRef.current.yaw, mousePositionRef.current.pitch);
              return `Yaw: ${formatted.yaw} | Pitch: ${formatted.pitch}`;
            })()}
          </div>
        </div>
      )}

      <div id='controls-hint'>
        <div>🖱️ Drag to look around • Click to show paths</div>
        <div>📍 Click on arrows to navigate</div>
        {poiCreationMode ? (
          <div>
            <div>📍 POI Creation Mode: Click anywhere to add a point of interest</div>
            <div style={{ fontSize: '10px', opacity: 0.8, marginTop: '4px' }}>
              Coordinate System: Yaw (±180°) • Pitch (±90°)
              {mousePositionRef.current && (
                 <span>
                   {' • Current: '}
                   {(() => {
                     const formatted = formatCoordinates(mousePositionRef.current.yaw, mousePositionRef.current.pitch);
                     return `Y:${formatted.yaw} P:${formatted.pitch}`;
                   })()}
                 </span>
               )}
            </div>
          </div>
        ) : null}
      </div>

      <style jsx>{`
        .tap-hint {
          position: absolute;
          bottom: 40px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 12px 24px;
          border-radius: 24px;
          font-size: 14px;
          opacity: 0;
          transition: opacity 0.5s;
          pointer-events: none;
          z-index: 1000;
        }

        .compass-arrow-container {
          position: absolute;
          top: 20px;
          right: 20px;
          width: 60px;
          height: 60px;
          background: rgba(0, 0, 0, 0.5);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1300;
          transition: transform 0.2s linear;
        }

        .compass-arrow {
          width: 0;
          height: 0;
          border-left: 15px solid transparent;
          border-right: 15px solid transparent;
          border-bottom: 30px solid red;
          transform: translateY(-5px);
        }

        .tap-hint.show {
          opacity: 1;
          animation: fadeInOut 3s ease-in-out;
        }

        .poi-controls {
          position: absolute;
          top: 20px;
          left: 20px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          z-index: 1500;
        }

        .poi-toggle-btn,
         .poi-visibility-btn,
         .poi-export-btn {
           width: 50px;
           height: 50px;
           border: none;
           border-radius: 50%;
           background: rgba(0, 0, 0, 0.7);
           color: white;
           font-size: 20px;
           cursor: pointer;
           transition: all 0.3s ease;
           backdrop-filter: blur(10px);
           -webkit-backdrop-filter: blur(10px);
           display: flex;
           align-items: center;
           justify-content: center;
         }

         .poi-counter {
           background: rgba(0, 0, 0, 0.7);
           color: white;
           padding: 8px 12px;
           border-radius: 20px;
           font-size: 14px;
           font-weight: bold;
           backdrop-filter: blur(10px);
           -webkit-backdrop-filter: blur(10px);
           text-align: center;
           min-width: 60px;
         }

        .poi-toggle-btn:hover,
        .poi-visibility-btn:hover,
        .poi-export-btn:hover {
          background: rgba(0, 0, 0, 0.9);
          transform: scale(1.1);
        }

        .poi-toggle-btn.active {
          background: #4CAF50;
        }

        .poi-visibility-btn.hidden {
          background: #f44336;
        }

        /* POI Preview Animation */
        @keyframes poiPreviewPulse {
          0% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); opacity: 0.8; }
        }

        /* Enhanced POI Creation Mode Cursor */
        .panorama-container.poi-creation-mode {
          cursor: crosshair !important;
        }

        .panorama-container.poi-creation-mode * {
          cursor: crosshair !important;
        }

        #controls-hint {
          position: absolute;
          bottom: 20px;
          left: 20px;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          color: white;
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 12px;
          z-index: 1000;
          opacity: 0.8;
        }

        @media (max-width: 768px) {
          #controls-hint {
            display: none;
          }
          
          .poi-controls {
            top: 10px;
            left: 10px;
          }
          
          .poi-toggle-btn,
           .poi-visibility-btn,
           .poi-export-btn {
             width: 40px;
             height: 40px;
             font-size: 16px;
           }
           
           .poi-counter {
             padding: 6px 10px;
             font-size: 12px;
             min-width: 50px;
           }
        }
      `}</style>
    </>
  );
}
