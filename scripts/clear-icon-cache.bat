@echo off
echo Clearing Windows icon cache...

:: Stop Windows Explorer
taskkill /f /im explorer.exe

:: Clear icon cache files
del /a /q "%localappdata%\IconCache.db"
del /a /f /q "%localappdata%\Microsoft\Windows\Explorer\iconcache*"

:: Clear thumbnail cache
del /f /s /q "%LocalAppData%\Microsoft\Windows\Explorer\thumbcache_*.db"

:: Wait a moment
timeout /t 2 /nobreak > nul

:: Restart Windows Explorer
start explorer.exe

:: Force icon refresh
ie4uinit.exe -show

echo Icon cache cleared successfully!
pause