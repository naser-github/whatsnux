import { app, ipcMain, session } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import { AppSettings } from '../shared/types';
import { getMainWindow, setCloseToTray, setCompatibilityMode } from './window';
import { SETTINGS_FILE, SESSION_PARTITION, WHATSAPP_WEB_URL } from '../shared/constants';

const DEFAULT_SETTINGS: AppSettings = {
  closeToTray: true,
  startMinimized: false,
  theme: 'system',
  nativeNotifications: true,
  hardwareAcceleration: true,
  callCompatibilityMode: false,
  launchOnLogin: false,
};

let currentSettings: AppSettings = { ...DEFAULT_SETTINGS };

function settingsFilePath(): string {
  return path.join(app.getPath('userData'), SETTINGS_FILE);
}

function isTheme(value: unknown): value is AppSettings['theme'] {
  return value === 'system' || value === 'light' || value === 'dark';
}

function booleanOrDefault(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function normalizeSettings(value: unknown): AppSettings {
  const input = typeof value === 'object' && value !== null ? value as Partial<AppSettings> : {};

  return {
    closeToTray: booleanOrDefault(input.closeToTray, DEFAULT_SETTINGS.closeToTray),
    startMinimized: booleanOrDefault(input.startMinimized, DEFAULT_SETTINGS.startMinimized),
    theme: isTheme(input.theme) ? input.theme : DEFAULT_SETTINGS.theme,
    nativeNotifications: booleanOrDefault(input.nativeNotifications, DEFAULT_SETTINGS.nativeNotifications),
    hardwareAcceleration: booleanOrDefault(input.hardwareAcceleration, DEFAULT_SETTINGS.hardwareAcceleration),
    callCompatibilityMode: booleanOrDefault(
      input.callCompatibilityMode,
      DEFAULT_SETTINGS.callCompatibilityMode
    ),
    launchOnLogin: booleanOrDefault(input.launchOnLogin, DEFAULT_SETTINGS.launchOnLogin),
  };
}

export function loadSettings(): AppSettings {
  try {
    const filePath = settingsFilePath();
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      currentSettings = normalizeSettings(JSON.parse(data));
    }
  } catch {
    currentSettings = { ...DEFAULT_SETTINGS };
  }
  return currentSettings;
}

export function saveSettings(settings: AppSettings): AppSettings {
  currentSettings = normalizeSettings(settings);
  try {
    const filePath = settingsFilePath();
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(currentSettings, null, 2), 'utf-8');
  } catch {
    // Silently fail — settings will be in-memory for this session
  }
  return currentSettings;
}

export function updateSettings(settings: Partial<AppSettings>): AppSettings {
  const nextSettings = saveSettings({ ...currentSettings, ...settings });
  applyRuntimeSettings(nextSettings);
  return nextSettings;
}

export function getSettings(): AppSettings {
  return { ...currentSettings };
}

export function applyRuntimeSettings(settings: AppSettings): void {
  setCloseToTray(settings.closeToTray);
  app.setLoginItemSettings({ openAtLogin: settings.launchOnLogin });
  setCompatibilityMode(settings.callCompatibilityMode);
}

export function setupSettingsIpc(): void {
  ipcMain.handle('get-settings', () => {
    return getSettings();
  });

  ipcMain.handle('set-settings', (_event, settings: unknown) => {
    return updateSettings(normalizeSettings(settings));
  });

  ipcMain.handle('clear-cache', async () => {
    const s = session.fromPartition(SESSION_PARTITION);
    await s.clearCache();
    return true;
  });

  ipcMain.handle('reset-app-data', async () => {
    const s = session.fromPartition(SESSION_PARTITION);
    await s.clearCache();
    await s.clearStorageData();
    updateSettings(DEFAULT_SETTINGS);

    // Reload to show WhatsApp QR again
    const win = getMainWindow();
    if (win) {
      win.loadURL(WHATSAPP_WEB_URL);
    }
    return true;
  });
}
