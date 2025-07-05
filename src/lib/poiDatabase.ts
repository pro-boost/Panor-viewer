import { InfoHotspot, POIFile, POIWithFiles } from '@/types/scenes';

class POIDatabase {
  private dbName = 'POIDatabase';
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create POIs object store
        if (!db.objectStoreNames.contains('pois')) {
          const poisStore = db.createObjectStore('pois', { keyPath: 'id' });
          poisStore.createIndex('sceneId', 'sceneId', { unique: false });
          poisStore.createIndex('createdAt', 'createdAt', { unique: false });
        }

        // Create files object store
        if (!db.objectStoreNames.contains('files')) {
          const filesStore = db.createObjectStore('files', { keyPath: 'id' });
          filesStore.createIndex('poiId', 'poiId', { unique: false });
        }
      };
    });
  }

  private async ensureDB(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.init();
    }
    if (!this.db) {
      throw new Error('Failed to initialize database');
    }
    return this.db;
  }

  async savePOI(poi: InfoHotspot, files?: File[]): Promise<void> {
    const db = await this.ensureDB();
    const transaction = db.transaction(['pois', 'files'], 'readwrite');
    const poisStore = transaction.objectStore('pois');
    const filesStore = transaction.objectStore('files');

    // Save POI
    await new Promise<void>((resolve, reject) => {
      const request = poisStore.put(poi);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    // Save files if provided
    if (files && files.length > 0) {
      for (const file of files) {
        const poiFile: POIFile = {
          id: `${poi.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          poiId: poi.id,
          name: file.name,
          type: file.type,
          size: file.size,
          data: file,
          createdAt: new Date(),
        };

        await new Promise<void>((resolve, reject) => {
          const request = filesStore.put(poiFile);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
      }
    }
  }

  async getPOIsForScene(sceneId: string): Promise<POIWithFiles[]> {
    const db = await this.ensureDB();
    const transaction = db.transaction(['pois', 'files'], 'readonly');
    const poisStore = transaction.objectStore('pois');
    const filesStore = transaction.objectStore('files');

    // Get POIs for scene
    const pois = await new Promise<InfoHotspot[]>((resolve, reject) => {
      const request = poisStore.index('sceneId').getAll(sceneId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    // Get files for each POI and create blob URLs
    const poisWithFiles: POIWithFiles[] = [];
    for (const poi of pois) {
      const files = await new Promise<POIFile[]>((resolve, reject) => {
        const request = filesStore.index('poiId').getAll(poi.id);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      const imageUrls: string[] = [];
      const fileObjects: File[] = [];

      for (const file of files) {
        // Create File object from stored blob
        const fileObj = new File([file.data], file.name, { type: file.type });
        fileObjects.push(fileObj);

        // Create blob URL for images
        if (file.type.startsWith('image/')) {
          const blobUrl = URL.createObjectURL(file.data);
          imageUrls.push(blobUrl);
        }
      }

      poisWithFiles.push({
        ...poi,
        files: fileObjects,
        imageUrls,
      });
    }

    return poisWithFiles;
  }

  async updatePOI(poi: InfoHotspot, newFiles?: File[]): Promise<void> {
    const db = await this.ensureDB();
    const transaction = db.transaction(['pois', 'files'], 'readwrite');
    const poisStore = transaction.objectStore('pois');
    const filesStore = transaction.objectStore('files');

    // Update POI with new timestamp
    const updatedPOI = { ...poi, updatedAt: new Date() };
    await new Promise<void>((resolve, reject) => {
      const request = poisStore.put(updatedPOI);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    // Add new files if provided
    if (newFiles && newFiles.length > 0) {
      for (const file of newFiles) {
        const poiFile: POIFile = {
          id: `${poi.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          poiId: poi.id,
          name: file.name,
          type: file.type,
          size: file.size,
          data: file,
          createdAt: new Date(),
        };

        await new Promise<void>((resolve, reject) => {
          const request = filesStore.put(poiFile);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
      }
    }
  }

  async deletePOI(poiId: string): Promise<void> {
    const db = await this.ensureDB();
    const transaction = db.transaction(['pois', 'files'], 'readwrite');
    const poisStore = transaction.objectStore('pois');
    const filesStore = transaction.objectStore('files');

    // Delete POI
    await new Promise<void>((resolve, reject) => {
      const request = poisStore.delete(poiId);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    // Delete associated files
    const files = await new Promise<POIFile[]>((resolve, reject) => {
      const request = filesStore.index('poiId').getAll(poiId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    for (const file of files) {
      await new Promise<void>((resolve, reject) => {
        const request = filesStore.delete(file.id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }
  }

  async deleteFile(fileId: string): Promise<void> {
    const db = await this.ensureDB();
    const transaction = db.transaction(['files'], 'readwrite');
    const filesStore = transaction.objectStore('files');

    await new Promise<void>((resolve, reject) => {
      const request = filesStore.delete(fileId);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async exportData(): Promise<Blob> {
    const db = await this.ensureDB();
    const transaction = db.transaction(['pois', 'files'], 'readonly');
    const poisStore = transaction.objectStore('pois');
    const filesStore = transaction.objectStore('files');

    // Get all POIs
    const pois = await new Promise<InfoHotspot[]>((resolve, reject) => {
      const request = poisStore.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    // Get all files
    const files = await new Promise<POIFile[]>((resolve, reject) => {
      const request = filesStore.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    // Create export data
    const exportData = {
      pois,
      files: files.map(file => ({
        ...file,
        data: null, // Will be handled separately
      })),
      exportedAt: new Date().toISOString(),
    };

    // For now, return JSON blob (in a real implementation, you'd create a zip file)
    return new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
  }

  async importData(jsonData: string): Promise<void> {
    const data = JSON.parse(jsonData);
    const db = await this.ensureDB();
    const transaction = db.transaction(['pois', 'files'], 'readwrite');
    const poisStore = transaction.objectStore('pois');
    const filesStore = transaction.objectStore('files');

    // Import POIs
    for (const poi of data.pois) {
      await new Promise<void>((resolve, reject) => {
        const request = poisStore.put(poi);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }

    // Import files (if any)
    if (data.files) {
      for (const file of data.files) {
        await new Promise<void>((resolve, reject) => {
          const request = filesStore.put(file);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
      }
    }
  }

  async getAllPOIs(): Promise<InfoHotspot[]> {
    const db = await this.ensureDB();
    const transaction = db.transaction(['pois'], 'readonly');
    const poisStore = transaction.objectStore('pois');

    return new Promise<InfoHotspot[]>((resolve, reject) => {
      const request = poisStore.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getFilesForPOI(poiId: string): Promise<POIFile[]> {
    const db = await this.ensureDB();
    const transaction = db.transaction(['files'], 'readonly');
    const filesStore = transaction.objectStore('files');

    return new Promise<POIFile[]>((resolve, reject) => {
      const request = filesStore.index('poiId').getAll(poiId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Clean up blob URLs to prevent memory leaks
  static cleanupBlobUrls(urls: string[]): void {
    urls.forEach(url => {
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    });
  }
}

// Export singleton instance
export const poiDB = new POIDatabase();
export default POIDatabase;