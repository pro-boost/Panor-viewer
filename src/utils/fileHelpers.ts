// Centralized file URL management
export class FileURLManager {
  static getBaseURL(): string {
    // Always use the API route for file serving
    // The custom protocol approach has compatibility issues
    return "/api/files";
  }

  static getProjectFileURL(projectId: string, relativePath: string): string {
    const baseURL = this.getBaseURL();
    return `${baseURL}/${projectId}/${relativePath}`;
  }

  static getPanoramaImageURL(projectId: string, imageName: string): string {
    return this.getProjectFileURL(projectId, `images/${imageName}`);
  }

  static getConfigFileURL(projectId: string, filename: string): string {
    return this.getProjectFileURL(projectId, `config/${filename}`);
  }

  static getPOIFileURL(
    projectId: string,
    poiId: string,
    filename: string,
  ): string {
    return this.getProjectFileURL(projectId, `poi/${poiId}/${filename}`);
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
