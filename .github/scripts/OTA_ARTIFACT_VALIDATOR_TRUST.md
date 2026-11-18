# OTA artifact validator — trust boundary (SAFETY 02A FIX03)

Status: **standalone untrusted-artifact structural validator only**. This file is not a release authorization and is not a proof of GitHub provenance. The validator must never run candidate `app.config.js`, project scripts, or installers; it validates files as data.

## Caller contract

`validateArtifact({ root, manifest, output, expected })` compares all seven `expected` identity fields with the manifest. **This comparison authenticates nothing unless `expected` was independently established by a trusted caller.** Never copy `expected` fields from the downloaded manifest, asset export, candidate PR output, or other untrusted file. A matching digest string by itself does not prove that the bytes came from GitHub.

The future trusted publisher must separately establish and verify:

- **sourceSha** — independently approved exact source commit, not sourced from artifact metadata. Verify its repository identity and authorization to release.
- **workflowSha** — actual trusted workflow execution commit from verified GitHub Actions run metadata; do not take it from the artifact. The workflow file contents and refs must be checked independently.
- **workflowRef** — allowlisted repository/workflow path and protected `refs/heads/main`, verified against the actual GitHub run; a matching string in the manifest is not evidence.
- **runId / runAttempt** — GitHub Actions run and attempt obtained from trusted context/API. Verify matching repository, workflow identity, event, status/conclusion, commit and attempt.
- **artifactId** — immutable artifact ID from trusted GitHub Actions upload output or GitHub API after authenticating the relevant run/attempt; verify association with the approved run.
- **artifactDigest** — `sha256:<64 hex>` independently retrieved from authenticated GitHub artifact metadata and checked against exact downloaded archive bytes using a documented digest procedure. Compare to the approved artifact record, never to a candidate-provided value alone.

The validator does **not** perform GitHub API lookups, check workflow protection, authenticate the manifest author, verify an attestation, determine policy approval, attest application runtime compatibility, or publish OTA. Those must be separate publisher gates. Never expose `EXPO_TOKEN` or other release credentials to candidate-controlled code or filesystem paths. The release pipeline must use isolated trusted Linux execution with immutable inputs and independently validated provenance. A successful validator result alone must not unlock a token-bearing job.

## Path categories

`metadata.json` asset and bundle `path` entries are filesystem-relative paths and must remain canonical, inside the export root, without traversal, symlinks, hardlinks, or device names. `assetmap.json` `httpServerLocation` is a Metro **logical original location**, not a filesystem path to open. A scoped npm package segment (e.g. `@react-navigation`) is allowed only immediately after a `node_modules` segment. This does **not** allow `..`, backslash, URL-encoded segments, or `@` in arbitrary locations, nor does it change `safePath()` rules.

The compatibility change is based on an observed USGCorso Android export reporting 71 assetmap entries and a location `/assets/node_modules/@react-navigation/elements/lib/module/assets`. A subsequent user-provided Android export was inspected and replayed against FIX04: 71 asset-map records; 86 exported files; 121,784,692 expanded bytes; 86 staged files compared byte-for-byte with the export, using a synthetic manifest and synthetic identity values. The replay demonstrated structural compatibility and byte integrity for **that one export only**. It did not authenticate GitHub provenance, verify a release run/artifact, demonstrate Linux EAS publication compatibility, or authorize publishing. The result was obtained in a separate isolated replay and is not independently reproduced by the unit-test suite in this repository.

## Residual risks

Filesystem parent-directory races are not fully eliminated by path-based checks. Use a non-shared isolated trusted runner with no concurrent untrusted filesystem writer. Windows symlink and FIFO tests may skip; exercise them on Linux. Bound depth/entry-count and case-collision tests should be maintained or expanded. Real OTA publishing remains explicitly prohibited until a separately authorized trusted publisher is implemented and audited.


## SAFETY 02A FIX04 — Windows export compatibility boundary

- `metadata.fileMetadata.android.bundle` may begin with the literal `_expo/` directory, with the remaining segments subject to normal strict filesystem validation. This allowance does not apply to asset paths or manifest paths.
- Android asset metadata may contain a Windows Metro asset reference in the exact form `assets\` followed by 32 hexadecimal characters. The validator converts that reference to the canonical slash-separated **comparison path** `assets/<hex>` after checking its full syntax. Other backslashes, mixed separators, drive prefixes, UNC references, traversal, empty/dot segments, and reserved names remain forbidden.
- The artifact inventory and trusted manifest continue to use canonical `/` paths. The raw `metadata.json` bytes are checked against their original manifest SHA-256 and staged byte-for-byte; the validator does **not** secretly rewrite signed metadata.
- EAS CLI on Linux resolves asset paths from metadata using the host platform. Accordingly, a Windows-created export, even when structurally validated by this component, is **not automatically Linux EAS publish-compatible**. A trusted Linux publisher must use a Linux-generated canonical export, or a separately reviewed and explicitly hashed trusted normalization step. This validator does not claim or implement the latter.
- A real Android export replay establishes structural compatibility for one recorded export, not publisher authorization, provenance, runtime compatibility or a production release approval.

## SAFETY 02A FIX05 — narrow _expo boundary

The Android bundle must not be the bare `_expo` directory name. The `_expo` exception is valid only for a file path beneath `_expo/`; traversal, unsafe segments, and all existing path constraints remain enforced. A negative regression test rejects the bare `_expo` metadata bundle reference. The complete real-export replay noted above predates FIX05; its positive `_expo/static/js/android/*.hbc` shape remains covered by the existing regression test.
