import { app } from 'electron';

export function setupMediaFlags(hardwareAcceleration: boolean = true): void {
  // PipeWire support for screen sharing on Wayland
  app.commandLine.appendSwitch('enable-features', 'WebRTCPipeWireCapturer');

  // Wayland support via Ozone
  app.commandLine.appendSwitch('enable-features', 'UseOzonePlatform');
  app.commandLine.appendSwitch('ozone-platform-hint', 'auto');

  // Accelerated video decode
  app.commandLine.appendSwitch('enable-accelerated-video');

  // GPU acceleration
  if (hardwareAcceleration) {
    app.commandLine.appendSwitch('ignore-gpu-blocklist');
    app.commandLine.appendSwitch('enable-gpu-rasterization');
    app.commandLine.appendSwitch('enable-zero-copy');
  } else {
    app.commandLine.appendSwitch('disable-gpu');
  }
}

export function setupCallDetection(mainWindow: Electron.BrowserWindow): void {
  // Periodically check for WhatsApp Web call controls.
  // WhatsApp Web exposes call controls via DOM elements in the chat header.
  // This detection runs in the renderer context without exposing Node.js APIs.
  const checkInterval = setInterval(() => {
    if (mainWindow.isDestroyed()) {
      clearInterval(checkInterval);
      return;
    }

    mainWindow.webContents.executeJavaScript(`
      (function() {
        var noticeId = 'whatsnux-call-fallback';
        const hasCallButton = document.querySelector('[data-testid="call-video"], [data-testid="call-audio"]') !== null;
        const hasVideoButton = document.querySelector('[data-testid="call-video"]') !== null;
        const hasVoiceButton = document.querySelector('[data-testid="call-audio"]') !== null;
        const hasChatInput = document.querySelector('[contenteditable="true"][role="textbox"]') !== null;

        var existing = document.getElementById(noticeId);
        if (hasCallButton && existing) {
          existing.remove();
        }

        if (!hasCallButton && hasChatInput && !existing) {
          var notice = document.createElement('div');
          notice.id = noticeId;
          notice.textContent = 'Whatsnux: calls are unavailable here unless WhatsApp Web exposes call buttons for this account.';
          notice.setAttribute('style', [
            'position: fixed',
            'right: 16px',
            'bottom: 16px',
            'z-index: 2147483647',
            'max-width: 360px',
            'padding: 10px 12px',
            'border-radius: 8px',
            'background: #111b21',
            'color: #e9edef',
            'font: 13px sans-serif',
            'box-shadow: 0 8px 24px rgba(0,0,0,.24)'
          ].join(';'));
          document.body.appendChild(notice);
          setTimeout(function() {
            var current = document.getElementById(noticeId);
            if (current) current.remove();
          }, 10000);
        }

        return { hasCallButton, hasVideoButton, hasVoiceButton };
      })();
    `).catch(() => {
      // Page not ready or navigation in progress — ignore
    });
  }, 5000); // Check every 5 seconds after load

  // Clean up on navigation
  mainWindow.webContents.on('did-navigate', () => {
    clearInterval(checkInterval);
  });
}
