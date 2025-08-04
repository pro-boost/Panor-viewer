@echo off
REM Batch script to build Electron app on Windows without symbolic link issues
REM This script resolves Windows-specific permission issues with electron-builder

echo Setting up Windows-safe Electron build environment...

REM Disable code signing auto-discovery
set CSC_IDENTITY_AUTO_DISCOVERY=false

REM Disable Windows code signing
set WIN_CSC_LINK=
set WIN_CSC_KEY_PASSWORD=

REM Force disable code signing
set ELECTRON_BUILDER_ALLOW_UNRESOLVED_DEPENDENCIES=true

echo Clearing electron-builder cache...
set CACHE_DIR=%LOCALAPPDATA%\electron-builder\Cache
if exist "%CACHE_DIR%" (
    rmdir /s /q "%CACHE_DIR%" 2>nul
    if errorlevel 1 (
        echo Warning: Could not clear cache completely
    ) else (
        echo Cache cleared successfully
    )
)

echo Building Electron application...
npx electron-builder --config config/electron-builder.json --win --publish=never

if %errorlevel% equ 0 (
    echo Build completed successfully!
    echo Built files are in the 'dist-new' directory
) else (
    echo Build failed with exit code: %errorlevel%
    exit /b %errorlevel%
)

echo Windows-safe Electron build process completed!
pause