# Build Sugar Spark APK using Android Studio (Windows)

## 1. Install tools
1. Install Android Studio from the official Android developer site.
2. During setup, install Android SDK, Android SDK Platform, Android SDK Build-Tools, Platform Tools, and Android Emulator (optional).
3. Install Node.js 22 LTS.
4. Install JDK 17 (recommended for Capacitor Android / Gradle compatibility).

## 2. Extract project
Extract this project ZIP to a writable folder such as `C:\Games\SugarSpark`. Open PowerShell in that folder and confirm:
```powershell
node --version
npm --version
java -version
```

## 3. Install SDK packages in Android Studio
Open Android Studio > More Actions > SDK Manager (or Tools > SDK Manager).
- **SDK Platforms:** install Android 15 / API 35 (or the project's required platform if Gradle requests another).
- **SDK Tools:** ensure Android SDK Build-Tools, Android SDK Platform-Tools, Android SDK Command-line Tools (latest), and Android SDK tools are selected.
Click Apply and accept licenses.

## 4. Build debug APK
From PowerShell in the project folder:
```powershell
npm install
npx cap add android
npx cap sync android
cd android
.\gradlew.bat assembleDebug
```
If `android` already exists, skip `npx cap add android` and use `npx cap sync android`.

## 5. Find APK
Successful build output:
`android\app\build\outputs\apk\debug\app-debug.apk`
Copy that APK to your Android phone and install it. Android may prompt to allow installing apps from that source; only allow if you trust the APK.

## 6. Troubleshooting
- If Java is incompatible, use JDK 17 and set `JAVA_HOME` to its install directory.
- If Gradle says a platform/build-tools package is missing, install it via SDK Manager.
- If SDK is not detected, set `ANDROID_HOME` and `ANDROID_SDK_ROOT` to the SDK Location displayed in SDK Manager.
- If Windows blocks the Gradle wrapper, unblock the project folder or use `./gradlew.bat` in PowerShell.
- If npm or Gradle downloads fail, check internet/proxy access.

## 7. Alternative: GitHub Actions cloud build
This ZIP includes `.github/workflows/android-apk.yml`.
1. Create a GitHub repository.
2. Upload and commit the project files, including the workflow.
3. Push to `main` or `master`.
4. Open GitHub > Actions > **Sugar Spark Android Debug APK**.
5. Wait for the workflow to finish successfully.
6. Open the run and download the `Sugar-Spark-debug-apk` artifact.

This requires a GitHub account and internet access on GitHub-hosted runners. This workflow has not been executed from this environment, so its output is not verified.
