import { contextBridge, ipcRenderer } from 'electron';

// Minimal preload bridge for WhatsApp Web.
// No Node.js APIs beyond contextBridge are exposed to the renderer.
// Only specific IPC methods are whitelisted.

contextBridge.exposeInMainWorld('__whatstux', {
  // Notifications
  showNotification: (title: string, body: string) => {
    ipcRenderer.send('show-notification', { title, body });
  },

  // Downloads
  openDownloadsFolder: () => {
    ipcRenderer.send('open-downloads-folder');
  },

  getSettings: (): Promise<unknown> => {
    return ipcRenderer.invoke('get-settings');
  },
});
