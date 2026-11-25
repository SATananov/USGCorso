[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)] [string] $CandidateApk,
  [string] $PackageId = 'com.usgcorso.mobile',
  [string] $DeviceSerial
)

$ErrorActionPreference = 'Stop'

function Resolve-AndroidDeviceSerial {
  param(
    [string] $RequestedSerial,
    [string[]] $DeviceOutput = @()
  )

  if (-not [string]::IsNullOrWhiteSpace($RequestedSerial)) {
    return $RequestedSerial.Trim()
  }

  $devices = @(
    foreach ($line in $DeviceOutput) {
      if ($line -match '^\s*(?<serial>\S+)\s+(?<state>\S+)\s*$') {
        [pscustomobject]@{
          Serial = $Matches.serial
          State = $Matches.state
        }
      }
    }
  )

  if ($devices.Count -eq 0) {
    throw 'No Android devices were found. Connect one device or specify -DeviceSerial.'
  }
  if ($devices.Count -gt 1) {
    throw 'Multiple Android devices were found. Specify -DeviceSerial to choose one.'
  }
  if ($devices[0].State -ne 'device') {
    throw "The only Android device is not ready (state: $($devices[0].State))."
  }

  return $devices[0].Serial
}

$candidate = (Resolve-Path -LiteralPath $CandidateApk -ErrorAction Stop).Path
$adbCommand = Get-Command adb -ErrorAction Stop
$selectedSerial = $DeviceSerial
if ([string]::IsNullOrWhiteSpace($selectedSerial)) {
  $deviceOutput = & $adbCommand.Source devices 2>&1
  if ($LASTEXITCODE -ne 0) { throw 'Could not list Android devices through ADB.' }
  $selectedSerial = Resolve-AndroidDeviceSerial -DeviceOutput $deviceOutput
} else {
  $selectedSerial = Resolve-AndroidDeviceSerial -RequestedSerial $selectedSerial
}

$sdkRoot = if ($env:ANDROID_SDK_ROOT) { $env:ANDROID_SDK_ROOT } elseif ($env:ANDROID_HOME) { $env:ANDROID_HOME } else { Split-Path -Parent (Split-Path -Parent $adbCommand.Source) }
$buildTools = Join-Path $sdkRoot 'build-tools'
$apksigner = Get-ChildItem -LiteralPath $buildTools -Directory -ErrorAction Stop |
  Sort-Object { try { [version]$_.Name } catch { [version]'0.0' } } -Descending |
  ForEach-Object { Join-Path $_.FullName 'apksigner.bat' } |
  Where-Object { Test-Path -LiteralPath $_ } |
  Select-Object -First 1
if (-not $apksigner) { throw 'Android SDK apksigner was not found.' }

function Get-CertificateDigests([string] $ApkPath) {
  $output = & $apksigner verify --print-certs $ApkPath 2>&1 | Out-String
  if ($LASTEXITCODE -ne 0) { throw 'APK signature verification failed.' }
  $digests = [regex]::Matches($output, 'certificate SHA-256 digest:\s*([0-9a-fA-F]+)') |
    ForEach-Object { $_.Groups[1].Value.ToUpperInvariant() } |
    Sort-Object -Unique
  if (-not $digests) { throw 'No signer certificate SHA-256 digest was reported.' }
  return ,@($digests)
}

$tempBase = [IO.Path]::GetFullPath($env:TEMP).TrimEnd('\') + '\'
$tempRoot = [IO.Path]::GetFullPath((Join-Path $tempBase ('usgcorso-signer-check-' + [Guid]::NewGuid().ToString('N'))))
if (-not $tempRoot.StartsWith($tempBase, [StringComparison]::OrdinalIgnoreCase)) {
  throw 'Temporary APK path is outside the system temporary directory.'
}
$null = New-Item -ItemType Directory -Path $tempRoot -ErrorAction Stop
$marker = Join-Path $tempRoot '.codex-owned-temporary-directory'
Set-Content -LiteralPath $marker -Value 'temporary installed APK inspection' -NoNewline

try {
  $paths = & $adbCommand.Source -s $selectedSerial shell pm path $PackageId 2>$null
  if ($LASTEXITCODE -ne 0) { throw 'Could not query the installed package; verify ADB/device connectivity.' }
  $baseLine = $paths | Where-Object { $_ -match '^package:.*/base\.apk\s*$' } | Select-Object -First 1
  if (-not $baseLine) { throw 'Installed base APK was not found for the requested package.' }
  $deviceApkPath = ($baseLine -replace '^package:', '').Trim()
  $installedApk = Join-Path $tempRoot 'installed-base.apk'
  $null = & $adbCommand.Source -s $selectedSerial pull $deviceApkPath $installedApk 2>&1
  if ($LASTEXITCODE -ne 0 -or -not (Test-Path -LiteralPath $installedApk -PathType Leaf)) {
    throw 'Could not read the installed APK from the device.'
  }

  $installedDigests = @(Get-CertificateDigests $installedApk)
  $candidateDigests = @(Get-CertificateDigests $candidate)
  $same = (Compare-Object $installedDigests $candidateDigests -SyncWindow 0).Count -eq 0
  Write-Output "Installed package signer SHA-256: $($installedDigests -join ', ')"
  Write-Output "Candidate APK signer SHA-256: $($candidateDigests -join ', ')"
  Write-Output "Signer match: $([bool]$same)"
  if (-not $same) { throw 'Signers differ. Do not use adb install -r for this package.' }
} finally {
  $resolvedTemp = [IO.Path]::GetFullPath($tempRoot)
  if ($resolvedTemp.StartsWith($tempBase, [StringComparison]::OrdinalIgnoreCase) -and (Test-Path -LiteralPath $marker)) {
    Remove-Item -LiteralPath $resolvedTemp -Recurse -Force
  }
}
