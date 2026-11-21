# Third-Party Credits and Notices

This plugin was developed with the help of AI. The following projects and files informed its development. Their creators retain their respective rights.

## Corsair headset battery reference

- [SaifAqqad/corsair_battery_level](https://github.com/SaifAqqad/corsair_battery_level), especially its [`app.js`](https://github.com/SaifAqqad/corsair_battery_level/blob/master/app.js) and README, informed the HS70 Pro receiver approach and product ID used as a reference.
- SaifAqqad's README credits [mx0c/Corsair-Headset-Battery-Overlay](https://github.com/mx0c/Corsair-Headset-Battery-Overlay) as the earlier project it rewrote. We acknowledge that upstream lineage.
- The repositories above are linked as references; their source files and assets are not bundled here. The SaifAqqad repository does not list a license file, so this package does not redistribute its `app.js` or other source files.

## StreamDock SDK

- [MiraboxSpace/StreamDock-Plugin-SDK](https://github.com/MiraboxSpace/StreamDock-Plugin-SDK), including its [Node.js V2 example plugin](https://github.com/MiraboxSpace/StreamDock-Plugin-SDK/tree/main/SDNodeJsSDKV2), was used as a reference for StreamDock plugin structure and messaging.
- The repository provides the MIT license. A copy is included at [`LICENSES/MiraboxSpace-StreamDock-Plugin-SDK-MIT.txt`](LICENSES/MiraboxSpace-StreamDock-Plugin-SDK-MIT.txt).
- No SDK example source files are redistributed in this package.

## Bundled Node.js dependencies

The plugin bundle includes third-party dependencies with their license files alongside the packages in `plugin/node_modules`, including `@napi-rs/canvas` (MIT), `node-hid` (BSD), and `ws` (MIT).
