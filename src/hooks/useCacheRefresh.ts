import { useEffect, useCallback } from 'react';
import { CacheManager } from '@/utils/cacheManager';

/**
 * Hook for handling cache refresh events and forcing image reloads
 */
export function useCacheRefresh(projectId?: string) {
  const refreshImages = useCallback(() => {
    if (!projectId) return;
    
    // Force refresh all images with the project's class or data attribute
    const images = document.querySelectorAll(`img[data-project-id="${projectId}"]`);
    images.forEach((img) => {
      const htmlImg = img as HTMLImageElement;
      const originalSrc = htmlImg.src;
      
      // Remove existing cache-busting parameter and add new one
      const url = new URL(originalSrc);
      url.searchParams.set('t', Date.now().toString());
      
      // Force reload by setting src to empty then back to new URL
      htmlImg.src = '';
      setTimeout(() => {
        htmlImg.src = url.toString();
      }, 10);
    });
    
    // Also refresh any canvas or WebGL textures if needed
    window.dispatchEvent(new CustomEvent('force-texture-reload', {
      detail: { projectId }
    }));
  }, [projectId]);

  const handleCacheRefresh = useCallback((event: CustomEvent) => {
    const { projectId: eventProjectId } = event.detail;
    if (!projectId || eventProjectId === projectId) {
      refreshImages();
    }
  }, [projectId, refreshImages]);

  useEffect(() => {
    // Listen for cache refresh events
    window.addEventListener('panorama-cache-refresh', handleCacheRefresh as EventListener);
    
    return () => {
      window.removeEventListener('panorama-cache-refresh', handleCacheRefresh as EventListener);
    };
  }, [handleCacheRefresh]);

  return {
    refreshImages,
    forceRefreshProject: useCallback(() => {
      if (projectId) {
        const cacheManager = CacheManager.getInstance();
        cacheManager.forceRefreshProject(projectId);
      }
    }, [projectId])
  };
}

/**
 * Hook for listening to upload completion and triggering cache refresh
 */
export function useUploadCacheRefresh() {
  const handleUploadComplete = useCallback((projectId: string) => {
    // Trigger cache refresh after a short delay to ensure server-side cache invalidation is complete
    setTimeout(() => {
      const cacheManager = CacheManager.getInstance();
      cacheManager.forceRefreshProject(projectId);
    }, 500);
  }, []);

  return { handleUploadComplete };
}