import { app, globalShortcut, BrowserWindow } from 'electron';
import { getMainWindow } from './window';

export function setupShortcuts(): void {
  // Ctrl/Cmd+Q — Quit app
  globalShortcut.register('CommandOrControl+Q', () => {
    app.quit();
  });

  // Ctrl/Cmd+R — Reload WhatsApp Web
  globalShortcut.register('CommandOrControl+R', () => {
    const win = getMainWindow();
    if (win) {
      win.webContents.reload();
    }
  });

  // Ctrl/Cmd+= and Ctrl/Cmd+- — Zoom in/out
  globalShortcut.register('CommandOrControl+=', () => {
    const win = getMainWindow();
    if (win) {
      const level = win.webContents.getZoomLevel();
      win.webContents.setZoomLevel(level + 0.5);
    }
  });

  globalShortcut.register('CommandOrControl+-', () => {
    const win = getMainWindow();
    if (win) {
      const level = win.webContents.getZoomLevel();
      win.webContents.setZoomLevel(level - 0.5);
    }
  });

  // Ctrl/Cmd+0 — Reset zoom
  globalShortcut.register('CommandOrControl+0', () => {
    const win = getMainWindow();
    if (win) {
      win.webContents.setZoomLevel(0);
    }
  });
}

export function destroyShortcuts(): void {
  globalShortcut.unregisterAll();
}