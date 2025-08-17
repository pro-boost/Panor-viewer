import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { updateElectronMenuAdminStatus } from '@/utils/electronMenuHelper';

/**
 * Hook to synchronize authentication state with Electron menu
 * Updates the menu context when admin status changes
 */
export const useElectronMenuSync = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    // Update Electron menu when admin status changes
    if (user) {
      updateElectronMenuAdminStatus(isAdmin);
    }
  }, [user, isAdmin]);

  return {
    isElectron: typeof window !== 'undefined' && window.electronAPI,
    isAdmin
  };
};