import { app, BrowserWindow } from 'electron';

export function setupShortcuts(mainWindow: BrowserWindow): void {
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.type !== 'keyDown' || (!input.control && !input.meta)) {
      return;
    }

    const key = input.key.toLowerCase();

    if (key === 'q') {
      event.preventDefault();
      app.quit();
      return;
    }

    if (key === 'r') {
      event.preventDefault();
      mainWindow.webContents.reload();
      return;
    }

    if (key === '=' || key === '+') {
      event.preventDefault();
      mainWindow.webContents.setZoomLevel(mainWindow.webContents.getZoomLevel() + 0.5);
      return;
    }

    if (key === '-') {
      event.preventDefault();
      mainWindow.webContents.setZoomLevel(mainWindow.webContents.getZoomLevel() - 0.5);
      return;
    }

    if (key === '0') {
      event.preventDefault();
      mainWindow.webContents.setZoomLevel(0);
    }
  });
}

export function destroyShortcuts(): void {}
