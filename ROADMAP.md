# USGCorso — Future Roadmap

**USG — Unico Suo Genere™**

**Project:** USGCorso / USG Corso Companion

This document outlines possible next steps for the ongoing USGCorso project. **Planned features are not presented as implemented or as part of the SoftUni v1.0.1 exam APK.** Scope, order, design and release decisions may change after testing and review.

[Back to README](README.md#jump-to) · [Current development status](README.md#development-status) · [Automated tests](README.md#automated-tests)

---

## Current foundation

The published exam version demonstrates real app navigation, Supabase authentication and personal content, community and Knowledge flows, place discovery, Google Maps, camera/image selection, Android notifications, OCR and on-device translation. The source also contains administration and professional-service functionality. **Implementation does not mean that every feature has been validated on every Android device.** For verified-device evidence and limitations, refer to the [README](README.md#development-status) and [Examiner Guide](EXAMINER_GUIDE.md).

## Planned development

### 1. Quality, reliability and privacy

- Complete device-based acceptance checks for registration, session restoration, CRUD, permissions, camera, location and error states.
- Expand automated coverage around critical forms, navigation, offline/error recovery and account boundaries.
- Continue security reviews of Supabase authorization, data visibility, moderation permissions and account privacy before production changes.
- Improve accessibility, screen responsiveness and the consistency of Bulgarian, English and Italian interface text.

### 2. Knowledge and cultural heritage

- Broaden editorially reviewed educational content, including breed history, responsible care and functional characteristics of the Cane Corso.
- Improve provenance, editorial review and translations across Bulgarian, English and Italian.
- Refine OCR quality and review workflows; machine recognition and translation should remain clearly distinguishable from verified source material.
- Connect relevant educational content with the wider USG Cane Corso Platform without losing editorial independence.

### 3. Community and responsible participation

- Develop additional community interactions and trustworthy reporting/moderation flows.
- Keep public contributions relevant to Cane Corso, with appropriate review of photos and descriptions.
- Strengthen member-level privacy and transparency around what is public or personal.

### 4. Places, professionals and practical services

- Expand relevant, reviewable categories such as veterinary care, pet shops, dog-friendly places and services for large breeds.
- Explore a dedicated **Transport** category for people and providers transporting Cane Corso and other large dogs.
- Improve geographic discovery, user-submitted updates, place verification and service-profile quality.

### 5. Events and Corso Match

- Turn the **Events** informational screen into a useful, maintained events directory with meaningful details and discovery tools.
- Develop **Corso Match** beyond its informational starting point, focusing on responsible education about whether a Cane Corso fits a person's experience, expectations and lifestyle.

### 6. Wider platform and distribution

- Continue aligning the mobile experience with the USG cultural and educational platform.
- Evaluate a future Google Play release only after native-build verification, privacy review, release preparation and adequate user testing.
- Keep Expo/EAS delivery and compatible OTA updates separate from changes that require a new native Android build.

## Guiding principles

USGCorso is intended to inform, connect and support responsible engagement with the Cane Corso breed. **It is not a marketplace for selling dogs, a replacement for kennel organizations or a substitute for professional veterinary advice.** Contributions, public profiles and community features should respect privacy and responsible moderation.

## What this document does not claim

- No completion dates or release promises are established here.
- The SoftUni exam APK does not contain completed implementations of every item above.
- A planned feature is not automatically a production-ready, tested or approved service.

---

[Back to README](README.md#jump-to) · [Examiner Guide](EXAMINER_GUIDE.md) · [Automated test guide](tests/README.md)
