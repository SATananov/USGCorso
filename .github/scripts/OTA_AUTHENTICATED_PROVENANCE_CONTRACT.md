# USGCorso OTA — SAFETY 02B-03A: Authenticated Provenance Contract

**Status:** design-only / unimplemented; **not a release gate**. 2026-11-18.

## Boundary

The existing `.github/scripts/verify-ota-provenance.mjs` is an **offline consistency verifier**, not authentication. Candidate export is untrusted. The trusted publisher must independently acquire and authenticate all approval evidence; candidate-supplied `policy`, run JSON, artifact JSON, attestation JSON, and digest **cannot** be accepted as authoritative. This document neither grants GitHub permissions nor authorizes publishing.

`EXPO_TOKEN` must never be visible to any process that runs candidate-controlled code, dependencies, Expo config, build hooks, shell scripts, or dynamic JS. A publisher must consume already-validated inert output using a trusted, pinned implementation that does **not** evaluate candidate code or source-controlled build config. An Expo CLI invocation with candidate content and `EXPO_TOKEN` is not assumed safe merely because it follows a hash check. A secure way to publish prebuilt assets must be demonstrated separately; otherwise NO-GO.

## Frozen initial policy

- Repository identity: `SATananov/USGCorso` **and** its trusted numeric repository ID, obtained independently; do not infer this ID from this design document.
- Candidate branch: `refs/heads/feature/eas-ota`; source SHA must be a full, immutable commit identity.
- Trusted publisher workflow must be loaded from and pinned to an independently reviewed version on protected `main`; unreviewed candidate checkout is prohibited in credential-bearing jobs.
- Allow only the *first* workflow run attempt (`run_attempt === 1`), with **no reruns**; reject if the current run has ever advanced past attempt 1, even if an earlier artifact exists.
- The artifact must be immutable for the intended release, nonexpired, uniquely identified by API ID, and downloaded from an authenticated GitHub endpoint. Verify the **exact downloaded bytes** and content digest, not just a manifest value.
- Cryptographically verify a GitHub Artifact Attestation (signature, certificate/signing identity, trust root, and subject SHA-256) covering those **exact bytes**. Verify the asserted repository, immutable source commit, trusted signer workflow identity and ref, and the appropriate run/attempt identity from authenticated claims. If attempt identity is unavailable or cannot be bound to the artifact, **deny**.
- An attestation made by an uncontrolled candidate job is not sufficient as a trusted builder assertion. The signer workflow, OIDC credential boundary, and all build inputs must be independently reviewed and pinned. Signing an archive does not establish that its embedded code is benign.
- Approval is separate from provenance: human authorization (where required) must reference the precise repository, source SHA, run ID, attempt, artifact ID, archive SHA-256, intended channel/runtime, and a trusted immutable approval record.
- Re-fetch/check run state, relevant attestation claims and artifact digest immediately before publication to mitigate approvals that become stale after a rerun or artifact replacement. Fail closed on changes, ambiguous identity, rate limits, permission errors, missing pages, partial downloads, or unverifiable signatures.

## Data and proof requirements

| Input | Trusted source | Required check |
| --- | --- | --- |
| Repository | Authenticated GitHub REST response and trusted repository ID policy | exact full name and numeric ID |
| Workflow run | Authenticated `GET /repos/{owner}/{repo}/actions/runs/{run_id}` | repository ID; source SHA; branch; workflow ID/path; event; status completed; conclusion success; latest attempt equals 1 |
| Attempt | Authenticated `GET /repos/{owner}/{repo}/actions/runs/{run_id}/attempts/1` | same run, successful attempt; this endpoint alone does **not** attribute artifacts to the attempt |
| Artifact | Authenticated artifact ID/detail and run-artifacts enumeration (all pages) | exact ID/name, associated run, nonexpired, size, digest; uniqueness, no mismatched page or IDs |
| Archive | Authenticated GitHub artifact download, isolated file read | exact SHA-256/size and existing SAFETY 02A structural validation |
| Attestation | Independently fetched/verified GitHub attestation bundle and trusted root | cryptographic signature + subject hash + trusted signer / repository / source / run / attempt binding; **no acceptance based on unverified JSON** |
| Approval | Independently protected and auditable authorization | exact bound identity and digest, channel, runtime; fresh at time of publish |

Workflow-run API `path` representation (`@main` vs `@refs/heads/main`) is **not** to be loosened based on examples. Probe a real authenticated response and pin an allowlisted canonical representation after review. The current offline verifier accepts `@main` only. API response examples and `referenced_workflows` entries do not establish a universal normalized form.

## Adversarial cases: all must DENY

1. Candidate-supplied API JSON, fabricated attestation, forged policy, or forged approval.
2. `run_attempt` is 2+ or has increased to 2+ since approval.
3. The run says attempt 1, but the artifact cannot be cryptographically bound to the approved attempt.
4. Artifact belongs to same run ID/source SHA but an earlier or unknown attempt.
5. Correct attestation signature for the **wrong archive**, wrong source SHA, repo, signer workflow, or run/attempt.
6. Correct archive SHA-256 but no independently verified attestation or authorized publication approval.
7. Rewritten/deleted/expired artifact, stale API response, missing API page, duplicate ambiguity or redirected download outside verified trust constraints.
8. Signed artifact created by an untrusted candidate-controlled signer, even if GitHub-issued.
9. Any candidate source/config/dependency executed in a job with `EXPO_TOKEN`.
10. Publisher is asked to run EAS/Expo dynamic bundle or project config directly on untrusted candidate repository.
11. Runtime/channel mismatch, approval identity mismatch, or unreviewed workflow-definition change.

## Phase gates

**02B-03A (this package):** documentation and offline static contract tests only. No API client, secrets, GitHub Actions edits, EAS, artifacts downloaded, or release action.

**02B-03B (future; separate permission):** read-only authenticated GitHub API compatibility evidence for one real run, including `path`, workflow ID, attempt and artifact shapes; redact sensitive data. Absence of a real run is a blocker, not permission to improvise.

**02B-03C (future; separate permission):** implement isolated authenticated sourcing and cryptographic verification, with offline negative tests, challenge cases and independent audit. No credential-bearing publisher.

**Publisher (future; separate permission):** approved workflow isolation, real Expo publish path audit, protected-environment reviewer rules and precise human authorization. First real publication only after additional permission.

## Primary references (read-only)

- GitHub REST workflow runs and attempts: https://docs.github.com/en/rest/actions/workflow-runs
- GitHub REST workflow-run artifacts: https://docs.github.com/en/rest/actions/artifacts
- GitHub artifact attestations: https://docs.github.com/en/actions/concepts/security/artifact-attestations
- GitHub verification documentation: https://docs.github.com/en/actions/how-tos/secure-your-work/use-artifact-attestations/verify-attestations-offline
- GitHub REST attestations warning (signature and identity must be verified): https://docs.github.com/en/rest/repos/attestations
- GitHub OIDC claims: https://docs.github.com/en/actions/reference/security/oidc
