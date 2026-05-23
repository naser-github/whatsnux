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
  const runDetection = (): void => {
    if (mainWindow.isDestroyed()) {
      clearInterval(checkInterval);
      return;
    }

    mainWindow.webContents.executeJavaScript(`
      (function() {
        var noticeId = 'whatstux-call-fallback';
        var overlayId = 'whatstux-call-fallback-overlay';
        var promptDismissedKey = 'whatstux-call-beta-prompt-dismissed-session';
        const hasCallButton = document.querySelector('[data-testid="call-video"], [data-testid="call-audio"]') !== null;
        const hasVideoButton = document.querySelector('[data-testid="call-video"]') !== null;
        const hasVoiceButton = document.querySelector('[data-testid="call-audio"]') !== null;
        const pageText = (document.body && document.body.innerText ? document.body.innerText : '').toLowerCase();
        const looksLoggedIn = pageText.indexOf('chats') !== -1 ||
          pageText.indexOf('search') !== -1 ||
          pageText.indexOf('archived') !== -1 ||
          document.querySelector('[contenteditable="true"][role="textbox"]') !== null;
        const betaKeywords = ['join beta', 'join the beta', 'desktop beta', 'multi-device beta', 'multi device beta'];
        const labelNodes = Array.from(document.querySelectorAll('button, [role="button"], [role="menuitem"], [aria-label], [title]'));
        const betaOptionAvailable = labelNodes.some(function(node) {
          if (node.closest && node.closest('#' + overlayId)) return false;
          const label = [
            node.getAttribute('aria-label') || '',
            node.getAttribute('title') || '',
            node.textContent || ''
          ].join(' ').toLowerCase();

          return betaKeywords.some(function(keyword) {
            return label.indexOf(keyword) !== -1;
          });
        });

        function findControlByLabel(labels) {
          const candidates = Array.from(document.querySelectorAll('button, [role="button"], [role="menuitem"], [role="switch"], input, [aria-label], [title]'));
          return candidates.find(function(node) {
            if (node.closest && node.closest('#' + overlayId)) return false;
            const rect = node.getBoundingClientRect();
            const isVisible = rect.width > 0 && rect.height > 0;
            if (!isVisible) return false;

            const label = [
              node.getAttribute('aria-label') || '',
              node.getAttribute('title') || '',
              node.textContent || ''
            ].join(' ').trim().toLowerCase();

            return labels.some(function(expectedLabel) {
              return label === expectedLabel || label.indexOf(expectedLabel) !== -1;
            });
          });
        }

        function getText(node) {
          return [
            node.getAttribute && node.getAttribute('aria-label') || '',
            node.getAttribute && node.getAttribute('title') || '',
            node.textContent || ''
          ].join(' ').trim().toLowerCase();
        }

        function findVisibleTextContainer(labels) {
          const candidates = Array.from(document.querySelectorAll('div, span, button, [role="button"], [role="menuitem"], [role="switch"]'));
          return candidates.find(function(node) {
            if (node.closest && node.closest('#' + overlayId)) return false;
            const rect = node.getBoundingClientRect();
            if (rect.width <= 0 || rect.height <= 0) return false;
            const label = getText(node);
            return labels.some(function(expectedLabel) {
              return label === expectedLabel || label.indexOf(expectedLabel) !== -1;
            });
          });
        }

        function clickNode(node) {
          if (!node) return false;
          node.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, view: window }));
          node.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true, view: window }));
          node.click();
          return true;
        }

        function findBetaControl() {
          const directControl = findControlByLabel(betaKeywords);
          if (directControl) return directControl;

          const label = findVisibleTextContainer(['join the beta', 'join beta']);
          if (!label) return null;

          let container = label;
          for (let i = 0; i < 5 && container; i += 1) {
            const switchControl = container.querySelector('[role="switch"], input[type="checkbox"], button, [role="button"]');
            if (switchControl) return switchControl;
            container = container.parentElement;
          }

          return label;
        }

        function findSettingsControl() {
          return findControlByLabel(['settings']);
        }

        function findHelpAndFeedbackControl() {
          return findControlByLabel(['help and feedback']) ||
            findVisibleTextContainer(['help and feedback']);
        }

        function enableBetaFast(body) {
          var betaControl = findBetaControl();
          if (betaControl) {
            window.sessionStorage.setItem(promptDismissedKey, '1');
            clickNode(betaControl);
            body.textContent = 'Join the beta clicked. Reloading...';
            var overlay = document.getElementById(overlayId);
            if (overlay) overlay.remove();
            setTimeout(function() {
              window.location.reload();
            }, 1000);
            return;
          }

          var settingsControl = findSettingsControl();
          if (settingsControl) {
            clickNode(settingsControl);
            body.textContent = 'Opening Settings...';
          }

          setTimeout(function() {
            var helpAndFeedback = findHelpAndFeedbackControl();
            if (helpAndFeedback) {
              clickNode(helpAndFeedback);
              body.textContent = 'Opening Help and feedback...';
            }

            setTimeout(function() {
              var betaAfterOpen = findBetaControl();
              if (betaAfterOpen) {
                window.sessionStorage.setItem(promptDismissedKey, '1');
                clickNode(betaAfterOpen);
                body.textContent = 'Join the beta clicked. Reloading...';
                var overlay = document.getElementById(overlayId);
                if (overlay) overlay.remove();
                setTimeout(function() {
                  window.location.reload();
                }, 1000);
              } else {
                body.textContent = 'Could not find Join the beta. This account may not be eligible yet.';
              }
            }, 350);
          }, 350);
        }

        var existing = document.getElementById(noticeId);
        var overlay = document.getElementById(overlayId);
        if (hasCallButton) {
          if (existing) existing.remove();
          if (overlay) overlay.remove();
        }

        if (!hasCallButton && looksLoggedIn && !existing) {
          overlay = document.createElement('div');
          overlay.id = overlayId;
          overlay.setAttribute('style', [
            'position: fixed',
            'inset: 0',
            'z-index: 2147483646',
            'display: flex',
            'align-items: center',
            'justify-content: center',
            'background: rgba(0,0,0,.52)',
            'backdrop-filter: blur(2px)'
          ].join(';'));

          var notice = document.createElement('div');
          notice.id = noticeId;
          notice.setAttribute('role', 'dialog');
          notice.setAttribute('aria-modal', 'true');
          notice.setAttribute('style', [
            'width: min(520px, calc(100vw - 32px))',
            'padding: 24px',
            'border-radius: 18px',
            'background: #111b21',
            'color: #e9edef',
            'font: 15px sans-serif',
            'line-height: 1.5',
            'box-shadow: 0 24px 80px rgba(0,0,0,.45)',
            'border: 1px solid rgba(255,255,255,.08)'
          ].join(';'));

          var title = document.createElement('div');
          title.textContent = 'Enable calling in WhatsTux';
          title.setAttribute('style', 'font-weight: 800; font-size: 22px; margin-bottom: 10px;');

          var body = document.createElement('div');
          body.textContent = 'Calls need WhatsApp Web/Desktop beta. Click below and WhatsTux will open Settings > Help and feedback > Join the beta for you. If the option is missing, this account is not eligible yet.';

          var progress = document.createElement('div');
          progress.setAttribute('style', [
            'display: none',
            'align-items: center',
            'gap: 10px',
            'margin-top: 16px',
            'padding: 12px',
            'border-radius: 12px',
            'background: rgba(0,168,132,.12)',
            'color: #d1f4ec'
          ].join(';'));

          var spinner = document.createElement('div');
          spinner.textContent = '';
          spinner.setAttribute('style', [
            'width: 18px',
            'height: 18px',
            'border: 3px solid rgba(255,255,255,.25)',
            'border-top-color: #00a884',
            'border-radius: 50%',
            'animation: whatstux-spin .8s linear infinite'
          ].join(';'));

          var progressText = document.createElement('div');
          progressText.textContent = 'Joining beta... please wait.';
          progress.appendChild(spinner);
          progress.appendChild(progressText);

          if (!document.getElementById('whatstux-spin-style')) {
            var spinStyle = document.createElement('style');
            spinStyle.id = 'whatstux-spin-style';
            spinStyle.textContent = '@keyframes whatstux-spin { to { transform: rotate(360deg); } }';
            document.head.appendChild(spinStyle);
          }

          var actions = document.createElement('div');
          actions.setAttribute('style', 'display: flex; gap: 10px; margin-top: 18px; flex-wrap: wrap;');

          function makeButton(label, primary) {
            var button = document.createElement('button');
            button.textContent = label;
            button.setAttribute('style', [
              'border: 0',
              'border-radius: 12px',
              'padding: 11px 14px',
              'background: ' + (primary ? '#00a884' : '#2a3942'),
              'color: white',
              'font: 700 14px sans-serif',
              'cursor: pointer'
            ].join(';'));
            return button;
          }

          var enableBetaButton = makeButton('Join beta and enable calls', true);
          enableBetaButton.addEventListener('click', function() {
            enableBetaButton.disabled = true;
            enableBetaButton.textContent = 'Joining beta...';
            enableBetaButton.setAttribute('style', enableBetaButton.getAttribute('style') + '; opacity: .8; cursor: wait;');
            dismissButton.disabled = true;
            dismissButton.setAttribute('style', dismissButton.getAttribute('style') + '; opacity: .45; cursor: not-allowed;');
            progress.setAttribute('style', progress.getAttribute('style').replace('display: none', 'display: flex'));
            body.textContent = 'Please wait. WhatsTux is opening Settings > Help and feedback > Join the beta.';
            progressText.textContent = 'Joining beta...';
            enableBetaFast(body);
          });

          var dismissButton = makeButton('Not now', false);
          dismissButton.addEventListener('click', function() {
            window.sessionStorage.setItem(promptDismissedKey, '1');
            overlay.remove();
          });

          function showPrompt() {
            actions.appendChild(enableBetaButton);
            actions.appendChild(dismissButton);
            notice.appendChild(title);
            notice.appendChild(body);
            notice.appendChild(progress);
            notice.appendChild(actions);
            overlay.appendChild(notice);
            document.body.appendChild(overlay);
          }

          if (window.sessionStorage.getItem(promptDismissedKey) !== '1') {
            showPrompt();
          }
        }

        return { hasCallButton, hasVideoButton, hasVoiceButton, betaOptionAvailable };
      })();
    `).catch(() => {
      // Page not ready or navigation in progress — ignore
    });
  };

  const checkInterval = setInterval(runDetection, 5000);
  mainWindow.webContents.on('did-finish-load', () => {
    setTimeout(runDetection, 2500);
  });
}
