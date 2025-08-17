import { CacheManager } from './cacheManager';

// Centralized file URL management with cache-busting support
export class FileURLManager {
  static getBaseURL(): string {
    // Always use the API route for file serving
    // The custom protocol approach has compatibility issues
    return "/api/files";
  }

  static getProjectFileURL(projectId: string, relativePath: string, cacheBust: boolean = false): string {
    const baseURL = this.getBaseURL();
    let url = `${baseURL}/${projectId}/${relativePath}`;
    
    if (cacheBust) {
      const cacheManager = CacheManager.getInstance();
      const timestamp = cacheManager.getProjectTimestamp(projectId);
      url += `?t=${timestamp}`;
    }
    
    return url;
  }

  static getPanoramaImageURL(projectId: string, imageName: string, cacheBust: boolean = true): string {
    const baseURL = this.getBaseURL();
    let url = `${baseURL}/${projectId}/images/${imageName}`;
    
    if (cacheBust) {
      const cacheManager = CacheManager.getInstance();
      const timestamp = cacheManager.getImageTimestamp(projectId, imageName);
      url += `?t=${timestamp}`;
    }
    
    return url;
  }

  static getConfigFileURL(projectId: string, filename: string, cacheBust: boolean = true): string {
    return this.getProjectFileURL(projectId, `config/${filename}`, cacheBust);
  }

  static getPOIFileURL(
    projectId: string,
    poiId: string,
    filename: string,
    cacheBust: boolean = false
  ): string {
    return this.getProjectFileURL(projectId, `poi/${poiId}/${filename}`, cacheBust);
  }

  /**
   * Force refresh cache for a project's images
   */
  static refreshProjectCache(projectId: string): void {
    const cacheManager = CacheManager.getInstance();
    cacheManager.forceRefreshProject(projectId);
  }

  /**
   * Update cache for a specific image
   */
  static updateImageCache(projectId: string, imageName: string): void {
    const cacheManager = CacheManager.getInstance();
    cacheManager.updateImageCache(projectId, imageName);
  }
}

// Helper function to check if running in Electron
export const isElectron = (): boolean => {
  return (
    typeof window !== "undefined" &&
    (window as any).electronAPI?.isElectron === true
  );
};

// Helper function to get projects path
export const getProjectsPath = async (): Promise<string> => {
  if (isElectron() && (window as any).electronAPI?.getProjectsPath) {
    return await (window as any).electronAPI.getProjectsPath();
  }
  return "/projects"; // Fallback for web
};

// Helper function to get user data path
export const getUserDataPath = async (): Promise<string> => {
  if (isElectron() && (window as any).electronAPI?.getUserDataPath) {
    return await (window as any).electronAPI.getUserDataPath();
  }
  return "/userData"; // Fallback for web
};
