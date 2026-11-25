[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)] [string] $ApkPath
)

$ErrorActionPreference = 'Stop'
$apk = (Resolve-Path -LiteralPath $ApkPath -ErrorAction Stop).Path
$adbCommand = Get-Command adb -ErrorAction SilentlyContinue
$sdkRoot = if ($env:ANDROID_SDK_ROOT) { $env:ANDROID_SDK_ROOT } elseif ($env:ANDROID_HOME) { $env:ANDROID_HOME } elseif ($adbCommand) { Split-Path -Parent (Split-Path -Parent $adbCommand.Source) } else { throw 'Android SDK location was not found.' }
$apksigner = Get-ChildItem -LiteralPath (Join-Path $sdkRoot 'build-tools') -Directory -ErrorAction Stop |
  Sort-Object { try { [version]$_.Name } catch { [version]'0.0' } } -Descending |
  ForEach-Object { Join-Path $_.FullName 'apksigner.bat' } |
  Where-Object { Test-Path -LiteralPath $_ } |
  Select-Object -First 1
if (-not $apksigner) { throw 'Android SDK apksigner was not found.' }

$output = & $apksigner verify --print-certs $apk 2>&1 | Out-String
if ($LASTEXITCODE -ne 0) { throw 'APK signature verification failed.' }
$sha1 = [regex]::Match($output, 'certificate SHA-1 digest:\s*([0-9a-fA-F]+)').Groups[1].Value.ToUpperInvariant()
$sha256 = [regex]::Match($output, 'certificate SHA-256 digest:\s*([0-9a-fA-F]+)').Groups[1].Value.ToUpperInvariant()
if (-not $sha1 -or -not $sha256) { throw 'APK signer certificate digests were not found.' }

Write-Output "Signer certificate SHA-1 (Google Android app restriction): $sha1"
Write-Output "Signer certificate SHA-256: $sha256"
Write-Output 'Only public certificate fingerprints were read; private keystore material was not accessed.'
