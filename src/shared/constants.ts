export const APP_NAME = 'Whatsnux';
export const APP_ID = 'com.whatsnux.app';
export const WHATSAPP_WEB_URL = 'https://web.whatsapp.com';
export const WHATSAPP_WEB_ORIGIN = 'https://web.whatsapp.com';
export const SESSION_PARTITION = 'persist:whatsapp';
export const WINDOW_DEFAULTS = {
  width: 1280,
  height: 720,
  minWidth: 800,
  minHeight: 600,
};

// WhatsApp Web rejects Electron's default user agent because it contains "Electron".
export const DEFAULT_CHROME_USER_AGENT =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36';

// User-agent for compatibility mode when WhatsApp Web hides desktop features on Linux.
export const COMPATIBILITY_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36';

// Settings
export const SETTINGS_FILE = 'settings.json';
