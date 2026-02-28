@echo off
echo Fixing DNS settings to allow Neon database connection...
echo.
echo This script requires Administrator privileges.
echo Please right-click and select "Run as administrator"
echo.
pause

REM Set DNS to Google for all active network adapters
netsh interface ip set dns "Wi-Fi" static 8.8.8.8 primary
netsh interface ip add dns "Wi-Fi" 8.8.4.4 index=2

netsh interface ip set dns "Ethernet" static 8.8.8.8 primary
netsh interface ip add dns "Ethernet" 8.8.4.4 index=2

REM Flush DNS cache
ipconfig /flushdns

echo.
echo DNS settings updated successfully!
echo Please restart your terminal and try again.
pause
