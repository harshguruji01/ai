const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('guruAiDesktop', {
  platform: process.platform,
  isDesktop: true,
  onAction: (callback) => ipcRenderer.on('guruai-action', (event, action) => callback(action)),
  version: '1.0.0'
});
