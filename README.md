# USG Corso

**The Global Cane Corso Mobile Ecosystem**

USG Corso is a React Native mobile application currently being developed as an exam project for the SoftUni React Native course.

The project is focused on the Cane Corso community and brings together owner tools, breed knowledge, location-based services, community features, events, professional services and educational content in one mobile ecosystem.

> Current stage: React Native exam project in active development.

---

## Project Status

USG Corso is currently under development.

The present version contains the first application structure, branded home screen, USG visual identity, animated application intro and the initial main ecosystem categories.

Some exam-required features listed below are still planned and will be implemented during the development process.

---

## Future Integration with USG Cane Corso Platform

USG Corso is currently being developed as a standalone React Native exam project.

After the exam, the application is planned to become part of the broader **USG Cane Corso Platform**, which is also currently under active development.

The long-term goal is for the mobile application to extend the platform with mobile-first features, owner tools, community functionality, Cane Corso knowledge, location-based services and other ecosystem modules.

**USG Cane Corso Platform:**  
https://usg-cane-corso-platform.com/

The current mobile project is not yet technically integrated with the platform.

---

## Main Application Areas

The current USG Corso concept includes the following main areas:

- **My Corso**
- **Corso Friendly**
- **Knowledge**
- **Community**
- **Professionals & Services**
- **Events**
- **Corso Match**
- **About USG**

These areas represent the planned mobile ecosystem and will be implemented step by step during the project.

---

## Technology

- React Native
- Expo
- JavaScript
- React Navigation *(planned for exam implementation)*
- External backend / API *(planned for exam implementation)*
- Authentication and session persistence *(planned for exam implementation)*
- Native mobile functionality *(planned for exam implementation)*

---

## Installation

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

---

## Run the Application

Start Expo:

```bash
npx expo start
```

To start with a cleared Metro cache:

```bash
npx expo start -c
```

The application can then be opened in Expo Go or with a configured Android emulator.

---

## APK Build

**Final APK link:** Not available yet.

A link to the functional exam `.apk` build will be added here before final submission.

---

# Functional Guide

## 1. Project Overview

### Application Name

**USG Corso**

### Application Category / Topic

Cane Corso owner tools, community, education and mobile ecosystem.

### Main Purpose

USG Corso is designed as a mobile ecosystem for Cane Corso owners, enthusiasts and community members.

The application aims to combine useful owner tools, breed knowledge, community features, location-based information, events and professional services in one mobile experience.

For the SoftUni exam, the project is being developed as a standalone React Native MVP. After the exam, it is planned to become part of the broader USG Cane Corso Platform.

---

## 2. User Access & Permissions

### Guest (Not Authenticated)

**Planned for exam completion.**

The guest flow will provide access only to authentication-related screens until the user successfully logs in or registers.

Exact guest-access rules will be finalized together with the authentication implementation.

### Authenticated User

**Planned for exam completion.**

Authenticated users will access the main application and its available screens.

The final exam implementation will document the exact create, edit and delete permissions after the backend and CRUD flows are completed.

---

## 3. Authentication & Session Handling

### Authentication Flow

**Planned for exam completion.**

The final application will include:

1. Login
2. Register
3. Logout
4. Authentication-state check when the application starts
5. Protected access to the main application

### Session Persistence

**Planned for exam completion.**

The final implementation will keep the authenticated session after the application is closed and restarted.

The exact session-storage mechanism will be documented after the authentication solution is implemented.

---

## 4. Navigation Structure

### Root Navigation Logic

**Planned for exam completion.**

The final navigation architecture will separate authenticated and unauthenticated application flows.

### Main Navigation

The current home screen represents the main USG Corso ecosystem areas.

For the final exam version, the project will include composed navigation with at least one Stack Navigator and additional navigation appropriate to the application structure.

### Nested Navigation

**Planned for exam completion.**

Nested navigation will be documented after the React Navigation structure is implemented.

---

## 5. List → Details Flow

**Planned for exam completion.**

The final application will contain at least one master-detail flow where:

- a list or overview screen displays data;
- selecting an item opens a details screen;
- the selected item ID or object is passed using route parameters.

The exact USG Corso module used for this flow will be documented after implementation.

---

## 6. Data Source & Backend

**Planned for exam completion.**

The exam version will use an external data source rather than hardcoded JSON data.

The final backend choice and configuration will be documented after implementation.

---

## 7. Data Operations (CRUD)

### Read (GET)

**Planned for exam completion.**

Data will be fetched from the selected external backend or API and displayed in the application.

### Create (POST)

**Planned for exam completion.**

The user will be able to create at least one type of application data through a form.

### Update / Delete

**Planned for exam completion.**

The final project will implement an update operation and, where appropriate for the application logic, delete functionality.

Loading and error states will be included in the final data flow.

---

## 8. Forms & Validation

### Forms Used

**Planned for exam completion.**

The final project will include the forms required for authentication and data creation/editing.

### Validation Rules

**Planned for exam completion.**

At least three distinct fields will be validated.

At least one field will contain multiple validation rules.

The final field names and exact rules will be documented after the forms are implemented.

---

## 9. Input Controls

**Planned for exam completion.**

The final application will include at least two input types beyond standard text input where appropriate to the selected feature flow.

---

## 10. Native Device Features

**Planned for exam completion.**

The preferred native feature for USG Corso is **Location / Maps**, because it fits naturally with the **Corso Friendly** module.

The planned purpose is to support location-aware discovery of places suitable for Cane Corso and other large dogs.

Additional native features such as Image Picker may be considered later if they fit the final exam scope.

---

## 11. Typical User Flow

The final exam user journey is planned to follow this general structure:

1. The user opens USG Corso.
2. The application checks the authentication state.
3. The user logs in or registers if necessary.
4. The authenticated user enters the main USG Corso application.
5. The user navigates to one of the implemented functional modules.
6. The user views external data and opens a details screen.
7. The user performs the available create or edit operation.
8. The application updates the UI and handles loading or error states.

The final flow will be updated to match the implemented exam functionality exactly.

---

## 12. Error & Edge Case Handling

**Planned for exam completion.**

The final project will explicitly handle:

- authentication errors;
- network and data-loading errors;
- empty data states;
- missing data states;
- loading states;
- invalid form input.

---

## Current Implemented UI

The current project already includes:

- USG Corso branded home screen
- USG visual identity
- animated application intro
- premium splash background
- ecosystem hero image
- fullscreen hero preview
- expandable main ecosystem categories
- eight primary USG Corso application areas

These features form the current visual and structural foundation of the project.

---

## USG Philosophy

**USG — Unico Suo Genere™**

**FUNZIONE CREA IL TIPO**

USG promotes knowledge, responsibility and respect for the Cane Corso.

The project is not designed as a dog-selling marketplace and is not intended to compete with canine organizations. Its long-term purpose is educational, cultural and community-oriented.

---

## Repository

https://github.com/SATananov/USGCorso

---

## Author

**Stefan Tananov**

---

## License / Rights

USG — Unico Suo Genere™  
All rights reserved.
