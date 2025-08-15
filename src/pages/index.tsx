"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { ReactElement, useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/router";
import styles from "@/styles/Welcome.module.css";
import { FileURLManager } from "@/utils/fileHelpers";
import Navbar from "@/components/ui/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import PageLoadingComponent from "@/components/ui/PageLoadingComponent";
import Portal from "@/components/ui/Portal";

// ProjectManager moved to PanoramaViewer component

// Dynamically import PanoramaViewer to avoid SSR issues with Marzipano
const PanoramaViewer = dynamic(
  () => import("@/components/viewer/PanoramaViewer"),
  {
    ssr: false,
    loading: (): ReactElement => (
      <PageLoadingComponent headerText="Loading Panoramas" />
    ),
  }
);

interface ConfigData {
  scenes: Array<{ id: string; name: string; [key: string]: any }>;
  projectId?: string;
  projectPath?: string;
}

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

export default function Home(): ReactElement {
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [hasPanoramas, setHasPanoramas] = useState<boolean>(false);
  const [hasProjects, setHasProjects] = useState<boolean>(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [config, setConfig] = useState<ConfigData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showProjects, setShowProjects] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>(""); // name, size, created, updated
  const [sortOrder, setSortOrder] = useState<string>("asc"); // asc, desc
  const [showSortDropdown, setShowSortDropdown] = useState<boolean>(false);
  const dropdownButtonRef = useRef<HTMLButtonElement>(null);
  const gridDropdownButtonRef = useRef<HTMLButtonElement>(null);

  // Grid column selector state
  const [gridColumns, setGridColumns] = useState<number>(3);
  const [screenSize, setScreenSize] = useState<"small" | "medium" | "large">(
    "large"
  );
  const [showGridDropdown, setShowGridDropdown] = useState<boolean>(false);

  // Screen size detection
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setScreenSize("small");
        setGridColumns(1); // Force 1 column on small screens
      } else if (width < 1024) {
        setScreenSize("medium");
        // Adjust grid columns if current selection is not available
        if (gridColumns > 2) setGridColumns(2);
      } else {
        setScreenSize("large");
      }
    };

    // Set initial screen size
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [gridColumns]);

  // Load grid preference from localStorage
  useEffect(() => {
    const savedGridColumns = localStorage.getItem("panorama-grid-columns");
    if (savedGridColumns) {
      const columns = parseInt(savedGridColumns, 10);
      if ([1, 2, 3].includes(columns)) {
        setGridColumns(columns);
      }
    }
  }, []);

  // Save grid preference to localStorage
  useEffect(() => {
    localStorage.setItem("panorama-grid-columns", gridColumns.toString());
  }, [gridColumns]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      // Check if click is outside both the dropdown button and the portal dropdown menu
      if (
        !target.closest(`.${styles.customDropdown}`) &&
        !target.closest("#portal-root")
      ) {
        setShowSortDropdown(false);
        setShowGridDropdown(false);
      }
    };

    if (showSortDropdown || showGridDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSortDropdown, showGridDropdown]);

  // Filtered and sorted projects
  const filteredProjects = useMemo(() => {
    let filtered = projects.filter((project) => {
      // Search filter
      const matchesSearch = project.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      return matchesSearch;
    });

    // Sort projects only if a sort option is selected
    if (sortBy) {
      filtered.sort((a, b) => {
        let comparison = 0;

        switch (sortBy) {
          case "name":
            comparison = a.name.localeCompare(b.name);
            break;
          case "size":
            comparison = a.sceneCount - b.sceneCount;
            break;
          case "createdAt":
            comparison =
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            break;
          case "updatedAt":
            comparison =
              new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
            break;
          default:
            return 0;
        }

        return sortOrder === "asc" ? comparison : -comparison;
      });
    }

    return filtered;
  }, [projects, searchTerm, sortBy, sortOrder]);

  // Determine available grid column options based on screen size and project count
  const getAvailableGridOptions = useMemo(() => {
    const projectCount = filteredProjects.length;

    // Project count rules
    if (projectCount === 1) {
      return [1]; // Force 1 col for single project
    }

    // Screen size rules
    let availableOptions: number[] = [];
    if (screenSize === "small") {
      return []; // No selector on small screens (always 1 col)
    } else if (screenSize === "medium") {
      availableOptions = [2, 1];
    } else {
      // large
      availableOptions = [3, 2, 1];
    }

    // Apply project count restrictions
    if (projectCount === 1) {
      return [1]; // Only 1 column for single project
    }
    if (projectCount === 2) {
      availableOptions = availableOptions.filter(option => option <= 2);
    }
    
    return availableOptions;
  }, [filteredProjects.length, screenSize]);

  // Check if grid selector should be shown
  const shouldShowGridSelector = useMemo(() => {
    return getAvailableGridOptions.length > 1;
  }, [getAvailableGridOptions]);

  // Ensure current grid selection is valid
  useEffect(() => {
    if (
      shouldShowGridSelector &&
      !getAvailableGridOptions.includes(gridColumns)
    ) {
      setGridColumns(getAvailableGridOptions[0] || 1);
    }
  }, [getAvailableGridOptions, gridColumns, shouldShowGridSelector]);

  const loadProjects = async () => {
    try {
      const response = await fetch("/api/projects");
      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects);
        setHasProjects(data.projects.length > 0);

        // Do not auto-select a project to ensure the welcome page is always shown first.
      }
    } catch (error) {
      console.error("Error loading projects:", error);
    }
  };

  const checkForPanoramas = async (projectId?: string) => {
    try {
      let configResponse;
      let imagePathPrefix = "";

      if (projectId) {
        // Check project-specific config
        configResponse = await fetch(
          `/api/projects/${encodeURIComponent(projectId)}/config`,
          {
            cache: "no-store",
          }
        );
        imagePathPrefix = `/${projectId}`;
      } else {
        // No project selected, no panoramas available
        setHasPanoramas(false);
        setConfig(null);
        return;
      }

      if (!configResponse.ok) {
        setHasPanoramas(false);
        setConfig(null);
        return;
      }

      const configData: ConfigData = await configResponse.json();
      setConfig(configData);

      if (!configData.scenes || configData.scenes.length === 0) {
        setHasPanoramas(false);
        return;
      }

      // Check if actual image files exist by testing the first few scenes
      const testScenes = configData.scenes.slice(
        0,
        Math.min(3, configData.scenes.length)
      );
      let imageExists = false;

      for (const scene of testScenes) {
        try {
          const imagePath = projectId
            ? `${imagePathPrefix}/images/${scene.id}-pano.jpg`
            : `/images/${scene.id}-pano.jpg`;
          const imageResponse = await fetch(imagePath, {
            method: "HEAD",
            cache: "no-store",
          });
          if (imageResponse.ok) {
            imageExists = true;
            break;
          }
        } catch {
          // Continue checking other images
        }
      }
      setHasPanoramas(imageExists);
    } catch (error) {
      console.error("Error checking for panoramas:", error);
      setHasPanoramas(false);
      setConfig(null);
    }
  };

  const handleProjectSelect = (projectId: string) => {
    setSelectedProject(projectId);
    if (projectId) {
      // Navigate to project page
      router.push(`/${projectId}`);
    } else {
      // Check for legacy panoramas
      checkForPanoramas();
    }
  };

  const handleProjectCreate = () => {
    // Refresh projects list after creation
    loadProjects();
  };

  const deleteProject = async (projectId: string) => {
    try {
      setDeleting(projectId);
      const response = await fetch(
        `/api/projects?projectId=${encodeURIComponent(projectId)}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete project");
      }

      setProjects((prev) => prev.filter((p) => p.id !== projectId));
      setHasProjects(projects.filter((p) => p.id !== projectId).length > 0);

      // If we deleted the current project, stay on home page
      if (selectedProject === projectId) {
        setSelectedProject("");
      }
    } catch (err: any) {
      console.error("Failed to delete project:", err);
      alert(err.message || "Failed to delete project");
    } finally {
      setDeleting(null);
    }
  };

  useEffect(() => {
    const initializeApp = async () => {
      setLoading(true);
      await loadProjects();

      // Check for legacy panoramas if no projects exist
      await checkForPanoramas();
      setLoading(false);
    };

    initializeApp();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      checkForPanoramas(selectedProject);
    }
  }, [selectedProject]);

  // Show loading while checking authentication or loading data
  if (authLoading || loading) {
    const headerText = authLoading
      ? "Checking Authentication"
      : "Loading Projects";
    return <PageLoadingComponent headerText={headerText} />;
  }

  // If not authenticated after loading is complete, the AuthContext will handle redirecting
  // We don't show access denied here to prevent flash, let AuthContext handle the redirect
  if (!isAuthenticated) {
    return <PageLoadingComponent headerText="Redirecting to Login" />;
  }

  // Show content based on state
  return (
    <div>
      {hasPanoramas && selectedProject ? (
        // Show panorama viewer for selected project
        <PanoramaViewer projectId={selectedProject} />
      ) : (
        // Show welcome screen
        <div className={styles.container}>
          <Navbar />

          <div
            className={`${styles.content} ${hasProjects && showProjects ? styles.hasProjects : ""}`}
          >
            {/* Hero Section */}
            <div className={styles.heroSection}>
              <h1 className={styles.title}>
                Welcome to Advanced <br /> Panorama Viewer
              </h1>
              <p className={styles.subtitle}>
                Experience immersive 360° panoramic tours of your spaces
              </p>
              <p className={styles.description}>
                {hasProjects
                  ? `You have ${projects.length} project${projects.length !== 1 ? "s" : ""}. Select one to get started or create a new one.`
                  : "Get started by creating your first project and uploading panoramic images."}
              </p>
            </div>

            {/* Action Buttons */}
            <div className={styles.actionButtons}>
              <Link href="/upload" className={styles.uploadButton}>
                <div className={styles.buttonTitle}>
                  {hasProjects ? "New Project" : "Create Project"}
                </div>
              </Link>

              {hasProjects && (
                <button
                  className={styles.projectsIndicator}
                  onClick={() => {
                    const newShowProjects = !showProjects;
                    setShowProjects(newShowProjects);

                    // Scroll to projects section when showing projects
                    if (newShowProjects) {
                      setTimeout(() => {
                        const projectsSection = document.querySelector(
                          `.${styles.projectsSection}`
                        );
                        if (projectsSection) {
                          projectsSection.scrollIntoView({
                            behavior: "smooth",
                            block: "start",
                          });
                        }
                      }, 100); // Small delay to ensure the section is rendered
                    }
                  }}
                >
                  <div className={styles.indicatorIcon}>
                    <span className={styles.projectCount}>
                      {projects.length}
                    </span>
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      style={{
                        transform: showProjects
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                      }}
                    >
                      <path
                        d="M19 9L12 16L5 9"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div className={styles.buttonTitle}>
                    {showProjects ? "Hide Projects" : "View Projects"}
                  </div>
                </button>
              )}
            </div>

            {/* Projects Section */}
            {hasProjects && showProjects && (
              <div className={styles.projectsSection}>
                <div className={styles.projectsHeader}>
                  <h2 className={styles.projectsTitle}>
                    You have{" "}
                    {filteredProjects.length === projects.length
                      ? `${projects.length} project${projects.length !== 1 ? "s" : ""}`
                      : `${filteredProjects.length} of ${projects.length} project${projects.length !== 1 ? "s" : ""}`}
                  </h2>
                  <p className={styles.projectsSubtitle}>
                    Click on any project to start exploring
                  </p>

                  {/* Search and Filter Controls */}
                  <div className={styles.searchFilterContainer}>
                    {/* Search Bar */}
                    <div className={styles.searchContainer}>
                      <div className={styles.searchInputWrapper}>
                        <svg
                          className={styles.searchIcon}
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <input
                          type="text"
                          placeholder="Search projects..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className={styles.searchInput}
                        />
                        {searchTerm && (
                          <button
                            onClick={() => setSearchTerm("")}
                            className={styles.clearSearchButton}
                          >
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                            >
                              <path
                                d="M18 6L6 18M6 6L18 18"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Filter Controls */}
                    <div className={styles.filterContainer}>
                      {/* Sort Dropdown */}
                      <div className={styles.filterGroup}>
                        <div className={styles.customDropdown}>
                          <button
                            ref={dropdownButtonRef}
                            className={`${styles.filterSelect} ${styles.dropdownButton}`}
                            onClick={() =>
                              setShowSortDropdown(!showSortDropdown)
                            }
                          >
                            <span>
                              {sortBy
                                ? `${sortBy.charAt(0).toUpperCase() + sortBy.slice(1).replace("At", "")} ${sortOrder === "asc" ? "↑" : "↓"}`
                                : "Sort by"}
                            </span>
                          </button>
                          {showSortDropdown && (
                            <Portal>
                              <div
                                className={styles.dropdownMenu}
                                style={{
                                  position: "fixed",
                                  top: dropdownButtonRef.current?.getBoundingClientRect()
                                    .bottom
                                    ? dropdownButtonRef.current.getBoundingClientRect()
                                        .bottom + 4
                                    : 0,
                                  left:
                                    dropdownButtonRef.current?.getBoundingClientRect()
                                      .left || 0,
                                  width:
                                    dropdownButtonRef.current?.getBoundingClientRect()
                                      .width || "auto",
                                  zIndex: 999999,
                                }}
                              >
                                {["name", "size", "createdAt", "updatedAt"].map(
                                  (field) => (
                                    <button
                                      key={field}
                                      onClick={() => {
                                        if (sortBy === field) {
                                          setSortOrder(
                                            sortOrder === "asc" ? "desc" : "asc"
                                          );
                                        } else {
                                          setSortBy(field);
                                          setSortOrder("asc");
                                        }
                                        setShowSortDropdown(false);
                                      }}
                                      className={styles.dropdownItem}
                                    >
                                      {field.charAt(0).toUpperCase() +
                                        field.slice(1).replace("At", "")}
                                      {sortBy === field &&
                                        (sortOrder === "asc" ? " ↑" : " ↓")}
                                    </button>
                                  )
                                )}
                              </div>
                            </Portal>
                          )}
                        </div>
                      </div>

                      {/* Grid Column Selector */}
                      {shouldShowGridSelector && (
                        <div className={styles.filterGroup}>
                          <div className={styles.customDropdown}>
                            <button
                              ref={gridDropdownButtonRef}
                              className={`${styles.filterSelect} ${styles.dropdownButton}`}
                              onClick={() =>
                                setShowGridDropdown(!showGridDropdown)
                              }
                            >
                              <span>
                                {gridColumns === 1
                                  ? "1 Column"
                                  : gridColumns === 2
                                    ? "2 Columns"
                                    : "3 Columns"}
                              </span>
                            </button>
                            {showGridDropdown && (
                              <Portal>
                                <div
                                  className={styles.dropdownMenu}
                                  style={{
                                    position: "fixed",
                                    top: gridDropdownButtonRef.current?.getBoundingClientRect()
                                      .bottom
                                      ? gridDropdownButtonRef.current.getBoundingClientRect()
                                          .bottom + 4
                                      : 0,
                                    left:
                                      gridDropdownButtonRef.current?.getBoundingClientRect()
                                        .left || 0,
                                    width:
                                      gridDropdownButtonRef.current?.getBoundingClientRect()
                                        .width || "auto",
                                    zIndex: 999999,
                                  }}
                                >
                                  {getAvailableGridOptions.map((option) => (
                                    <button
                                      key={option}
                                      onClick={() => {
                                        setGridColumns(option);
                                        setShowGridDropdown(false);
                                      }}
                                      className={`${styles.dropdownItem} ${
                                        gridColumns === option
                                          ? styles.activeDropdownItem
                                          : ""
                                      }`}
                                    >
                                      {option === 1
                                        ? "1 Column"
                                        : option === 2
                                          ? "2 Columns"
                                          : "3 Columns"}
                                    </button>
                                  ))}
                                </div>
                              </Portal>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Clear Button */}
                      <button
                        onClick={() => {
                          setSearchTerm("");
                          setSortBy("");
                          setSortOrder("asc");
                        }}
                        className={styles.clearFiltersButton}
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                </div>
                <div
                  className={`${styles.projectList} ${styles[`gridCols${gridColumns}`]}`}
                >
                  {filteredProjects.length === 0 ? (
                    <div className={styles.noProjectsMessage}>
                      {searchTerm ? (
                        <>
                          <div className={styles.noProjectsIcon}></div>
                          <h3>No projects found</h3>
                          <p>Try adjusting your search or filter criteria</p>
                          <button
                            onClick={() => {
                              setSearchTerm("");
                              setSortBy("name");
                              setSortOrder("asc");
                            }}
                            className={styles.clearFiltersButton}
                          >
                            Clear all filters
                          </button>
                        </>
                      ) : (
                        <>
                          <h3>No projects yet</h3>
                          <p>
                            Upload your first panorama project to get started
                          </p>
                        </>
                      )}
                    </div>
                  ) : (
                    filteredProjects.map((project) => (
                      <div
                        key={project.id}
                        className={styles.projectCard}
                        onClick={() => handleProjectSelect(project.id)}
                      >
                        <div className={styles.projectThumbnail}>
                          {project.firstSceneId ? (
                            <img
                              src={FileURLManager.getPanoramaImageURL(
                                project.id,
                                `${project.firstSceneId}-pano.jpg`
                              )}
                              alt={`${project.name} thumbnail`}
                              className={styles.projectThumbnailImage}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = "none";
                                const placeholder =
                                  target.nextElementSibling as HTMLElement;
                                if (placeholder)
                                  placeholder.style.display = "flex";
                              }}
                            />
                          ) : null}
                          <div
                            className={styles.projectThumbnailPlaceholder}
                            style={{
                              display: project.firstSceneId ? "none" : "flex",
                            }}
                          ></div>
                        </div>
                        <div className={styles.projectContent}>
                          <div className={styles.projectCardHeader}>
                            <div className={styles.projectHeaderLeft}>
                              <div>
                                <h3 className={styles.projectName}>
                                  {project.name}
                                </h3>
                                <div className={styles.projectInfo}>
                                  Updated{" "}
                                  {new Date(
                                    project.updatedAt
                                  ).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                            <div className={styles.projectActions}>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.location.href = `/upload?project=${encodeURIComponent(project.id)}`;
                                }}
                                className={styles.editButton}
                                title="Edit project"
                              >
                                <svg
                                  width="12"
                                  height="12"
                                  viewBox="0 0 24 24"
                                  fill="none"
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
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setProjectToDelete(project);
                                  setShowDeleteConfirm(true);
                                }}
                                disabled={deleting === project.id}
                                className={`${styles.deleteButton} ${
                                  deleting === project.id ? styles.deleting : ""
                                }`}
                                title="Delete project"
                              >
                                {deleting === project.id ? (
                                  <div className={styles.deletingSpinner}>
                                    ...
                                  </div>
                                ) : (
                                  <svg
                                    width="12"
                                    height="12"
                                    viewBox="0 0 24 24"
                                    fill="none"
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
                                )}
                              </button>
                            </div>
                          </div>
                          <div className={styles.projectMeta}></div>
                          <div className={styles.projectStats}>
                            <div className={styles.statItem}>
                              <span className={styles.statValue}>
                                {project.sceneCount}
                              </span>
                              <span className={styles.statLabel}>Scenes</span>
                            </div>
                            <div className={styles.statItem}>
                              <span className={styles.statValue}>
                                {project.poiCount}
                              </span>
                              <span className={styles.statLabel}>POIs</span>
                            </div>
                            <div className={styles.statItem}>
                              <span className={styles.statValue}>
                                {project.floorCount || 1}
                              </span>
                              <span className={styles.statLabel}>Floors</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={showDeleteConfirm}
        title="Delete Project"
        message={`Are you sure you want to delete project "${projectToDelete?.name || projectToDelete?.id}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={() => {
          if (projectToDelete) {
            deleteProject(projectToDelete.id);
          }
          setShowDeleteConfirm(false);
          setProjectToDelete(null);
        }}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setProjectToDelete(null);
        }}
      />
    </div>
  );
}
