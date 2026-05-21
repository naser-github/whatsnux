export interface AppSettings {
  closeToTray: boolean;
  startMinimized: boolean;
  theme: 'system' | 'light' | 'dark';
  nativeNotifications: boolean;
  hardwareAcceleration: boolean;
  callCompatibilityMode: boolean;
  launchOnLogin: boolean;
}

export type PermissionType = 'microphone' | 'camera' | 'display-capture' | 'notifications' | 'clipboard';