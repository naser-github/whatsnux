# Product Requirements Document
## Project: WhatsTux

### 1. Goal

Build WhatsTux, a polished Linux desktop client for WhatsApp with the same daily-use experience expected from WhatsApp for Windows:

- Chat, media, voice notes, file sharing, reactions, communities, channels, status, search, archived chats, pinned chats, starred messages, and settings.
- Voice calls, video calls, screen sharing, incoming call alerts, and call controls when WhatsApp Web exposes those features for the linked account.
- Native Linux desktop behavior: tray, notifications, startup option, media permissions, dark/light theme, keyboard shortcuts, and clean window controls.
- Strong performance: low idle CPU, controlled memory use, GPU video acceleration where supported, and no unnecessary background work.

### 2. Hard Constraint

This app must use official WhatsApp Web infrastructure at `https://web.whatsapp.com`.

It must not reverse-engineer WhatsApp private protocols, bypass encryption, scrape unsupported APIs, or use unofficial automation that can risk account bans.

Because Meta controls WhatsApp Web feature rollout, exact parity with WhatsApp for Windows cannot be guaranteed by this app alone. The app must target full parity, detect missing Web features, and show clear fallback states.

### 3. Product Identity

| Item | Value |
| --- | --- |
| App name | WhatsTux |
| Product name | WhatsTux |
| Executable name | `whatstux` |
| Package name | `whatstux` |
| App ID | `com.whatstux.app` |

Branding rules:

- Use original WhatsTux app icon and visual identity.
- Do not use the official WhatsApp logo as the app icon.
- Do not present WhatsTux as an official Meta or WhatsApp product.
- Add a short disclaimer in app metadata and release notes: WhatsTux is an unofficial Linux desktop client that uses WhatsApp Web.

### 4. Product Scope

#### 4.1 In Scope

| Area | Requirement |
| --- | --- |
| Messaging | Full WhatsApp Web messaging support, including text, emoji, stickers, GIFs, media, documents, voice notes, reactions, replies, forwards, edits, deletes, polls, search, and chat management. |
| Calls | Support one-to-one and group voice/video calls when available in WhatsApp Web. Support camera, microphone, speaker output, mute, camera toggle, screen share, and call notifications. |
| Desktop UX | Native tray, minimize-to-tray, startup on login, app badge/unread count, native notifications, keyboard shortcuts, file drag/drop, clipboard paste, and download handling. |
| UI polish | Native-feeling Linux desktop shell, clean titlebar, proper dark/light theme, smooth scrolling, readable fonts, no layout glitches, and no visible wrapper clutter. |
| Performance | GPU acceleration where available, lazy startup work, background throttling controls, low idle CPU, low memory growth over long sessions, and fast resume from tray. |
| Packaging | Linux distribution using `.deb`, `.rpm`, and AppImage. Flatpak can be added later only if camera, mic, screen share, tray, and notifications work well inside sandbox limits. |

#### 4.2 Out of Scope

- Custom WhatsApp server implementation.
- Bot behavior or message automation.
- Multi-account support in the first release.
- Modifying WhatsApp message content or weakening end-to-end encryption.
- Injecting large UI rewrites into WhatsApp Web.

### 5. Technical Architecture

| Layer | Decision |
| --- | --- |
| App shell | Electron LTS. |
| Web content | `BrowserWindow` loading `https://web.whatsapp.com`. |
| Security model | Remote content stays sandboxed. Use `nodeIntegration: false`, `contextIsolation: true`, `sandbox: true`, and a minimal preload bridge. |
| Permissions | Grant only required permissions for `https://web.whatsapp.com`: microphone, camera, display capture, notifications, and clipboard where required. Deny unknown origins by default. |
| Calls | Use Chromium WebRTC through WhatsApp Web. Add Linux media flags and feature detection, but do not depend on private WhatsApp internals. |
| Audio | Use system PulseAudio/PipeWire through Chromium. Provide device-change recovery and clear error states. |
| Video | Enable Chromium hardware acceleration flags where supported. Keep a software fallback. |
| Screen share | Use Chromium display capture. On Wayland, support `xdg-desktop-portal` behavior. |
| Storage | Use Electron session storage for WhatsApp login state. Never copy or export WhatsApp auth tokens. |

### 6. Functional Requirements

