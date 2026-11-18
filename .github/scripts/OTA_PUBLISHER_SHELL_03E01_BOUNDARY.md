# SAFETY 02B-03E-01 FIX01 — local, non-publishing shell proof

## Security decision

**NOT A RELEASE GATE. NO-GO for trusted publishing or real OTA.** This helper is a local, bounded staging experiment, not a hardened credential-bearing tool. It must never be called with real tokens, and does not invoke EAS CLI or any network API.

## Changes from first proof

- Manifest **allowlist**, not blacklist: only the synthetic `bundle.hbc` path and simple `assets/...` image/font paths are accepted. `app.config.js`, `package.json`, `.js`, `.mjs` and other candidate-controlled project code are rejected **even when listed with correct SHA-256**. This deliberately does **not** model all real Expo export formats.
- Candidate and destination path containment uses real paths of the existing source and destination parent, with case-insensitive comparisons on Windows. Rejects overlap before writing. Junctions, directory aliases, and reparse-point races require more scrutiny before any privileged use.
- Explicit limits: 16 files, 8 MiB/file, 32 MiB total, 64 source tree entries, 6 directory levels. Stages one file at a time; no all-file content buffer. These limits are only for synthetic tests and cannot process the real production-sized export.
- Checks inherited `process.env` **and** the passed `environment` object for `EXPO_TOKEN`, `GITHUB_TOKEN`, and `GH_TOKEN` (presence alone rejects). This is only a refusal guard; not OS sandboxing or proof that the full environment is secret-free.
- Best-effort cleanup of a partially created destination only when it retains the same inode/device identity. No claim of safe recovery from concurrent hostile filesystem mutation.

## Remaining blockers

The source directory and destination parent are not pinned through OS directory handles, and a malicious concurrent filesystem actor could race checks, writes, and cleanup. `O_NOFOLLOW` may not be effective on all Windows filesystem configurations. The skipped symlink case on Windows remains unproven. Strong publisher isolation requires separate runner/filesystem permissions, immutable artifacts, independently validated provenance and attempt binding, token isolation, and code-level review of the **exact** EAS CLI version and project shell.

Do not push, run EAS, configure credentials, or authorize OTA based on this proof.
