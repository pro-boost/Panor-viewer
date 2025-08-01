'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from '../ControlPanel.module.css';
import projectStyles from '@/styles/ProjectsPanel.module.css';
import { useProjectsManager } from '../../../hooks/useProjectsManager';
import { useNavigation } from '../../../hooks/useNavigation';
import ConfirmationModal from '../ConfirmationModal';

interface Project {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  sceneCount: number;
  hasConfig: boolean;
}

interface ProjectsPanelProps {
  onPanelClose: () => void;
}

export function ProjectsPanel({ onPanelClose }: ProjectsPanelProps) {
  const router = useRouter();
  const navigation = useNavigation();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const {
    projects,
    projectsLoading,
    projectsError,
    deleting,
    isNavigating,
    loadProjects,
    deleteProject,
    handleProjectSelect,
  } = useProjectsManager();

  const currentProject = router.query.projectId as string;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className={styles.expandedPanel}>
      <div className={styles.header}>
        <div className={styles.icon}>
          <svg
            width='16'
            height='16'
            viewBox='0 0 24 24'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path
              d='M22 19C22 19.6 21.6 20 21 20H3C2.4 20 2 19.6 2 19V5C2 4.4 2.4 4 3 4H7L9 6H21C21.6 6 22 6.4 22 7V19Z'
              stroke='white'
              strokeWidth='2'
              fill='none'
            />
          </svg>
        </div>
        <span className={styles.text}>Projects</span>
      </div>
      <div className={styles.projectsContent}>
        {/* Create Project Button */}
        <button
          className={`${styles.actionButton} ${projectStyles.createButton}`}
          onClick={() => {
            console.log('🔄 Create New Project clicked');
            onPanelClose();
            console.log('🔄 Panel closed, navigating to upload...');
            // Force full page navigation to ensure immediate rendering
            window.location.href = '/upload';
          }}
        >
          + Create New Project
        </button>

        {/* Error Display */}
        {projectsError && (
          <div className={projectStyles.errorContainer}>
            {projectsError}
            <button
              onClick={loadProjects}
              className={projectStyles.retryButton}
            >
              Retry
            </button>
          </div>
        )}

        {/* Projects List */}
        {projectsLoading ? (
          <div className={projectStyles.loadingContainer}>
            Loading projects...
          </div>
        ) : projects.length === 0 ? (
          <div className={projectStyles.emptyContainer}>No projects yet</div>
        ) : (
          <div className={projectStyles.projectsList}>
            {projects.map((project: Project) => (
              <div
                key={project.id}
                className={`${projectStyles.projectItem} ${
                  currentProject === project.id ? projectStyles.current : ''
                } ${isNavigating ? projectStyles.navigating : ''}`}
                onClick={e => {
                  if (isNavigating) {
                    e.preventDefault();
                    e.stopPropagation();
                    return;
                  }
                  handleProjectSelect(project.id, onPanelClose);
                }}
              >
                <div className={projectStyles.projectInfo}>
                  <div className={projectStyles.projectName}>
                    {project.name}
                  </div>
                  <div className={projectStyles.projectMeta}>
                    {formatDate(project.updatedAt)} • {project.sceneCount}{' '}
                    scenes
                  </div>
                </div>
                <div className={projectStyles.projectActions}>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      onPanelClose();
                      // Force full page navigation to ensure immediate rendering
                      window.location.href = `/upload?project=${encodeURIComponent(project.id)}`;
                    }}
                    className={projectStyles.editButton}
                    title='Edit project'
                  >
                    <svg width='12' height='12' viewBox='0 0 24 24' fill='none'>
                      <path
                        d='M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13'
                        stroke='currentColor'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      />
                      <path
                        d='M18.5 2.50023C18.8978 2.1024 19.4374 1.87891 20 1.87891C20.5626 1.87891 21.1022 2.1024 21.5 2.50023C21.8978 2.89805 22.1213 3.43762 22.1213 4.00023C22.1213 4.56284 21.8978 5.1024 21.5 5.50023L12 15.0002L8 16.0002L9 12.0002L18.5 2.50023Z'
                        stroke='currentColor'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      />
                    </svg>
                  </button>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      setProjectToDelete(project);
                      setShowDeleteConfirm(true);
                    }}
                    disabled={deleting === project.id}
                    className={`${projectStyles.deleteButton} ${
                      deleting === project.id ? projectStyles.deleting : ''
                    }`}
                    title='Delete project'
                  >
                    {deleting === project.id ? (
                      <div className={projectStyles.deletingSpinner}>...</div>
                    ) : (
                      <svg
                        width='12'
                        height='12'
                        viewBox='0 0 24 24'
                        fill='none'
                      >
                        <path
                          d='M3 6H5H21'
                          stroke='currentColor'
                          strokeWidth='2'
                          strokeLinecap='round'
                          strokeLinejoin='round'
                        />
                        <path
                          d='M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z'
                          stroke='currentColor'
                          strokeWidth='2'
                          strokeLinecap='round'
                          strokeLinejoin='round'
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={showDeleteConfirm}
        title='Delete Project'
        message={`Are you sure you want to delete project "${projectToDelete?.name || projectToDelete?.id}"? This action cannot be undone.`}
        confirmText='Delete'
        cancelText='Cancel'
        variant='danger'
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
