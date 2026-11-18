# SAFETY 02B-02 — Offline GitHub run/artifact consistency verifier

Status: standalone local fixture verifier; **not** a release authorization gate.

## Scope

`verify-ota-provenance.mjs` uses Node.js built-ins only. It reads four independently supplied local inputs: a trusted policy JSON, an already-fetched GitHub Actions workflow-run JSON response, an already-fetched GitHub artifact JSON response, and the downloaded artifact archive. It checks run/repository/workflow/event/branch/source SHA identity, successful completion, run attempt, artifact association, artifact identity and expiry, ZIP size, and SHA-256 of the exact local archive bytes. It never executes the archive, invokes EAS, reads `EXPO_TOKEN`, or calls GitHub APIs.

The output `scope: offline-consistency-only` is intentional. An attacker controlling all four inputs can fabricate internally consistent values. **PASS does not authenticate provenance or authorize publishing.** The future privileged caller must obtain policy from independently protected release policy, obtain run and artifact objects from authenticated GitHub API requests (not files supplied by candidate code), and fetch the specific artifact by its ID. It must enforce that the accepted source SHA and the protected workflow definition are the intended ones. Successful GitHub API responses also do not on their own attest the entire build process or the GitHub workflow file's evaluated content.

## Current deliberate constraints

- Repository name is `SATananov/USGCorso`.
- **03B-02 path compatibility:** Real GitHub REST workflow-run and attempt responses for `SATananov/USGCorso` run `44241063989` (observed 2026-11-18) returned `path: ".github/workflows/ota-preview-publish.yml"`, with **no** `@main` suffix. The offline policy now requires exactly one unqualified `.github/workflows/*.yml` or `.yaml` path; `@main`, `@refs/heads/main`, traversal, or query suffixes are rejected. `run.path` must match policy exactly. **This is only a compatibility rule, not trusted workflow authentication**: a malicious caller controlling policy and run JSON can substitute another syntactically permitted workflow file name and still obtain offline PASS. A future trusted publisher MUST pin the exact allowed workflow path, trusted workflow commit and SHA-256 of the workflow definition independently, authenticate fresh GitHub API responses and reject mismatches. `policy.branch` and `run.head_branch` **remain main-only**; observed candidate-branch runs are not valid trusted-main producer fixtures. The intended future `ota-artifact-export.yml` workflow does not yet exist and its name in tests is hypothetical. `workflow_id` and numeric repository ID must be independently trusted. Do not relax these checks to support the candidate preview-publisher run.
- Run `head_sha` is required to equal the release policy `sourceSha`. This is suitable only for a workflow executing on that source commit. A future trusted-main workflow dispatching a *different* candidate commit must use a separately reviewed source-binding protocol (e.g. independently verified attestation), not simply reuse this equality check.
- GitHub's artifact `workflow_run` object associates the artifact with a run ID, but does not cryptographically bind it to a specific `run_attempt`. The verifier compares the **run** attempt to policy, but cannot prove the artifact was created in that attempt. A production integration **MUST FAIL CLOSED** unless independently authenticated evidence ties the chosen artifact to exactly the authorized attempt. In particular, identical `run_id`, `head_sha`, and matching digest do **not** prove attempt identity. Reject ambiguous reruns; never derive a claimed attempt from the artifact JSON alone. A regression fixture deliberately demonstrates that a caller can change both the policy attempt and the run response attempt while reusing the very same artifact object: standalone PASS still does not prove artifact attempt identity.
- The artifact digest is the SHA-256 of the downloaded GitHub artifact archive, not the individual exported files. SAFETY 02A handles inner-file validation only after independent provenance and archive extraction safeguards.
- The archive file must be regular, single-link, within 512 MiB and locally unchanged during reading. The three local JSON inputs are limited to 512 KiB each, reject duplicate JSON object keys (including escaped aliases), impose a 64-level parsing depth limit, and are read from verified file descriptors with pre/post file-identity checks; they are **not authenticated sources**. Symlinked parent-directory races are not fully prevented, and verification cannot guarantee unchanged pathnames after it finishes; use an isolated trusted workspace without concurrent untrusted writers.
- This fixture verifier does not implement API authentication, workflow-file SHA verification, authorization, ZIP extraction, manifest generation, protected environments, artifact attestation, Expo runtime checks, or credential isolation. Those remain explicitly NO-GO for integration.

## Test-only CLI example

```bash
node .github/scripts/verify-ota-provenance.mjs \
  --policy /absolute/trusted-policy.json \
  --run /absolute/github-run-response.json \
  --artifact /absolute/github-artifact-response.json \
  --archive /absolute/downloaded-artifact.zip
```

All paths must be absolute. This interface is **not** a safe production entry point until a trusted caller guarantees their independent origins. No real GitHub API or artifact is required for unit tests.

```bash
node --test .github/scripts/verify-ota-provenance.test.mjs
```

## Integration prerequisites

1. Trusted main workflow and repository policy approved separately; protect workflow edits and release credentials.
2. Authenticated, fail-closed GitHub API retrieval; verify repository/workflow identity and immutable source binding independently.
3. Explicit artifact-to-run-attempt binding, especially on reruns.
4. Verify archive digest and safe extraction; then invoke SAFETY 02A with expected identity independently established by the caller.
5. Demonstrate EAS CLI operation without any candidate code execution while secrets are present. Do not interpret `--skip-bundler` as such a guarantee.
6. Separate manual release authorization bound to exact artifact digest, source SHA, runtime and preview channel.

The strict JSON scanner rejects duplicate decoded keys in each object, while permitting the same key in separate nested objects. All numeric identifiers and artifact sizes must be positive safe integers, and the archive has an independent size cap. No existing workflow is modified by this patch. No GitHub push, EAS process or OTA publication is authorized.
