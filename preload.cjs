const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  downloadAndInstallUpdate: (url) => ipcRenderer.send('download-and-install-update', url),
  onUpdateProgress: (callback) => {
    const subscription = (event, progress) => callback(progress);
    ipcRenderer.on('update-progress', subscription);
    return () => {
      ipcRenderer.removeListener('update-progress', subscription);
    };
  },
  onUpdateError: (callback) => {
    const subscription = (event, error) => callback(error);
    ipcRenderer.on('update-error', subscription);
    return () => {
      ipcRenderer.removeListener('update-error', subscription);
    };
  }
});
