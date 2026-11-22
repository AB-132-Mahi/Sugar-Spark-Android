#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

for tool in node npm java; do
  if ! command -v "$tool" >/dev/null 2>&1; then
    echo "Missing required tool: $tool" >&2
    exit 2
  fi
done
if [[ -z "${ANDROID_HOME:-}${ANDROID_SDK_ROOT:-}" ]]; then
  echo "Android SDK not found. Set ANDROID_HOME or ANDROID_SDK_ROOT after installing the SDK." >&2
  exit 2
fi

npm install
if [[ ! -d android ]]; then
  npx cap add android
fi
npx cap sync android
if [[ -x android/gradlew ]]; then
  (cd android && ./gradlew assembleDebug)
else
  echo "Capacitor Android Gradle wrapper missing after sync." >&2
  exit 3
fi
APK="$ROOT/android/app/build/outputs/apk/debug/app-debug.apk"
if [[ -f "$APK" ]]; then
  echo "Debug APK created: $APK"
else
  echo "Build command completed but APK not found at expected path: $APK" >&2
  exit 4
fi
