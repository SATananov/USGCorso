# SAFETY 02B-03E-02 FIX01 — EAS CLI text observation boundary

**ADVISORY TEXT MARKERS ONLY. NOT AN AST ANALYZER. NOT A RUNTIME PROOF. NOT A RELEASE GATE.**

## Source locator and provenance limitation

- Repository: `expo/eas-cli`
- Tag locator: `v27.9.0`
- File: `packages/eas-cli/src/commands/update/index.ts`
- Observed Git blob SHA-1: `7ca5a5d910e0abe62dcc7119dafd17933c1ba7e6` (**not** the content SHA-256)
- Source URL: https://github.com/expo/eas-cli/blob/v27.9.0/packages/eas-cli/src/commands/update/index.ts

Earlier upstream manual inspection reported that dynamic public and private project config methods are called before the `if (!skipBundler)` condition around `buildBundlesAsync`; input directory resolution follows. This is a **documented observation**, not independently authenticated by the included code. Do not assume the tag stays immutable. Do not run EAS against a candidate checkout with `EXPO_TOKEN`.

## Exact meaning of analyzer output

The analyzer accepts **operator-provided local text** and checks the presence, uniqueness, and ordering of six literal markers. The only positive statement is `textMarkerOrderObserved: true`. It **never** claims that the calls are executable, that `buildBundlesAsync` is inside a skip-bundler guard, or that dynamic configuration actually executes first.

In particular, the analyzer cannot distinguish markers in comments, quoted strings, unreachable code, moved method bodies, or changed TypeScript semantics. Comment-only and string-only inputs can produce an advisory text-marker observation. This is **not a vulnerability bypass** because every result explicitly has `sourceAuthenticityProven: false`, `semanticControlFlowProven: false`, `skipBundlerControlFlowProven: false`, `dynamicConfigExecutionOrderProven: false`, `codeExecutionIsolationProven: false`, and `publishAuthorized: false`.

FIX01 removes the misleading `skipBundlerSkipsBuildBundlesAsync` and `dynamicProjectConfigAccessBeforeSkipBundler` flags. Input files are read from a file descriptor with an `fstat` size gate before reading and a byte limit during reading. This mitigates oversized-file buffering; it does not authenticate a file or protect against a hostile concurrently modified filesystem.

The test inputs are synthetic; the test suite **does not run** the real EAS CLI, use secrets, call the network, validate provenance or test actual runtime isolation.

## Remaining blockers

Independently acquire and authenticate a pinned upstream source and dependencies; perform AST/call-graph analysis or carefully instrument real EAS CLI in an isolated, **secret-free and network-blocked** environment; verify independent publisher shell, artifact-to-attempt provenance, attestation, and credential isolation. No candidate-controlled code may execute with `EXPO_TOKEN`.

**Publisher disabled. No GitHub push. No OTA publication.**
