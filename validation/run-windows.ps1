param(
  [Parameter(Mandatory = $true)][string]$Tarball,
  [Parameter(Mandatory = $true)][string]$EvidenceDir
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$desktopUrl = 'https://github.com/anywhere-labs/deepseek-harness-desktop/releases/download/v2.0.2/DSH-Desktop-2.0.2-x64-Setup.exe'
$desktopSha256 = 'b31f63f8cf70d3fc07ed2ae36e5de7b1939e604bdb3be097de3383a82a06a787'
$installer = Join-Path $env:RUNNER_TEMP 'DSH-Desktop-2.0.2-x64-Setup.exe'
$installDir = Join-Path $env:RUNNER_TEMP 'dshdesktop'
$dshHome = Join-Path $env:RUNNER_TEMP 'dsh-home'
$playwrightRoot = Join-Path $env:RUNNER_TEMP 'playwright-core'
$appExe = Join-Path $installDir 'DSH Desktop.exe'
$resources = Join-Path $installDir 'resources\app.asar.unpacked'
$bootstrap = Join-Path $resources 'lib\desktop-cli.js'
$profileDir = Join-Path $dshHome 'profiles\desktop'
$settingsPath = Join-Path $dshHome 'settings.yaml'
$userDataDir = Join-Path $env:APPDATA 'DSH Desktop'
$runtimeCommands = Join-Path $userDataDir 'runtime-commands\bin'
$runtimePnpm = Join-Path $runtimeCommands 'pnpm.cmd'
$desktopDsh = Join-Path $userDataDir 'host-commands\desktop\bin\dsh.cmd'
$installRecoveryState = Join-Path $userDataDir 'plugin-install-recovery\state.json'
$env:DSH_HOME = $dshHome
$env:PLAYWRIGHT_CORE_ROOT = $playwrightRoot

New-Item -ItemType Directory -Force -Path $EvidenceDir, $dshHome | Out-Null

function Install-Desktop {
  & curl.exe -fL --retry 3 --retry-all-errors $desktopUrl -o $installer
  if ($LASTEXITCODE -ne 0) { throw 'Desktop installer download failed' }
  $actual = (Get-FileHash -Algorithm SHA256 $installer).Hash.ToLowerInvariant()
  if ($actual -ne $desktopSha256) { throw "Desktop installer SHA-256 $actual does not match $desktopSha256" }
  (Get-AuthenticodeSignature $installer | Format-List * | Out-String) | Set-Content -Encoding utf8 (Join-Path $EvidenceDir 'windows-authenticode.txt')
  $process = Start-Process -FilePath $installer -ArgumentList @('--updated', '/S', "/D=$installDir") -Wait -PassThru
  if ($process.ExitCode -ne 0 -or -not (Test-Path -LiteralPath $appExe)) {
    throw "Desktop installer exited $($process.ExitCode) or did not create $appExe"
  }
}

function Uninstall-Desktop {
  $uninstaller = Get-ChildItem -LiteralPath $installDir -Filter 'Uninstall*.exe' -File | Select-Object -First 1
  if ($null -eq $uninstaller) { throw 'Desktop uninstaller is missing' }
  $process = Start-Process -FilePath $uninstaller.FullName -ArgumentList '/S' -Wait -PassThru
  if ($process.ExitCode -ne 0 -or (Test-Path -LiteralPath $appExe)) {
    throw "Desktop uninstaller exited $($process.ExitCode) or left the application executable"
  }
}

function Stop-DesktopProcess([System.Diagnostics.Process]$Process) {
  if (-not $Process.HasExited) {
    Stop-Process -Id $Process.Id -Force -ErrorAction SilentlyContinue
  }
  $Process.WaitForExit()
}

function Initialize-DesktopRuntime {
  $stdout = Join-Path $EvidenceDir '00-bootstrap-desktop.stdout.log'
  $stderr = Join-Path $EvidenceDir '00-bootstrap-desktop.stderr.log'
  $process = Start-Process -FilePath $appExe -ArgumentList @('--remote-debugging-port=19221', '--disable-gpu') -PassThru -RedirectStandardOutput $stdout -RedirectStandardError $stderr
  try {
    $deadline = [DateTime]::UtcNow.AddSeconds(90)
    while ([DateTime]::UtcNow -lt $deadline) {
      $rendererReady = $false
      try {
        $targets = @(Invoke-RestMethod -Uri 'http://127.0.0.1:19221/json/list' -TimeoutSec 2)
        $rendererReady = @($targets | Where-Object { $_.url -match '^http://127\.0\.0\.1:\d+/' }).Count -gt 0
      } catch {
        $rendererReady = $false
      }
      if ($rendererReady -and (Test-Path -LiteralPath $runtimePnpm)
        -and (Test-Path -LiteralPath $desktopDsh)
        -and (Test-Path -LiteralPath (Join-Path $profileDir 'package.json'))) {
        return
      }
      if ($process.HasExited) { throw "Desktop exited $($process.ExitCode) before runtime bootstrap completed" }
      Start-Sleep -Milliseconds 250
    }
    throw 'Desktop did not materialize its runtime commands and desktop profile'
  } finally {
    Stop-DesktopProcess $process
  }
}

function Invoke-DesktopDsh([string[]]$Arguments) {
  $output = (& $desktopDsh @Arguments 2>&1 | Out-String)
  if ($LASTEXITCODE -ne 0) { throw "dsh $($Arguments -join ' ') failed:`n$output" }
  return $output.Trim()
}

function Assert-InstallRecovery([string]$Label) {
  if (-not (Test-Path -LiteralPath $installRecoveryState)) {
    throw "Desktop CLI did not create its install recovery WAL after $Label"
  }
  $state = Get-Content -LiteralPath $installRecoveryState -Raw | ConvertFrom-Json
  if ($state.profileName -ne 'desktop' -or $state.phase -ne 'awaiting-restart') {
    throw "Unexpected install recovery state after $Label`: $($state | ConvertTo-Json -Compress)"
  }
  Copy-Item -LiteralPath $installRecoveryState -Destination (Join-Path $EvidenceDir "$Label-install-recovery.json") -Force
}

function Prepare-Fixture {
  $packageJson = (& node -e "const{createRequire}=require('node:module');const{join}=require('node:path');console.log(createRequire(join(process.argv[1],'package.json')).resolve('@kirkchinese/dsh-citeciter/package.json'))" $profileDir).Trim()
  if ($LASTEXITCODE -ne 0) { throw 'failed to resolve the installed CiteCiter package' }
  $devDir = Join-Path (Split-Path -Parent $packageJson) 'dev'
  New-Item -ItemType Directory -Force -Path $devDir | Out-Null
  Copy-Item -Force (Join-Path $PSScriptRoot '..\packages\citeciter\dev\fake-llm.mjs') (Join-Path $devDir 'fake-llm.mjs')
  @'
- insert:
    - id: citeciter-fixture-llm
      name: ./node_modules/@kirkchinese/dsh-citeciter/dev/fake-llm.mjs
'@ | Set-Content -Encoding utf8 (Join-Path $profileDir 'cordis.patch.yml')
}

function Set-DesktopSettings([string]$Mode, [int]$Port) {
  @"
dsh-desktop:
  mode: $Mode
  port: $Port
"@ | Set-Content -Encoding utf8 $settingsPath
}

function Run-Ui([int]$DebugPort, [string]$Action, [string]$ExpectedPort, [string]$Label) {
  $stdout = Join-Path $EvidenceDir "$Label-desktop.stdout.log"
  $stderr = Join-Path $EvidenceDir "$Label-desktop.stderr.log"
  $process = Start-Process -FilePath $appExe -ArgumentList @("--remote-debugging-port=$DebugPort", '--disable-gpu') -PassThru -RedirectStandardOutput $stdout -RedirectStandardError $stderr
  try {
    & node (Join-Path $PSScriptRoot 'desktop-ui.mjs') "http://127.0.0.1:$DebugPort" $Action $ExpectedPort (Join-Path $EvidenceDir "$Label.json") (Join-Path $EvidenceDir "$Label.png")
    if ($LASTEXITCODE -ne 0) { throw "Desktop UI validation $Label failed" }
  } finally {
    Stop-DesktopProcess $process
  }
}

Install-Desktop
try {
  Set-DesktopSettings 'compatibility' 43189
  Initialize-DesktopRuntime
  $env:Path = "$runtimeCommands;$env:Path"
  $resolvedPnpm = (Get-Command pnpm -CommandType Application).Source
  if (-not [string]::Equals($resolvedPnpm, $runtimePnpm, [StringComparison]::OrdinalIgnoreCase)) {
    throw "pnpm resolved to $resolvedPnpm instead of Desktop runtime $runtimePnpm"
  }
  $dshShim = Get-Content -LiteralPath $desktopDsh -Raw
  if (-not $dshShim.Contains('set "DSH_DESKTOP_DEFAULT_PROFILE=desktop"')
    -or -not $dshShim.Contains("set `"DSH_DESKTOP_INSTALL_RECOVERY_STATE_PATH=$installRecoveryState`"")) {
    throw 'Desktop generated dsh.cmd without its default profile or recovery WAL hand-off'
  }
  Copy-Item -LiteralPath $desktopDsh -Destination (Join-Path $EvidenceDir 'windows-dsh.cmd.txt') -Force
  @("DSH_COMMAND=$desktopDsh", "DEFAULT_PROFILE=desktop", "INSTALL_RECOVERY_STATE=$installRecoveryState", "PATH[0]=$runtimeCommands") |
    Set-Content -Encoding utf8 (Join-Path $EvidenceDir 'windows-runtime-environment.txt')

  $env:ELECTRON_RUN_AS_NODE = '1'
  $nodeVersion = (& $appExe -p 'process.version').Trim()
  $pnpmVersion = (& pnpm '--version').Trim()
  Remove-Item Env:ELECTRON_RUN_AS_NODE -ErrorAction SilentlyContinue
  $dshVersion = Invoke-DesktopDsh @('--version')
  @("Node $nodeVersion", "pnpm $pnpmVersion", "DSH $dshVersion") | Set-Content -Encoding utf8 (Join-Path $EvidenceDir 'windows-runtime-versions.txt')
  if ($pnpmVersion -ne '11.7.0' -or $dshVersion -notmatch '0\.1\.1-rc\.2') { throw 'packaged runtime versions are not Desktop 2.0.2 / DSH rc.2' }

  Invoke-DesktopDsh @('plugin', 'add', '@kirkchinese/dsh-citeciter@0.4.0') | Set-Content -Encoding utf8 (Join-Path $EvidenceDir 'install-0.4.0.txt')
  Assert-InstallRecovery '0.4.0'
  Prepare-Fixture
  & node (Join-Path $PSScriptRoot '..\packages\citeciter\dev\seed-smoke-session.mjs') $dshHome $profileDir | Set-Content -Encoding utf8 (Join-Path $EvidenceDir 'seed.json')
  if ($LASTEXITCODE -ne 0) { throw 'source Session seed failed' }
  Set-DesktopSettings 'compatibility' 43189
  Run-Ui 19222 'create-compatibility' '43189' '01-compatibility-0.4.0'

  $candidateTarball = (Resolve-Path -LiteralPath $Tarball).Path
  Invoke-DesktopDsh @('plugin', 'add', $candidateTarball) | Set-Content -Encoding utf8 (Join-Path $EvidenceDir 'upgrade-0.4.1.txt')
  Assert-InstallRecovery 'candidate-upgrade'
  Prepare-Fixture
  Invoke-DesktopDsh @('plugin', 'list', '--depth', '0') | Set-Content -Encoding utf8 (Join-Path $EvidenceDir 'candidate-list.txt')
  Invoke-DesktopDsh @('--dump-config') | Set-Content -Encoding utf8 (Join-Path $EvidenceDir 'candidate-dump-config.txt')
  Set-DesktopSettings 'compatibility' 43189
  Run-Ui 19223 'verify-compatibility' '43189' '02-candidate-compatibility'
  Set-DesktopSettings 'advanced' 43189
  Run-Ui 19224 'verify-advanced' '43189' '03-advanced-fixed'

  Set-DesktopSettings 'advanced' 0
  Run-Ui 19225 'verify-advanced' 'random' '04-advanced-random'

  Uninstall-Desktop
  if (-not (Test-Path -LiteralPath (Join-Path $dshHome 'citeciter'))) { throw 'Desktop uninstall removed CiteCiter Topic data' }
  Install-Desktop
  Set-DesktopSettings 'advanced' 43189
  Run-Ui 19226 'verify-advanced' '43189' '05-app-reinstall'

  Invoke-DesktopDsh @('plugin', 'remove', '@kirkchinese/dsh-citeciter') | Set-Content -Encoding utf8 (Join-Path $EvidenceDir 'plugin-remove.txt')
  if (-not (Test-Path -LiteralPath (Join-Path $dshHome 'citeciter'))) { throw 'plugin removal deleted Topic data' }
  Invoke-DesktopDsh @('plugin', 'add', $candidateTarball) | Set-Content -Encoding utf8 (Join-Path $EvidenceDir 'plugin-reinstall.txt')
  Assert-InstallRecovery 'candidate-reinstall'
  Prepare-Fixture
  Run-Ui 19227 'verify-advanced' '43189' '06-plugin-reinstall'
} finally {
  if (Test-Path -LiteralPath $appExe) { Uninstall-Desktop }
}
