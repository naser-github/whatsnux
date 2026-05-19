---
name: whatsnux-project
description: Project-specific rules for building Whatsnux, the unofficial Linux desktop client for WhatsApp Web. Use when working in this repo, editing its docs, planning agents, implementing Electron app code, reviewing security, packaging Linux builds, or testing WhatsApp Web login, tray, notifications, permissions, calls, screen share, and performance.
---

# Whatsnux Project

## Core Rules

- Build Whatsnux as an unofficial Linux desktop client for `https://web.whatsapp.com`.
- Use official WhatsApp Web only.
- Do not use private WhatsApp APIs.
- Do not reverse-engineer WhatsApp protocols.
- Do not automate messages or bot behavior.
- Do not weaken or bypass WhatsApp end-to-end encryption.
- Do not use the official WhatsApp logo as the app icon or product logo.
- Mention WhatsApp Web only in description/disclaimer text.

## Product Identity

```text
App name: Whatsnux
Product name: Whatsnux
Executable: whatsnux
Package name: whatsnux
App ID: com.whatsnux.app
```

## Stack

- Runtime: Electron LTS.
- Language: TypeScript.
- Package manager: npm.
- Packaging: electron-builder.
- Targets: `.deb`, `.rpm`, AppImage.
- Primary distros: Ubuntu LTS first, then Debian, Fedora, Arch/Manjaro, openSUSE.
- Display servers: X11 and Wayland.
- Audio: PipeWire first, PulseAudio fallback.

## Security Defaults

For the WhatsApp Web window:

```text
nodeIntegration: false
contextIsolation: true
sandbox: true
webSecurity: true
allowRunningInsecureContent: false
```

Rules:

- Keep WhatsApp Web renderer without Node.js access.
- Keep preload minimal.
- Expose only small trusted bridge APIs.
- Deny unknown origins by default.
- Open external links in the system browser.
- Do not open external links inside the main app window.
- Do not log message text, contact names, media contents, auth tokens, or call metadata.

## Permissions

Grant only for `https://web.whatsapp.com`:

- Microphone.
- Camera.
- Display capture.
- Notifications.
- Clipboard where required.

Default for unknown origins:

```text
deny
```

No broad permission auto-approval.

## Calls Rule

Whatsnux can support calls only when WhatsApp Web exposes call controls for the linked account.

Implementation must:

- Detect whether calls are available.
- Show clear fallback if calls are missing.
- Avoid claiming guaranteed Windows parity.
- Keep compatibility user-agent mode as optional setting only.

## Agent Plan

- Use `doc/agent-plan.md` as the source of truth for agent roles, ownership, and model assignment.
- Reviewer QA must review Media Calls work before it is treated as done.
- Do not change the model split without updating `doc/agent-plan.md`.

## Milestones

- Use `doc/roadmap.md` as the source of truth for milestone order and sprint scope.
- Do not start calls, full settings, packaging, or UI polish before Milestone 1 is stable.

## Docs To Respect

Read these repo docs when relevant:

```text
doc/requirement.md
doc/agent-plan.md
doc/roadmap.md
doc/architecture.md
doc/test-plan.md
```

Use `doc/architecture.md` before creating files.
Use `doc/test-plan.md` before marking a milestone done.
