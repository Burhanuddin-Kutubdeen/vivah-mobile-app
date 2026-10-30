# Build and deploy to connected Android device
param(
    [string]$HostIP = "192.168.8.186",
    [int]$Port = 3000
)

Write-Host "=== Building web app ===" -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host "=== Syncing to Android ===" -ForegroundColor Cyan
npx cap sync android
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host "=== Running Gradle build ===" -ForegroundColor Cyan
Set-Location android
.\gradlew.bat assembleDebug
if ($LASTEXITCODE -ne 0) { Set-Location ..; exit 1 }
Set-Location ..

Write-Host "=== Installing APK on device ===" -ForegroundColor Cyan
$apkPath = "android\app\build\outputs\apk\debug\app-debug.apk"
adb install -r $apkPath
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host "=== Launching app ===" -ForegroundColor Cyan
adb shell monkey -p lk.vivah.app -c android.intent.category.LAUNCHER 1

Write-Host "=== Done! App is running on your device ===" -ForegroundColor Green
