"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { ReactElement, useState, useEffect } from "react";
import { useRouter } from "next/router";
import styles from "@/styles/Welcome.module.css";
import { FileURLManager } from "@/utils/fileHelpers";
import Navbar from "@/components/ui/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import PageLoadingComponent from "@/components/ui/PageLoadingComponent";

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
                  <h2 className={styles.projectsTitle}>Your Projects</h2>
                  <p className={styles.projectsSubtitle}>
                    Click on any project to start exploring
                  </p>
                </div>
                <div className={styles.projectList}>
                  {projects.map((project) => (
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
                        >
                          🏢
                        </div>
                      </div>
                      <div className={styles.projectContent}>
                        <div className={styles.projectCardHeader}>
                          <div className={styles.projectHeaderLeft}>
                            <div className={styles.projectIcon}>🏢</div>
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
                  ))}
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
