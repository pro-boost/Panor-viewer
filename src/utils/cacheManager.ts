// Cache management utility for handling image cache-busting

interface ProjectCacheInfo {
  lastUpdated: number;
  imageTimestamps: Record<string, number>;
}

class CacheManager {
  private static instance: CacheManager;
  private cacheData: Map<string, ProjectCacheInfo> = new Map();
  private storageKey = 'panorama_cache_timestamps';

  private constructor() {
    this.loadFromStorage();
  }

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  private loadFromStorage(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        this.cacheData = new Map(Object.entries(data));
      }
    } catch (error) {
      console.warn('Failed to load cache data from storage:', error);
    }
  }

  private saveToStorage(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const data = Object.fromEntries(this.cacheData);
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save cache data to storage:', error);
    }
  }

  /**
   * Get cache-busting timestamp for a project
   */
  getProjectTimestamp(projectId: string): number {
    const cacheInfo = this.cacheData.get(projectId);
    return cacheInfo?.lastUpdated || Date.now();
  }

  /**
   * Get cache-busting timestamp for a specific image
   */
  getImageTimestamp(projectId: string, imageName: string): number {
    const cacheInfo = this.cacheData.get(projectId);
    return cacheInfo?.imageTimestamps[imageName] || cacheInfo?.lastUpdated || Date.now();
  }

  /**
   * Update project cache timestamp (called when project is updated)
   */
  updateProjectCache(projectId: string): void {
    const timestamp = Date.now();
    const existingInfo = this.cacheData.get(projectId);
    
    this.cacheData.set(projectId, {
      lastUpdated: timestamp,
      imageTimestamps: existingInfo?.imageTimestamps || {}
    });
    
    this.saveToStorage();
  }

  /**
   * Update specific image cache timestamp
   */
  updateImageCache(projectId: string, imageName: string): void {
    const timestamp = Date.now();
    const existingInfo = this.cacheData.get(projectId) || {
      lastUpdated: timestamp,
      imageTimestamps: {}
    };
    
    existingInfo.imageTimestamps[imageName] = timestamp;
    existingInfo.lastUpdated = timestamp;
    
    this.cacheData.set(projectId, existingInfo);
    this.saveToStorage();
  }

  /**
   * Clear all cache data for a project
   */
  clearProjectCache(projectId: string): void {
    this.cacheData.delete(projectId);
    this.saveToStorage();
  }

  /**
   * Clear all cache data
   */
  clearAllCache(): void {
    this.cacheData.clear();
    this.saveToStorage();
  }

  /**
   * Force refresh all images for a project by updating timestamps
   */
  forceRefreshProject(projectId: string): void {
    this.updateProjectCache(projectId);
    
    // Also trigger a custom event that components can listen to
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('panorama-cache-refresh', {
        detail: { projectId }
      }));
    }
  }
}

export default CacheManager;
export { CacheManager };