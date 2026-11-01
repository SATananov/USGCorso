# USG Corso

**Regular Exam Course Project for React Native at SoftUni**

**Stefan Tananov**

**SoftUni Username:** `tanashi`

**Course:** React Native Regular Exam Project

**The Global Cane Corso Mobile Ecosystem**

USG Corso is a React Native mobile application for Cane Corso owners, enthusiasts and people who want to learn more about the breed.

The project is being developed for the React Native Regular Exam at SoftUni. It is currently a standalone mobile project and is planned to become part of the wider **USG Cane Corso Platform** after the exam.

USG Cane Corso Platform:  
https://usg-cane-corso-platform.com/

---

## Jump to

### Exam Project

- [Exam Status](#exam-status)
- [Functional Guide](#functional-guide)
- [Project Overview](#project-overview)
- [User Access & Permissions](#user-access--permissions)
- [Authentication & Session Handling](#authentication--session-handling)
- [Navigation Structure](#navigation-structure)
- [List → Details Flow](#list--details-flow)
- [Data Source & Backend](#data-source--backend)
- [CRUD Operations](#crud-operations)
- [Forms & Validation](#forms--validation)
- [Native Device Features](#native-device-features)
- [Typical User Flow](#typical-user-flow)
- [Error & Edge Case Handling](#error--edge-case-handling)
- [APK / Build](#apk--build)
- [Run Instructions](#run-instructions)

### Additional USG Features

- [Current Implementation](#current-implementation)
- [Application Areas](#application-areas)
- [My Corso](#my-corso)
- [Community Corso](#community-corso)
- [User Content and Materials](#user-content-and-materials)
- [OCR and QR Assisted Capture](#ocr-and-qr-assisted-capture)
- [Moderation and Governance](#moderation-and-governance)
- [Corso Map](#corso-map)
- [Place Proposals](#place-proposals)
- [Admin Places Moderation](#admin-places-moderation)
- [Technology](#technology)
- [Project Structure](#project-structure)
- [Environment Configuration](#environment-configuration)
- [Development Build](#development-build)
- [Current Development Status](#current-development-status)
- [Future Integration](#future-integration-with-usg-cane-corso-platform)
- [About USG](#about-usg)

---

## Exam Status

This project is being prepared for the SoftUni React Native Regular Exam.

- Navigation: implemented
- Authentication: implemented
- Session persistence: implemented
- Real backend with Supabase: implemented
- CRUD operations: implemented
- Pull-to-refresh: implemented
- Forms and validation: implemented
- Native mobile features: implemented
- Functional Guide: included below
- APK link: will be added with the final exam build

---

## Functional Guide

### Project Overview

**Application Name:** USG Corso

**Category:** Cane Corso / Community / Education / Mobile Utility

USG Corso is a mobile application for Cane Corso owners and people interested in the breed.

The app combines dog profiles, useful places, community content, educational materials and mobile tools in one place.

### User Access & Permissions

**Guest user**

A guest can open the application, see the Home screen and preview the main sections.

Actions that need personal data or user content require login.

**Authenticated user**

A logged-in user can use the main application areas and personal features.

The user can create, view, edit and delete supported personal content such as dog profiles and submitted materials.

### Authentication & Session Handling

The application uses Supabase Auth.

The user can:

- register
- log in
- log out
- confirm email
- recover a forgotten password
- set a new password

The session is saved by Supabase.

If the user closes and opens the application again, the session can be restored automatically.

### Navigation Structure

The application uses two main navigator types:

- Bottom Tab Navigator
- Native Stack Navigator

The bottom tabs provide access to the main sections.

The Stack Navigator is used for details screens, settings, admin screens and other screens opened from the main areas.

The project has more than five screens.

It also has dynamic details screens that receive data through route parameters.

### List → Details Flow

The application has list-to-details flows.

Examples:

- places list → place details
- user materials list → material details
- admin moderation list → moderation details

The details screens receive an ID or object through route parameters.

### Data Source & Backend

USG Corso uses Supabase as a real backend.

Supabase is used for:

- authentication
- database data
- file storage
- Edge Functions
- moderation data
- application counters

The main application data is not loaded from hardcoded JSON files.

### CRUD Operations

The application includes real CRUD operations.

**Read**

Data is loaded from Supabase and shown in lists and details screens.

**Create**

Users can create supported content such as:

- Cane Corso profiles
- place proposals
- user materials

**Update**

Users can edit supported content that belongs to them.

Admins can also update supported moderation data.

**Delete**

Supported user content can be deleted where the application flow allows it.

### Forms & Validation

The application contains forms for:

- registration
- login
- password recovery
- profile data
- My Corso
- place proposals
- user materials

The forms use validation for required and invalid values.

Examples include:

- required name or title
- valid email
- password rules
- required content fields

The application also uses controls other than normal text inputs, including switches, selectors, image selection, date-related input and map-based coordinate selection.

### Native Device Features

The project uses several mobile-specific features:

- Camera
- Image Picker
- Location
- Google Maps
- OCR from images
- QR detection

The camera and image picker can be used when working with photos and materials.

Location and Maps are used for Corso places.

OCR can help extract text from an image.

### Typical User Flow

A normal flow can be:

1. Open the application.
2. Log in or register.
3. Open one of the main sections.
4. View existing data or create personal content.
5. Open a details screen.
6. Edit, delete or submit content where available.

### Error & Edge Case Handling

The application handles common states such as:

- authentication errors
- network errors
- missing data
- empty lists
- loading states
- invalid form values

Normal application feedback uses the USG visual style.

### APK / Build

The project uses an Android Development Build during development.

The final exam APK link will be added here before submission.

---

## Current Implementation

USG Corso already includes a working visual system, navigation, authentication, Supabase-backed user data, Cane Corso profiles, moderated community sharing, user-submitted content, OCR/QR-assisted capture, location features and an Android native map workflow.

Implemented so far:

- 3D USG intro
- USG dark and gold visual identity
- dark and light themes
- English, Bulgarian and Italian language support
- saved language preference
- saved theme preference
- home screen with eight main sections
- direct Home quick actions for the most important section tasks
- live Home counters backed by Supabase for approved places, Community Corso and approved content
- separate screen for each main section
- hero image for each main section
- fullscreen hero image preview
- bottom navigation
- stack navigation
- global back button
- dynamic details screen
- Settings area
- Notifications settings
- Privacy settings
- Help & Support
- Legal information
- Replay USG Intro
- Reset Preferences
- Supabase backend connection
- Supabase Auth
- sign up, sign in and sign out
- email confirmation flow
- persisted authentication session
- Forgot Password and Reset Password flow
- recovery deep-link handling
- password recovery email resend
- user profile data
- My Corso dog profiles
- dog photo upload with Supabase Storage
- community sharing controls
- public Cane Corso moderation states
- admin dog moderation
- Community Corso public gallery limited to approved public profiles
- user content and material submission flow
- article and photo-oriented material forms
- user material editing, deletion and resubmission
- admin content moderation
- branded USG dialogs for application feedback and confirmations
- camera capture and image selection
- OCR-assisted text extraction
- Bulgarian, English and Italian OCR language support
- QR detection workflow
- account deletion flow
- Corso Map on native Android with Google Maps
- foreground location permission and current position
- approved place markers and place details
- place category filtering
- reverse geocoding through a Supabase Edge Function
- place proposal flow
- admin place moderation
- admin place editing and change requests
- internal Android Development Build configuration
- custom USG application icon and Android adaptive icon
- keyboard-safe mobile forms

The application is still in active development. Some sections remain informational or prepared for future backend functionality, and a final production release build is not claimed yet.

---

## Application Areas

The app has eight main areas.

### My Corso

My Corso is the owner's personal Cane Corso area and already uses real Supabase data.

Current functionality includes:

- creating a dog profile
- editing a dog profile
- deleting a dog profile
- dog name, sex, color and birth date
- country and city
- kennel and breeder information
- registration number
- description
- dog photo upload
- photo replacement and removal
- community visibility control

### Corso Friendly

Corso Friendly contains the location and place discovery functionality.

Current functionality includes:

- native Android Google Map
- current device location
- approved place markers
- place details
- category filtering
- Add a Place proposal flow
- GPS-assisted coordinates
- reverse geocoding
- admin moderation for submitted places

Favorites and reviews are planned for later development.

### Knowledge

Knowledge is the educational area for Cane Corso information.

Current topics include:

- Cane Corso Basics
- History & Heritage
- Function & Type
- Growth & Development
- Nutrition
- Training
- Behavior
- Health & Care

The section currently provides the application structure for educational content and can be expanded with deeper content and backend data later.

### Community

Community includes the Community Corso experience and the planned wider community areas.

Current functionality includes:

- public Cane Corso profiles shared by owners
- dog photos
- owner display information
- location information
- dog profile details
- fullscreen dog photo preview

Additional community areas remain planned:

- Lost & Found
- New Home
- Breeding Match
- broader community interaction

### Professionals & Services

This area is planned for useful Cane Corso services.

Current topics:

- Breeders
- Trainers
- Veterinary
- Handlers
- Transport
- Pet Shops

Backend service directories will be added later.

### Events

This area is planned for dog and Cane Corso events.

Current topics:

- Upcoming
- Dog Shows
- Seminars
- Lectures
- Training Events
- Breed Meetings

A live events backend is not connected yet.

### Corso Match

Corso Match is planned as an educational feature that helps a person understand whether the Cane Corso is suitable for their lifestyle.

It is not a breeding or mating feature.

### About USG

This section explains the idea and philosophy behind USG.

---

## Functional Guide

### Application Start

When the app starts:

1. the 3D USG intro is shown;
2. the user sees the USG identity and 3D coin;
3. the user enters the application through the Explore action.

The intro can be opened again from Settings.

### Home Screen

The home screen contains:

- the USG ecosystem image
- the application title
- eight main sections
- access to Settings
- direct quick actions under the main sections
- live counters for supported public data

Examples of direct Home actions include:

- My Corso and Add Corso
- Corso Map and Add Place
- Knowledge Library and Add Material
- Public Corsos and Gallery
- Services and Add Service
- Upcoming Events and Add Event

The main groups can still be opened and closed for secondary navigation options.

The live counters are loaded from Supabase and are not hardcoded.

### Main Sections

Each of the eight main areas has its own screen with a shared USG visual system.

Section screens can include:

- hero imagery
- titles and descriptions
- section actions
- navigation to detailed functionality

Hero images can be opened in fullscreen mode.

### Languages

The app supports:

- English
- Bulgarian
- Italian

The selected language is saved on the device.

### Themes

The app supports:

- Dark theme
- Light theme

The selected theme is saved on the device.

### Settings

Settings includes access to:

- language selection
- theme selection
- Notifications
- Privacy
- Account
- Help & Support
- Legal information
- Replay USG Intro
- Reset Preferences

### Notifications

The user can save local preferences for:

- Events
- Community
- Lost & Found

These are currently local preferences. Real push notifications are not connected yet.

### Privacy

The app currently provides local privacy preparation settings such as Public Profile and Location Discovery.

These settings are not yet a complete backend privacy policy system.

### Reset Preferences

Reset Preferences returns local settings to their defaults, including language, theme, notification preferences and local privacy preferences.

---

## Authentication and Account Recovery

USG Corso uses Supabase Auth for real user authentication.

Current authentication functionality includes:

- account registration
- email and password sign in
- sign out
- persisted sessions
- authentication state handling
- email confirmation flow
- guest access where supported by the application flow
- Forgot Password
- password recovery email
- recovery deep link handling
- setting a new password
- resending the recovery email

Password recovery email delivery is configured through Supabase Auth. The project does not store SMTP credentials in the repository.

---

## Profile and Account

Authenticated users can maintain profile information stored through Supabase.

Current profile fields and tools include:

- display name
- username
- biography
- country
- city
- Cane Corso avatar presets
- profile completion state
- location readiness

The Account area also includes an account deletion flow backed by a Supabase Edge Function.

---

## My Corso

My Corso uses Supabase-backed CRUD functionality for the signed-in owner's dogs.

Users can:

- create dog profiles
- view their dogs
- edit dog information
- delete dog profiles
- upload Cane Corso photos
- replace or remove photos
- control whether a dog is private or submitted for Community visibility

Dog images use Supabase Storage.

Private owner content remains available to the owner without public moderation.

When a dog is shared publicly, its public visibility is governed by moderation states such as pending, approved, rejected or needs changes. Public profile or photo changes can return the item to moderation before it is shown again in Community.

---

## Community Corso

Community Corso loads public Cane Corso profiles through the Supabase backend.

Shared profiles can display available information such as:

- dog photo
- dog name
- sex
- color
- birth date
- country and city
- kennel
- breeder
- registration number
- description
- owner display information

Only profiles intentionally shared through the application's community visibility flow are intended for this area.

Community Corso is moderation-aware: public profiles are intended to appear only after approval.

---

## User Content and Materials

USG Corso includes a Supabase-backed user content workflow for authenticated users.

Current functionality includes:

- creating user-submitted materials
- article/text-oriented submissions
- photo-oriented submissions
- attaching supported media
- viewing the user's own materials
- editing submitted content
- deleting owned content
- resubmitting content after changes
- moderation states and moderation notes
- admin review of submitted content
- approved-content counting for Home discovery

The content architecture uses section keys so submissions can be associated with areas such as Knowledge, Services and Events.

The public browsing experience for every content category is still being expanded. The current implementation provides the submission, ownership and moderation foundation without claiming that every section is already a complete public directory.

---

## OCR and QR Assisted Capture

The material workflow includes camera and image-assisted tools intended to reduce manual text entry.

Current functionality includes:

- direct camera capture
- image selection
- OCR-assisted extraction from images
- Bulgarian OCR
- English OCR
- Italian OCR
- language-aware OCR provider selection
- local native Android OCR module
- QR detection support
- extraction results that can be used in the material workflow

The OCR implementation includes local Android module code and bundled language data for Bulgarian, English and Italian.

OCR is an assistance feature. Extracted text should still be reviewed by the user before submission.

---

## Moderation and Governance

Public user-generated content is governed separately from private owner data.

The current moderation model includes:

- private owner content
- pending public submissions
- approved public content
- rejected content
- needs-changes workflows where supported
- moderation notes
- admin review screens
- dog profile moderation
- place moderation
- user content moderation

The goal is to keep public USG content relevant to Cane Corso and the purpose of each section.

The application uses branded USG dialogs for ordinary confirmations, warnings and success feedback instead of standard React Native alert dialogs.

---

## Corso Map

Corso Map is implemented for native Android with React Native Maps and Google Maps.

Current map functionality includes:

- Google Maps native Android rendering
- foreground location permission
- current device location
- approved USG place markers
- category filtering
- place details
- map-based coordinate selection

The Google Maps Android API key is provided through environment configuration and is not stored directly in the source code.

---

## Place Proposals

Signed-in users can propose useful locations through the Add a Place flow.

A proposal can include:

- place name
- category
- country
- city
- address
- phone
- website
- description
- Cane Corso Friendly flag
- latitude and longitude

Coordinates can be selected from the map or assisted by the device location and reverse-geocoding workflow.

New proposals enter moderation before becoming approved public places.

### Reverse Geocoding

Reverse geocoding is handled through the Supabase Edge Function:

`reverse-geocode`

The mobile application sends coordinates to the function and uses the returned location data in the place workflow.

---

## Admin Places Moderation

The application contains a role-based Admin area for place moderation.

Current admin place functionality includes:

- listing pending place proposals
- reviewing submitted place information
- approving proposals
- rejecting proposals
- editing pending place data
- requesting changes from the submitter
- using a map during moderation

The admin service also includes member listing support for the Admin area.

---

## Account Deletion

Account deletion is handled through the Supabase Edge Function:

`delete-account`

The flow is designed to perform server-side account cleanup rather than exposing privileged credentials in the mobile application.

Administrative safety checks are also included in the deletion flow.

---

## Technology

The project currently uses:

- React Native
- Expo SDK 58
- React 19
- JavaScript
- React Navigation
- AsyncStorage
- Supabase
- Supabase Auth
- Supabase Database
- Supabase Storage
- Supabase Edge Functions
- Expo Location
- React Native Maps
- Google Maps for native Android
- Expo Image Picker
- Expo Camera
- Expo File System
- Expo OCR Kit
- local Expo Android OCR module
- bundled Tesseract language data for Bulgarian, English and Italian
- Expo Linking
- Expo Dev Client
- EAS Build
- Expo GL
- Three.js
- React Native StyleSheet
- Safe Area Context

React Navigation is used for application navigation.

AsyncStorage is used for local preferences such as language, theme, notifications and local privacy settings.

Supabase provides authentication and the current backend data layer.

Expo GL and Three.js power the 3D USG intro.

---

## Project Structure

The project is organized around feature-specific modules:

```text
USGCorso/
├── assets/
│   ├── auth/
│   ├── icons/
│   ├── profile/
│   └── USG and section imagery
├── src/
│   ├── account/
│   ├── admin/
│   ├── app/
│   ├── auth/
│   ├── community/
│   ├── components/
│   ├── dogs/
│   ├── governance/
│   ├── home/
│   ├── i18n/
│   ├── lib/
│   ├── navigation/
│   ├── ocr/
│   ├── places/
│   ├── profile/
│   ├── qr/
│   ├── screens/
│   ├── styles/
│   └── theme/
├── modules/
│   └── usg-ocr/
│       └── Android native OCR module and tessdata
├── supabase/
│   ├── functions/
│   │   ├── delete-account/
│   │   └── reverse-geocode/
│   └── SQL setup files
├── .env.example
├── App.js
├── app.config.js
├── app.json
├── eas.json
├── index.js
├── package.json
└── README.md
```

---

## Environment Configuration

The repository contains `.env.example` with the required variable names but no secrets.

Create a local `.env` file with:

```text
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
GOOGLE_MAPS_ANDROID_API_KEY=
```

The real `.env` file must remain local and must never be committed.

`GOOGLE_MAPS_ANDROID_API_KEY` is required when building the Android application with Google Maps support.

---

## Run Instructions

Clone the repository:

```bash
git clone https://github.com/SATananov/USGCorso.git
```

Open the project folder:

```bash
cd USGCorso
```

Install the packages:

```bash
npm install
```

Create the local `.env` file from `.env.example` and provide the required local environment values.

Start Expo:

```bash
npx expo start
```

For a clean Metro start:

```bash
npx expo start -c
```

For the current native Android Corso Map workflow, use the configured Development Build rather than relying on Expo Go for full native behavior.

---

## Development Build

The project includes Expo Dev Client and an EAS development profile for an internal Android APK.

The current `development` build profile uses:

- `developmentClient: true`
- internal distribution
- Android APK output

A new Development APK is required when a change modifies native dependencies or native application configuration that is not already present in the installed development client.

Ordinary JavaScript, UI and README-only changes do not require a new Development APK.

A final production/exam release APK is not claimed by this README yet.

---

## Current Development Status

### Working now

- visual identity and 3D intro
- multilingual UI foundation
- dark and light themes
- navigation and Settings
- Supabase connection
- authentication and real user accounts
- password recovery
- user profiles
- My Corso CRUD
- dog photo storage
- My Corso public moderation
- Community Corso approved public data
- user content and materials flow
- user material edit/delete/resubmit flow
- admin content moderation
- camera capture
- OCR-assisted extraction in Bulgarian, English and Italian
- QR detection foundation
- branded USG feedback dialogs
- Home quick actions and Supabase-backed counters
- account deletion flow
- native Android Corso Map
- device location
- place proposal workflow
- reverse geocoding Edge Function
- admin place moderation
- Development Build configuration

### Still in development

- real push notifications
- backend-driven privacy controls
- Favorites and Reviews for places
- deeper public Knowledge library browsing
- live Professionals & Services directory browsing
- live Events directory and calendar browsing
- full Corso Match questionnaire and logic
- wider community interaction modules
- final production/exam release APK
- technical integration with the wider USG Cane Corso Platform

Development continues step by step from the current stable functionality.

---

## Future Integration with USG Cane Corso Platform

USG Corso is currently a separate React Native project.

After the exam, the plan is to connect it with the wider **USG Cane Corso Platform**.

The mobile application can extend the platform with:

- owner tools
- breed knowledge
- community features
- location-based features
- events
- professional services

The mobile project is not technically connected to the platform yet.

---

## About USG

**USG — Unico Suo Genere™**

USG is a cultural and educational Cane Corso project focused on:

- knowledge
- history
- responsibility
- respect for the breed
- responsible ownership
- community

The project is not designed as a dog-selling marketplace.

Its philosophy is expressed through:

**FUNZIONE CREA IL TIPO**

---

## Repository

https://github.com/SATananov/USGCorso

---

## Author

**Stefan Tananov**

---

## Rights

**USG — Unico Suo Genere™**  
All rights reserved.
