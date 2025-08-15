import { useState, FormEvent, ChangeEvent, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import styles from "@/styles/POIManagement.module.css";
import Logo from "@/components/ui/Logo";
import LogoutButton from "@/components/ui/LogoutButton";
import { POIData } from "@/types/poi";
import POIFileManager, { exportPOI } from "@/components/poi/POIFileManager";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import { useAuth } from "@/contexts/AuthContext";
import PageLoadingComponent from "@/components/ui/PageLoadingComponent";

interface Project {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  sceneCount: number;
  hasConfig: boolean;
  firstSceneId?: string;
  poiCount: number;
  floorCount: number;
}

interface ProjectPOIs {
  projectId: string;
  projectName: string;
  pois: POIData[];
  sceneCount: number;
}

interface CustomSelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: CustomSelectOption[];
  placeholder?: string;
}

function CustomSelect({
  value,
  onChange,
  options,
  placeholder,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className={styles.customSelect} ref={dropdownRef}>
      <button
        type="button"
        className={styles.selectButton}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{selectedOption?.label || placeholder}</span>
        <span className={styles.selectArrow}>▼</span>
      </button>

      {isOpen && (
        <div className={styles.selectDropdown}>
          {options.map((option) => (
            <div
              key={option.value}
              className={`${styles.selectOption} ${
                value === option.value ? styles.selected : ""
              }`}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function POIManagement() {
  // Initialize authentication
  const { isAuthenticated, loading: authLoading, user } = useAuth();

  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectPOIs, setProjectPOIs] = useState<ProjectPOIs[]>([]);
  const [referrerUrl, setReferrerUrl] = useState<string>("/");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState("");
  const [showDetails, setShowDetails] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [deletingPOI, setDeletingPOI] = useState<string | null>(null);
  const [useIndividualFiles, setUseIndividualFiles] = useState(false);
  const [fileManagerMessage, setFileManagerMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [poiToDelete, setPOIToDelete] = useState<{
    projectId: string;
    poiId: string;
    poiName: string;
  } | null>(null);
  const [showImportManager, setShowImportManager] = useState(false);

  // Reset import manager when project changes
  useEffect(() => {
    setShowImportManager(false);
  }, [selectedProject]);

  useEffect(() => {
    // Capture referrer information
    const referrer = document.referrer;
    const urlParams = new URLSearchParams(window.location.search);
    const fromProject = urlParams.get("from");
    const fromScene = urlParams.get("scene");

    if (fromProject && fromScene) {
      setReferrerUrl(`/${fromProject}?scene=${fromScene}`);
    } else if (fromProject) {
      setReferrerUrl(`/${fromProject}`);
    } else if (referrer && referrer.includes(window.location.origin)) {
      // If referrer is from the same origin, use it
      const referrerPath = referrer.replace(window.location.origin, "");
      setReferrerUrl(referrerPath || "/");
    }

    loadProjectsAndPOIs();
  }, []);

  const loadProjectsAndPOIs = async () => {
    setIsLoading(true);
    try {
      // Load all projects
      const projectsResponse = await fetch("/api/projects");
      if (!projectsResponse.ok) {
        throw new Error("Failed to load projects");
      }
      const projectsData = await projectsResponse.json();
      setProjects(projectsData.projects || []);

      // Load POIs for each project
      const allProjectPOIs: ProjectPOIs[] = [];
      for (const project of projectsData.projects || []) {
        try {
          // Try loading from individual files first
          const individualResponse = await fetch(
            `/api/poi/load-individual?projectId=${encodeURIComponent(project.id)}&useIndividual=${useIndividualFiles}`
          );

          if (individualResponse.ok) {
            const poisData = await individualResponse.json();
            if (poisData.pois && poisData.pois.length > 0) {
              allProjectPOIs.push({
                projectId: project.id,
                projectName: project.name,
                pois: poisData.pois,
                sceneCount: project.sceneCount,
              });
              setUseIndividualFiles(poisData.source === "individual");
            }
          } else {
            // Fallback to main file
            const poisResponse = await fetch(
              `/api/poi/load?projectId=${encodeURIComponent(project.id)}`
            );
            if (poisResponse.ok) {
              const poisData = await poisResponse.json();
              if (poisData.pois && poisData.pois.length > 0) {
                allProjectPOIs.push({
                  projectId: project.id,
                  projectName: project.name,
                  pois: poisData.pois,
                  sceneCount: project.sceneCount,
                });
              }
            }
          }
        } catch (error) {
          console.warn(`Failed to load POIs for project ${project.id}:`, error);
        }
      }
      setProjectPOIs(allProjectPOIs);

      const totalPOIs = allProjectPOIs.reduce(
        (sum, project) => sum + project.pois.length,
        0
      );
      setMessage(
        `Loaded ${totalPOIs} POIs from ${allProjectPOIs.length} projects`
      );
    } catch (error) {
      console.error("Failed to load projects and POIs:", error);
      setMessage("Failed to load POI data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePOI = async (
    projectId: string,
    poiId: string,
    poiName: string
  ) => {
    setPOIToDelete({ projectId, poiId, poiName });
    setShowDeleteConfirm(true);
  };

  const confirmDeletePOI = async () => {
    if (!poiToDelete) return;

    setDeletingPOI(poiToDelete.poiId);
    try {
      // Build query parameters for the DELETE request
      const params = new URLSearchParams({
        projectId: poiToDelete.projectId,
        id: poiToDelete.poiId,
        useIndividual: useIndividualFiles.toString(),
      });

      const response = await fetch(`/api/poi/delete?${params.toString()}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete POI");
      }

      // Refresh the POI data
      await loadProjectsAndPOIs();
      setMessage("POI deleted successfully");
    } catch (error) {
      console.error("Failed to delete POI:", error);
      setMessage("Failed to delete POI. Please try again.");
    } finally {
      setDeletingPOI(null);
      setShowDeleteConfirm(false);
      setPOIToDelete(null);
    }
  };

  const toggleProjectDetails = (projectId: string) => {
    setShowDetails((prev) => ({
      ...prev,
      [projectId]: !prev[projectId],
    }));
  };

  const handlePOIImported = (poi: POIData) => {
    // Refresh the POI data after import
    loadProjectsAndPOIs();
  };

  const handleExportPOI = async (poi: POIData, projectId: string) => {
    try {
      await exportPOI(projectId, poi.id, poi.name);
      setFileManagerMessage({
        type: "success",
        text: `POI "${poi.name}" exported successfully`,
      });
    } catch (error) {
      setFileManagerMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to export POI",
      });
    }
  };

  const handleFileManagerMessage = (
    type: "success" | "error",
    message: string
  ) => {
    setFileManagerMessage({ type, text: message });
    setTimeout(() => setFileManagerMessage(null), 5000);
    // Hide import manager on successful import
    if (type === "success" && message.includes("imported")) {
      setShowImportManager(false);
    }
  };

  const handleExportAllPOIs = async (
    projectId: string,
    projectName: string
  ) => {
    try {
      const response = await fetch(
        `/api/poi/export-all?projectId=${encodeURIComponent(projectId)}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to export POIs");
      }

      // Create download link
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${projectId}-all-pois-export.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setFileManagerMessage({
        type: "success",
        text: `All POIs from "${projectName}" exported successfully`,
      });
    } catch (error) {
      setFileManagerMessage({
        type: "error",
        text:
          error instanceof Error ? error.message : "Failed to export all POIs",
      });
    }
  };

  const filteredProjectPOIs = projectPOIs
    .filter((project) => {
      if (selectedProject !== "all" && project.projectId !== selectedProject) {
        return false;
      }
      return true;
    })
    .map((project) => {
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const filteredPOIs = project.pois.filter(
          (poi) =>
            poi.name.toLowerCase().includes(searchLower) ||
            poi.description.toLowerCase().includes(searchLower) ||
            poi.type.toLowerCase().includes(searchLower)
        );
        return {
          ...project,
          pois: filteredPOIs,
        };
      }
      return project;
    })
    .filter((project) => project.pois.length > 0);

  const totalPOIs = filteredProjectPOIs.reduce(
    (sum, project) => sum + project.pois.length,
    0
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case "file":
        return "File";
      case "iframe":
        return "Web";
      default:
        return "POI";
    }
  };

  // Show loading state while checking authentication
  if (authLoading) {
    return <PageLoadingComponent headerText="Checking Authentication" />;
  }

  // Show access denied if not authenticated
  if (!isAuthenticated) {
    return (
      <div className={styles.container}>
        <div className={styles.accessDeniedContent}>
          <h1>Access Denied</h1>
          <p>You must be logged in to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Logo variant="default" position="absolute" />
      <div className={styles.logoutContainer}>
        {user?.role === "admin" && (
          <Link href="/admin/users" className={styles.adminLink}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8.5 11C10.7091 11 12.5 9.20914 12.5 7C12.5 4.79086 10.7091 3 8.5 3C6.29086 3 4.5 4.79086 4.5 7C4.5 9.20914 6.29086 11 8.5 11Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M17 11L19 13L23 9"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className={styles.adminText}>Admin</span>
            <span className={styles.adminTextHover}>Manage Users</span>
          </Link>
        )}
        <LogoutButton variant="minimal" />
      </div>
      <div className={styles.content}>
        <h1 className={styles.title}>POI Management</h1>

        <button
          onClick={() => {
            if (window.history.length > 1) {
              router.back();
            } else {
              router.push(referrerUrl);
            }
          }}
          className={styles.backLink}
        >
          ← Back to Panorama Viewer
        </button>

        {fileManagerMessage && (
          <div
            className={`${styles.message} ${
              fileManagerMessage.type === "error"
                ? styles.messageError
                : styles.messageSuccess
            }`}
          >
            {fileManagerMessage.text}
          </div>
        )}

        <form className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Point of Interest Management</label>
            <div className={styles.inputHint}>
              Manage and view all Points of Interest across your panorama
              projects. Filter by project, search by keywords, and perform bulk
              operations.
            </div>
          </div>

          {/* Filters */}
          <div className={styles.formGroup}>
            <div className={styles.formGroup}>
              <label htmlFor="projectFilter" className={styles.label}>
                Filter by Project:
              </label>
              <CustomSelect
                value={selectedProject}
                onChange={setSelectedProject}
                placeholder="Select a project"
                options={[
                  {
                    value: "all",
                    label: `All Projects (${projectPOIs.length})`,
                  },
                  ...projects.map((project) => {
                    const projectPOICount =
                      projectPOIs.find((p) => p.projectId === project.id)?.pois
                        .length || 0;
                    return {
                      value: project.id,
                      label: `${project.name} (${projectPOICount} POIs)`,
                    };
                  }),
                ]}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="searchPOIs" className={styles.label}>
                Search POIs:
              </label>
              <input
                type="text"
                id="searchPOIs"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, description, or type..."
                className={styles.textInput}
              />
            </div>
          </div>

          {/* Summary */}
          {!isLoading && (
            <div
              className={`${styles.fileSummary} ${styles.poiSummaryContainer}`}
            >
              <h4 className={styles.summaryTitle}>POI Summary</h4>
              <div className={styles.summaryContent}>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryIcon}>POI</span>
                  <span className={styles.summaryText}>
                    {totalPOIs} POI{totalPOIs !== 1 ? "s" : ""} found
                  </span>
                </div>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryIcon}>Projects</span>
                  <span className={styles.summaryText}>
                    {filteredProjectPOIs.length} project
                    {filteredProjectPOIs.length !== 1 ? "s" : ""} with POIs
                  </span>
                </div>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={loadProjectsAndPOIs}
            disabled={isLoading}
            className={styles.submitButton}
          >
            {isLoading && <span className={styles.loadingSpinner}></span>}
            {isLoading ? "Loading..." : "Refresh POI Data"}
          </button>
        </form>

        {/* POI List */}
        <div className={styles.poiListContainer}>
          {isLoading ? (
            <PageLoadingComponent headerText="Loading POI Data" />
          ) : filteredProjectPOIs.length === 0 ? (
            <div className={styles.form}>
              <div className={styles.formGroup}>
                <div className={styles.emptyState}>
                  <div className={styles.emptyTitle}>No POIs found</div>

                  <div className={styles.inputHint}>
                    {searchTerm
                      ? "Try adjusting your search terms"
                      : "Create some POIs in your panorama projects or import them below"}
                  </div>
                </div>
              </div>

              {/* Show POI File Manager when no POIs are found */}
              {!searchTerm && (
                <div className={styles.formGroup}>
                  {selectedProject === "all" ? (
                    <div className={styles.inputHint}>
                      Please select a specific project to import POIs
                    </div>
                  ) : (
                    <POIFileManager
                      projectId={selectedProject}
                      onPOIImported={handlePOIImported}
                      onError={(error) =>
                        handleFileManagerMessage("error", error)
                      }
                      onSuccess={(message) =>
                        handleFileManagerMessage("success", message)
                      }
                      hasExistingPOIs={projectPOIs.some(
                        (project) =>
                          project.projectId === selectedProject &&
                          project.pois.length > 0
                      )}
                    />
                  )}
                </div>
              )}
            </div>
          ) : (
            filteredProjectPOIs.map((project) => (
              <div key={project.projectId} className={styles.form}>
                <div className={styles.formGroup}>
                  <div
                    className={styles.projectHeaderContainer}
                    onClick={() => toggleProjectDetails(project.projectId)}
                  >
                    <div>
                      <h3 className={styles.projectTitle}>
                        {project.projectName}
                      </h3>
                      <div
                        className={`${styles.inputHint} ${styles.projectMeta}`}
                      >
                        {project.pois.length} POI
                        {project.pois.length !== 1 ? "s" : ""} •{" "}
                        {project.sceneCount} scene
                        {project.sceneCount !== 1 ? "s" : ""}
                      </div>
                    </div>
                    <div className={styles.projectActionsContainer}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExportAllPOIs(
                            project.projectId,
                            project.projectName
                          );
                        }}
                        className={styles.backLink}
                        title={`Export all ${project.pois.length} POIs from this project`}
                      >
                        Export All
                      </button>
                      <Link
                        href={`/${project.projectId}`}
                        className={styles.backLink}
                        onClick={(e) => e.stopPropagation()}
                      >
                        View Project
                      </Link>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProject(project.projectId);
                          setShowImportManager(!showImportManager);
                          // Auto-expand project details when opening import manager
                          if (!showImportManager) {
                            setShowDetails((prev) => ({
                              ...prev,
                              [project.projectId]: true,
                            }));
                          }
                        }}
                        className={styles.backLink}
                        title={`Import POIs to ${project.projectName}`}
                      >
                        {showImportManager &&
                        selectedProject === project.projectId
                          ? "Hide Import"
                          : "Import POIs"}
                      </button>
                      <span className={styles.expandIcon}>
                        {showDetails[project.projectId] ? "▼" : "▶"}
                      </span>
                    </div>
                  </div>
                </div>

                {showDetails[project.projectId] && (
                  <div>
                    {/* POI File Manager */}
                    {selectedProject === project.projectId &&
                      showImportManager && (
                        <div className={styles.formGroup}>
                          <POIFileManager
                            projectId={selectedProject}
                            onPOIImported={handlePOIImported}
                            onError={(error) =>
                              handleFileManagerMessage("error", error)
                            }
                            onSuccess={(message) =>
                              handleFileManagerMessage("success", message)
                            }
                            hasExistingPOIs={projectPOIs.some(
                              (p) =>
                                p.projectId === selectedProject &&
                                p.pois.length > 0
                            )}
                          />
                        </div>
                      )}
                    {project.pois.map((poi) => (
                      <div key={poi.id} className={styles.fileSummary}>
                        <h3 className={styles.summaryTitle}>POI: {poi.name}</h3>
                        <div className={styles.summaryContent}>
                          <div className={styles.summaryItem}>
                            <span className={styles.summaryIcon}>📍</span>
                            <div className={styles.summaryText}>
                              Description: {poi.description}
                            </div>
                          </div>

                          <div className={styles.inputHint}>
                            <div>Panorama: {poi.panoramaId}</div>
                            <div>Created: {formatDate(poi.createdAt)}</div>
                            {poi.content && <div>Content: {poi.content}</div>}
                          </div>

                          <div className={styles.buttonGroup}>
                            <Link
                              href={`/${project.projectId}/${poi.panoramaId}`}
                              className={styles.poiButton}
                            >
                              View
                            </Link>
                            <button
                              onClick={() =>
                                handleExportPOI(poi, project.projectId)
                              }
                              className={styles.poiButton}
                            >
                              Export
                            </button>
                            <button
                              onClick={() =>
                                handleDeletePOI(
                                  project.projectId,
                                  poi.id,
                                  poi.name
                                )
                              }
                              disabled={deletingPOI === poi.id}
                              className={`${styles.poiButton} ${styles.poiButtonDelete}`}
                            >
                              {deletingPOI === poi.id
                                ? "Deleting..."
                                : "Delete"}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Message Display */}
        {message && (
          <div className={styles.messageContainer}>
            <div
              className={`${styles.message} ${
                message.includes("Failed")
                  ? styles.messageError
                  : styles.messageSuccess
              }`}
            >
              {message}
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setPOIToDelete(null);
        }}
        onConfirm={confirmDeletePOI}
        title="Delete POI"
        message={`Are you sure you want to delete the POI &quot;${poiToDelete?.poiName}&quot;? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}
