# SAFETY 02B-03E-03A — Runtime sandbox preflight (design, NO EXECUTION)

Status: **PLAN ONLY / NOT A RUNTIME PROOF / NOT RELEASE AUTHORIZATION**.

The real EAS CLI v27.9.0 runtime execution boundary has not yet been tested. This package introduces a deterministic, non-executing Docker argument plan for an **independently built and reviewed** immutable image containing a synthetic fixture and a reviewed `/opt/probe/entry.mjs`. It deliberately does **not** create, pull, build or run an image. No image has been selected or approved. No Docker daemon is contacted.

## Required independent evidence before considering a later execution

1. Obtain and authenticate upstream EAS CLI v27.9.0 source, transitive dependencies and the **actual executable package**. A source blob Git SHA-1 alone does not authenticate a runnable CLI.
2. Review/build a disposable Linux image from an approved base image digest; verify the resulting exact local image ID `sha256:<64 hex>`, its filesystem, entrypoint and configured environment. Never rely on a mutable tag.
3. Fixture and runner must be synthetic, minimal, reviewed and **baked into the isolated image**. No candidate repository, host bind mounts, Docker socket, host source, credentials, network proxies or user profiles are passed to the container.
4. Independently verify Docker Desktop/daemon trust, host OS security, enforced network isolation, image provenance, resource limits and that the Docker engine / VM has no route to secrets. Docker flags alone are not a complete security proof.
5. Never place `EXPO_TOKEN`, `GITHUB_TOKEN`, `GH_TOKEN`, EAS credentials, private signing keys or other secrets into the environment or image. No EAS publish command until a separate, independently reviewed execution approval.
6. Instrument the eventual fixture so that a local marker can show whether controlled `app.config.js` executes **before** `--skip-bundler`; failure before config execution is **INCONCLUSIVE**, not isolation proof.

## Preflight design constraints

Generated argument plan defaults to `--network=none`, `--pull=never`, read-only root filesystem, no host mounts, dropped capabilities, nonroot UID, constrained memory/PIDs, private temporary filesystem and explicit image ID. The command is a **plan**, not a launcher. A docker image can itself carry untrusted code, secrets, privileged runtime assumptions or malicious configuration; it must be reviewed separately.

## Findings and limitations

`eas update --skip-bundler --input-dir` skips Metro but the pinned upstream command source requests dynamic project configuration earlier. Static source observations do not prove the runtime behavior or inability to execute untrusted config. An authenticated offline runtime check requires a reviewed image, runner and synthetic fixture; this package leaves all approval checks false by default.

`executionAuthorized=false` and `publicationAuthorized=false` are unconditional. No real EAS CLI, secrets, network, OTA or workflow were used. Even a future offline runtime success does not establish artifact provenance, artifact-to-attempt binding, credential isolation or production publishing approval.
