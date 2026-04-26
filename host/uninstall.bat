@echo off
set "REG_KEY=HKCU\Software\Mozilla\NativeMessagingHosts\youtube_mpv"

reg delete "%REG_KEY%" /f

if %ERRORLEVEL% equ 0 (
    echo Successfully removed youtube_mpv host from Firefox registry.
) else (
    echo Failed to remove the host or it was not installed.
)

pause
