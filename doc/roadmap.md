# Roadmap
## Project: WhatsTux

### Milestone 1: App Shell

Owner: Electron Core

- Create Electron project.
- Load `https://web.whatsapp.com`.
- Preserve login session.
- Add secure Electron defaults.
- Block unsafe navigation.
- Open external links in system browser.
- Add basic tray quit.

Exit condition:

- App opens WhatsApp Web.
- QR login works.
- Restart keeps login.
- External links open in browser.
- Tray Quit exits app.

### Milestone 2: Desktop Basics

Owner: Electron Core + UI UX

- Add tray.
- Add close-to-tray.
- Add quit behavior.
- Add native notifications.
- Add external link handling.
- Add download handling.
- Add basic shortcuts.

Exit condition:

- App behaves like a normal Linux desktop app.

### Milestone 3: Permissions

Owner: Electron Core + Media Calls

- Add origin-limited permission handling.
- Support mic permission.
- Support camera permission.
- Support screen capture permission.
- Add clear denied-permission states.

Exit condition:

- WhatsApp Web can request mic, camera, and screen share safely.

### Milestone 4: Calls

Owner: Media Calls + WhatsApp Web

- Detect call availability.
- Test voice call.
- Test video call.
- Test incoming call while minimized.
- Test screen share on X11.
- Test screen share on Wayland.
- Test Bluetooth headset before and during call.
- Add compatibility mode if Linux blocks visible call support.

Exit condition:

- Calls work when WhatsApp Web exposes them.
- If calls are missing, app explains why.

### Milestone 5: Settings and Polish

Owner: UI UX

- Add settings page.
- Add startup on login.
- Add theme setting.
- Add hardware acceleration setting.
- Add call compatibility setting.
- Add cache reset.
- Add error states.

Exit condition:

- User can control important desktop behavior without editing config files.

### Milestone 6: Packaging

Owner: Packaging

- Add `.deb` package.
- Add `.rpm` package.
- Add AppImage.
- Add app icon.
- Add desktop entry.
- Add autostart support.
- Add release command.

Exit condition:

- App installs and launches cleanly on supported Linux distros.

### Milestone 7: QA and Performance

Owner: Reviewer QA

- Run core test checklist.
- Run call test checklist.
- Check Electron security.
- Check idle CPU.
- Check memory after long session.
- Check CPU/GPU during video call.
- Check package install/uninstall.

Exit condition:

- Reviewer approves release or lists required fixes.

### Review Gates

No milestone is done until Reviewer QA checks it.

Hard blockers:

- Unsafe Electron settings.
- Permission granted to unknown origins.
- External links opening inside the app.
- Message/contact/auth data logged.
- Broken login persistence.
- Broken tray quit behavior.
- High idle CPU without reason.

### First Sprint

Tasks:

1. Create Electron project structure.
2. Add secure `BrowserWindow`.
3. Load WhatsApp Web.
4. Keep session after restart.
5. Block external navigation.
6. Add basic tray with Quit.
7. Add first smoke test checklist.

First sprint success:

- App launches.
- WhatsApp QR appears.
- Login persists.
- External links open in browser.
- Tray quit works.
