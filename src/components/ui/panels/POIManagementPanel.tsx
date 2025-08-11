"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import styles from "../ControlPanel.module.css";
import projectStyles from "@/styles/ProjectsPanel.module.css";
import poiPanelStyles from "@/styles/POIManagementPanel.module.css";
import { POIData } from "@/types/poi";
import ConfirmationModal from "../ConfirmationModal";

interface POIManagementPanelProps {
  projectId: string;
  currentPanoramaId: string;
  onPanelClose: () => void;
  onPOIEdit?: (poi: POIData) => void;
  onPOIDelete?: (poiId: string | POIData) => void;
  onPOINavigate?: (panoramaId: string) => void;
}

export const POIManagementPanel = React.forwardRef<
  { updatePOIList: (poiId: string) => void },
  POIManagementPanelProps
>(function POIManagementPanel(
  {
    projectId,
    currentPanoramaId,
    onPanelClose,
    onPOIEdit,
    onPOIDelete,
    onPOINavigate,
  },
  ref,
) {
  const router = useRouter();
  const [allPois, setAllPois] = useState<POIData[]>([]);
  const [filteredPois, setFilteredPois] = useState<POIData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Load all POIs for the project
  const loadPOIs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `/api/poi/load?projectId=${encodeURIComponent(projectId)}`,
      );

      if (response.ok) {
        const data = await response.json();
        setAllPois(data.pois || []);
      } else if (response.status === 404) {
        // No POIs found, start with empty array
        setAllPois([]);
      } else {
        throw new Error("Failed to load POIs");
      }
    } catch (err) {
      console.error("Error loading POIs:", err);
      setError("Failed to load POIs");
      setAllPois([]);
    } finally {
      setLoading(false);
    }
  };

  // Delete POI
  const handleDeletePOI = (e: React.MouseEvent, poi: POIData) => {
    e.stopPropagation();
    if (typeof onPOIDelete === "function") {
      onPOIDelete(poi);
    }
  };

  // Update local state when POI is deleted externally
  const updatePOIList = (deletedPoiId: string) => {
    setAllPois((prev) => prev.filter((poi) => poi.id !== deletedPoiId));
  };

  // Expose updatePOIList method through ref
  React.useImperativeHandle(
    ref,
    () => ({
      updatePOIList,
    }),
    [],
  );

  // Handle POI edit
  const handleEditPOI = (poi: POIData) => {
    if (onPOIEdit) {
      onPOIEdit(poi);
    }
    onPanelClose();
  };

  // Handle POI navigation
  const handleNavigateToPOI = (poi: POIData) => {
    if (onPOINavigate) {
      onPOINavigate(poi.panoramaId);
    }
    onPanelClose();
  };

  // Filter POIs based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredPois(allPois);
    } else {
      const filtered = allPois.filter(
        (poi) =>
          poi.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (poi.description &&
            poi.description.toLowerCase().includes(searchTerm.toLowerCase())),
      );
      setFilteredPois(filtered);
    }
  }, [allPois, searchTerm]);

  // Load POIs when component mounts
  useEffect(() => {
    if (projectId) {
      loadPOIs();
    }
  }, [projectId]);

  // Get POI type icon
  const getPOITypeIcon = (type: string) => {
    switch (type) {
      case "file":
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
            />
            <path
              d="M14 2V8H20"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
            />
          </svg>
        );
      case "iframe":
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
            />
            <path d="M2 12H22" stroke="currentColor" strokeWidth="2" />
            <path
              d="M12 2C14.5 4.5 16 8.5 16 12S14.5 19.5 12 22C9.5 19.5 8 15.5 8 12S9.5 4.5 12 2Z"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
            />
          </svg>
        );
      default:
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M21 10C21 17 12 23 12 23S3 17 3 10C3 5.03 7.03 1 12 1S21 5.03 21 10Z"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
            />
            <circle
              cx="12"
              cy="10"
              r="3"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
            />
          </svg>
        );
    }
  };

  return (
    <div className={styles.expandedPanel}>
      <div className={styles.header}>
        <div className={styles.icon}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M21 10C21 17 12 23 12 23S3 17 3 10C3 5.03 7.03 1 12 1S21 5.03 21 10Z"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
            />
            <circle
              cx="12"
              cy="10"
              r="3"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
            />
          </svg>
        </div>
        <div className={styles.text}>POI Management</div>
      </div>

      <div className={styles.poiManagementContent}>
        <button
          className={`${styles.actionButton} ${projectStyles.createButton}`}
          onClick={() => {
            console.log("🔄 Manage POIs clicked");
            console.log("🔄 Router ready:", router.isReady);
            console.log("🔄 Current route:", router.asPath);

            onPanelClose();
            console.log("🔄 Panel closed, navigating to POI management...");

            const url = `/poi-management?from=${encodeURIComponent(projectId)}&scene=${encodeURIComponent(currentPanoramaId)}`;
            console.log("🔄 Navigating to:", url);

            // Use window.location.href to force a full page navigation
            setTimeout(() => {
              window.location.href = url;
            }, 100);
          }}
        >
          + Manage POIs
        </button>

        <p className={styles.description}>
          Manage all Points of Interest in your project. Right-click on any
          panorama to create new POIs.
        </p>

        {/* Search Bar */}
        <div className={poiPanelStyles.searchContainer}>
          <input
            type="text"
            placeholder="Search POIs by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={poiPanelStyles.searchInput}
          />
        </div>

        {loading && (
          <div className={poiPanelStyles.loadingContainer}>Loading POIs...</div>
        )}

        {error && <div className={poiPanelStyles.errorContainer}>{error}</div>}

        {!loading && !error && (
          <>
            {/* POI Count Info */}
            {allPois.length > 0 && (
              <div className={poiPanelStyles.poiCountInfo}>
                <span>
                  {searchTerm
                    ? `${filteredPois.length} of ${allPois.length} POIs`
                    : `${allPois.length} POI${allPois.length !== 1 ? "s" : ""} total`}
                </span>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className={poiPanelStyles.clearSearchButton}
                  >
                    Clear search
                  </button>
                )}
              </div>
            )}

            {filteredPois.length === 0 ? (
              <div className={poiPanelStyles.emptyContainer}>
                {searchTerm ? (
                  <>
                    No POIs found matching &quot;{searchTerm}&quot;.
                    <br />
                    Try a different search term.
                  </>
                ) : allPois.length === 0 ? (
                  <>
                    No POIs found in this project.
                    <br />
                    Right-click on any panorama to create one.
                  </>
                ) : (
                  "No POIs to display."
                )}
              </div>
            ) : (
              <div className={poiPanelStyles.poisContainer}>
                {filteredPois.map((poi) => (
                  <div
                    key={poi.id}
                    onClick={() => handleNavigateToPOI(poi)}
                    className={`${poiPanelStyles.poiItem} ${
                      poi.panoramaId === currentPanoramaId
                        ? poiPanelStyles.current
                        : poiPanelStyles.other
                    }`}
                    title={`Click to navigate to ${poi.name} in scene ${poi.panoramaId}`}
                  >
                    <div className={poiPanelStyles.poiIcon}>
                      {getPOITypeIcon(poi.type)}
                    </div>
                    <div className={poiPanelStyles.poiContent}>
                      <div className={poiPanelStyles.poiName}>{poi.name}</div>
                      <div className={poiPanelStyles.poiScene}>
                        Scene: {poi.panoramaId}
                      </div>
                    </div>
                    <div className={poiPanelStyles.poiActions}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditPOI(poi);
                        }}
                        className={poiPanelStyles.actionButton}
                        title="Edit POI"
                      >
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          className={poiPanelStyles.actionIcon}
                        >
                          <path
                            d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M18.5 2.50023C18.8978 2.1024 19.4374 1.87891 20 1.87891C20.5626 1.87891 21.1022 2.1024 21.5 2.50023C21.8978 2.89805 22.1213 3.43762 22.1213 4.00023C22.1213 4.56284 21.8978 5.1024 21.5 5.50023L12 15.0002L8 16.0002L9 12.0002L18.5 2.50023Z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => handleDeletePOI(e, poi)}
                        className={`${poiPanelStyles.actionButton} ${poiPanelStyles.deleteButton}`}
                        title="Delete POI"
                      >
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          className={poiPanelStyles.actionIcon}
                        >
                          <path
                            d="M3 6H5H21"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={loadPOIs}
              className={styles.actionButton}
              style={{ marginTop: "12px" }}
            >
              Refresh POIs
            </button>
          </>
        )}
      </div>
    </div>
  );
});

