$ErrorActionPreference = 'Stop'
$pluginFolder = Split-Path -Parent $MyInvocation.MyCommand.Path
$pluginsFolder = Join-Path $env:APPDATA 'HotSpot\StreamDock\plugins'
New-Item -ItemType Directory -Path $pluginsFolder -Force | Out-Null
Copy-Item -LiteralPath $pluginFolder -Destination $pluginsFolder -Recurse -Force
Write-Host "Installed Corsair Headset Battery to $pluginsFolder"
Write-Host 'Restart Stream Dock, then add Corsair Headset Battery to a key.'
