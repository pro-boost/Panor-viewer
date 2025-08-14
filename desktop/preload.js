const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  // Path utilities
  getProjectsPath: () => ipcRenderer.invoke("app:getProjectsPath"),
  getUserDataPath: () => ipcRenderer.invoke("app:getPath", "userData"),

  // Menu update functions
  updateMenuAdminStatus: (isAdmin) => {
    console.log('[PRELOAD] updateMenuAdminStatus called with:', isAdmin);
    return ipcRenderer.invoke("update-menu-admin-status", isAdmin);
  },
  updateMenuProjectId: (projectId) => {
    console.log('[PRELOAD] updateMenuProjectId called with:', projectId);
    return ipcRenderer.invoke("update-menu-project-id", projectId);
  },
  updateMenuContext: (context) => {
    console.log('[PRELOAD] updateMenuContext called with:', context);
    return ipcRenderer.invoke("update-menu-context", context);
  },

  // Platform info
  platform: process.platform,
  isElectron: true,
});
