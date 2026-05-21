import { Notification, ipcMain } from 'electron';
import { getMainWindow } from './window';

export function setupNotifications(): void {
  // Handle notification requests from the renderer via IPC
  ipcMain.on('show-notification', (_event, { title, body }: { title: string; body: string }) => {
    const notification = new Notification({
      title,
      body,
      silent: false,
    });

    notification.on('click', () => {
      const win = getMainWindow();
      if (win) {
        if (win.isMinimized()) win.restore();
        win.show();
        win.focus();
      }
    });

    notification.show();
  });
}