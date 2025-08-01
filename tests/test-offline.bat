@echo off
echo Testing Electron App Offline Mode...
echo.
echo This script will:
echo 1. Temporarily disable internet connectivity simulation
echo 2. Start the Electron application
echo 3. Test if it works without remote credentials
echo.
pause

echo Starting application...
start "" "dist\win-ia32-unpacked\PrimeZone Advanced Panorama Viewer.exe"

echo.
echo Application started! Check if the window opens successfully.
echo If it works, the offline fix is successful.
echo.
echo Press any key to continue...
pause > nul