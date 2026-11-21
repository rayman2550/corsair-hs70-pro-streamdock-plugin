# Corsair HS70 Pro Battery for AJAZZ/MiraBox StreamDock

An unofficial Windows plugin that reads the battery level and wireless connection status reported by a Corsair HS70 Pro Wireless headset through its USB receiver, then displays them on a StreamDock key.

## Features

- **Three display styles:** Percentage text, Battery with percentage, and Charge level icons.
- **Windows font picker:** choose a font installed on Windows.
- **Separate text sizing:** percentage text from 12–44 px and the ON/OFF connection label from 10–32 px.
- **Separate colors:** choose one color for the percentage and another for the ON/OFF label.
- **Text styling:** bold, italic, and underline.
- **Small-display rendering:** the key image is rendered at 128 × 128 pixels.

## How to install

### Recommended: use the included installer

1. Download the ZIP from [the latest release](https://github.com/rayman2550/corsair-hs70-pro-streamdock-plugin/releases/latest).
2. In File Explorer, right-click the ZIP and choose **Extract All**.
3. Open the extracted folder, then open `com.codex.streamdock.corsairbattery.sdPlugin`.
4. Right-click `install.ps1` and choose **Run with PowerShell**. The installer copies the plugin into your Stream Dock plugins folder under your Windows user profile; administrator rights should not be needed.
5. Restart Stream Dock.
6. Drag **Corsair Headset Battery** onto a key. Select the key to open its settings and choose a display style, font, colors, text sizes, and styling.

### Manual installation

1. Extract the release ZIP.
2. Copy the entire `com.codex.streamdock.corsairbattery.sdPlugin` folder to `%APPDATA%\HotSpot\StreamDock\plugins\`. Do not copy only the files inside it.
3. Restart Stream Dock and add **Corsair Headset Battery** to a key.

### Uninstall

Close Stream Dock, delete `com.codex.streamdock.corsairbattery.sdPlugin` from `%APPDATA%\HotSpot\StreamDock\plugins\`, then reopen Stream Dock.

## Requirements

- Windows 10 or later
- Stream Dock 3.10.188.226 or later
- Corsair HS70 Pro Wireless USB receiver connected

## Notes

- Battery level and connection state reflect what the headset receiver reports. Charging state is not currently shown separately.
- If another app has exclusive access to the USB receiver, close it and restart Stream Dock.
- The package includes THIRD-PARTY-NOTICES.md and dependency license files. The Corsair reference projects are credited and linked; their source files are not bundled.

## Screenshots

<img width="548" height="822" alt="1" src="https://github.com/user-attachments/assets/c363d8e6-0bbd-4048-bd84-293b5a42d605" />
<img width="568" height="806" alt="2" src="https://github.com/user-attachments/assets/212135e6-461d-49c0-8d68-5e52b172dfea" />
<img width="562" height="814" alt="3" src="https://github.com/user-attachments/assets/82e7f748-376c-4261-90d3-3d5f8e54e53c" />

## Credits

- Receiver reference: [SaifAqqad/corsair_battery_level](https://github.com/SaifAqqad/corsair_battery_level), which credits [mx0c/Corsair-Headset-Battery-Overlay](https://github.com/mx0c/Corsair-Headset-Battery-Overlay).
- StreamDock structure reference: [MiraboxSpace/StreamDock-Plugin-SDK](https://github.com/MiraboxSpace/StreamDock-Plugin-SDK).
- See THIRD-PARTY-NOTICES.md in the download package for details.

## Disclaimer

This plugin was coded with the help of AI. It is an unofficial community project and is not affiliated with or endorsed by Corsair, MiraBox, or AJAZZ. Please review and test it with your own setup before relying on it.
