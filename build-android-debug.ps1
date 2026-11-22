$ErrorActionPreference = 'Stop'
Set-Location (Join-Path $PSScriptRoot '..')
foreach ($tool in @('node','npm','java')) {
  if (-not (Get-Command $tool -ErrorAction SilentlyContinue)) { throw "Missing required tool: $tool" }
}
if (-not ($env:ANDROID_HOME -or $env:ANDROID_SDK_ROOT)) { throw 'Android SDK not found. Set ANDROID_HOME or ANDROID_SDK_ROOT.' }
npm install
if (-not (Test-Path 'android')) { npx cap add android }
npx cap sync android
if (-not (Test-Path 'android/gradlew')) { throw 'Gradle wrapper missing after Capacitor sync.' }
Push-Location android
try { .\gradlew.bat assembleDebug } finally { Pop-Location }
$apk = Join-Path (Get-Location) 'android/app/build/outputs/apk/debug/app-debug.apk'
if (Test-Path $apk) { Write-Host "Debug APK created: $apk" } else { throw "Build completed but APK not found: $apk" }
