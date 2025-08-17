import { useCallback } from "react";
import { SceneInfo as SceneInfoType, LinkHotspot } from "@/types/scenes";
import { PanoramaViewerRefs, PanoramaViewerActions } from "./usePanoramaViewer";
import { calculate3DDistance } from "@/utils/panoramaUtils";

export interface UseHotspotManagerProps {
  refs: PanoramaViewerRefs;
  actions: PanoramaViewerActions;
  hotspotsVisible: boolean;
  maxHotspots: number;
}

export function useHotspotManager({
  refs,
  actions,
  hotspotsVisible,
  maxHotspots,
}: UseHotspotManagerProps) {
  // Clear hotspots for a scene
  const clearHotspotsForScene = useCallback(
    (sceneInfo: SceneInfoType): void => {
      if (!sceneInfo?.scene) {
        console.warn("clearHotspotsForScene: Invalid scene info provided");
        return;
      }

      try {
        const hotspotContainer = sceneInfo.scene.hotspotContainer();
        if (!hotspotContainer) {
          console.warn("clearHotspotsForScene: No hotspot container found");
          return;
        }

        // Destroy all hotspots
        const hotspots = hotspotContainer.listHotspots();
        hotspots.forEach((hotspot: Marzipano.Hotspot) => {
          try {
            hotspotContainer.destroyHotspot(hotspot);
          } catch (destroyErr) {
            console.warn("Failed to destroy individual hotspot:", destroyErr);
          }
        });

        // Clear our references
        sceneInfo.hotspotElements = [];
        console.log(
          `Cleared ${hotspots.length} hotspots for scene ${sceneInfo.data.id}`,
        );
      } catch (err) {
        console.error("Error clearing hotspots:", err);
        // Ensure references are cleared even on error
        sceneInfo.hotspotElements = [];
      }
    },
    [],
  );

  // Create hotspots for a scene with distance-based filtering
  const createHotspotsForScene = useCallback(
    (sceneInfo: SceneInfoType): void => {
      if (!sceneInfo?.scene) {
        console.warn("createHotspotsForScene: Invalid scene info provided");
        return;
      }

      if (!sceneInfo.data?.linkHotspots) {
        console.log(
          `No hotspots to create for scene ${sceneInfo.data?.id || "unknown"}`,
        );
        return;
      }

      try {
        const hotspotContainer = sceneInfo.scene.hotspotContainer();
        if (!hotspotContainer) {
          console.warn("createHotspotsForScene: No hotspot container found");
          return;
        }

        // Clear any existing hotspots first
        clearHotspotsForScene(sceneInfo);

        // Get current scene position for distance calculation
        const currentPosition = sceneInfo.data.position;
        if (!currentPosition) {
          console.warn("Current scene position not available for distance calculation");
          return;
        }

        // Create hotspot data with distances and sort by distance
        const hotspotsWithDistance = sceneInfo.data.linkHotspots
          .map((hotspotData: LinkHotspot, originalIndex: number) => {
            // Find target scene position from refs
            const targetScene = refs.scenesRef.current[hotspotData.target];
            let distance = 0;
            
            if (targetScene?.data?.position) {
              distance = calculate3DDistance(currentPosition, targetScene.data.position);
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
          .slice(0, maxHotspots); // Limit to maxHotspots

        // Create hotspots from the filtered and sorted list
        hotspotsWithDistance.forEach((hotspotData, index) => {
          try {
            if (
              typeof hotspotData.yaw !== "number" ||
              typeof hotspotData.pitch !== "number"
            ) {
              console.warn(
                `Invalid hotspot data at index ${index}:`,
                hotspotData,
              );
              return;
            }

            const element = document.createElement("div");
            element.setAttribute("data-hotspot-index", hotspotData.originalIndex.toString());
            element.setAttribute(
              "data-target-scene",
              hotspotData.target || "unknown",
            );
            element.setAttribute(
              "data-distance",
              hotspotData.calculatedDistance.toFixed(2),
            );

            hotspotContainer.createHotspot(element, {
              yaw: hotspotData.yaw,
              pitch: hotspotData.pitch,
            });

            sceneInfo.hotspotElements.push(element);
          } catch (hotspotErr) {
            console.error(`Failed to create hotspot ${index}:`, hotspotErr);
          }
        });

        console.log(
          `Created ${sceneInfo.hotspotElements.length}/${sceneInfo.data.linkHotspots.length} hotspots for scene ${sceneInfo.data.id} (limited by maxHotspots: ${maxHotspots})`,
        );
      } catch (err) {
        console.error("Error creating hotspots:", err);
      }
    },
    [clearHotspotsForScene, maxHotspots, refs.scenesRef],
  );

  // Toggle hotspots with improved error handling
  const toggleHotspots = useCallback((): void => {
    try {
      if (hotspotsVisible) {
        actions.setHotspotsVisible(false);
        if (refs.hotspotTimeoutRef.current) {
          clearTimeout(refs.hotspotTimeoutRef.current);
          refs.hotspotTimeoutRef.current = null;
        }
        console.log("Hotspots hidden");
      } else {
        actions.setHotspotsVisible(true);
        // Auto-hide after 5 seconds
        if (refs.hotspotTimeoutRef.current) {
          clearTimeout(refs.hotspotTimeoutRef.current);
        }
        refs.hotspotTimeoutRef.current = setTimeout(() => {
          try {
            actions.setHotspotsVisible(false);
            console.log("Hotspots auto-hidden after timeout");
          } catch (timeoutErr) {
            console.error("Error during hotspot auto-hide:", timeoutErr);
          }
        }, 5000);
        console.log("Hotspots shown (will auto-hide in 5s)");
      }
    } catch (err) {
      console.error("Error toggling hotspots:", err);
    }
  }, [hotspotsVisible, actions, refs.hotspotTimeoutRef]);

  return {
    clearHotspotsForScene,
    createHotspotsForScene,
    toggleHotspots,
  };
}
