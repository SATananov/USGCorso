# USGCorso — SoftUni Examiner Guide

USGCorso is an **Android (Expo / React Native)** application. The `.apk` does **not** execute natively on a Windows laptop. You may use a physical Android phone or an Android Virtual Device (AVD) on a Windows laptop. No Windows `.exe` is provided. A short demonstration video, if supplied separately, is a supplement, not a replacement for the APK.

> **Status:** This guide documents the exam workflow. The GitHub Release download was checked after publication. The current APK is signed with a dedicated USG Corso release certificate; the welcome screen and SoftUni Demonstration have been observed on an Android emulator. This is **not** proof of all features working in all environments.

## Download the exam APK

1. Open the [GitHub releases page](https://github.com/SATananov/USGCorso/releases).
2. Select release `softuni-v1.0.0`.
3. Download the asset named `USGCorso_1.0.0_SOFTUNI.apk`.
4. Compare the downloaded file's SHA-256 to the checksum **published in that release's notes**. Do not use an older build's checksum for a new APK.
5. The public APK is published at the GitHub Release linked above.

## Option A — install on Android phone

1. Download the APK onto an Android phone or copy it over USB.
2. Open the APK with Android's file manager and allow installing from that source if prompted. Only install if you trust the release and have verified its checksum.
3. Launch **USG Corso**, tap **CONTINUE**, then open **SoftUni Demonstration** from the welcome/auth screen.
4. The app may request runtime permissions for camera, location, or notifications as features are used.
5. **Do not uninstall an existing USGCorso installation to replace it.** Different signing certificates cannot update one another, and uninstalling may erase locally stored data. Prefer an unused test phone or emulator.

## Option B — run on a Windows laptop using Android Emulator

### Prerequisites

- Windows 10/11 computer with hardware virtualization enabled; Android emulator acceleration must be supported.
- At least 16 GiB system RAM is recommended for a smooth Android Studio + emulator workflow (actual requirements vary by image and host).
- Install [Android Studio](https://developer.android.com/studio), including **Android SDK**, **Platform Tools** (`adb`) and **Android Emulator** via SDK Manager.
- A compatible x86_64 virtual device system image (e.g. recent Android API level with Google APIs/Play Store, where available). An API 37 x86_64 AVD was used in development; that specific image is not mandatory.

### Create and start the virtual device

1. In Android Studio open **Device Manager** → **Create device** → choose a phone → download a compatible x86_64 system image → Finish.
2. Start the AVD from Device Manager. Complete Android setup if prompted.
3. If boot fails, try **Cold Boot Now** and check virtualization and graphics options. AVDs can be resource-intensive; a stalled AVD is not proof of an APK failure.
4. Confirm the emulator is fully booted before installing anything. In PowerShell run:

```powershell
adb devices -l
adb -s emulator-5554 shell getprop sys.boot_completed
```

`emulator-5554` is an **example** serial. Use the actual `emulator-XXXX` shown by `adb devices`. The boot property should return `1`.

### Install and launch

**Method 1:** Drag the downloaded APK from Windows onto the running Android emulator. Wait for the install confirmation, then open USG Corso.

**Method 2:** Use PowerShell (replace the path and emulator serial as needed):

```powershell
$serial = 'emulator-5554'
$apk = Join-Path $HOME 'Downloads\USGCorso_1.0.0_SOFTUNI.apk'
adb -s $serial shell getprop sys.boot_completed
adb -s $serial shell pm path com.usgcorso.mobile
adb -s $serial install $apk
adb -s $serial shell am start -n com.usgcorso.mobile/.MainActivity
adb -s $serial shell pidof com.usgcorso.mobile
```

If `pm path` already returns a package path, **check the existing installation first**: different signing keys can produce `INSTALL_FAILED_UPDATE_INCOMPATIBLE`. Never automatically uninstall, especially on a real device. Always target a specific emulator serial when a physical phone is also attached.

### Usability and connectivity

- The emulator needs internet access for Supabase-backed features. A GPS/location simulation may be needed for map demonstrations.
- Camera and other native features may behave differently from physical hardware. Prefer a phone for camera/OCR validation.
- API keys and backend availability are not included as credentials in this guide. Demo account credentials must be provided privately, not publicly in the repository.

## SoftUni Demonstration — examiner walkthrough

From the welcome screen tap **CONTINUE**, then **SoftUni Demonstration**. Expand sections **01–06**:

| Section | What to inspect | Notes |
| --- | --- | --- |
| 01 Navigation and structure | Knowledge list → content details; tab/stack navigation | Public knowledge may be accessible as a guest |
| 02 Authentication and sessions | Registration, sign-in, sign-out, persistent session | Use dedicated exam accounts; do not use personal credentials |
| 03 Data and operations | My Materials create/read/edit/delete and refresh | Requires authenticated account and access to backend |
| 04 Forms and validation | Registration and Add Material forms | Check required fields, validation, keyboard behavior |
| 05 Native mobile features | Image picker/camera, OCR, location, map | Some functions require device permissions and hardware |
| 06 Build and presentation | Project repository, README, APK distribution | Extra presentation section without exam points |

**Guest access is intentional product behavior** because USGCorso is being developed as a real application. The demonstration does not bypass authentication, but guest-visible routes may differ from the *literal* protected-route wording of the course specification. This difference is disclosed rather than represented as automatic compliance.

## Verification boundaries

- Confirmed previously: Release APK signature v2 with `CN=USG Corso`, expected APK package `com.usgcorso.mobile`, successful emulator boot, welcome screen and section 06 rendering.
- Not automatically confirmed: every flow in sections 01–05, fresh-device permissions, backend operations, or native features in all emulator images.
- Signing keystore and passwords are private and **must never be included** in a public release, README, ZIP, or exam submission.
