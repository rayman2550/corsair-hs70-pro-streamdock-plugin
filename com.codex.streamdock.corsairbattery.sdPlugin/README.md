# Corsair Headset Battery for StreamDock

An unofficial Windows StreamDock plugin that displays the battery percentage and wireless connection status of a Corsair HS70 Pro Wireless headset. Choose plain percentage text, a battery graphic, or charge-level bars, then customize the Windows font, separate percentage and connection-label colors, bold, italic, underline, and the sizes of both text elements.

## Features

- Shows the headset connection state (`ON`, `OFF`, or a status while checking) and reported battery percentage.
- Offers percentage, battery graphic, and charge-bar display modes.
- Uses installed Windows fonts, with separate percentage and connection-label colors, bold, italic, underline, and separate size controls.
- Renders a 128 × 128 key image with antialiased text sized for the small StreamDock display.

## Requirements

- Windows 10 or later
- Stream Dock 3.10.188.226 or later (uses the application's built-in Node.js 20 runtime)
- Corsair HS70 Pro Wireless USB receiver connected

## Install

Extract the package and run `install.ps1`, or copy the whole `.sdPlugin` folder into:

```text
%APPDATA%\HotSpot\StreamDock\plugins\
```

Restart Stream Dock, then drag **Corsair Headset Battery** onto a key. Open its settings to choose the display mode, font, color, and text sizes.

## Notes

- The receiver reader follows the approach and product ID (`0x0A4F`) from the open-source [Corsair battery utility](https://github.com/SaifAqqad/corsair_battery_level).
- The percentage is the value reported by the headset. Charging state is not currently shown separately.
- The plugin checks for the receiver every five seconds. If another application has exclusive access to the receiver, close that application and restart Stream Dock.

## Disclaimer

This plugin was coded with the help of AI. It is an unofficial community project and is not affiliated with or endorsed by Corsair, MiraBox, or AJAZZ. Please review the code and test it with your own headset and StreamDock setup before relying on it.

See [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md) for source credits and bundled dependency license details.
