'use client';

import { useState, useEffect, useRef, useCallback, MouseEvent } from 'react';
import Script from 'next/script';
import FloorSelector from './FloorSelector';
import MiniMap from './MiniMap';
import LoadingScreen from './LoadingScreen';

import Hotspot from './Hotspot';
import { checkWebGLSupport, createRipple } from '@/lib/panoramaUtils';
import {
  ConfigData,
  SceneInfo as SceneInfoType,
  LinkHotspot,
} from '@/types/scenes';

// Using types imported from @/types/scenes.ts

// Utility to convert yaw/pitch to 2D screen coordinates
function yawPitchToScreen(
  yaw: number,
  pitch: number,
  width: number,
  height: number,
  fov: number
) {
  // Equirectangular projection: center is (width/2, height/2)
  // Yaw: 0 is center, positive is right; Pitch: 0 is center, positive is up
  // fov in radians
  const x = width / 2 + (width / fov) * yaw;
  const y = height / 2 - (height / fov) * pitch;
  return { x, y };
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

  const viewerRef = useRef<Marzipano.Viewer | null>(null);
  const scenesRef = useRef<Record<string, SceneInfoType>>({});
  const panoRef = useRef<HTMLDivElement>(null);
  const hotspotTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const marzipanoRef = useRef<boolean>(false);

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
      createHotspotsForScene,
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

  // Handle panorama click
  const handlePanoClick = useCallback(
    (e: MouseEvent<HTMLDivElement>): void => {
      // Don't toggle if clicking a hotspot
      if ((e.target as HTMLElement).closest('.hotspot')) return;

      // Show touch ripple effect
      createRipple(e.clientX, e.clientY, panoRef.current);

      // Toggle hotspots
      toggleHotspots();
    },
    [toggleHotspots]
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
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          cursor: 'grab',
        }}
        onClick={handlePanoClick}
        onMouseDown={e =>
          ((e.currentTarget as HTMLElement).style.cursor = 'grabbing')
        }
        onMouseUp={e =>
          ((e.currentTarget as HTMLElement).style.cursor = 'grab')
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
        </>
      )}

      <div id='controls-hint'>
        <div>🖱️ Drag to look around • Click to show paths</div>
        <div>📍 Click on arrows to navigate</div>
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
        }
      `}</style>
    </>
  );
}