| ID | Requirement |
| --- | --- |
| FR-1 | Load WhatsApp Web as the primary app surface and preserve linked-device login across restarts. |
| FR-2 | Detect whether calls are available for the current account/session. If not available, show a clear in-app notice instead of pretending calls work. |
| FR-3 | Support voice and video calls through WebRTC when WhatsApp Web exposes call controls. |
| FR-4 | Support screen sharing during calls when WhatsApp Web and the Linux desktop session allow display capture. |
| FR-5 | Provide microphone, camera, speaker, and screen permission handling only for WhatsApp Web origin. |
| FR-6 | Keep the app running in tray when the user closes the window, unless the user chooses Quit. |
| FR-7 | Show native Linux desktop notifications for messages and incoming calls. |
| FR-8 | Support unread count in tray/menu where the desktop environment allows it. |
| FR-9 | Provide standard desktop shortcuts: new chat/search focus, reload, zoom, mute notifications, lock app, open downloads, and quit. |
| FR-10 | Handle files cleanly: drag/drop upload, paste image, choose download folder, open downloaded files, and show failed download errors. |
| FR-11 | Provide a settings page for startup on login, tray behavior, theme, notification mode, call compatibility mode, hardware acceleration, and cache reset. |
| FR-12 | Support compatibility user-agent mode as a setting only if feature detection shows WhatsApp Web hides required desktop features on Linux. Do not hardcode spoofing as the only path. |

### 7. Non-Functional Requirements

#### 7.1 Performance

- Idle CPU target: below 3% after sync settles on a normal Linux laptop.
- Memory target: stable under long sessions, with no major leak after 8 hours idle plus active chat use.
- Startup target: first usable UI within 3 seconds after Electron starts on a mid-range laptop.
- Video target: hardware acceleration enabled when supported by GPU/driver; graceful fallback when not supported.
- Background target: tray mode must not keep expensive timers or animations active.

#### 7.2 Audio and Video Quality

- Calls must recover from device changes where Chromium/WebRTC supports recovery.
- Bluetooth profile changes must be tested on PipeWire with common headsets.
- App must expose clear troubleshooting states for missing microphone, camera, audio output, screen portal, or denied permissions.
- Call UI must stay responsive during network degradation.

#### 7.3 Security and Privacy

- No Node.js access inside WhatsApp Web renderer.
- No remote module.
- No broad permission auto-approval.
- No external navigation inside the main app window.
- Unknown links must open in the system browser after validation.
- Only trusted preload APIs are exposed.
- No logging of message text, contact names, media contents, auth tokens, or call metadata.

#### 7.4 UX Quality

- App must feel like a real Linux desktop app, not a rough browser wrapper.
- Window controls must be clear on GNOME and KDE.
- Theme must follow system theme by default, with manual override.
- UI overrides must be small and defensive. Do not hide core WhatsApp controls.
- Loading, offline, reconnecting, permission denied, and call unsupported states must be clear.

### 8. Linux Compatibility Requirements

| Area | Requirement |
| --- | --- |
| Primary distros | Support current Ubuntu LTS first, then Debian, Fedora, Arch, Manjaro, and openSUSE. |
| Display server | Support X11 and Wayland. |
| Audio | Support PipeWire first, PulseAudio fallback. |
| Screen sharing | Support `xdg-desktop-portal` on Wayland. |
| GPU | Support Intel, AMD, and NVIDIA paths where Electron/Chromium supports them. |
| Packaging | `.deb` for Ubuntu/Debian, `.rpm` for Fedora/openSUSE, AppImage as universal fallback. |

### 9. Build Plan

1. Create Electron app shell.
2. Load WhatsApp Web with secure Electron defaults.
3. Add app menu, tray, close-to-tray, and native notifications.
4. Add permission handlers for WhatsApp Web origin only.
5. Add download handling and external link handling.
6. Add Linux media flags behind settings.
7. Add feature detection for calls, screen share, and notifications.
8. Add settings page.
9. Add packaging for `.deb`, `.rpm`, and AppImage.
10. Add automated smoke tests and manual media test checklist.

### 10. Test Plan

The detailed test checklist lives in `doc/test-plan.md`.

The PRD only defines the requirement that every milestone must pass its matching tests before being treated as done.

### 11. Risks

| Risk | Impact | Mitigation |
| --- | --- | --- |
| WhatsApp Web does not expose calls to every user/account | Calls may be missing | Feature detection, compatibility mode, clear fallback, track rollout. |
| Meta changes WhatsApp Web internals | UI or feature detection may break | Keep injection minimal, avoid private selectors where possible, add smoke tests. |
| Electron/Chromium media bugs on Linux | Call or screen share issues | Pin Electron LTS, test X11/Wayland, keep fallback settings. |
| GPU acceleration differs by driver | Video performance may vary | Detect support, allow disable/enable, document known driver paths. |
| Flatpak sandbox blocks media features | Poor call/screen-share UX | Ship native packages first. Treat Flatpak as later optional work. |
| Aggressive UA spoofing causes breakage | Login/calls may fail | Use UA compatibility only as a setting, not a default requirement. |

### 12. Acceptance Criteria

The first release is acceptable when:

- WhatsApp Web login, messaging, media, downloads, notifications, tray, and startup behavior work on supported Linux desktops.
- Calls work when WhatsApp Web exposes call controls for the account.
- The app gives a clear reason when calls are not available.
- No unsafe Electron settings are used.
- Idle CPU and memory stay within target range.
- `.deb`, `.rpm`, and AppImage builds install or launch cleanly.
- UX is clean enough to use daily without feeling like a broken browser wrapper.
