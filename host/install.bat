@echo off
set "REG_KEY=HKCU\Software\Mozilla\NativeMessagingHosts\youtube_mpv"

:: Get the absolute path to the manifest file
:: ~dp0 gets the directory path of the script including the trailing backslash
set "MANIFEST_PATH=%~dp0youtube_mpv.json"

:: Replace single backslashes with double backslashes (Optional but sometimes preferred for JSON paths inside bat, but reg.exe handles normal paths fine)
:: Actually reg add works best with normal backslashes.

reg add "%REG_KEY%" /ve /d "%MANIFEST_PATH%" /f

if %ERRORLEVEL% equ 0 (
    echo Successfully registered youtube_mpv host with Firefox.
) else (
    echo Failed to register the host. Please try running as Administrator if it failed.
)

pause
