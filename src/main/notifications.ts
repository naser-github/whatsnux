import { Notification, ipcMain } from 'electron';
import { getMainWindow } from './window';
import { getSettings } from './settings';

interface NotificationPayload {
  title: string;
  body: string;
}

const MAX_NOTIFICATION_TITLE_LENGTH = 120;
const MAX_NOTIFICATION_BODY_LENGTH = 500;

function isNotificationPayload(value: unknown): value is NotificationPayload {
  if (typeof value !== 'object' || value === null) return false;
  const payload = value as Partial<NotificationPayload>;
  return typeof payload.title === 'string' && typeof payload.body === 'string';
}

function limitNotificationText(value: string, maxLength: number): string {
  return value.trim().slice(0, maxLength);
}

export function setupNotifications(): void {
  // Handle notification requests from the renderer via IPC
  ipcMain.on('show-notification', (_event, payload: unknown) => {
    if (!getSettings().nativeNotifications || !isNotificationPayload(payload)) {
      return;
    }

    const notification = new Notification({
      title: limitNotificationText(payload.title, MAX_NOTIFICATION_TITLE_LENGTH),
      body: limitNotificationText(payload.body, MAX_NOTIFICATION_BODY_LENGTH),
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
