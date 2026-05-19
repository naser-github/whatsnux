# Architecture
## Project: Whatsnux

### 1. Goal

Define the first implementation shape for Whatsnux.

The app must stay simple: Electron shell, official WhatsApp Web, safe preload, native Linux desktop integration.

### 2. Core Decisions

| Area | Decision |
| --- | --- |
| Runtime | Electron LTS |
| Language | TypeScript |
| Package manager | npm |
| Main UI source | `https://web.whatsapp.com` |
| App storage | Electron persistent session |
| Local UI | Small internal pages for settings and error states |
| Packaging | electron-builder |
| Release targets | `.deb`, `.rpm`, AppImage |

### 3. Proposed Repo Structure

```text
doc/
  requirement.md
  agent-plan.md
  roadmap.md
  architecture.md
  test-plan.md

src/
  main/
    app.ts
    window.ts
    session.ts
    permissions.ts
    tray.ts
    notifications.ts
    downloads.ts
    navigation.ts
    settings.ts
    media-flags.ts

  preload/
    whatsapp-preload.ts
    settings-preload.ts

  renderer/
    settings/
      index.html
      settings.ts
      settings.css
    error/
      index.html
      error.ts
      error.css

  shared/
    constants.ts
    types.ts

assets/
  icons/
  tray/

scripts/
  smoke-check.sh
```

### 4. Main Process

Owner: Electron Core

Responsibilities:

- Start Electron app.
- Apply Linux media and GPU flags before app ready.
- Create the WhatsApp Web window.
- Keep session persistent.
- Handle tray and close-to-tray.
- Handle downloads.
- Handle native notifications.
- Block unsafe navigation.
- Open external links in system browser.
- Own app settings storage.

Security defaults:

```text
nodeIntegration: false
contextIsolation: true
sandbox: true
webSecurity: true
allowRunningInsecureContent: false
```

### 5. WhatsApp Window

Owner: Electron Core + WhatsApp Web

Window requirements:

- Load only `https://web.whatsapp.com`.
- Use persistent partition for login state.
- Deny unknown origins.
- Prevent popups from opening inside the app.
- Keep a clean title and app icon.
- Preserve normal WhatsApp Web behavior.

No large DOM rewrite is allowed.

### 6. Preload

Owner: WhatsApp Web

Rules:

- Keep preload minimal.
- Do not expose Node.js APIs to WhatsApp Web.
- Expose only small safe bridge methods.
- Do not read messages, contacts, media, auth tokens, or call metadata.

Allowed use:

- Detect high-level app state.
- Report feature availability.
- Support small UI compatibility hooks.
- Connect settings UI to main process.

### 7. Permissions

Owner: Electron Core + Media Calls

Allowed only for `https://web.whatsapp.com`:

- Microphone.
- Camera.
- Display capture.
- Notifications.
- Clipboard where required.

Default for unknown origins:

```text
deny
```

No broad auto-approval.

### 8. Navigation

Owner: Electron Core

Rules:

- Main window stays on WhatsApp Web.
- External links open in system browser.
- Unknown protocols are denied unless explicitly allowed.
- New windows are denied by default.

Allowed internal origins:

```text
https://web.whatsapp.com
```

### 9. Media and Calls

Owner: Media Calls

Responsibilities:

- Add Linux media flags behind settings.
- Support PipeWire and PulseAudio behavior through Chromium.
- Support X11 and Wayland screen share paths.
- Detect call availability.
- Add call compatibility mode only when needed.
- Document known distro or driver issues.

Important:

Whatsnux can only support calls when WhatsApp Web exposes call controls for the linked account.

### 10. Settings

Owner: UI UX

Settings needed:

- Launch on login.
- Close to tray.
- Start minimized.
- Theme mode.
- Native notifications.
- Hardware acceleration.
- Call compatibility mode.
- Clear cache.
- Reset app data.

Settings must be stored locally and must not include WhatsApp auth data.

### 11. Packaging

Owner: Packaging

Targets:

- `.deb` for Ubuntu/Debian.
- `.rpm` for Fedora/openSUSE.
- AppImage as universal fallback.

Package identity:

```text
name: whatsnux
productName: Whatsnux
appId: com.whatsnux.app
executable: whatsnux
```

Branding rules:

- Use original Whatsnux icons.
- Do not use the official WhatsApp logo as the app icon.
- Package metadata must say this is an unofficial client for WhatsApp Web.

### 12. First Build Boundary

Milestone 1 should only implement:

- Electron project setup.
- Secure BrowserWindow.
- WhatsApp Web loading.
- Persistent login session.
- External navigation blocking.
- Basic tray quit.

Do not start calls, settings, packaging, or UI polish before Milestone 1 is stable.
