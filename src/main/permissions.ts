import { session, BrowserWindow } from 'electron';
import { WHATSAPP_WEB_ORIGIN, SESSION_PARTITION } from '../shared/constants';

// Track denied permissions per origin for showing clear error states
const deniedPermissions = new Map<string, Set<string>>();

const ALLOWED_PERMISSIONS = new Set([
  'media',
  'microphone',
  'camera',
  'display-capture',
  'notifications',
  'clipboard-read',
  'clipboard-sanitized-write',
]);

export function setupPermissions(): void {
  const s = session.fromPartition(SESSION_PARTITION);

  s.setPermissionRequestHandler((webContents, permission, callback) => {
    const origin = webContents.getURL();

    // Only allow specific permissions for WhatsApp Web
    if (origin.startsWith(WHATSAPP_WEB_ORIGIN) && ALLOWED_PERMISSIONS.has(permission)) {
      callback(true);
    } else {
      // Track denied permissions
      if (!deniedPermissions.has(origin)) {
        deniedPermissions.set(origin, new Set());
      }
      deniedPermissions.get(origin)!.add(permission);
      callback(false);
    }
  });

  s.setPermissionCheckHandler((webContents, permission, requestingOrigin) => {
    const origin = requestingOrigin || webContents?.getURL() || '';

    if (origin.startsWith(WHATSAPP_WEB_ORIGIN) && ALLOWED_PERMISSIONS.has(permission)) {
      return true;
    }
    return false;
  });
}

export function getDeniedPermissions(origin: string): string[] {
  return Array.from(deniedPermissions.get(origin) || []);
}

export function clearDeniedPermissions(origin: string): void {
  deniedPermissions.delete(origin);
}