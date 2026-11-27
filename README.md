# USGCorso

USGCorso is an Android application for Cane Corso owners and enthusiasts, developed with React Native and Expo for the SoftUni exam. It combines personal dog records, community features, breed education and practical mobile tools, backed by Supabase.

The app is part of the wider [USG Cane Corso Platform](https://usg-cane-corso-platform.com/), a cultural and educational project.

**Author:** Stefan Tananov · **SoftUni username:** `tanashi`

## Examiner Quick Start

1. Download [USGCorso_1.0.1_SoftUni.apk](https://github.com/SATananov/USGCorso/releases/download/softuni-v1.0.1/USGCorso_1.0.1_SoftUni.apk) from the [official GitHub release](https://github.com/SATananov/USGCorso/releases/tag/softuni-v1.0.1).
2. Install it on an Android phone or emulator and open **USG Corso**. The release APK runs without Metro.
3. Complete the 3D intro and tap **Continue**. On the welcome screen, choose **SoftUni Demo** to open the 01–06 examiner menu. Signed-in demo users can reopen it with the floating **SOFTUNI** button.
4. Choose a section to follow its walkthrough. Demo account details are below in [SoftUni Demonstration](#softuni-demonstration).

Supabase features require an internet connection. For full emulator setup, see [Android Studio Setup and Run](#android-studio-setup-and-run) and the [Examiner Guide](EXAMINER_GUIDE.md).

## Jump to

- [Examiner Quick Start](#examiner-quick-start)
- [Download Android APK](#download-android-apk)
- [SoftUni Demonstration](#softuni-demonstration)
- [Android Studio Setup and Run](#android-studio-setup-and-run)
- [OTA Updates](#ota-updates)
- [Project Architecture](#project-architecture)
- [Functional Guide](#functional-guide)
- [Main Features](#main-features)
- [OCR and Translation](#ocr-and-translation)
- [Technology](#technology)
- [Development Status](#development-status)
- [Examiner Guide](EXAMINER_GUIDE.md)

## Download Android APK

The exam release is **USG Corso 1.0.1** (`com.usgcorso.mobile`, Android `versionCode` 6, EAS profile `examOta`).

- [Download USGCorso_1.0.1_SoftUni.apk](https://github.com/SATananov/USGCorso/releases/download/softuni-v1.0.1/USGCorso_1.0.1_SoftUni.apk)
- [GitHub release page](https://github.com/SATananov/USGCorso/releases/tag/softuni-v1.0.1)
- SHA-256: `21A060AA918CBB14242505817C6D57133C1355E9C927ED1A616BD82F67FAC667`

The release URLs returned HTTP 200, and the APK downloaded from GitHub matched the original SHA-256. The APK was built from an earlier source revision than the current documentation; its release details identify that build. It uses the original EAS signing certificate. Android APKs require a phone or emulator; they do not run directly on Windows.

**Build details:** The APK was built from source commit `9abdad6ba8a7a90cd4da46195dd03d62929a1ec0`. This is separate from later documentation changes on `main`. The release build used version `1.0.1` and version code `6`; the current source `app.json` says version code `5`, which the `examOta` profile overrides to `6`. `package.json` currently reports `1.0.0`.

## SoftUni Demonstration

The demo menu groups the exam walkthrough into six sections. It uses the normal application sign-in flow and does not bypass authentication.

| Section | What to inspect |
| --- | --- |
| 01 — Navigation | Main tabs, public Knowledge list and item details |
| 02 — Authentication | Sign-in, registration, session persistence and protected routes |
| 03 — Data operations | My Corso and My Materials records, including supported create, edit, delete and refresh flows |
| 04 — Forms | Registration, material forms and validation feedback |
| 05 — Mobile features | Camera and image selection, OCR, location and map features (permissions/device dependent) |
| 06 — Build & presentation | Repository, README and APK distribution; this is an extra presentation section |

The dedicated exam accounts are temporary and intended for evaluation only. They use experimental data; do not enter personal information. Sign out before switching accounts.

| Role | Email | Password |
| --- | --- | --- |
| Regular user | `SoftUniUser@demo.com` | `SoftUniUser123!@#` |
| Administrator | `SoftUniAdmin@demo.com` | `SoftUniAdmin123!@#` |

To sign in, choose **SoftUni Demo** on the welcome screen, then **Test real sign in**, and enter an account above. After the exam, disable these accounts and remove their credentials from public documentation; password rotation is also recommended because Git history retains earlier versions.

## Android Studio Setup and Run

### Run the Published APK — Recommended for Examiners

1. Install Android Studio with Android SDK, Platform Tools (`adb`) and Android Emulator.
2. In **Device Manager**, create and start a phone AVD with a compatible x86_64 system image. Complete device setup and wait for boot.
3. Download the official APK linked above.
4. In PowerShell, confirm the emulator serial and boot state:

```powershell
adb devices -l
$serial = 'emulator-XXXX' # Replace with the serial listed above
adb -s $serial shell getprop sys.boot_completed
```

The boot property should return `1`. Install by dragging the APK onto the running emulator, or use:

```powershell
$apk = Join-Path $HOME 'Downloads\USGCorso_1.0.1_SoftUni.apk'
adb -s $serial install $apk
adb -s $serial shell am start -n com.usgcorso.mobile/.MainActivity
```

The release APK is standalone and needs no Metro server. Open **Continue**, then **SoftUni Demo**. Internet is required for Supabase-backed content. Use a test device or emulator: a development build may use a different signing certificate but the same package name, which can prevent an in-place update. Check before replacing an installation; uninstalling can erase local data.

### Run From Source — Development

Requirements: Git, Node.js/npm, VS Code, Android Studio with SDK and Platform Tools, and a running Android emulator. From PowerShell:

```powershell
git clone https://github.com/SATananov/USGCorso.git
cd USGCorso
code .
npm ci
Copy-Item .env.example .env
```

Add the required local Supabase URL, publishable key and Android Maps API key to `.env`; do not commit real credentials. Start the emulator, then create and launch a native Development Build:

```powershell
npx expo run:android
```

Start the Metro development server in a separate terminal:

```powershell
npx expo start --dev-client
```

For a clean Metro cache, use `npx expo start --dev-client -c`. Open the Development Build on the emulator and connect it to Metro. Native module or dependency changes require a new Development Build. Expo Go does not include all native modules used by this project.

**Troubleshooting:** Confirm `adb devices -l` lists a fully booted device. If install reports `INSTALL_FAILED_UPDATE_INCOMPATIBLE`, the installed app was signed differently; check for local data before considering removal. Maps builds require `GOOGLE_MAPS_ANDROID_API_KEY`. Supabase features need a valid `.env` and internet access.

## OTA Updates

Over-the-air (OTA) updates can deliver compatible JavaScript and asset changes to an installed app without installing a new APK. Changes to native code, modules or Android permissions need a new native build. The v1.0.1 exam APK uses the `ota-preview` channel and runtime version `1.0.1`; this preview channel is not a public Google Play release.

On 27 November 2026, a Samsung Galaxy A13 running the exam APK detected a test update, accepted it through **Update now**, and displayed the temporary Home label. A second OTA update restored the clean Home screen. Both updates were applied without installing a new APK.

## Project Architecture

```mermaid
flowchart TD
    INTRO["3D Intro"] --> WELCOME["Welcome screen"]
    WELCOME --> DEMO["SoftUni Demo 01–06"]
    WELCOME --> GUEST["Guest access"]
    WELCOME --> LOGIN["Sign in or register"]
    DEMO --> LOGIN
    DEMO --> GUEST
    GUEST --> MAIN["Main navigation"]
    LOGIN --> MAIN

    MAIN --> TABS["Nine bottom tabs"]
    TABS --> GROUP1["Home · My Corso · Corso Friendly"]
    TABS --> GROUP2["Knowledge · Community · Services"]
    TABS --> GROUP3["Events · Corso Match · About"]

    MAIN --> STACK["Details · Materials · Care · Settings"]
    MAIN --> ADMIN["Admin screens · role required"]
    GROUP2 --> PUBLIC["Public Knowledge · Community questions"]
    MAIN --> PERSONAL["Personal actions · sign-in required"]
    PERSONAL --> SUPA["Supabase Auth · Database · Storage · Edge Functions"]
    ADMIN --> SUPA
    GROUP1 --> MAP["Google Maps · device location"]
    STACK --> DEVICE["Camera · Tesseract OCR · ML Kit"]
    MAIN -.-> OTA["Expo Updates · ota-preview · 1.0.1"]
```

The app opens with the 3D intro, then the welcome/auth gateway. Guests can browse Knowledge and see limited previews; personal features require a signed-in session. Admin stack screens additionally check the user's role. These client-side route checks do not replace backend authorization. Expo Updates deliver compatible JavaScript and assets; native changes require a new build.

## Functional Guide

### Navigation and access

The root flow restores authentication state, displays the intro and welcome/auth gateway, then opens the main app. The nine bottom tabs are Home, My Corso, Corso Friendly, Knowledge, Community, Services, Events, Corso Match and About. Stack routes provide item details, materials, care tools, settings, help, legal information and administration.

Knowledge is public, and Community questions can be browsed publicly. Guests see limited previews of other areas. Personal records and actions require sign-in; administrative screens also check the Supabase role. Guest access is intentional product behavior and differs from a specification that requires only authentication screens while signed out.

### Authentication, backend and data

Supabase Auth supports registration, sign-in/out, email confirmation and password recovery. Sessions persist through AsyncStorage with token refresh. Registration may require email confirmation before sign-in. A cold start restores a saved session; verify this behavior on the installed exam APK as part of evaluation.

Supabase provides authentication, database records, file storage and Edge Functions. For example, My Corso mutations save dog profiles and photos and reload the list from the backend. My Materials supports authenticated create, read, edit, delete and refresh flows. Users can submit Community questions and replies; public content may be subject to moderation. Admin tools handle supported content and professional access approvals. Available mutations depend on the section and backend policies.

List-to-detail examples include Knowledge → `KnowledgePublicDetails` (`item`), Corso Friendly → `PlaceDetails` (`placeId`), and My Materials → `MyMaterialDetails` (`item`). Server-backed lists provide refresh where implemented.

### Forms and errors

Forms cover account access, dog profiles, material submissions, professional applications and place proposals. Registration checks a valid email, password length and character groups, and matching confirmation. Other screens validate their own required fields. The app provides loading, empty, error and success feedback for common backend and form states. Try invalid registration values and a material submission to inspect validation; keyboard and permission behavior can vary by device.

### Mobile tools

Corso Friendly uses Google Maps, device location, categories, place proposals, favorites and place reviews. Camera, image selection and QR detection use device features. Care History combines Supabase-backed records with local extension data; health records and some quantity entries are local. Care Calendar entries and reminders are stored locally. Reminders use Android local notifications and require notification permission; they are not server push notifications.

Tesseract OCR can extract Bulgarian, English and Italian text from selected or captured images. Its local OCR Test Lab is a diagnostic screen; recognition quality varies and text should be reviewed. Knowledge details can offer explicit Google ML Kit on-device translation among Bulgarian, English and Italian. Models download when needed; the current Android implementation requires Wi-Fi for that download. Machine translations are labeled and the original text remains available.

## Main Features

| Feature | What it does |
| --- | --- |
| My Corso | Manage dog profiles and photos; open a zoomable photo viewer and use supported care, diary, growth, behavior, challenge and walk screens. |
| Corso Friendly | Browse categorized places on a map or list, use device location, view details, save favorites, submit place proposals, and rate or review places. |
| Knowledge | Browse public educational materials, open details and request on-device translation when available. |
| Community | View shared Cane Corso profiles and public questions, read replies, and submit questions or replies when signed in. Moderation applies to supported content. |
| My Materials | Create, read, edit, delete and refresh the signed-in user's materials. |
| Professionals & Services | Browse public professional profiles, manage an eligible user's profile and submit an access application for admin review. Public profile fields are visibility controlled. |
| Care History & Calendar | Care History combines Supabase-backed records with local extensions; health and some quantity entries are local. Calendar entries and reminders are local, with Android local notifications when permitted. |
| Admin | Review supported applications, places and community content; administrator routes check the user's role. |
| Settings & languages | Manage app preferences, account, privacy, notifications, help and legal information; the interface supports Bulgarian, English and Italian. |
| Events | Informational section screen; a live events directory is not implemented. |
| Corso Match | Informational section screen; the planned lifestyle suitability feature is not implemented. |

## OCR and Translation

- The custom native Tesseract module is in `modules/usg-ocr/`; `src/ocr/ocrService.js` exposes OCR to the app. The service and OCR Test Lab apply a 25-second JavaScript timeout.
- OCR supports Bulgarian (`bul`), English (`eng`) and Italian (`ita`). Results are local and require review; the Test Lab is diagnostic, not an accuracy guarantee.
- The Android module in `modules/usg-translate/` uses Google ML Kit Translate. Knowledge details offer a manual on-device translation action for Bulgarian, English and Italian. Language models download when required; the current implementation requires Wi-Fi for downloads.
- Translation is distinct from the older experimental Supabase translation queue in migration history. That migration is not evidence of a deployed cloud translator.

## Technology

- **App:** React Native, Expo SDK 58, JavaScript, React Navigation, TypeScript tooling (the app is primarily JavaScript).
- **Backend:** Supabase Auth, Database, Storage and Edge Functions; AsyncStorage for session persistence.
- **Android and device APIs:** Expo Camera, Image Picker, Location, Notifications and Updates; React Native Maps with Google Maps; custom Expo modules for Tesseract OCR and ML Kit Translate.
- **Build and graphics:** EAS Build, Expo Dev Client, Expo GL and Three.js.

## Development Status

### Implemented

Authentication and session persistence, the nine-tab app, Supabase-backed personal and community flows, place favorites and reviews, professional profiles and access applications, admin moderation, dog care records with local notifications, OCR and on-device translation are implemented in the source. Events and Corso Match currently show informational content only.

### Verified on device

The signed v1.0.1 APK signature, version, JavaScript bundle and OCR models were checked. On a Samsung Galaxy A13, standalone launch without Metro, navigation, sign-in, Google Maps and Knowledge were checked. OTA delivery and restoration of the clean Home screen were also confirmed on that device on 27 November 2026. These checks do not cover every feature or a full acceptance pass. The published release and APK checksums are documented above.

### Still in development

Planned or incomplete work includes a live Events directory, full Corso Match logic, broader community interaction and services coverage, deeper backend privacy controls, broader editorial review and translation coverage, and integration with the wider USG platform. OCR accuracy can vary on complex documents. Local care notifications are not a remote push notification system. Google Play publication has not occurred.

## About USG

**USG — Unico Suo Genere™** is a cultural and educational Cane Corso project built around knowledge, history, responsibility and respect for the breed. USGCorso is not a dog-selling marketplace.

## Links

- [Repository](https://github.com/SATananov/USGCorso)
- [USG Cane Corso Platform](https://usg-cane-corso-platform.com/)
- [Examiner Guide](EXAMINER_GUIDE.md)
