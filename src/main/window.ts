import { BrowserWindow, app } from 'electron';
import path from 'path';
import { WHATSAPP_WEB_URL, WINDOW_DEFAULTS, APP_NAME, WHATSAPP_USER_AGENT } from '../shared/constants';
import { SESSION_PARTITION } from '../shared/constants';

let mainWindow: BrowserWindow | null = null;
let closeToTrayEnabled = true;
let appIsQuitting = false;

interface MainWindowOptions {
  startMinimized?: boolean;
  callCompatibilityMode?: boolean;
}

export function setCloseToTray(enabled: boolean): void {
  closeToTrayEnabled = enabled;
}

export function isCloseToTray(): boolean {
  return closeToTrayEnabled;
}

export function setAppIsQuitting(value: boolean): void {
  appIsQuitting = value;
}

export function createMainWindow(options: MainWindowOptions = {}): BrowserWindow {
  mainWindow = new BrowserWindow({
    width: WINDOW_DEFAULTS.width,
    height: WINDOW_DEFAULTS.height,
    minWidth: WINDOW_DEFAULTS.minWidth,
    minHeight: WINDOW_DEFAULTS.minHeight,
    title: APP_NAME,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, '..', 'preload', 'whatsapp-preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
      partition: SESSION_PARTITION,
    },
  });

  if (options.callCompatibilityMode) {
    mainWindow.webContents.setUserAgent(WHATSAPP_USER_AGENT);
  }

  mainWindow.loadURL(WHATSAPP_WEB_URL);

  mainWindow.once('ready-to-show', () => {
    if (!options.startMinimized) {
      mainWindow?.show();
    }
  });

  // Close-to-tray: hide instead of close when enabled
  mainWindow.on('close', (event) => {
    if (closeToTrayEnabled && !appIsQuitting) {
      event.preventDefault();
      mainWindow?.hide();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  return mainWindow;
}

export function getMainWindow(): BrowserWindow | null {
  return mainWindow;
}

export function showErrorPage(message: string, detail?: string): void {
  if (!mainWindow) return;
  const params = new URLSearchParams({ message });
  if (detail) params.set('detail', detail);
  mainWindow.loadURL(`file://${path.join(__dirname, '..', 'renderer', 'error', 'index.html')}?${params.toString()}`);
}

export function navigateToSettings(): void {
  // Open settings in a separate window to avoid preload script conflicts
  const settingsWin = new BrowserWindow({
    width: 680,
    height: 700,
    parent: mainWindow || undefined,
    title: `${APP_NAME} - Settings`,
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, '..', 'preload', 'settings-preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
  });

  const settingsPath = path.join(__dirname, '..', 'renderer', 'settings', 'index.html');
  settingsWin.loadURL(`file://${settingsPath}`);
}

export function showMainWindow(): void {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.show();
    mainWindow.focus();
  }
}

export function setCompatibilityMode(enabled: boolean): void {
  if (!mainWindow) return;
  if (enabled) {
    mainWindow.webContents.setUserAgent(WHATSAPP_USER_AGENT);
  } else {
    // Reset to default Electron user agent
    mainWindow.webContents.setUserAgent('');
  }
}

export function quitApplication(): void {
  appIsQuitting = true;
  app.quit();
}
