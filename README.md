# Firefox YouTube MPV

Firefox extension to right-click and open YouTube videos directly in the local `mpv` player via Native Messaging.

Only on Windows.

## Prerequisites
- **mpv**: Added to your system `PATH`
- **Node.js**: Installed to run the native host script

## Installation
1. Run `host/install.bat` to register the native messaging host.
2. In Firefox, go to `about:debugging#/runtime/this-firefox`.
3. Click **"Load Temporary Add-on..."** and select `extension/manifest.json`.

## Usage
Go to YouTube and right-click on a video link, the tab itself, or the page background, then select the "Open in MPV" context menu option.

## Packaging
To package this extension into a deployable `.zip` file for Mozilla signing or distribution, navigate to the `extension/` directory and run:
`npx web-ext build`

## Uninstallation
1. Remove the extension from Firefox via the `about:addons` page.
2. Run `host/uninstall.bat` to unregister the host.
