# Build production release AAB for Google Play Store
Write-Host "=== Building web app (production) ===" -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host "=== Syncing to Android ===" -ForegroundColor Cyan
npx cap sync android
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host "=== Building Release AAB ===" -ForegroundColor Cyan
Set-Location android
.\gradlew.bat bundleRelease
if ($LASTEXITCODE -ne 0) { Set-Location ..; exit 1 }
Set-Location ..

$aabPath = "android\app\build\outputs\bundle\release\app-release.aab"
Write-Host "`n=== Release AAB built successfully! ===" -ForegroundColor Green
Write-Host "Output: $aabPath" -ForegroundColor Yellow
Write-Host "`nUpload this file to Google Play Console:" -ForegroundColor Cyan
Write-Host "https://play.google.com/console" -ForegroundColor Yellow
