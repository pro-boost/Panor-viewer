"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import { FaDownload, FaTimes } from "react-icons/fa";
import { ConfigData } from "@/types/scenes";
import { POIData } from "@/types/poi";

import styles from "../ui/ConfirmationModal.module.css";

// Add CSS animation for progress bar
const progressBarStyles = `
  @keyframes progressPulse {
    0% { opacity: 0.6; }
    50% { opacity: 1; }
    100% { opacity: 0.6; }
  }
`;

// Inject styles into document head
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = progressBarStyles;
  document.head.appendChild(styleSheet);
}

interface ExportConfirmationModalProps {
  isOpen: boolean;
  config: ConfigData;
  pois?: POIData[];
  onClose: () => void;
}

const ExportConfirmationModal: React.FC<ExportConfirmationModalProps> = ({
  isOpen,
  config,
  pois = [],
  onClose,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [includePOIs, setIncludePOIs] = useState(true);
  const [exportStatus, setExportStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });
  const [exportProgress, setExportProgress] = useState({
    step: 0,
    totalSteps: 6,
    message: "Initializing export..."
  });

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isExporting) {
      onClose();
    }
  };

  const handleExport = async () => {
    // Validate that we have config and scenes to export
    if (!config || !config.scenes || config.scenes.length === 0) {
      setExportStatus({
        type: "error",
        message: "No scenes available to export. Please add panorama scenes first.",
      });
      return;
    }

    setIsExporting(true);
    setExportStatus({ type: null, message: "" });
    setExportProgress({ step: 1, totalSteps: 6, message: "Validating project data..." });

    try {
      // Prepare project data for export
      const projectData = {
        config,
        pois: includePOIs ? pois : [], // Include POIs only if checkbox is checked
      };

      // Set initial progress state
      setExportProgress({ step: 1, totalSteps: 6, message: "Validating project data..." });

      // Simulate realistic progress during export
      const progressSteps = [
        { step: 2, message: "Loading templates...", delay: 500 },
        { step: 3, message: "Processing configuration...", delay: 1000 },
        { step: 4, message: "Adding core files...", delay: 1500 },
        { step: 5, message: "Processing images...", delay: 2000 }
      ];

      // Start gradual progress updates
      const progressPromises = progressSteps.map((step, index) => 
        new Promise(resolve => {
          setTimeout(() => {
            setExportProgress({ step: step.step, totalSteps: 6, message: step.message });
            resolve(null);
          }, step.delay);
        })
      );

      // Start all progress updates and API call simultaneously
      const [response] = await Promise.all([
        fetch('/api/export-project', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'export',
            projectData
          })
        }),
        ...progressPromises
      ]);
      
      // Final progress step when server operations complete
      setExportProgress({ step: 6, totalSteps: 6, message: "Download ready - starting download..." });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Export failed');
      }

      // Handle ZIP file download
      const blob = await response.blob();
      const filename = response.headers.get('Content-Disposition')?.match(/filename="(.+)"/)?.[1] || 'panorama-export.zip';
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      setExportStatus({
        type: "success",
        message: `Project "${config?.projectName || "Panorama Project"}" exported successfully!`,
      });

      // Close modal after successful export
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Export failed:", error);
      
      let errorMessage = "Export failed. Please try again.";
      
      // Try to parse detailed error from API response
      if (error instanceof Error) {
        try {
          // Check if it's a fetch error with response
          if (error.message.includes('Failed to fetch')) {
            errorMessage = "Network error: Unable to connect to server. The project may be too large or the server may be overloaded.";
          } else {
            errorMessage = error.message;
          }
        } catch (parseError) {
          console.error("Error parsing error response:", parseError);
        }
      }
      
      setExportStatus({
        type: "error",
        message: errorMessage,
      });
    } finally {
      setIsExporting(false);
      setExportProgress({ step: 0, totalSteps: 6, message: "Initializing export..." });
    }
  };

  const modalContent = (
    <div className={styles.modalOverlay} onClick={handleOverlayClick}>
      <div className={styles.modalContainer}>
        <div className={styles.modalHeader}>
          <div className={styles.headerContent}>
            <FaDownload
              className={`${styles.warningIcon} ${styles.info}`}
              size={20}
            />
            <h3 className={styles.modalTitle}>Export Project</h3>
          </div>
          {!isExporting && (
            <button
              onClick={onClose}
              className={styles.closeButton}
              title="Close"
            >
              <FaTimes size={16} />
            </button>
          )}
        </div>

        <div className={styles.modalContent}>
          {exportStatus.type ? (
            <div className={`export-status ${exportStatus.type}`}>
              <p className={styles.modalMessage}>
                {exportStatus.type === "success" ? "✓" : "✗"} {exportStatus.message}
              </p>
            </div>
          ) : (
            <>
              {!isExporting && (
                <>
                  <p className={styles.modalMessage}>
                    Create a standalone panorama viewer with all assets included.
                    {config?.projectName && (
                      <> Project: <strong>{config.projectName}</strong></>
                    )}
                  </p>
                  
                  <div className="export-options" style={{ marginTop: "16px" }}>
                    <label 
                      style={{ 
                        display: "flex", 
                        alignItems: "center", 
                        gap: "8px", 
                        cursor: "pointer",
                        color: "#fff",
                        fontSize: "14px"
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={includePOIs}
                        onChange={(e) => setIncludePOIs(e.target.checked)}
                        style={{
                          width: "16px",
                          height: "16px",
                          cursor: "pointer"
                        }}
                      />
                      Include Points of Interest ({pois.length} POIs)
                    </label>
                    <p style={{ 
                      fontSize: "12px", 
                      color: "rgba(255, 255, 255, 0.7)", 
                      marginTop: "4px",
                      marginLeft: "24px"
                    }}>
                      {includePOIs 
                        ? "POIs will be included in the exported viewer" 
                        : "POIs will be excluded from the exported viewer"
                      }
                    </p>
                  </div>
                </>
              )}
              
              {/* Progress Bar Content */}
              {isExporting && (
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "20px",
                  padding: "20px 0"
                }}>
                  <div style={{
                    width: "100%",
                    maxWidth: "400px"
                  }}>
                    <div style={{
                      backgroundColor: "#2a2a2a",
                      borderRadius: "12px",
                      overflow: "hidden",
                      height: "12px",
                      marginBottom: "16px",
                      border: "1px solid #444"
                    }}>
                      <div style={{
                        height: "100%",
                        background: "linear-gradient(90deg, #4CAF50, #45a049)",
                        borderRadius: "11px",
                        transition: "width 0.3s ease",
                        width: `${(exportProgress.step / exportProgress.totalSteps) * 100}%`
                      }} />
                    </div>
                    
                    <div style={{
                      textAlign: "center",
                      color: "#fff",
                      fontSize: "16px",
                      fontWeight: "500",
                      marginBottom: "8px"
                    }}>
                      Step {exportProgress.step} of {exportProgress.totalSteps}
                    </div>
                    
                    <div style={{
                      textAlign: "center",
                      color: "#ccc",
                      fontSize: "14px"
                    }}>
                      {exportProgress.message}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {!exportStatus.type && (
          <div className={styles.modalActions}>
            <button 
              onClick={onClose} 
              className={styles.cancelButton}
              disabled={isExporting}
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              className={`${styles.confirmButton} ${styles.info}`}
              disabled={isExporting}
            >
              {isExporting ? (
                <>
                  <span style={{ marginRight: "8px" }}>⏳</span>
                  Exporting...
                </>
              ) : (
                "Export Project"
              )}
            </button>
            

          </div>
        )}
      </div>
    </div>
  );

  // Render the modal at the document body level using a portal
  return typeof document !== "undefined"
    ? createPortal(modalContent, document.body)
    : null;
};

export default ExportConfirmationModal;