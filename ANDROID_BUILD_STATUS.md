# Android APK build status

## Current environment result

The debug APK build could not be executed in the current build environment. Android SDK tools (`sdkmanager`, `adb`, `gradle`) are not installed, and outbound DNS/network access is unavailable (attempt to reach Google's Android download host failed with `Could not resolve host`). The Capacitor dependencies are also not present locally, so an Android native project cannot be generated offline here.


## Build on a computer with Android tooling

Requirements:
- Node.js LTS and npm
- Java JDK 17 (Capacitor Android 6-compatible)
- Android Studio / Android SDK
- Android SDK platform and build-tools installed
- `ANDROID_HOME` or `ANDROID_SDK_ROOT` set to the SDK directory


### Linux/macOS

From this project folder:

```bash
npm install
bash scripts/build-android-debug.sh
```

The script installs npm dependencies, creates the Capacitor Android platform project if absent, syncs the game files, builds the debug APK, and checks for the APK at:

`android/app/build/outputs/apk/debug/app-debug.apk`

### Windows PowerShell

```powershell
npm install
.\scripts\build-android-debug.ps1
```

The debug APK is unsigned for Play Store release purposes but debug builds are signed automatically with the Android debug key and can be installed for testing. For Google Play, create and protect your own release keystore, configure release signing securely (do not commit secrets), and build a release APK/AAB using Android Studio/Gradle.


## Build verification checklist

After build, verify the APK with Android SDK tools:

```bash
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
adb shell monkey -p com.sugarspark.game 1
```

Confirm the app opens, orientation/viewport are suitable for portrait, touch input works, localStorage progress survives force-stop/relaunch, and offline launch works after initial installation. These device checks have **not** been performed in this environment.
