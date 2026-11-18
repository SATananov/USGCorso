# SAFETY 02B-03C — Trusted Workflow Identity and Artifact Attempt Binding

Status: **DESIGN-ONLY / FAIL CLOSED / NOT A RELEASE GATE**.

## Known local checkpoint

At the time of design, the reported local branch is `feature/eas-ota`, HEAD starts with `d64f108`, ahead of origin by six commits, and the user's worktree was clean. The local commit is **not** an independently reviewed publisher workflow identity. Neither this document nor the accompanying JSON identifies a workflow as approved for publishing.

## Trust boundaries

1. Candidate export runs without `EXPO_TOKEN`, publication credentials, or privileged GitHub App credentials. Candidate outputs, logs, JSON, and bundled attestations are **untrusted data** until independently verified.
2. A separately approved and pinned trusted workflow must be identified by repository ID, **full immutable Git commit SHA**, canonical workflow path, and **SHA-256 of workflow file bytes at that commit**. `path`, branch name, workflow ID, and `head_sha` alone are insufficient. Review the workflow plus all executable dependencies and pinned third-party actions. Never substitute a candidate-controlled workflow for this publisher.
3. GitHub API data must be obtained by a trusted actor using a short-lived, least-privilege repository-scoped credential; default to `Actions: read` for workflow/run/artifact reads. Validate separate permissions for attestation retrieval. Keep all credentials outside the candidate process, artifacts, diagnostics, and environment. Query HTTPS GitHub endpoints with bounded responses; do not treat candidate-provided API JSON as authenticated.
4. Require independently validated run and attempt endpoints, repository ID, event, branch, exact trusted workflow identity, source commit, success/completion, and `run_attempt === 1`. **Attempt-one policy alone does not bind an artifact to that attempt**. Reject reruns and any ambiguous or missing attribution. The run's job attempt metadata and the artifact's `workflow_run.id` are insufficient evidence.
5. Verify a cryptographic Sigstore/GitHub artifact attestation against trusted roots and strict issuer/signer claims. Verify that its subject **is exactly the downloaded archive's SHA-256**, and that independently authenticated signer/source/workflow/run/attempt claims actually exist and meet pinned expectations. Do not infer claims absent from the verified certificate or attestation. Verify provenance with supported `gh attestation verify` or equivalent, not raw matching of unauthenticated JSON.
6. **Open blocker**: no real candidate artifact or verified attestation has been inspected. The specific authoritative evidence binding an artifact to a selected workflow attempt has not yet been demonstrated. If authoritative claims cannot establish that binding, refuse publication. For an initial design, do not treat `run_attempt=1` or the lack of reruns as an attestation for a particular artifact.
7. **Open blocker**: the actual trusted publisher workflow commit and workflow-file digest remain unselected/unreviewed. Do not insert a guessed SHA or a mutable branch as the trusted value.
8. **Open blocker**: review the runtime behavior of Expo CLI/EAS publishing and any config resolution to ensure no candidate-controlled JS, `app.config.js`, package scripts, plugins or hooks execute with `EXPO_TOKEN`. If the execution boundary cannot be proven, **do not publish**.
9. Independent release authorization must bind source commit, artifact ID, **exact archive digest**, runtime/channel, candidate metadata, trusted workflow identity, and time-limited approval. Freshly re-fetch authenticated inputs and verify non-expiry, commit and provenance immediately before a one-shot publish. No credentials can be introduced into a step that executes candidate code.

## GitHub API path compatibility

The 2026-11-18 read-only observation of run `44241063989` returned path `.github/workflows/ota-preview-publish.yml` with **no `@main` suffix**. This observed path belongs to the existing candidate-branch validation/publishing workflow and is **NOT** an approved independent trusted workflow. Offline format compatibility is separate from trusted path identity: validate the exact path against independently pinned trusted workflow metadata.

## Explicit forbidden conclusions

- A passing offline file verifier or fixture is **not authenticated provenance**.
- A GitHub API run whose `run_attempt` is `1` is **not artifact-to-attempt proof**.
- An unverified attestation envelope or candidate-supplied signature is **not provenance**.
- An attestation proves certain signed provenance claims; it does **not** prove software harmlessness.
- A successful GitHub Actions run is **not authorization to publish**.

## Remaining work before implementation

Independently review and pin a trusted publisher workflow on `main` with full commit/file digest; select a constrained GitHub App credential and permission model; produce one safe candidate archive and verify a real attestation with an actual attempt claim or demonstrate a separate authoritative binding; test reruns, replacement, stale metadata, fork/source substitution and credential isolation; have an independent security review. No GitHub Actions configuration, Git branch, token, or OTA publication is modified by this design-only package.

## Reference documentation

- https://docs.github.com/en/rest/actions/workflow-runs
- https://docs.github.com/en/rest/actions/artifacts
- https://docs.github.com/en/rest/repos/attestations
- https://docs.github.com/en/actions/concepts/security/artifact-attestations
- https://cli.github.com/manual/gh_attestation_verify
