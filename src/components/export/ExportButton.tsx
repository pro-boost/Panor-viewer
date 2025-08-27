"use client";

import React, { useState } from "react";
import { ConfigData } from "@/types/scenes";
import { POIData } from "@/types/poi";
import { ExportIcon } from "../ui/icons/ControlPanelIcons";
import ExportConfirmationModal from "./ExportConfirmationModal";
import styles from "./ExportButton.module.css";

interface ExportButtonProps {
  config: ConfigData;
  pois?: POIData[];
  disabled?: boolean;
  className?: string;
}

/**
 * Export button component for creating standalone panorama viewer packages
 */
export default function ExportButton({
  config,
  pois = [],
  disabled = false,
  className = "",
}: ExportButtonProps) {
  const [showModal, setShowModal] = useState(false);

  const handleExportClick = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <>
      <div className={styles.exportContainer}>
        <div className={styles.exportHeader}>
          <ExportIcon />
          <span className={styles.exportHeaderText}>Export Project</span>
        </div>
        <div className={styles.exportContent}>
          <button
            onClick={handleExportClick}
            disabled={disabled}
            className={styles.exportButton}
            title="Export project as standalone viewer"
          >
            <span>Export Project</span>
          </button>
          <div className={styles.exportDescription}>
            Create a standalone panorama viewer with all assets included
          </div>
        </div>
      </div>
      
      <ExportConfirmationModal
        isOpen={showModal}
        config={config}
        pois={pois}
        onClose={handleCloseModal}
      />
    </>
  );
}