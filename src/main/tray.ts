import { Tray, Menu, app, nativeImage } from 'electron';
import path from 'path';
import { APP_NAME } from '../shared/constants';
import { showMainWindow, isCloseToTray, setCloseToTray, quitApplication } from './window';
import { updateSettings } from './settings';

let tray: Tray | null = null;

export function createTray(): Tray {
  // Load tray icon from assets
  const iconPath = path.join(__dirname, '..', '..', 'assets', 'tray', 'tray.png');
  const icon = nativeImage.createFromPath(iconPath);
  tray = new Tray(icon);

  rebuildTrayMenu();

  tray.setToolTip(APP_NAME);

  tray.on('double-click', () => {
    showMainWindow();
  });

  return tray;
}

function rebuildTrayMenu(): void {
  if (!tray) return;

  const closeToTray = isCloseToTray();

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show WhatsTux',
      click: () => showMainWindow(),
    },
    { type: 'separator' },
    {
      label: 'Close to Tray',
      type: 'checkbox',
      checked: closeToTray,
      click: () => {
        const nextCloseToTray = !closeToTray;
        setCloseToTray(nextCloseToTray);
        updateSettings({ closeToTray: nextCloseToTray });
        rebuildTrayMenu();
      },
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        quitApplication();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);
}

export function destroyTray(): void {
  if (tray) {
    tray.destroy();
    tray = null;
  }
}
