import { BrowserWindow, shell } from 'electron';
import { WHATSAPP_WEB_URL } from '../shared/constants';

export function setupNavigation(mainWindow: BrowserWindow): void {
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    // Allow WhatsApp Web internal navigation
    if (url.startsWith(WHATSAPP_WEB_URL)) {
      return { action: 'allow' };
    }

    // Open external links in the system browser
    const allowedProtocols = ['http:', 'https:'];
    try {
      const parsed = new URL(url);
      if (allowedProtocols.includes(parsed.protocol)) {
        shell.openExternal(url);
      }
    } catch {
      // Invalid URL — deny
    }

    return { action: 'deny' };
  });

  // Intercept renderer-initiated navigation
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith(WHATSAPP_WEB_URL)) {
      event.preventDefault();
      const allowedProtocols = ['http:', 'https:'];
      try {
        const parsed = new URL(url);
        if (allowedProtocols.includes(parsed.protocol)) {
          shell.openExternal(url);
        }
      } catch {
        // Invalid URL — silently ignore
      }
    }
  });
}