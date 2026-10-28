# USG Corso

**Regular Exam Course Project for React Native at SoftUni**

**Stefan Tananov**

**The Global Cane Corso Mobile Ecosystem**

USG Corso is a React Native mobile application for Cane Corso owners, enthusiasts and people who want to learn more about the breed.

The project is being developed for the React Native Regular Exam at SoftUni.

The app is currently a standalone exam project. In the future, it is planned to become part of the wider **USG Cane Corso Platform**.

USG Cane Corso Platform:  
https://usg-cane-corso-platform.com/

---

## Exam Evaluation

- [Current Implementation](#current-implementation)
- [Application Areas](#application-areas)
- [Functional Guide](#functional-guide)
- [Technology](#technology)
- [Project Structure](#project-structure)
- [Run Instructions](#run-instructions)
- [Current Development Status](#current-development-status)
- [Future Integration](#future-integration-with-usg-cane-corso-platform)
- [About USG](#about-usg)

---

## Current Implementation

The project already has a working visual and navigation foundation.

Implemented so far:

- 3D USG intro
- USG dark and gold visual identity
- light theme
- English, Bulgarian and Italian language support
- saved language preference
- saved theme preference
- home screen with eight main sections
- separate screen for each main section
- hero image for each main section
- fullscreen hero image preview
- bottom navigation
- stack navigation
- global back button
- dynamic details screen
- Settings screen
- Notifications settings
- Privacy settings
- Account preparation screen
- Legal information screen
- Help & Support screen
- Replay USG Intro
- Reset Preferences

The application is still in active development.

Authentication, backend data, full CRUD features and the final APK are not completed yet.

---

## Application Areas

The app currently has eight main areas.

### My Corso

This area is planned for the owner's dog.

Current topics:

- Growth & Care
- Behavior
- Challenges
- Journal

More real functionality will be added here next.

### Corso Friendly

This area is planned for places that are suitable for Cane Corso and other large dogs.

Planned topics:

- Map
- Near Me
- Places
- Add a Place
- Favorites
- Reviews

### Knowledge

This section is planned for Cane Corso education.

Current topics:

- Cane Corso Basics
- History & Heritage
- Function & Type
- Growth & Development
- Nutrition
- Training
- Behavior
- Health & Care

### Community

This area is planned for community features.

Current topics:

- Lost & Found
- New Home
- Breeding Match
- Community

### Professionals & Services

This area is planned for useful Cane Corso services.

Current topics:

- Breeders
- Trainers
- Veterinary
- Handlers
- Transport
- Pet Shops

### Events

This area is planned for dog and Cane Corso events.

Current topics:

- Upcoming
- Dog Shows
- Seminars
- Lectures
- Training Events
- Breed Meetings

### Corso Match

Corso Match is planned as an educational feature.

Its purpose is to help a person understand whether the Cane Corso is suitable for their lifestyle.

It is not a breeding or mating feature.

### About USG

This section explains the idea and philosophy behind USG.

---

## Functional Guide

This section describes only features that currently work.

### Application Start

When the app starts:

1. the 3D USG intro is shown;
2. the user sees the USG identity and 3D coin;
3. the user enters the app with the Explore action.

The intro can also be opened again from Settings.

### Home Screen

The home screen contains:

- the USG ecosystem image;
- the application title;
- eight main sections;
- access to Settings.

The main groups can be opened and closed.

### Main Sections

Each of the eight main areas has its own screen.

Each screen contains:

- a section hero image;
- a title;
- a short description;
- a shared USG visual style.

The hero image can be opened in fullscreen mode.

### Details Screen

Some home items open a dynamic Details screen.

The selected item title is passed to the screen through navigation parameters.

### Languages

The app currently supports:

- English
- Bulgarian
- Italian

The user can change the language from Settings.

The selected language is saved on the device.

### Themes

The app currently supports:

- Dark theme
- Light theme

Dark is the default USG theme.

The selected theme is saved on the device.

### Settings

Settings currently contains:

- language selection;
- theme selection;
- Notifications;
- Privacy;
- Account preparation;
- Help & Support;
- Legal information;
- Replay USG Intro;
- Reset Preferences.

### Notifications

The user can currently save local preferences for:

- Events
- Community
- Lost & Found

These are local preferences only.

Real push notifications are not connected yet.

### Privacy

The app currently has local preparation settings for:

- Public Profile
- Location Discovery

Real account privacy rules will be connected later with the backend.

### Reset Preferences

Reset Preferences returns the local settings to their defaults.

It resets:

- language to English;
- theme to Dark;
- notification preferences;
- privacy preferences.

---

## Technology

The project currently uses:

- React Native
- Expo
- React
- JavaScript
- React Navigation
- AsyncStorage
- Expo GL
- Three.js
- React Native StyleSheet
- Safe Area Context

React Navigation is used for the app screens and navigation.

AsyncStorage is used to save local preferences such as language and theme.

Expo GL and Three.js are used for the 3D USG intro.

---

## Project Structure

The project is currently organized like this:

```text
USGCorso/
├── assets/
│   ├── icons/
│   └── hero and USG images
├── src/
│   ├── app/
│   ├── components/
│   ├── i18n/
│   ├── navigation/
│   ├── screens/
│   ├── styles/
│   └── theme/
├── App.js
├── app.json
├── index.js
├── package.json
└── README.md
```

The structure can still change while new exam features are added.

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

Start Expo:

```bash
npx expo start
```

For a clean Metro start:

```bash
npx expo start -c
```

The app can then be opened with Expo Go or a configured emulator.

---

## Current Development Status

The visual system, language system, theme system, navigation and Settings area are already working.

The next development steps will focus on real application functionality.

Important features that are still not completed:

- authentication;
- real user accounts;
- backend connection;
- CRUD operations;
- real My Corso data;
- real community data;
- location features;
- push notifications;
- final exam APK.

These features will be added step by step.

---

## Future Integration with USG Cane Corso Platform

USG Corso is currently a separate React Native project.

After the exam, the plan is to connect it with the wider **USG Cane Corso Platform**.

The mobile app can later extend the platform with:

- owner tools;
- breed knowledge;
- community features;
- location-based features;
- events;
- professional services.

The mobile project is not technically connected to the platform yet.

---

## About USG

**USG — Unico Suo Genere™**

USG is a cultural and educational Cane Corso project.

Its focus is:

- knowledge;
- history;
- responsibility;
- respect for the breed;
- responsible ownership;
- community.

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
