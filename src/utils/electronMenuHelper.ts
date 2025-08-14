// Utility functions for communicating with Electron main process to update menu context

// Check if running in Electron environment
export const isElectron = (): boolean => {
  return typeof window !== 'undefined' && window.electronAPI && typeof window.electronAPI === 'object';
};

// Update admin status in Electron menu
export const updateElectronMenuAdminStatus = async (isAdmin: boolean): Promise<void> => {
  console.log('[ELECTRON HELPER] updateElectronMenuAdminStatus called with:', isAdmin);
  console.log('[ELECTRON HELPER] isElectron():', isElectron());
  console.log('[ELECTRON HELPER] window.electronAPI:', window.electronAPI);
  
  if (!isElectron()) {
    console.log('[ELECTRON HELPER] Not in Electron environment, skipping');
    return;
  }
  
  try {
    // @ts-ignore - Electron IPC is available in Electron context
    await window.electronAPI?.updateMenuAdminStatus?.(isAdmin);
    console.log('[ELECTRON HELPER] Successfully called updateMenuAdminStatus');
  } catch (error) {
    console.warn('Failed to update Electron menu admin status:', error);
  }
};

// Update current project ID in Electron menu
export const updateElectronMenuProjectId = async (projectId: string | null): Promise<void> => {
  if (!isElectron()) return;
  
  try {
    // @ts-ignore - Electron IPC is available in Electron context
    await window.electronAPI?.updateMenuProjectId?.(projectId);
  } catch (error) {
    console.warn('Failed to update Electron menu project ID:', error);
  }
};

// Update both admin status and project ID in Electron menu
export const updateElectronMenuContext = async (context: {
  adminStatus?: boolean;
  projectId?: string | null;
}): Promise<void> => {
  if (!isElectron()) return;
  
  try {
    // @ts-ignore - Electron IPC is available in Electron context
    await window.electronAPI?.updateMenuContext?.(context);
  } catch (error) {
    console.warn('Failed to update Electron menu context:', error);
  }
};

// Declare global types for TypeScript
declare global {
  interface Window {
    electronAPI?: {
      updateMenuAdminStatus?: (isAdmin: boolean) => Promise<void>;
      updateMenuProjectId?: (projectId: string | null) => Promise<void>;
      updateMenuContext?: (context: { adminStatus?: boolean; projectId?: string | null }) => Promise<void>;
    };
  }
}