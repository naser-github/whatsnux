// Settings page — communicates with main process via __whatstuxSettings bridge

interface Settings {
  closeToTray: boolean;
  startMinimized: boolean;
  theme: 'system' | 'light' | 'dark';
  nativeNotifications: boolean;
  hardwareAcceleration: boolean;
  callCompatibilityMode: boolean;
  launchOnLogin: boolean;
}

declare global {
  interface Window {
    __whatstuxSettings: {
      getSettings: () => Promise<Settings>;
      setSettings: (settings: Settings) => Promise<Settings>;
      clearCache: () => Promise<boolean>;
      resetAppData: () => Promise<boolean>;
    };
  }
}

const elements = {
  launchOnLogin: document.getElementById('launch-on-login') as HTMLInputElement | null,
  startMinimized: document.getElementById('start-minimized') as HTMLInputElement | null,
  closeToTray: document.getElementById('close-to-tray') as HTMLInputElement | null,
  theme: document.getElementById('theme') as HTMLSelectElement | null,
  nativeNotifications: document.getElementById('native-notifications') as HTMLInputElement | null,
  callCompatibility: document.getElementById('call-compatibility') as HTMLInputElement | null,
  hwAcceleration: document.getElementById('hw-acceleration') as HTMLInputElement | null,
  clearCache: document.getElementById('clear-cache') as HTMLButtonElement | null,
  resetData: document.getElementById('reset-data') as HTMLButtonElement | null,
};

async function loadSettings(): Promise<void> {
  try {
    const settings = await window.__whatstuxSettings.getSettings();

    if (elements.launchOnLogin) elements.launchOnLogin.checked = settings.launchOnLogin;
    if (elements.startMinimized) elements.startMinimized.checked = settings.startMinimized;
    if (elements.closeToTray) elements.closeToTray.checked = settings.closeToTray;
    if (elements.theme) elements.theme.value = settings.theme;
    if (elements.nativeNotifications) elements.nativeNotifications.checked = settings.nativeNotifications;
    if (elements.callCompatibility) elements.callCompatibility.checked = settings.callCompatibilityMode;
    if (elements.hwAcceleration) elements.hwAcceleration.checked = settings.hardwareAcceleration;
  } catch {
    // Bridge not available — settings will use defaults
  }
}

async function saveSetting(): Promise<void> {
  try {
    const settings: Settings = {
      launchOnLogin: elements.launchOnLogin?.checked ?? false,
      startMinimized: elements.startMinimized?.checked ?? false,
      closeToTray: elements.closeToTray?.checked ?? true,
      theme: (elements.theme?.value as Settings['theme']) ?? 'system',
      nativeNotifications: elements.nativeNotifications?.checked ?? true,
      callCompatibilityMode: elements.callCompatibility?.checked ?? false,
      hardwareAcceleration: elements.hwAcceleration?.checked ?? true,
    };

    await window.__whatstuxSettings.setSettings(settings);
  } catch {
    // Bridge not available
  }
}

// Wire up change handlers
function setupEventListeners(): void {
  const changeableInputs = [
    elements.launchOnLogin,
    elements.startMinimized,
    elements.closeToTray,
    elements.nativeNotifications,
    elements.callCompatibility,
    elements.hwAcceleration,
  ];

  for (const input of changeableInputs) {
    if (input) {
      input.addEventListener('change', saveSetting);
    }
  }

  if (elements.theme) {
    elements.theme.addEventListener('change', saveSetting);
  }

  if (elements.clearCache) {
    elements.clearCache.addEventListener('click', async () => {
      try {
        await window.__whatstuxSettings.clearCache();
        elements.clearCache!.textContent = 'Done!';
        setTimeout(() => {
          elements.clearCache!.textContent = 'Clear';
        }, 2000);
      } catch {
        elements.clearCache!.textContent = 'Failed';
      }
    });
  }

  if (elements.resetData) {
    elements.resetData.addEventListener('click', async () => {
      if (!confirm('This will clear all app data including your login session. Are you sure?')) {
        return;
      }
      try {
        await window.__whatstuxSettings.resetAppData();
      } catch {
        elements.resetData!.textContent = 'Failed';
      }
    });
  }
}

// Initialize
loadSettings();
setupEventListeners();

// Required to make this a module for global type augmentation
export {};
