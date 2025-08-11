"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { ReactElement, useState, useEffect } from "react";
import { useRouter } from "next/router";
import styles from "@/styles/Welcome.module.css";
import { FileURLManager } from "@/utils/fileHelpers";
import Logo from "@/components/ui/Logo";
import LogoutButton from "@/components/ui/LogoutButton";
import { useAuth } from "@/contexts/AuthContext";
// ProjectManager moved to PanoramaViewer component

// Dynamically import PanoramaViewer to avoid SSR issues with Marzipano
const PanoramaViewer = dynamic(
  () => import("@/components/viewer/PanoramaViewer"),
  {
    ssr: false,
    loading: (): ReactElement => (
      <div id="loading">
        <div className="loader"></div>
        <div>Loading panoramas...</div>
      </div>
    ),
  },
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
          },
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
        Math.min(3, configData.scenes.length),
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
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <h1 className={styles.title}>Loading...</h1>
          <p className={styles.description}>
            {authLoading
              ? "Checking authentication..."
              : "Checking for projects and panoramas..."}
          </p>
        </div>
      </div>
    );
  }

  // If not authenticated after loading is complete, the AuthContext will handle redirecting
  // We don't show access denied here to prevent flash, let AuthContext handle the redirect
  if (!isAuthenticated) {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.loadingSpinner}></div>
          <p className={styles.description}>Redirecting to login...</p>
        </div>
      </div>
    );
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
          {/* Logo */}
          <Logo variant="default" position="absolute" />

          {/* User Menu */}
          <div className={styles.userMenu}>
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

          <div
            className={`${styles.content} ${hasProjects && showProjects ? styles.hasProjects : ""}`}
          >
            {/* Hero Section */}
            <div className={styles.heroSection}>
              <h1 className={styles.title}>
                Welcome to Advanced Panorama Viewer
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
                  onClick={() => setShowProjects(!showProjects)}
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
                              `${project.firstSceneId}-pano.jpg`,
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
                          <div className={styles.projectIcon}>🏢</div>
                          <h3 className={styles.projectName}>{project.name}</h3>
                        </div>
                        <div className={styles.projectMeta}>
                          <div className={styles.projectInfo}>
                            Updated{" "}
                            {new Date(project.updatedAt).toLocaleDateString()}
                          </div>
                        </div>
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
    </div>
  );
}
