# Agent Plan

## Project: WhatsTux

### 1. Goal

Use focused agents to build the app without messy ownership.

Each agent owns one clear area. No agent should edit files outside its scope unless Planner approves it.

### 2. Agent Roles

| Agent | Owns | Main Output |
| --- | --- | --- |
| Planner | Requirements, scope, task order, architecture decisions | Updated docs, sprint tasks, final decisions |
| Electron Core | Main Electron process, app lifecycle, security, session, tray, notifications, downloads, external links | Stable desktop shell |
| WhatsApp Web | WhatsApp Web loading, QR login, feature detection, minimal UI injection, unsupported-feature states | Reliable WhatsApp Web integration |
| Media Calls | WebRTC, mic, camera, screen share, PipeWire/PulseAudio behavior, GPU flags, Bluetooth testing | Best possible call support on Linux |
| UI UX | Window chrome, settings page, shortcuts, theme, tray menu, error states | Polished Linux desktop experience |
| Packaging | `.deb`, `.rpm`, AppImage, icons, desktop file, autostart, release scripts | Installable Linux app |
| Reviewer QA | Security review, performance review, test plan, regression checks | Approval or required fixes |

### 3. Ownership Rules

- Planner owns product and planning docs.
- Electron Core owns Electron main process files.
- WhatsApp Web owns preload and WhatsApp Web integration files.
- Media Calls owns media compatibility, call settings, and Linux audio/video docs.
- UI UX owns app UI, settings UI, titlebar, theme, icons, and shortcuts.
- Packaging owns build config and release assets.
- Reviewer QA does not own feature files unless fixing review comments.

If two agents need the same file, Planner decides the order.

### 4. Model Assignment

| Agent | Model | Reasoning |
| --- | --- | --- |
| Planner | GPT-5.5 | High |
| Electron Core | GPT-5.4 | Medium |
| WhatsApp Web | GPT-5.4 | Medium |
| Media Calls | GPT-5.5 | Medium |
| UI UX | GPT-5.4 Mini | Medium |
| Packaging | GPT-5.4 Mini | Medium |
| Reviewer QA | GPT-5.5 | High |

Rules:

- Media Calls can use medium reasoning, but Reviewer QA must use high reasoning.
- Electron Core should not use Mini by default because it owns security, permissions, session, downloads, and app lifecycle.
- WhatsApp Web should not use Mini by default because feature detection and preload boundaries are fragile.
- UI UX and Packaging can use Mini because their work is easier to review and lower risk.

### 5. Collaboration Rules

- No agent edits everything.
- No private WhatsApp APIs.
- No broad permission approval.
- No unsafe Electron setting.
- No logging of messages, contacts, auth data, or call metadata.
- Keep WhatsApp Web UI injection small and defensive.
- Reviewer QA checks every milestone before the next milestone is treated as done.

### 6. Recommended Agent Order

```text
Planner
  -> Electron Core
  -> WhatsApp Web
  -> Media Calls
  -> UI UX
  -> Packaging
  -> Reviewer QA
```

Parallel work:

```text
Electron Core + UI UX can work together after app shell exists.
Media Calls can start after permissions exist.
Packaging can start after app shell exists.
Reviewer QA checks after every milestone.
```
