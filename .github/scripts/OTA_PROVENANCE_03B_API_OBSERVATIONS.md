# SAFETY 02B-03B-01 — Real GitHub API observation and compatibility

Status: READ-ONLY OBSERVATION. These fixture values are **NOT authenticated evidence** and this package is **not a release gate**.

## Observed on 2026-11-18

Repository: `SATananov/USGCorso` (repository ID `1436603966`).

Read-only GitHub API endpoints were queried for run `44241063989`, including `/attempts/1`, `/artifacts`, and `/jobs`. The run reports workflow ID `422159467`, source SHA `0d8eade5e844fdeba9b471e049d90603139888d8`, branch `feature/eas-ota`, `run_attempt: 1`, and `completed/success`.

The actual workflow run response reports `path: ".github/workflows/ota-preview-publish.yml"` **without** an `@main` or `@refs/heads/main` suffix. The existing offline verifier may require `@main`. The discrepancy is real API compatibility evidence, **not** permission to modify that verifier or to relax matching to arbitrary paths.

The artifact collection for this run returned `total_count: 0`. There is no artifact or attestation from this run to bind to an attempt or release. The job list reported two jobs with `run_attempt: 1`, but job attempt metadata does **not** prove artifact-to-attempt binding.

## Required follow-up for trusted integration

1. Independently authenticate fresh GitHub API responses using a trusted, least-privilege credential held outside candidate execution. Do not accept candidate-supplied JSON as proof.
2. Pin exact trusted workflow commit **and** SHA-256 of its trusted workflow file; compare both against trusted data. Do not infer trusted workflow identity from an API `path` string alone.
3. Determine field compatibility against the exact API endpoint and release workflow in use. Treat unverified path forms as an integration blocker; fail closed.
4. Obtain a cryptographically verifiable attestation that binds the **exact archive digest** to the permitted repository, trusted issuer, workflow and source. Validate against trusted roots and independently sourced claims.
5. Establish authenticated artifact-to-attempt binding. Require `run_attempt === 1`, reject any rerun or ambiguity, and **fail closed** if exact attribution is not proven. Attempt-one labels on their own are insufficient.
6. Require an independent, narrowly scoped release approval and re-fetch/revalidate authorization immediately before any publication.
7. Do not execute candidate-controlled code in any process with `EXPO_TOKEN`. Existing `ota-preview-publish.yml` has not been remediated.
8. Keep these observations outside the chain of release authorization. No mock/fixture can establish provenance.

## Coverage boundaries

The included tests validate only this recorded, limited read-only observation and the intended failure posture. They do **not** verify network authentication, cryptographic signatures, GitHub artifact attestations, actual trusted workflow SHA-256, GitHub App credential scoping, or release readiness.

No workflow, local Git repository, protected branch, secret, EAS environment or OTA update is modified by this package.
