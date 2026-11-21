# Corsair HS70 Pro Battery for AJAZZ/MiraBox StreamDock

An unofficial Windows plugin that reads the battery level and wireless connection status reported by a Corsair HS70 Pro Wireless headset through its USB receiver, then displays them on a StreamDock key.

## Features

- **Three display styles:** Percentage text, Battery with percentage, and Charge level icons.
- **Windows font picker:** choose a font installed on Windows.
- **Separate text sizing:** percentage text from 12–44 px and the ON/OFF connection label from 10–32 px.
- **Separate colors:** choose one color for the percentage and another for the ON/OFF label.
- **Text styling:** bold, italic, and underline.
- **Small-display rendering:** the key image is rendered at 128 × 128 pixels.

## Download and install

1. Download the latest ZIP from [Releases](https://github.com/rayman2550/corsair-hs70-pro-streamdock-plugin/releases/latest).
2. Extract the ZIP.
3. Run install.ps1, or copy the included .sdPlugin folder to `%APPDATA%\HotSpot\StreamDock\plugins\`.
4. Restart Stream Dock and add **Corsair Headset Battery** to a key.
5. Open the key settings to choose a display style and adjust the font and colors.

## Requirements

- Windows 10 or later
- Stream Dock 3.10.188.226 or later
- Corsair HS70 Pro Wireless USB receiver connected

## Notes

- Battery level and connection state reflect what the headset receiver reports. Charging state is not currently shown separately.
- If another app has exclusive access to the USB receiver, close it and restart Stream Dock.
- The package includes THIRD-PARTY-NOTICES.md and dependency license files. The Corsair reference projects are credited and linked; their source files are not bundled.

## Screenshots

Screenshots of the display styles and settings panel will be added here.

## Credits

- Receiver reference: [SaifAqqad/corsair_battery_level](https://github.com/SaifAqqad/corsair_battery_level), which credits [mx0c/Corsair-Headset-Battery-Overlay](https://github.com/mx0c/Corsair-Headset-Battery-Overlay).
- StreamDock structure reference: [MiraboxSpace/StreamDock-Plugin-SDK](https://github.com/MiraboxSpace/StreamDock-Plugin-SDK).
- See THIRD-PARTY-NOTICES.md in the download package for details.

## Disclaimer

This plugin was coded with the help of AI. It is an unofficial community project and is not affiliated with or endorsed by Corsair, MiraBox, or AJAZZ. Please review and test it with your own setup before relying on it.
