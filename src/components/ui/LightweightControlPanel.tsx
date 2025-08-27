"use client";

import React, { ReactElement, useEffect } from "react";
import styles from "./ControlPanel.module.css";
import { SceneData } from "@/types/scenes";
import { ControlButton } from "./ControlButton";
import { FloorSelectorPanel } from "./panels";
import { FloorsIcon } from "./icons";
import { usePanelState } from "../../hooks/usePanelState";

interface LightweightControlPanelProps {
  // Floor Selector props
  scenes?: SceneData[];
  currentScene?: SceneData | null;
  onFloorChange?: (sceneId: string) => void;

  // Panel control props
  onClosePanels?: (closePanelsFunc: () => void) => void;
}

/**
 * Lightweight ControlPanel for standalone export
 * Only includes Floor Selector functionality
 * Excludes: Projects, POI Management, Performance Monitor, Hotspot Control
 */
export default function LightweightControlPanel({
  scenes = [],
  currentScene,
  onFloorChange,
  onClosePanels,
}: LightweightControlPanelProps): ReactElement {
  const {
    expandedPanel,
    handlePanelToggle,
    handleMouseEnter,
    handleMouseLeave,
    closePanels,
  } = usePanelState();

  // Provide closePanels function to parent component
  useEffect(() => {
    if (onClosePanels) {
      onClosePanels(closePanels);
    }
  }, [onClosePanels, closePanels]);

  return (
    <div className={styles.controlPanel}>
      {/* Floor Selector Panel - Only panel included in lightweight version */}
      {scenes.length > 0 && onFloorChange && (
        <ControlButton
          id="floors"
          expandedPanel={expandedPanel}
          onToggle={handlePanelToggle}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          icon={<FloorsIcon />}
        >
          <FloorSelectorPanel
            scenes={scenes}
            currentScene={currentScene}
            onFloorChange={onFloorChange}
            onPanelClose={closePanels}
          />
        </ControlButton>
      )}
    </div>
  );
}