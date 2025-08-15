"use client";

import Script from "next/script";
import { useState, useCallback, useEffect, useRef } from "react";
import MiniMap from "./MiniMap";
import LoadingScreen from "../utility/LoadingScreen";
import ControlPanel from "../ui/ControlPanel";
import PanoramaLogo from "./PanoramaLogo";
import TapHint from "./TapHint";
// import ControlsHint from './ControlsHint';
import PanoramaContainer from "./PanoramaContainer";
import HotspotRenderer, { HotspotRendererRef } from "./HotspotRenderer";
import POIComponent, { POIComponentRef } from "../poi/POIComponent";


import { usePanoramaManager } from "@/hooks/usePanoramaManager";
import { useCacheRefresh } from "@/hooks/useCacheRefresh";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { POIData } from "@/types/poi";

interface PanoramaViewerProps {
  projectId?: string;
  initialSceneId?: string;
  initialPOIId?: string;
}

export default function PanoramaViewer({
  projectId,
  initialSceneId,
  initialPOIId,
}: PanoramaViewerProps = {}) {
  const [closePanelsFunc, setClosePanelsFunc] = useState<(() => void) | null>(
    null
  );
  const [poiSceneCounts, setPoiSceneCounts] = useState<Record<string, number>>(
    {}
  );
  const hotspotRendererRef = useRef<HotspotRendererRef>(null);
  const poiComponentRef = useRef<POIComponentRef>(null);

  const handleClosePanels = useCallback((closePanels: () => void) => {
    setClosePanelsFunc(() => closePanels);
  }, []);

  // Fetch POI scene counts
  const fetchPOISceneCounts = useCallback(async () => {
    if (!projectId) {
      setPoiSceneCounts({});
      return;
    }

    try {
      const response = await fetch(
        `/api/poi/scene-counts?projectId=${encodeURIComponent(projectId)}`
      );
      if (response.ok) {
        const data = await response.json();
        setPoiSceneCounts(data.sceneCounts || {});
      } else {
        console.warn(
          "Failed to fetch POI scene counts for MiniMap:",
          response.status
        );
        setPoiSceneCounts({});
      }
    } catch (error) {
      console.error("Error fetching POI scene counts for MiniMap:", error);
      setPoiSceneCounts({});
    }
  }, [projectId]);

  const handlePOICreated = useCallback(
    (poi: POIData) => {
      console.log("POI created:", poi);
      // Refresh POI scene counts to update hotspot icons immediately
      if (hotspotRendererRef.current) {
        hotspotRendererRef.current.refreshPOISceneCounts();
      }
      // Also refresh local POI scene counts for MiniMap
      fetchPOISceneCounts();
    },
    [fetchPOISceneCounts]
  );

  // Fetch POI scene counts when projectId changes
  useEffect(() => {
    fetchPOISceneCounts();
  }, [fetchPOISceneCounts]);

  // Initialize cache refresh functionality
  const { refreshImages } = useCacheRefresh(projectId);

  const {
    state,
    refs,
    actions,
    navigateToScene,
    optimizePerformance,
    handlePanoClick,
    handleMarzipanoLoad,
    handleRetry,
  } = usePanoramaManager({
    projectId,
    initialSceneId,
    closePanels: closePanelsFunc || undefined,
  });

  // Add panorama-viewer class to body when component mounts
  useEffect(() => {
    document.body.classList.add("panorama-viewer");

    return () => {
      document.body.classList.remove("panorama-viewer");
    };
  }, []);

  // Listen for cache refresh events and refresh images when needed
  useEffect(() => {
    const handleCacheRefresh = () => {
      refreshImages();
      // Also refresh the panorama manager to reload scenes with new cache-busted URLs
      if (refs.viewerRef.current && state.currentScene) {
        // Force reload current scene with cache-busted URLs
        setTimeout(() => {
          navigateToScene(state.currentScene!);
        }, 100);
      }
    };

    window.addEventListener("panorama-cache-refresh", handleCacheRefresh);

    return () => {
      window.removeEventListener("panorama-cache-refresh", handleCacheRefresh);
    };
  }, [refreshImages, refs.viewerRef, state.currentScene, navigateToScene]);

  // Handle POI highlighting when viewer is ready and initialPOIId is provided
  useEffect(() => {
    if (initialPOIId && state.currentScene && !state.isLoading && projectId) {
      // Wait a bit for POI hotspots to be created
      const timer = setTimeout(async () => {
        try {
          // Fetch POI data to find the specific POI
          const response = await fetch(
            `/api/poi/load?projectId=${encodeURIComponent(projectId)}`
          );
          if (response.ok) {
            const data = await response.json();
            const targetPOI = data.pois?.find((poi: POIData) => poi.id === initialPOIId);
            
            if (targetPOI) {
              // If POI is in a different scene, navigate to it first
              if (targetPOI.panoramaId !== state.currentScene) {
                navigateToScene(targetPOI.panoramaId);
                // Wait for scene to load, then highlight POI
                setTimeout(() => {
                  poiComponentRef.current?.editPOI(targetPOI);
                }, 1500);
              } else {
                // POI is in current scene, highlight it immediately
                poiComponentRef.current?.editPOI(targetPOI);
              }
            }
          }
        } catch (error) {
          console.error('Error highlighting POI:', error);
        }
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [initialPOIId, state.currentScene, state.isLoading, projectId, navigateToScene]);

  // Cleanup effect to properly destroy viewer when component unmounts
  useEffect(() => {
    return () => {
      // Cleanup Marzipano viewer
      if (refs.viewerRef.current) {
        try {
          refs.viewerRef.current.destroy();
        } catch (error) {
          console.warn("Error destroying Marzipano viewer:", error);
        }
        refs.viewerRef.current = null;
      }

      // Clear all scenes
      refs.scenesRef.current = {};

      // Clear any pending timeouts
      if (refs.hotspotTimeoutRef.current) {
        clearTimeout(refs.hotspotTimeoutRef.current);
        refs.hotspotTimeoutRef.current = null;
      }

      // Clear the panorama container
      if (refs.panoRef.current) {
        refs.panoRef.current.innerHTML = "";
      }

      console.log("PanoramaViewer cleanup completed");
    };
  }, []); // Empty dependency array - only run on unmount

  if (state.error) {
    return <LoadingScreen error={state.error} onRetry={handleRetry} />;
  }

  return (
    <>
      <Script
        src="/assets/js/marzipano.js"
        strategy="afterInteractive"
        onLoad={handleMarzipanoLoad}
      />

      {state.isLoading && <LoadingScreen />}

      <PanoramaLogo />
      <PanoramaContainer panoRef={refs.panoRef} onPanoClick={handlePanoClick} />
      <TapHint show={state.showTapHint} />

      <ControlPanel
        maxHotspots={state.maxHotspots}
        onMaxHotspotsChange={actions.setMaxHotspots}
        scenes={state.config?.scenes || []}
        currentScene={
          state.currentScene && refs.scenesRef.current[state.currentScene]
            ? refs.scenesRef.current[state.currentScene].data
            : null
        }
        onFloorChange={navigateToScene}
        performanceStats={state.performanceStats}
        totalScenes={state.config?.scenes.length || 0}
        onOptimize={optimizePerformance}
        projectId={projectId}
        currentPanoramaId={state.currentScene}
        onPOIEdit={(poi) => {
          // Navigate to the POI's scene first, then edit
          if (poi.panoramaId !== state.currentScene) {
            navigateToScene(poi.panoramaId);
            // Wait for scene to load, then edit
            setTimeout(() => {
              poiComponentRef.current?.editPOI(poi);
            }, 1500);
          } else {
            // Already in the current scene, edit immediately
            poiComponentRef.current?.editPOI(poi);
          }
        }}
        onPOIDelete={async (poiId) => {
          // Extract the actual ID string from the parameter
          const actualPoiId = typeof poiId === "string" ? poiId : poiId.id;

          // Fetch POI data to determine which scene it belongs to
          try {
            const response = await fetch(
              `/api/poi/load?projectId=${encodeURIComponent(projectId || "")}`
            );
            if (response.ok) {
              const data = await response.json();
              const poiToDelete = data.pois?.find(
                (poi: any) => poi.id === actualPoiId
              );

              if (poiToDelete) {
                // Navigate to the POI's scene first if needed
                if (poiToDelete.panoramaId !== state.currentScene) {
                  navigateToScene(poiToDelete.panoramaId);
                  // Wait for scene to load, then delete
                  setTimeout(() => {
                    poiComponentRef.current?.deletePOI(actualPoiId);
                    fetchPOISceneCounts();
                  }, 1500);
                } else {
                  // Already in the current scene, delete immediately
                  poiComponentRef.current?.deletePOI(actualPoiId);
                  fetchPOISceneCounts();
                }
              } else {
                // POI not found, just try to delete it anyway
                poiComponentRef.current?.deletePOI(actualPoiId);
                fetchPOISceneCounts();
              }
            } else {
              // Failed to fetch POI data, just try to delete it anyway
              poiComponentRef.current?.deletePOI(actualPoiId);
              fetchPOISceneCounts();
            }
          } catch (error) {
            console.error("Error fetching POI data for deletion:", error);
            // Fallback: just try to delete it anyway
            poiComponentRef.current?.deletePOI(actualPoiId);
            fetchPOISceneCounts();
          }
        }}
        onPOINavigate={navigateToScene}
        onClosePanels={handleClosePanels}
      />

      {state.config &&
        state.currentScene &&
        refs.scenesRef.current[state.currentScene] && (
          <>
            <MiniMap
              scenes={state.config.scenes}
              currentScene={refs.scenesRef.current[state.currentScene]?.data}
              viewer={refs.viewerRef.current}
              onSelectScene={navigateToScene}
              rotationAngle={state.rotationAngle}
              poiSceneCounts={poiSceneCounts}
            />

            <HotspotRenderer
              ref={hotspotRendererRef}
              currentScene={state.currentScene}
              scenesRef={refs.scenesRef}
              hotspotsVisible={state.hotspotsVisible}
              onNavigate={navigateToScene}
              projectId={projectId}
              currentViewParams={state.currentViewParams}
            />

            <POIComponent
              ref={poiComponentRef}
              projectId={projectId || "default"}
              currentPanoramaId={state.currentScene}
              viewerSize={{ width: 800, height: 600 }} // You may want to get actual viewer size
              viewerRef={refs.viewerRef}
              panoRef={refs.panoRef}
              onPOICreated={handlePOICreated}
            />
          </>
        )}

      {/* <ControlsHint /> */}

      <ToastContainer
        position="bottom-left"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        toastStyle={{
          background: "rgba(0, 0, 0, 0.65)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: "8px",
          color: "#fff",
          fontSize: "14px",
          fontWeight: "500",
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.35)",
        }}
      />
    </>
  );
}
