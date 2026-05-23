import { contextBridge, ipcRenderer } from 'electron';

// Bridge between settings renderer and main process.
// Only exposes safe IPC calls — no direct Node.js access.

contextBridge.exposeInMainWorld('__whatstuxSettings', {
  getSettings: (): Promise<unknown> => {
    return ipcRenderer.invoke('get-settings');
  },

  setSettings: (settings: unknown): Promise<unknown> => {
    return ipcRenderer.invoke('set-settings', settings);
  },

  clearCache: (): Promise<unknown> => {
    return ipcRenderer.invoke('clear-cache');
  },

  resetAppData: (): Promise<unknown> => {
    return ipcRenderer.invoke('reset-app-data');
  },
});
