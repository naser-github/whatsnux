#!/usr/bin/env bash
set -euo pipefail

echo "=== WhatsTux Smoke Check ==="

# Check package scripts exist
echo "[1] Checking package.json scripts..."
npm run typecheck 2>/dev/null || { echo "FAIL: typecheck script missing or failing"; exit 1; }
echo "PASS"

# Check all source files exist
echo "[2] Checking source files..."
for f in \
  src/main/app.ts \
  src/main/window.ts \
  src/main/session.ts \
  src/main/navigation.ts \
  src/main/tray.ts \
  src/main/notifications.ts \
  src/main/downloads.ts \
  src/main/shortcuts.ts \
  src/main/permissions.ts \
  src/main/media-flags.ts \
  src/main/settings.ts \
  src/preload/whatsapp-preload.ts \
  src/preload/settings-preload.ts \
  src/shared/constants.ts \
  src/shared/types.ts \
  src/renderer/error/index.html \
  src/renderer/error/error.ts \
  src/renderer/error/error.css \
  src/renderer/settings/index.html \
  src/renderer/settings/settings.ts \
  src/renderer/settings/settings.css \
  scripts/smoke-check.sh \
  scripts/generate-icons.py; do
  if [ ! -f "$f" ]; then
    echo "FAIL: missing $f"
    exit 1
  fi
done
echo "PASS"

# Check assets exist
echo "[3] Checking asset files..."
for f in \
  assets/icons/icon.png \
  assets/icons/icon-256.png \
  assets/tray/tray.png; do
  if [ ! -f "$f" ]; then
    echo "FAIL: missing $f"
    exit 1
  fi
done
echo "PASS"

# Check build compiles
echo "[4] Building project..."
npm run build 2>/dev/null || { echo "FAIL: build failed"; exit 1; }
echo "PASS"

# Check dist output exists
echo "[5] Checking dist output..."
for f in \
  dist/main/app.js \
  dist/main/window.js \
  dist/main/session.js \
  dist/main/navigation.js \
  dist/main/tray.js \
  dist/main/notifications.js \
  dist/main/downloads.js \
  dist/main/shortcuts.js \
  dist/main/permissions.js \
  dist/main/media-flags.js \
  dist/main/settings.js \
  dist/preload/whatsapp-preload.js \
  dist/preload/settings-preload.js \
  dist/shared/constants.js \
  dist/shared/types.js \
  dist/renderer/error/index.html \
  dist/renderer/error/error.js \
  dist/renderer/error/error.css \
  dist/renderer/settings/index.html \
  dist/renderer/settings/settings.js \
  dist/renderer/settings/settings.css; do
  if [ ! -f "$f" ]; then
    echo "FAIL: missing dist/$f"
    exit 1
  fi
done
echo "PASS"

# Security check: verify no unsafe Electron settings
echo "[6] Security check..."
violations=0
for f in src/main/window.ts src/main/app.ts; do
  if grep -q "nodeIntegration.*true" "$f" 2>/dev/null; then
    echo "FAIL: nodeIntegration enabled in $f"
    violations=$((violations + 1))
  fi
  if grep -q "contextIsolation.*false" "$f" 2>/dev/null; then
    echo "FAIL: contextIsolation disabled in $f"
    violations=$((violations + 1))
  fi
  if grep -q "sandbox.*false" "$f" 2>/dev/null; then
    echo "FAIL: sandbox disabled in $f"
    violations=$((violations + 1))
  fi
done
if [ "$violations" -gt 0 ]; then
  echo "FAIL: $violations security violation(s) found"
  exit 1
fi
echo "PASS"

# Regression checks for settings-backed desktop behavior
echo "[7] Desktop behavior regression checks..."
violations=0

enable_features_count=$(grep -c "appendSwitch('enable-features'" src/main/media-flags.ts || true)
if [ "$enable_features_count" -ne 1 ]; then
  echo "FAIL: enable-features should be appended once with a combined feature list"
  violations=$((violations + 1))
fi

if ! grep -q "WebRTCPipeWireCapturer,UseOzonePlatform" src/main/media-flags.ts; then
  echo "FAIL: media feature list is missing PipeWire or Ozone support"
  violations=$((violations + 1))
fi

if ! grep -q "updateSettings({ closeToTray" src/main/tray.ts; then
  echo "FAIL: tray close-to-tray toggle is not persisted"
  violations=$((violations + 1))
fi

if ! grep -q "nativeNotifications" src/main/notifications.ts; then
  echo "FAIL: notification handler does not respect nativeNotifications"
  violations=$((violations + 1))
fi

if ! grep -q "normalizeSettings" src/main/settings.ts; then
  echo "FAIL: settings input is not normalized before saving"
  violations=$((violations + 1))
fi

if [ "$violations" -gt 0 ]; then
  echo "FAIL: $violations desktop behavior regression(s) found"
  exit 1
fi
echo "PASS"

echo ""
echo "=== All smoke checks passed ==="
