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

  // Platform info
  platform: process.platform,
  isElectron: true,
});
