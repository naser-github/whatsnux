import { BrowserWindow, shell } from 'electron';
import { WHATSAPP_WEB_ORIGIN } from '../shared/constants';

const EXTERNAL_PROTOCOLS = new Set(['http:', 'https:']);

function isWhatsAppWebUrl(url: string): boolean {
  try {
    return new URL(url).origin === WHATSAPP_WEB_ORIGIN;
  } catch {
    return false;
  }
}

function openExternalHttpUrl(url: string): void {
  try {
    const parsed = new URL(url);
    if (EXTERNAL_PROTOCOLS.has(parsed.protocol)) {
      shell.openExternal(parsed.toString());
    }
  } catch {
    // Invalid URL — deny
  }
}

export function setupNavigation(mainWindow: BrowserWindow): void {
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    // Allow WhatsApp Web internal navigation
    if (isWhatsAppWebUrl(url)) {
      return { action: 'allow' };
    }

    // Open external links in the system browser
    openExternalHttpUrl(url);

    return { action: 'deny' };
  });

  // Intercept renderer-initiated navigation
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (!isWhatsAppWebUrl(url)) {
      event.preventDefault();
      openExternalHttpUrl(url);
    }
  });
}
