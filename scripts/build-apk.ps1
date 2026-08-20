#!/usr/bin/env pwsh
# Build APK end-to-end: vite build → cap sync → gradle assembleRelease
# Requires:
#   - Node.js 18+
#   - Java JDK 21 at $env:JAVA_HOME (or system PATH)
#   - Android SDK at $env:ANDROID_HOME (or system PATH)

$ErrorActionPreference = "Stop"

$ProjectRoot = Split-Path -Parent $PSCommandPath
$ProjectRoot = Split-Path -Parent $ProjectRoot
Set-Location $ProjectRoot

$Env:JAVA_HOME = "C:\Program Files\Java\jdk-21"
$Env:ANDROID_HOME = $Env:ANDROID_HOME ?? "C:\Users\lethb\AppData\Local\Android\Sdk"
$Env:ANDROID_SDK_ROOT = $Env:ANDROID_SDK_ROOT ?? $Env:ANDROID_HOME
$Env:Path = "$Env:JAVA_HOME\bin;$Env:ANDROID_HOME\platform-tools;$Env:Path"

Write-Host "[1/3] Building web app..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) { throw "vite build failed" }

Write-Host "[2/3] Syncing Capacitor..." -ForegroundColor Cyan
npx cap sync android
if ($LASTEXITCODE -ne 0) { throw "cap sync failed" }

Write-Host "[3/3] Building APK with Gradle..." -ForegroundColor Cyan
Push-Location android
& ".\gradlew.bat" assembleRelease
if ($LASTEXITCODE -ne 0) { Pop-Location; throw "gradle build failed" }
Pop-Location

$Apk = Join-Path $ProjectRoot "android\app\build\outputs\apk\release\app-release.apk"
if (Test-Path $Apk) {
    $Size = [math]::Round((Get-Item $Apk).Length / 1MB, 2)
    Write-Host ""
    Write-Host "APK READY: $Apk ($Size MB)" -ForegroundColor Green
    Write-Host "Install with: adb install -r `"$Apk`"" -ForegroundColor Yellow
} else {
    throw "APK not found at $Apk"
}
