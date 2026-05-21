import { app, ipcMain } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import { AppSettings } from '../shared/types';
import { setCloseToTray, setCompatibilityMode } from './window';
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

export function loadSettings(): AppSettings {
  try {
    const filePath = settingsFilePath();
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      currentSettings = { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    }
  } catch {
    currentSettings = { ...DEFAULT_SETTINGS };
  }
  return currentSettings;
}

export function saveSettings(settings: AppSettings): AppSettings {
  currentSettings = { ...settings };
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

  ipcMain.handle('set-settings', (_event, settings: AppSettings) => {
    saveSettings(settings);
    applyRuntimeSettings(settings);

    return getSettings();
  });

  ipcMain.handle('clear-cache', async () => {
    const { session } = require('electron');
    const s = session.fromPartition(SESSION_PARTITION);
    await s.clearCache();
    return true;
  });

  ipcMain.handle('reset-app-data', async () => {
    const { session } = require('electron');
    const s = session.fromPartition(SESSION_PARTITION);
    await s.clearCache();
    await s.clearStorageData();
    // Reset settings to defaults
    saveSettings(DEFAULT_SETTINGS);

    // Reload to show WhatsApp QR again
    const { getMainWindow } = require('./window');
    const win = getMainWindow();
    if (win) {
      win.loadURL(WHATSAPP_WEB_URL);
    }
    return true;
  });
}
