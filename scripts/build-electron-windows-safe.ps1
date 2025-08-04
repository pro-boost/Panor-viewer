# PowerShell script to build Electron app on Windows without symbolic link issues
# This script resolves Windows-specific permission issues with electron-builder

Write-Host "Setting up Windows-safe Electron build environment..." -ForegroundColor Green

# Disable code signing auto-discovery
$env:CSC_IDENTITY_AUTO_DISCOVERY = "false"

# Disable Windows code signing
$env:WIN_CSC_LINK = ""
$env:WIN_CSC_KEY_PASSWORD = ""

# Force disable code signing
$env:ELECTRON_BUILDER_ALLOW_UNRESOLVED_DEPENDENCIES = "true"

# Clear any existing electron-builder cache that might have symbolic link issues
Write-Host "Clearing electron-builder cache..." -ForegroundColor Yellow
$cacheDir = "$env:LOCALAPPDATA\electron-builder\Cache"
if (Test-Path $cacheDir) {
    try {
        Remove-Item -Recurse -Force $cacheDir -ErrorAction Stop
        Write-Host "Cache cleared successfully" -ForegroundColor Green
    } catch {
        Write-Host "Warning: Could not clear cache completely: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

# Build the application
Write-Host "Building Electron application..." -ForegroundColor Green
try {
    # Use electron-builder with explicit configuration
    npx electron-builder --config config/electron-builder.json --win --publish=never
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Build completed successfully!" -ForegroundColor Green
        Write-Host "Built files are in the 'dist-new' directory" -ForegroundColor Cyan
    } else {
        Write-Host "Build failed with exit code: $LASTEXITCODE" -ForegroundColor Red
        exit $LASTEXITCODE
    }
} catch {
    Write-Host "Build failed with error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "Windows-safe Electron build process completed!" -ForegroundColor Green