import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

interface ExistingFiles {
  csv: string | null;
  images: string[];
  poi: string | null;
}

export const useProjectManager = () => {
  const router = useRouter();
  const [projectName, setProjectName] = useState('');
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [existingFiles, setExistingFiles] = useState<ExistingFiles>({
    csv: null,
    images: [],
    poi: null
  });
  const [showExistingFiles, setShowExistingFiles] = useState(false);
  const [referrerUrl, setReferrerUrl] = useState<string>('/');

  // Handle referrer URL for navigation
  useEffect(() => {
    const referrer = document.referrer;
    const urlParams = new URLSearchParams(window.location.search);
    const fromProject = urlParams.get('from');
    const fromScene = urlParams.get('scene');

    if (fromProject && fromScene) {
      setReferrerUrl(`/${fromProject}?scene=${fromScene}`);
    } else if (fromProject) {
      setReferrerUrl(`/${fromProject}`);
    } else if (editingProjectId) {
      setReferrerUrl(`/${editingProjectId}`);
    } else if (referrer && referrer.includes(window.location.origin)) {
      const referrerPath = referrer.replace(window.location.origin, '');
      setReferrerUrl(referrerPath || '/');
    }
  }, [editingProjectId]);

  // Handle project editing mode
  useEffect(() => {
    const projectParam = router.query.project as string;
    if (projectParam && !isEditMode) {
      setIsEditMode(true);
      setEditingProjectId(projectParam);
      setCreatedProjectId(projectParam);

      loadProjectData(projectParam);
    }
  }, [router.query.project, isEditMode]);

  const loadProjectData = async (projectParam: string) => {
    try {
      // Load project info
      const projectResponse = await fetch(
        `/api/projects?projectId=${encodeURIComponent(projectParam)}`
      );
      if (projectResponse.ok) {
        const projectData = await projectResponse.json();
        const project = projectData.projects?.find(
          (p: any) => p.id === projectParam
        );
        if (project) {
          setProjectName(project.name);
        }
      }

      // Load existing files
      const filesResponse = await fetch(
        `/api/projects/${encodeURIComponent(projectParam)}/files`
      );
      if (filesResponse.ok) {
        const filesData = await filesResponse.json();
        const { files } = filesData;

        // Store existing files in state
        setExistingFiles({
          csv: files.csv,
          images: files.images,
          poi: files.poi || null,
        });
      }
    } catch (error) {
      console.error('Failed to load project data:', error);
    }
  };

  const validateProjectName = (name: string): string[] => {
    const errors: string[] = [];
    if (!name.trim()) {
      errors.push('Project name is required');
    } else if (name.length < 3) {
      errors.push('Project name must be at least 3 characters long');
    } else if (name.length > 50) {
      errors.push('Project name must be less than 50 characters');
    } else if (!/^[a-zA-Z0-9\s\-_]+$/.test(name)) {
      errors.push(
        'Project name can only contain letters, numbers, spaces, hyphens, and underscores'
      );
    }
    return errors;
  };

  const createProject = async (): Promise<string> => {
    const projectResponse = await fetch('/api/projects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ projectName: projectName.trim() }),
    });

    if (!projectResponse.ok) {
      const projectError = await projectResponse.json();
      if (projectResponse.status === 409) {
        throw new Error(
          `Project name "${projectName.trim()}" already exists. Please choose a different name or edit the existing project.`
        );
      } else if (projectResponse.status === 400) {
        throw new Error(
          'Invalid project name. Project names can only contain letters, numbers, spaces, hyphens, and underscores.'
        );
      } else {
        throw new Error(projectError.error || 'Failed to create project');
      }
    }

    const projectData = await projectResponse.json();
    const projectId = projectData.project.id;
    setCreatedProjectId(projectId);
    return projectId;
  };

  const updateProjectName = async (projectId: string): Promise<void> => {
    try {
      await fetch('/api/projects', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: projectId,
          projectName: projectName.trim(),
        }),
      });
    } catch (error) {
      console.warn('Failed to update project name:', error);
    }
  };

  const getProjectStatusMessage = (): string => {
    if (!isEditMode) return '';

    const fileInfo = [];
    if (existingFiles.csv) {
      fileInfo.push(`CSV: ${existingFiles.csv}`);
    }
    if (existingFiles.images.length > 0) {
      fileInfo.push(`${existingFiles.images.length} image(s)`);
    }
    if (existingFiles.poi) {
      fileInfo.push(`POI: ${existingFiles.poi}`);
    }

    const projectDisplayName = projectName || editingProjectId;

    if (fileInfo.length > 0) {
      return `Editing project: ${projectDisplayName}. Current files: ${fileInfo.join(', ')}. Upload new files to update this project.`;
    } else {
      return `Editing project: ${projectDisplayName}. No existing files found. Upload files to add content to this project.`;
    }
  };

  const navigateBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      const targetUrl = editingProjectId ? `/${editingProjectId}` : referrerUrl;
      router.push(targetUrl);
    }
  };

  const initializeFromUrl = () => {
    const referrer = document.referrer;
    const urlParams = new URLSearchParams(window.location.search);
    const fromProject = urlParams.get('from');
    const fromScene = urlParams.get('scene');

    if (fromProject && fromScene) {
      setReferrerUrl(`/${fromProject}?scene=${fromScene}`);
    } else if (fromProject) {
      setReferrerUrl(`/${fromProject}`);
    } else if (editingProjectId) {
      setReferrerUrl(`/${editingProjectId}`);
    } else if (referrer && referrer.includes(window.location.origin)) {
      const referrerPath = referrer.replace(window.location.origin, '');
      setReferrerUrl(referrerPath || '/');
    }
  };

  return {
    projectName,
    setProjectName,
    createdProjectId,
    setCreatedProjectId,
    editingProjectId,
    setEditingProjectId,
    isEditMode,
    setIsEditMode,
    existingFiles,
    setExistingFiles,
    showExistingFiles,
    setShowExistingFiles,
    referrerUrl,
    setReferrerUrl,
    validateProjectName,
    createProject,
    updateProjectName,
    getProjectStatusMessage,
    navigateBack,
    loadProjectData,
    initializeFromUrl
  };
};