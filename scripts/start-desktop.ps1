param(
    [string]$DshHome = (Join-Path $env:USERPROFILE '.dsh-citeciter-desktop'),
    [string]$DesktopExe = (Join-Path $env:LOCALAPPDATA 'Programs/DSH Desktop/DSH Desktop.exe')
)

$ErrorActionPreference = 'Stop'
if (-not (Test-Path -LiteralPath $DesktopExe -PathType Leaf)) {
    throw "DSH Desktop was not found at $DesktopExe. Install Desktop 2.0.5 or pass -DesktopExe."
}
if (-not (Test-Path -LiteralPath (Join-Path $DshHome 'profiles/desktop/package.json') -PathType Leaf)) {
    throw "Install CiteCiter into the desktop profile under $DshHome before launching. See README.md."
}

$previousDshHome = $env:DSH_HOME
try {
    $env:DSH_HOME = [System.IO.Path]::GetFullPath($DshHome)
    Start-Process -FilePath $DesktopExe -WindowStyle Hidden
    Write-Output "Started DSH Desktop with data in $env:DSH_HOME"
} finally {
    if ($null -eq $previousDshHome) {
        Remove-Item Env:DSH_HOME -ErrorAction SilentlyContinue
    } else {
        $env:DSH_HOME = $previousDshHome
    }
}
