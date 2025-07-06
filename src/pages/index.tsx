'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ReactElement, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from '@/styles/Welcome.module.css';
// ProjectManager moved to PanoramaViewer component

// Dynamically import PanoramaViewer to avoid SSR issues with Marzipano
const PanoramaViewer = dynamic(() => import('@/components/PanoramaViewer'), {
  ssr: false,
  loading: (): ReactElement => (
    <div id='loading'>
      <div className='loader'></div>
      <div>Loading panoramas...</div>
    </div>
  ),
});

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
}

export default function Home(): ReactElement {
  const router = useRouter();
  const [hasPanoramas, setHasPanoramas] = useState<boolean>(false);
  const [hasProjects, setHasProjects] = useState<boolean>(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [config, setConfig] = useState<ConfigData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects);
        setHasProjects(data.projects.length > 0);

        // Auto-select the most recently updated project with config
        const projectWithConfig = data.projects.find(
          (p: Project) => p.hasConfig
        );
        if (projectWithConfig && !selectedProject) {
          setSelectedProject(projectWithConfig.id);
        }
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const checkForPanoramas = async (projectId?: string) => {
    try {
      let configResponse;
      let imagePathPrefix = '';

      if (projectId) {
        // Check project-specific config
        configResponse = await fetch(
          `/api/projects/${encodeURIComponent(projectId)}/config`,
          {
            cache: 'no-store',
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
            method: 'HEAD',
            cache: 'no-store',
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
      console.error('Error checking for panoramas:', error);
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

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.icon}>⏳</div>
          <h1 className={styles.title}>Loading...</h1>
          <p className={styles.description}>
            Checking for projects and panoramas...
          </p>
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
          <div className={styles.logoContainer}>
            <img
              src='/assets/svg/primezone-logo.svg'
              alt='PrimeZone Logo'
              className={styles.logo}
            />
          </div>

          <div className={styles.content}>
            <div className={styles.icon}>🏢</div>

            <h1 className={styles.title}>Welcome to PrimeZone</h1>

            <p className={styles.description}>
              Experience immersive 360° panoramic tours of your spaces.
              <br />
              {hasProjects
                ? 'Select a project from the sidebar or create a new one.'
                : 'Get started by creating your first project.'}
            </p>

            <Link href='/upload' className={styles.uploadButton}>
              <span className={styles.uploadIcon}>📁</span>
              {hasProjects ? 'Upload to New Project' : 'Create First Project'}
            </Link>

            <div className={styles.supportInfo}>
              Supported formats: JPG, PNG • CSV file with poses required
            </div>

            {hasProjects && (
              <div style={{ marginTop: '24px', textAlign: 'center' }}>
                <p
                  style={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '14px',
                  }}
                >
                  You have {projects.length} project
                  {projects.length !== 1 ? 's' : ''}. Select a project from the
                  sidebar to view panoramas.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
