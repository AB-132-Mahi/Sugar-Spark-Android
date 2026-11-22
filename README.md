# Sugar Spark 2.0 — Android-first Match-3 project

This is an incremental upgrade of the supplied Sugar Spark browser game. The original JavaScript game engine and first 30 target-score values remain in place. The working copy has been upgraded; the original ZIP was not modified.


## Run in a browser

- Open `index.html` in a modern browser. Some offline/PWA functionality requires serving over localhost/HTTPS.
- Recommended: `python -m http.server 8000`, then open `http://localhost:8000`.
- Run regression tests: `node tests.js` or `npm test`.


## Android wrapper setup (APK/AAB build not performed here)

This project includes Capacitor configuration as a starting point. Native Android project generation/build needs Android Studio, SDK, Gradle, and dependencies downloaded on your machine:


1. Install Node.js LTS and Android Studio (including SDK + build tools).
2. From this folder run `npm install`.
3. Run `npm run android:add` (only once to create the native Android project).
4. Run `npm run android:sync`.
5. Run `npm run android:open`, then use Android Studio to run on a device/emulator or generate APK/AAB.
6. Configure app signing in Android Studio/Gradle before publishing. Do not commit signing keys.


## What changed in this upgrade

- Updated Sugar Spark branding to 2.0 in the UI.
- Added World/Level HUD, current-world map panel, level chips for the current 30-level world, and selection for unlocked levels.
- Retained original level target values for levels 1–30.
- Added scalable target-score progression and world numbering through level 1000 (34 worlds; the last world is partial).
- Expanded local save to version 2, retaining the existing `sugarSparkSave` key and legacy `level`, `unlocked`, and `best` values. Additional per-level best scores, stars, and sound preference are saved.
- Added web app manifest and basic service-worker shell caching for offline use when hosted appropriately.
- Added automated progression tests alongside original engine tests.

## Current game scope and honest limitations

- The 8x8 Match-3 board, cascades, invalid-swap rollback, striped candy and color-bomb effects are inherited from the original project.
- Levels 1–30 retain their original score targets. Levels 31–1000 are generated target-score progression, not 970 hand-designed levels. There are not yet level-specific objectives, obstacle layouts, or new mechanics.
- The level panel is a current-world list, not a fully illustrated winding adventure map.
- The sound button is a preference toggle only; no music or sound assets/audio playback are included.
- Booster inventory, daily rewards, achievements, character animation, secure email/phone authentication, account linking, backend/cloud saves, conflict resolution, and production login are not implemented. No fake authentication flows are included.
- PWA manifest has no icon artwork yet; a polished install experience requires original icon assets.
- No APK or AAB has been built in this environment. Native Android project generation and device/emulator testing remain to be performed locally.
- The browser game persists progress locally through localStorage; offline play does not synchronize between devices.

## Save compatibility

The upgraded code reads the original `sugarSparkSave` JSON keys (`level`, `unlocked`, `best`). The expanded save writes a version marker and additional per-level data while retaining those original keys. Reset remains available through the reset button and is destructive by design.

## QA status

See `QA_REPORT.md` for test commands, outcomes, and unperformed checks.

## Android APK build

Android build prerequisites and verified limitations are in `ANDROID_BUILD_STATUS.md`.

- Linux/macOS: `bash scripts/build-android-debug.sh`
- Windows PowerShell: `./scripts/build-android-debug.ps1`

The build scripts require Node/npm, Java, and an installed Android SDK. They create/sync the Capacitor Android wrapper and attempt a debug APK build.
