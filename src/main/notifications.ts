import { Notification, ipcMain } from 'electron';
import { getMainWindow } from './window';
import { getSettings } from './settings';

interface NotificationPayload {
  title: string;
  body: string;
}

function isNotificationPayload(value: unknown): value is NotificationPayload {
  if (typeof value !== 'object' || value === null) return false;
  const payload = value as Partial<NotificationPayload>;
  return typeof payload.title === 'string' && typeof payload.body === 'string';
}

export function setupNotifications(): void {
  // Handle notification requests from the renderer via IPC
  ipcMain.on('show-notification', (_event, payload: unknown) => {
    if (!getSettings().nativeNotifications || !isNotificationPayload(payload)) {
      return;
    }

    const notification = new Notification({
      title: payload.title,
      body: payload.body,
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
