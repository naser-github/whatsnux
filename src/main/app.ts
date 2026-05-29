import { app, BrowserWindow, Menu } from 'electron';
import { createMainWindow, getMainWindow, navigateToSettings } from './window';
import { setupSession } from './session';
import { setupNavigation } from './navigation';
import { createTray, destroyTray } from './tray';
import { setupNotifications } from './notifications';
import { setupDownloads, setupDownloadIpc } from './downloads';
import { setupShortcuts, destroyShortcuts } from './shortcuts';
import { setupCallDetection, setupMediaFlags } from './media-flags';
import { loadSettings, setupSettingsIpc, applyRuntimeSettings } from './settings';
import { setAppIsQuitting, setCompatibilityMode } from './window';

// Prevent multiple instances
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
}

const initialSettings = loadSettings();

// Apply media flags before app is ready.
setupMediaFlags(initialSettings.hardwareAcceleration);

app.whenReady().then(() => {
  // Load persisted settings
  const settings = loadSettings();
  applyRuntimeSettings(settings);

  // Configure session and permissions before creating window
  setupSession();

  // Wire up desktop features
  setupNotifications();
  setupDownloads();
  setupDownloadIpc();
  setupSettingsIpc();

  // Create application menu
  const appMenu = Menu.buildFromTemplate([
    {
      label: 'WhatsTux',
      submenu: [
        {
          label: 'Settings',
          accelerator: 'CommandOrControl+,',
          click: () => navigateToSettings(),
        },
        { type: 'separator' },
        { role: 'quit' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
      ],
    },
  ]);
  Menu.setApplicationMenu(appMenu);

  // Create the main window
  const mainWindow = createMainWindow({
    startMinimized: settings.startMinimized,
    callCompatibilityMode: settings.callCompatibilityMode,
  });

  // Set up navigation controls
  setupNavigation(mainWindow);
  setupShortcuts(mainWindow);
  setupCallDetection(mainWindow);

  if (settings.callCompatibilityMode) {
    setCompatibilityMode(true);
  }

  // Create tray
  createTray();

  // macOS: re-create window when dock icon is clicked
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

// Focus existing window if user tries to launch a second instance
app.on('second-instance', () => {
  const win = getMainWindow();
  if (win) {
    if (win.isMinimized()) win.restore();
    win.focus();
  }
});

// Quit when all windows are closed (except macOS)
// With close-to-tray, this only fires when the user explicitly quits
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  setAppIsQuitting(true);
  destroyTray();
  destroyShortcuts();
});
