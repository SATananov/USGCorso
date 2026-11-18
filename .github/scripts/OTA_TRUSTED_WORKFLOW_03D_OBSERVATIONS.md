# SAFETY 02B-03D — Read-only trusted workflow identity evidence

**OBSERVATIONS ONLY — NOT A RELEASE GATE.** No workflow has been selected or approved as a trusted publisher.

## GitHub observations (2026-11-18)

The GitHub repository branch endpoint returned:

- `main`: commit `5e4a0e36ae1164573366634540edf4a8f019c4b7`, reported `protected: false`.
- `feature/eas-ota`: commit `0d8eade5e844fdeba9b471e049d90603139888d8`, reported `protected: true`.

The repository content API returned the Git **blob SHA-1** values for `.github/workflows/ota-preview-publish.yml` at each immutable commit:

- `main`: `d385fe2981263b2877262601077d987afd9e60be` — file is a short **dispatch-registration-only** workflow and refuses publication on main.
- `feature/eas-ota`: `c1e3d682602309b0e0ba2d87b013e316e7ca1834` — a different workflow that checks candidate code and has a secret-bearing EAS stage; **not approved as trusted**.

A Git blob SHA-1 is **not** the required independent workflow file SHA-256. This package intentionally leaves file SHA-256 `null`. The optional local read-only helper `VERIFY_USGCORSO_03D_LOCAL_BLOBS.ps1` can calculate SHA-256 from **existing local Git objects**, but only if those objects are already present. It does not fetch or modify anything and does not approve a workflow.

## Trust and security boundaries

A trusted publisher must use a separately reviewed and explicitly selected workflow on a protected trusted ref, with immutable commit and exact SHA-256 of the trusted workflow bytes. Neither of the observed workflows has been approved. No candidate source, candidate-owned policy or run metadata may choose or modify the trust anchors.

GitHub API observations are not independently signed release evidence. The publisher must authenticate GitHub responses with short-lived least-privilege credentials, pin the release workflow identity, verify exact artifact bytes against a cryptographically verified attestation with trusted roots, independently establish artifact-to-`run_attempt` binding, and deny unproven attribution. Requiring `run_attempt === 1` is necessary by policy but not sufficient proof. Candidate-controlled code must never execute in an `EXPO_TOKEN` process.

**NO-GO:** trusted publisher integration, push, Expo token access, and OTA publication. No attestation, candidate artifact, approval, or artifact-attempt proof is provided.
