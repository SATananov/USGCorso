# USGCorso — SoftUni Examiner Guide

USGCorso is an **Android (Expo / React Native)** application. The `.apk` does **not** execute natively on a Windows laptop. Use a physical Android phone or an Android Virtual Device (AVD) on a Windows laptop. No Windows `.exe` is provided. A demonstration video, if supplied separately, supplements the APK and does not replace it.

> **Release status:** The v1.0.1 APK build is prepared. GitHub Release `softuni-v1.0.1` has **not** been published. The planned asset URL below is not active or verified; check it after publication. The checks listed here are the confirmed scope, not a claim that every feature passed final acceptance.

## Download the exam APK

- Release title: **USG Corso v1.0.1**
- APK filename: `USGCorso_1.0.1_SoftUni.apk`
- Android package: `com.usgcorso.mobile`
- App version / versionCode: `1.0.1` / `6`
- EAS profile: `examOta`
- Build ID: `161d2bbe-1596-440b-ae99-04ec1fb3003b`
- Source commit: `9abdad6ba8a7a90cd4da46195dd03d62929a1ec0`
- Signing certificate: original EAS certificate
- APK SHA-256: `21A060AA918CBB14242505817C6D57133C1355E9C927ED1A616BD82F67FAC667`
- OTA channel / runtime: `ota-preview` / `1.0.1`

Planned GitHub Release asset URL (not yet published or verified):

```text
https://github.com/SATananov/USGCorso/releases/download/softuni-v1.0.1/USGCorso_1.0.1_SoftUni.apk
```

After publication, check that the release and asset are available before sharing this URL.

1. Obtain `USGCorso_1.0.1_SoftUni.apk` from the verified release asset after publication.
2. Install it on a test Android phone or emulator using the steps below.

## Confirmed v1.0.1 checks

- APK signing, app version, JavaScript bundle and OCR models were checked.
- On a Samsung Galaxy A13, the app launched standalone without Metro. Navigation, sign-in, Google Maps and Knowledge were checked.
- Jest: 52/52 tests passed; TypeScript check: PASS.
- On 27 November 2026, a temporary Home label arrived and appeared through OTA without a new APK. A second OTA update restored the clean Home screen, confirmed on the same Samsung device.

These results cover only the checks named above. They are not a full feature-by-feature acceptance pass.

## Option A — install on Android phone

1. Download the APK onto an Android phone or copy it over USB.
2. Open the APK with Android's file manager and allow installing from that source if prompted. Install only an APK downloaded from the official project release.
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
$apk = Join-Path $HOME 'Downloads\USGCorso_1.0.1_SoftUni.apk'
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
- API keys and backend configuration secrets are not included in this guide. Dedicated exam login credentials are listed in the [SoftUni Demo section of README](https://github.com/SATananov/USGCorso#softuni-demo).

## SoftUni Demonstration — examiner walkthrough

**Exam accounts and sign-in**

Use the dedicated **Regular User** account for authentication, persistent sessions, CRUD and forms. Use the dedicated **Administrator** account to inspect administration and moderation features. Both accounts are intended for exam evaluation only.

For the email addresses and passwords, see **[SoftUni Demo Accounts in README](https://github.com/SATananov/USGCorso#softuni-demo)**. Sign in through the normal USGCorso login screen; the demonstration does not bypass authentication.

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

## Further feature walkthrough checklist

Use this checklist for further feature-by-feature evaluation on the standalone APK. Use disposable test records and dedicated exam accounts. The confirmed checks above are the only checks claimed as completed; this checklist is not evidence that every item passed.

| Section | Acceptance check |
| --- | --- |
| 01 | Open Knowledge, Corso Friendly and My Materials list entries and inspect their corresponding details. The last two use the signed-in workflow. |
| 02 | Test login, registration validation, logout, cold restart without re-entering credentials, guest public content, and denial of personal/admin access without the required session or role. |
| 03 | Create a test material, read it, edit it, refresh from the server, then delete only that test record. |
| 04 | Test invalid email, weak password, mismatched confirmation, two non-text controls, keyboard visibility and safe areas. |
| 05 | Test camera/gallery and location permissions and results; on a saved dog photo test pinch, pan, double-tap, X and Android Back. OCR and translation are additional checks. |
| 06 | Verify standalone startup without Metro, package, signing certificate, version, release asset and SHA-256. |

The photo gesture and route guard checks are not included in the confirmed v1.0.1 device checks above. Do not run SQL review scripts or change production policies as part of this walkthrough.

## Verification boundaries

- Confirmed previously: successful emulator boot, welcome screen and SoftUni Demonstration rendering.
- Not automatically confirmed: every flow in sections 01–05, fresh-device permissions, backend operations, or native features in all emulator images.
- Android signing keystores, signing passwords, API keys and production secrets must never be included in a public release, README, ZIP or exam submission. The separate, temporary SoftUni exam account credentials are documented in README for evaluation and must be disabled or rotated after the exam.