// Render the confirmation modal outside the component to center it on the page
export function POIManagementPanelWithModal(props: POIManagementPanelProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [poiToDelete, setPoiToDelete] = useState<POIData | null>(null);
  const panelRef = React.useRef<{ updatePOIList: (poiId: string) => void }>(
    null,
  );

  const handleDeletePOI = (poiId: string | POIData) => {
    // If it's a string, we need to find the POI object
    if (typeof poiId === "string") {
      // For string IDs, we can't show a confirmation modal without the POI object
      // So we'll call the parent's onPOIDelete directly
      if (props.onPOIDelete) {
        props.onPOIDelete(poiId);
      }
      return;
    }

    // If it's a POIData object, show the confirmation modal
    setPoiToDelete(poiId);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!poiToDelete) return;

    // Update the panel's local state immediately
    panelRef.current?.updatePOIList(poiToDelete.id);

    // Call the parent's onPOIDelete - it will handle the API call and toast messages
    if (props.onPOIDelete) {
      props.onPOIDelete(poiToDelete.id);
    }

    // Close the modal
    setShowDeleteConfirm(false);
    setPoiToDelete(null);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setPoiToDelete(null);
  };

  return (
    <>
      <POIManagementPanel
        ref={panelRef}
        {...props}
        onPOIDelete={handleDeletePOI}
      />
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        title="Delete POI"
        message={
          poiToDelete
            ? `Are you sure you want to delete "${poiToDelete.name}"? This action cannot be undone.`
            : ""
        }
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        variant="danger"
      />
    </>
  );
}
