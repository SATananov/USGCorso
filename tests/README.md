# USGCorso automated tests

The Jest suite covers the application areas under `tests/auth`, `tests/navigation`, `tests/materials`, `tests/mobile`, and `tests/softuni-demo`. Shared Jest setup and UI stubs live in `tests/setup.js` and `tests/navigation/mocks`.

Run from the project root in Windows PowerShell:

```powershell
npm ci
npm test
npx tsc --noEmit
```

`npm test` runs the Jest/Expo suite in-band. It uses the dependency versions in `package-lock.json`. Tests mock backend operations, auth events, image picker methods, and native OCR calls; they do not connect to Supabase or invoke a real native OCR module. Hardware camera behavior, Android permissions, device crop UI, and real OCR output require a physical-device check.

`tests/arena` contains separate Python route verification tests and supporting review documents. They are not included in the Jest command.
