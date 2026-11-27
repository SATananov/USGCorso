# USGCorso — SoftUni Examiner Guide

**[React Native](https://reactnative.dev/) Regular Exam Project at [SoftUni](https://softuni.bg/)**

**Author:** Stefan Tananov · **SoftUni username:** `tanashi`

## Jump to

- [What is USGCorso?](#what-is-usgcorso)
- [Download and Install](#download--install)
- [Start the Application](#start-the-application)
- [SoftUni Demo — 01–06](#softuni-demo--0106)
- [Android Studio / Emulator](#android-studio--emulator)
- [Verified Features](#verified-features)
- [Known Limitations](#known-limitations)
- [Links](#links)
- [Author](#author)

## What is USGCorso?

USGCorso is an Android app for Cane Corso owners and enthusiasts, built with React Native and Expo for the SoftUni exam. It uses Supabase for account-based features and includes native Android tools. It is part of the wider USG Cane Corso educational project.

[↑ Back to top](#jump-to)

---

## Download & Install

Download the official [USGCorso_1.0.1_SoftUni.apk](https://github.com/SATananov/USGCorso/releases/download/softuni-v1.0.1/USGCorso_1.0.1_SoftUni.apk) from the [GitHub release](https://github.com/SATananov/USGCorso/releases/tag/softuni-v1.0.1). Install it on an Android phone or emulator. The APK is not a Windows executable and runs without Metro.

[↑ Back to top](#jump-to)

---

## Start the Application

Open USG Corso and complete the 3D intro. Tap **Continue**, then choose **SoftUni Demo** on the welcome screen to see sections **01–06**. A signed-in demo user can open the floating **SOFTUNI** button. Supabase-backed features require internet access.

[↑ Back to top](#jump-to)

---

## SoftUni Demo — 01–06

The demonstration menu uses the normal login flow. Sections **01–05** cover the exam's five graded areas (100 points in total); **06** is for build and presentation. This table maps the code paths for evaluation, not a claim that every flow has passed device testing.

| Requirement | Where to find it | How to test |
| --- | --- | --- |
| 01 — Navigation and details | Main tabs; Knowledge and its details; Corso Friendly and My Materials details | Open Knowledge → an item. With a signed-in account, open a place or material → details. |
| 02 — Authentication and sessions | Welcome screen, registration/login and account controls | Sign in, restart the app to inspect persisted session, then sign out. Registration may require email confirmation. |
| 03 — Data operations | My Corso and My Materials | With an exam user, create a disposable record, read it, edit, refresh, then delete only that test record. |
| 04 — Forms and validation | Registration, Add Material, dog and place forms | Try invalid email/password and mismatched confirmation; inspect the My Corso switch, care date/selection controls, keyboard and safe-area behavior. |
| 05 — Native features | Corso Friendly map/location, camera and image picker, OCR | Grant permissions when prompted; test on physical hardware where emulator support is limited. OCR and translation are additional checks. |
| 06 — Build and presentation | README, GitHub repository and APK release | Inspect the distribution and project information. This is an extra presentation section, not an app feature. |

### Demo Accounts

These dedicated accounts are temporary, for exam evaluation, and contain experimental data. Do not enter personal information. Sign out before switching accounts.

| Role | Email | Password |
| --- | --- | --- |
| Regular user | `SoftUniUser@demo.com` | `SoftUniUser123!@#` |
| Administrator | `SoftUniAdmin@demo.com` | `SoftUniAdmin123!@#` |

Choose **SoftUni Demo** → **Test real sign in**, then enter the account details. The demo authenticates against Supabase; it does not bypass login. After the exam, disable the accounts and remove their public credentials. Rotating passwords is also recommended because Git history retains old versions.

Guests can browse Knowledge and limited previews. Personal data and actions require a valid signed-in session; Admin screens also require the admin role. This guest behavior is intentional and differs from a literal requirement to show only authentication screens while signed out.

[↑ Back to top](#jump-to)

---

## Android Studio / Emulator

For the published APK, install Android Studio with Android SDK, Platform Tools (`adb`) and Android Emulator. In **Device Manager**, create and start a phone AVD with a compatible x86_64 image. After boot, download the APK above and drag it onto the emulator, or install from PowerShell:

```powershell
adb devices -l
$serial = 'emulator-XXXX' # Replace with the serial listed by adb
adb -s $serial shell getprop sys.boot_completed
$apk = Join-Path $HOME 'Downloads\USGCorso_1.0.1_SoftUni.apk'
adb -s $serial install $apk
adb -s $serial shell am start -n com.usgcorso.mobile/.MainActivity
```

The boot property should return `1`. Use the actual serial from `adb devices -l`, especially if both a phone and emulator are connected. Then open **Continue** → **SoftUni Demo**. No Metro server is needed for the release APK. Supabase features need internet access.

A source Development Build is different from the published APK. Build variants may have the same Android package but different signing certificates, preventing an in-place update. Check the existing installation first; do not uninstall casually because that can erase local data. Full source setup and commands are in the README's [Android Studio — Setup & Run](README.md#android-studio-setup-and-run) section. Expo Go does not replace the native Development Build for this project.

[↑ Back to top](#jump-to)

---

## Verified Features

- The v1.0.1 APK signature, app version, JavaScript bundle and OCR models were checked.
- On a Samsung Galaxy A13, standalone launch without Metro, navigation, sign-in, Google Maps and Knowledge were checked.
- On 27 November 2026, an OTA test update was detected, accepted using **Update now**, and displayed a temporary Home label; a second update restored the clean Home screen. No new APK was installed.
- The APK uses the original EAS signing certificate. Its SHA-256 is `21A060AA918CBB14242505817C6D57133C1355E9C927ED1A616BD82F67FAC667`.

These checks do not establish that every screen, permission, backend operation, OCR result or device configuration passed acceptance testing. Use disposable test data during further evaluation.

[↑ Back to top](#jump-to)

---

## Known Limitations

- Events and Corso Match are informational screens; live events and matching logic are not implemented.
- Care History combines Supabase records with local additions. The calendar and reminders are stored on the device; Android local notifications require permission and are not server push notifications.
- OCR recognition varies by image quality and needs manual review. ML Kit models download on demand; the current Android implementation requires Wi-Fi for that download.
- Guest-visible Knowledge and previews are intentional. Authentication and admin route guards complement backend authorization and do not replace it.
- The `ota-preview` channel is a preview update channel, not a public Google Play release. Native changes require a new build.

[↑ Back to top](#jump-to)

---

## Links

- [README and completed Functional Guide](README.md#functional-guide)
- [Official APK release](https://github.com/SATananov/USGCorso/releases/tag/softuni-v1.0.1)
- [USGCorso repository](https://github.com/SATananov/USGCorso)

[↑ Back to top](#jump-to)

---

## Author

**Stefan Tananov** · SoftUni username: `tanashi`

**USG — Unico Suo Genere™**
