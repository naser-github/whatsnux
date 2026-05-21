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
        const betaKeywords = ['join beta', 'desktop beta', 'multi-device beta', 'multi device beta'];
        const labelNodes = Array.from(document.querySelectorAll('button, [role="button"], [role="menuitem"], [aria-label], [title]'));
        const betaOptionAvailable = labelNodes.some(function(node) {
          const label = [
            node.getAttribute('aria-label') || '',
            node.getAttribute('title') || '',
            node.textContent || ''
          ].join(' ').toLowerCase();

          return betaKeywords.some(function(keyword) {
            return label.indexOf(keyword) !== -1;
          });
        });

        function findSettingsControl() {
          const settingsCandidates = Array.from(document.querySelectorAll('button, [role="button"], [role="menuitem"], [aria-label], [title]'));
          return settingsCandidates.find(function(node) {
            const label = [
              node.getAttribute('aria-label') || '',
              node.getAttribute('title') || '',
              node.textContent || ''
            ].join(' ').trim().toLowerCase();

            return label === 'settings' || label.indexOf('settings') !== -1;
          });
        }

        var existing = document.getElementById(noticeId);
        if (hasCallButton && existing) {
          existing.remove();
        }

        if (!hasCallButton && hasChatInput && !existing) {
          var notice = document.createElement('div');
          notice.id = noticeId;
          notice.setAttribute('role', 'status');
          notice.setAttribute('style', [
            'position: fixed',
            'right: 16px',
            'bottom: 16px',
            'z-index: 2147483647',
            'max-width: 420px',
            'padding: 14px',
            'border-radius: 12px',
            'background: #111b21',
            'color: #e9edef',
            'font: 13px sans-serif',
            'line-height: 1.4',
            'box-shadow: 0 8px 24px rgba(0,0,0,.28)'
          ].join(';'));

          var title = document.createElement('div');
          title.textContent = betaOptionAvailable
            ? 'Calls may need WhatsApp Web/Desktop beta'
            : 'Calls are not available for this account yet';
          title.setAttribute('style', 'font-weight: 700; margin-bottom: 6px;');

          var body = document.createElement('div');
          body.textContent = betaOptionAvailable
            ? 'A beta option appears to be available. Open WhatsApp settings, join beta yourself, then reload Whatsnux.'
            : 'If WhatsApp shows a Web/Desktop beta option for this account, join it from WhatsApp settings and reload. Whatsnux cannot enable beta automatically.';

          var actions = document.createElement('div');
          actions.setAttribute('style', 'display: flex; gap: 8px; margin-top: 10px; flex-wrap: wrap;');

          function makeButton(label) {
            var button = document.createElement('button');
            button.textContent = label;
            button.setAttribute('style', [
              'border: 0',
              'border-radius: 999px',
              'padding: 7px 10px',
              'background: #00a884',
              'color: white',
              'font: 12px sans-serif',
              'cursor: pointer'
            ].join(';'));
            return button;
          }

          var settingsButton = makeButton('Open settings');
          settingsButton.addEventListener('click', function() {
            var settingsControl = findSettingsControl();
            if (settingsControl) {
              settingsControl.click();
            } else {
              body.textContent = 'Open WhatsApp settings manually. If a Web/Desktop beta option is shown, join it yourself, then reload Whatsnux.';
            }
          });

          var reloadButton = makeButton('Reload');
          reloadButton.addEventListener('click', function() {
            window.location.reload();
          });

          var dismissButton = makeButton('Dismiss');
          dismissButton.setAttribute('style', dismissButton.getAttribute('style') + '; background: #2a3942;');
          dismissButton.addEventListener('click', function() {
            notice.remove();
          });

          actions.appendChild(settingsButton);
          actions.appendChild(reloadButton);
          actions.appendChild(dismissButton);
          notice.appendChild(title);
          notice.appendChild(body);
          notice.appendChild(actions);
          document.body.appendChild(notice);
          setTimeout(function() {
            var current = document.getElementById(noticeId);
            if (current) current.remove();
          }, betaOptionAvailable ? 30000 : 16000);
        }

        return { hasCallButton, hasVideoButton, hasVoiceButton, betaOptionAvailable };
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
