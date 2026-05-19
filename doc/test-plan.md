# Test Plan
## Project: Whatsnux

### 1. Goal

Verify that Whatsnux works as a daily Linux desktop client and does not break security, login, calls, or desktop behavior.

### 2. Test Environments

Minimum manual test matrix:

| Area | Required |
| --- | --- |
| Distros | Ubuntu LTS first, then Fedora, Arch/Manjaro, openSUSE |
| Display server | X11 and Wayland |
| Audio | PipeWire first, PulseAudio fallback |
| GPU | Intel, AMD, NVIDIA where available |
| Packages | `.deb`, `.rpm`, AppImage |

### 3. Milestone 1: App Shell

Required tests:

- App starts from terminal.
- WhatsApp Web loads.
- QR code appears for fresh profile.
- QR login succeeds.
- Login stays after app restart.
- Reload keeps session.
- Main window cannot navigate to random external site.
- External link opens in system browser.
- App can quit cleanly.

Pass condition:

- User can log in and reopen the app without scanning QR again.

### 4. Milestone 2: Desktop Basics

Required tests:

- Close button hides window when close-to-tray is enabled.
- Tray click restores window.
- Tray Quit exits app fully.
- Native notification appears for incoming message.
- Download starts from WhatsApp Web.
- Download saves to expected folder.
- Download failure shows clear error.
- Keyboard shortcuts work.

Pass condition:

- App behaves like a normal Linux desktop app.

### 5. Milestone 3: Permissions

Required tests:

- Microphone permission request appears or is granted only for WhatsApp Web.
- Camera permission request appears or is granted only for WhatsApp Web.
- Screen capture permission works on X11.
- Screen capture permission works on Wayland with portal.
- Unknown origin permission is denied.
- Denied permission shows clear user-facing state.

Pass condition:

- Media permissions work for WhatsApp Web and nowhere else.

### 6. Milestone 4: Calls

Required tests:

- Detect whether call buttons exist.
- If call buttons are missing, app shows call unsupported state.
- Start voice call.
- Receive voice call while app is visible.
- Receive voice call while app is minimized to tray.
- Start video call.
- Receive video call while app is visible.
- Receive video call while app is minimized to tray.
- Toggle mute.
- Toggle camera.
- Switch microphone during call.
- Switch speaker during call.
- Use wired headset before call.
- Use Bluetooth headset before call.
- Pair Bluetooth headset during call.
- Share full screen on X11.
- Share screen or window on Wayland.
- Recover after short network drop.

Pass condition:

- Calls work when WhatsApp Web exposes them.
- Missing calls are explained clearly.

### 7. Milestone 5: Settings and Polish

Required tests:

- Launch on login setting saves.
- Close-to-tray setting saves.
- Start minimized setting saves.
- Theme setting saves.
- Hardware acceleration setting saves.
- Call compatibility mode setting saves.
- Clear cache works without deleting package files.
- Reset app data requires confirmation.
- Error states are readable.

Pass condition:

- User can control app behavior without editing files.

### 8. Milestone 6: Packaging

Required tests:

- `.deb` installs.
- `.deb` launches from app menu.
- `.deb` uninstalls cleanly.
- `.rpm` installs.
- `.rpm` launches from app menu.
- `.rpm` uninstalls cleanly.
- AppImage launches without install.
- App icon appears.
- App icon is original Whatsnux branding, not the official WhatsApp logo.
- Desktop entry works.
- Executable name is `whatsnux`.

Pass condition:

- Supported Linux packages install or launch cleanly.

### 9. Milestone 7: Performance

Required tests:

- Cold startup time.
- Resume from tray time.
- Idle CPU after 10 minutes.
- Memory after 8 hours idle.
- Memory after heavy media chat use.
- CPU during voice call.
- CPU during video call.
- GPU acceleration status.
- Battery drain compared with browser tab.

Targets:

- Idle CPU below 3% after sync settles.
- No major memory leak after long idle session.
- First usable UI within 3 seconds after Electron starts on mid-range laptop.

### 10. Security Checks

Hard blockers:

- `nodeIntegration` enabled in WhatsApp Web window.
- `contextIsolation` disabled.
- `sandbox` disabled without documented reason.
- Permission granted to unknown origin.
- External link opens inside main app window.
- Message text logged.
- Contact name logged.
- Media content logged.
- Auth token copied, exported, or logged.
- Private WhatsApp API used.

### 11. Smoke Test Command

Add this script during implementation:

```text
scripts/smoke-check.sh
```

It should verify:

- package scripts exist.
- source files exist.
- app starts.
- lint passes.
- typecheck passes.

Exact command can be finalized after project setup.
