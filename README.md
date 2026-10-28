# USG Corso

**Regular Exam Course Project for [React Native](https://reactnative.dev/) at [SoftUni](https://softuni.bg/)**

**Stefan Tananov**

**The Global Cane Corso Mobile Ecosystem**

This repository is being developed as a **Regular Exam** project for the React Native course at [SoftUni](https://softuni.bg/). To learn more about the technology itself, visit the official [React Native](https://reactnative.dev/) documentation.

USG Corso is a React Native mobile application focused on Cane Corso owners, enthusiasts and the wider breed community.

The application is currently developed as a standalone exam project and is planned to become part of the broader **USG Cane Corso Platform**, which is under active development at **https://usg-cane-corso-platform.com/**.

The long-term goal is to bring together owner tools, breed knowledge, community features, location-based information, events and professional services in one mobile ecosystem.

---

## Exam Evaluation

- **Current Implementation:** [Jump to Current Implementation](#current-implementation)
- **Application Areas:** [Jump to Application Areas](#application-areas)
- **Functional Guide:** [Jump to Functional Guide](#functional-guide)
- **Technology:** [Jump to Technology](#technology)
- **Run Instructions:** [Jump to Run Instructions](#run-instructions)
- **Future Integration:** [Jump to Future Integration](#future-integration-with-usg-cane-corso-platform)
- **About USG:** [Jump to About USG](#about-usg)

---

## Current Implementation

The project currently contains the first visual and structural foundation of the USG Corso mobile application.

Implemented so far:

- branded USG Corso home screen
- animated USG application intro
- premium dark/gold splash background
- animated USG crest appearance
- USG ecosystem hero image
- fullscreen hero image preview
- expandable home-screen categories
- eight primary ecosystem areas
- custom USG visual identity
- dark premium mobile interface
- USG philosophy and brand messaging

The application is still in active development.

---

## Application Areas

The current home screen introduces the following eight main areas:

### My Corso

Planned owner-focused area for the dog's personal life, care, development and history.

Current home structure includes:

- Growth & Care
- Behavior
- Challenges
- Journal

### Corso Friendly

Planned area for places and locations that are genuinely suitable for Cane Corso and other large dogs.

Current home structure includes:

- Map
- Near Me
- Places
- Add a Place
- Favorites
- Reviews

### Knowledge

Planned educational section dedicated to the Cane Corso breed.

Current home structure includes:

- Cane Corso Basics
- History & Heritage
- Function & Type
- Growth & Development
- Nutrition
- Training
- Behavior
- Health & Care

### Community

Planned community section for responsible Cane Corso interaction.

Current home structure includes:

- Lost & Found
- New Home
- Breeding Match
- Community

### Professionals & Services

Planned directory for Cane Corso-related professional services.

Current home structure includes:

- Breeders
- Trainers
- Veterinary
- Handlers
- Transport
- Pet Shops

### Events

Planned section for Cane Corso and dog-related events.

Current home structure includes:

- Upcoming
- Dog Shows
- Seminars
- Lectures
- Training Events
- Breed Meetings

### Corso Match

Planned educational feature intended to help users understand whether the Cane Corso is suitable for their lifestyle.

### About USG

Introduces the philosophy and identity behind USG.

---

## Functional Guide

This section describes only the functionality that is currently implemented.

### Application Start

When the application starts:

1. the USG splash screen is displayed;
2. the USG crest appears with an animated zoom effect;
3. the brand text is displayed;
4. after the intro, the user enters the main home screen.

### Home Screen

The home screen contains:

- the USG ecosystem hero image;
- the application title;
- the application subtitle;
- eight main expandable sections.

Only one main section is expanded at a time.

### Ecosystem Hero Preview

The ecosystem hero image is interactive.

When the user presses the image:

1. a fullscreen preview opens;
2. the image is displayed in a dark modal;
3. the user can close the preview using the close button.

### Expandable Main Sections

Each main section can be opened and closed by pressing its header.

The current screen uses a simple accordion-style interaction.

### About USG Section

The current About USG content presents the project's philosophy and includes:

**FUNZIONE CREA IL TIPO**

**ФУНКЦИЯТА СЪЗДАВА ТИПА**

It also explains that USG promotes knowledge, responsibility and community around the Cane Corso.

---

## Technology

The project currently uses:

- [React Native](https://reactnative.dev/)
- [Expo](https://expo.dev/)
- [React](https://react.dev/)
- JavaScript
- React Native StyleSheet
- React Native Animated API

The project intentionally follows a simple course-oriented structure while it is being developed for the exam.

---

## Project Structure

Current main project files include:

```text
USGCorso/
├── assets/
│   ├── icons/
│   ├── ecosystem-hero.png
│   ├── splash-bg-premium-strong.png
│   └── usg-seal-splash.png
├── App.js
├── app.json
├── index.js
├── package.json
└── README.md
```

The project structure will evolve as new course concepts and exam functionality are implemented.

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

Install dependencies:

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

The application can then be opened with Expo Go or a configured emulator.

---

## Future Integration with USG Cane Corso Platform

USG Corso is currently being developed as a standalone React Native exam project.

After the exam, the application is planned to become part of the broader **USG Cane Corso Platform**, which is currently under active development.

The long-term goal is for the mobile application to extend the platform with mobile-first features, owner tools, community functionality, Cane Corso knowledge, location-based services and other ecosystem modules.

**USG Cane Corso Platform:**  
https://usg-cane-corso-platform.com/

The current mobile project is not yet technically integrated with the platform.

---

## About USG

**USG — Unico Suo Genere™**

USG is a cultural and educational Cane Corso project focused on knowledge, history, responsibility and respect for the breed.

The project is not designed as a dog-selling marketplace and is not intended to compete with canine organizations.

Its philosophy is expressed through:

**FUNZIONE CREA IL TIPO**

The long-term vision is to connect educational content, responsible ownership, community tools and digital services within a broader Cane Corso ecosystem.

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
