const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Path utilities
  getProjectsPath: () => ipcRenderer.invoke('app:getProjectsPath'),
  getUserDataPath: () => ipcRenderer.invoke('app:getPath', 'userData'),
  
  // Platform info
  platform: process.platform,
  isElectron: true,
});