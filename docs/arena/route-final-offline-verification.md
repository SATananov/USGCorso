# USG ARENA — 03B4F FINAL OFFLINE VERIFICATION AUDIT

**Mode:** Read-only source audit, no deployed functionality changed.
**Source checkpoint:** `2833a3c40d6b6d93cb0b7e2715f2a2c7e9439796`.
**Scope:** `tests/arena/route_verifier.py`, `route_fair_play.py`, `route_contract.py`, `test_route_contract_validation.py`, `route-audit-contract-validation.md`, `route-audit-input-validation.md`, `route-contract-test-guide.md`, and prior audit document, inspected at the checkpoint.
**Testing evidence:** User reported `OK` after the AUDIT FIX02 unittest run. The expected suite is 76 tests (61 previous + 15 new), but the provided final excerpt does not independently show `Ran 76 tests`. This audit is a source review, not a fresh execution of the full test suite.

## Executive decision

**OFFLINE FOUNDATION: ACCEPTABLE FOR FURTHER DEVELOPMENT. PRODUCTION GPS VERIFICATION: BLOCKED.**

All three analyzers remain local and pure, with no service credentials, database interaction, Android hooks or point issuance in the reviewed modules. The `ContractResult.eligible_for_award` dataclass field defaults to `False`, and the current contract never sets it to `True`. A `CANDIDATE_ONLY` outcome means a plausible trace, not verified dog walking. This audit does not validate spoof resistance, a live server gateway, or consent/ownership authorization.

## Verified safeguards from source

1. **Route input:** Accepts 2–300 ordered samples and checks timestamp timezone, coordinate ranges, accuracy, stated duration/distance, reported-versus-derived distance and segment speeds. Structural invalidity returns `REJECT`.
2. **Route uncertainty:** Too few usable points, weak signal, implausible speed, insufficient movement, distance disagreement and a usable-sample gap greater than 180 seconds trigger review reasons. Gaps of exactly 180 seconds are not flagged by this rule. Thresholds are provisional, not calibrated.
3. **Historical context:** Fair Play flags overlap at 50% of the shorter session and equal seven-anchor, four-decimal route shapes. These only trigger `REVIEW_REQUIRED`; repeating the same walk is not proof of fraud.
4. **Merged contract:** Rejects a structurally invalid *new* route. Corrupted *historical* data, excessive history and unexpected analyzer errors lead to `REVIEW_REQUIRED`, with reason codes rather than raw exception details.
5. **Boundaries:** `MAX_HISTORY_SESSIONS=1000`, `MAX_HISTORY_SAMPLES=6000`, `MAX_HISTORY_BYTES=262144`, 128-character/byte historical string limits, and a 64-character timestamp limit in route verification. The history byte budget is an approximation, not an actual memory allocation limit.
6. **Outcome safety:** No `VERIFIED` outcome or award-issuing path exists in these modules.

## Remaining risks and priority

### P0 — Required before any real GPS ranking or award

- **Authentication/ownership:** `owner_id`, `dog_id` and `previous_sessions` are caller-provided to the local function. A trusted server must validate JWT, derive owner ID, enforce dog ownership and consent, and load private history itself; never expose service credentials to a device.
- **Real concurrency:** The two-database-connection ingestion test harness is committed but has not been run. Idempotence, distinct-key overlapping evidence and review/retention/consent races are not proven under contention.
- **Verified decision and awards:** No authorized audit-backed review transition or atomic, idempotent award issuer is present in the reviewed Python modules. Public ranking and automatic GPS XP must remain off.
- **Privacy lifecycle:** Real location history, logging redaction, owner access/deletion, appeals and retention of verified/held sessions need an approved policy and deployed tests.

### P1 — Offline processing/accuracy hardening

- **Resource bounds are advisory:** `_bounded_history` assigns fixed estimates (256 bytes/session, 160 bytes/sample). It does not measure actual Python object memory, arbitrary integer conversion cost, CPU time or worker wall-clock. No OS-level sandbox or deadline exists.
- **History-error recovery cost:** On a full-history Fair Play rejection, `assess_contract` reprocesses each historical record in a separate `assess_fair_play` call, then potentially re-evaluates the valid subset. Bounded item/sample counts limit growth, but no measured latency profile or cancellation proves safe production service limits.
- **History isolation:** Current Fair Play validates all supplied historical records before checking owner/dog; even an unrelated corrupted entry leads to a review flag. This is safer than rejecting, but the future server should query only authorized same-owner/same-dog history and quarantine corruption.
- **Candidate input budget:** Candidate samples are count-limited, timestamps are length-limited, but there is no complete gateway-level request-byte limit, admission control or protected process deadline in the local contract.
- **Heuristic fingerprint:** Seven evenly spaced index-derived anchors can collide on common paths, be affected by sample density or noise, and miss re-timed/spoofed routes. This is a *review signal*, not a fraud verdict.
- **Threshold calibration:** The 180-second gap, 8 m/s speed and quality thresholds have not been field-calibrated with consented on-device routes, urban canyons, poor satellite reception or large-dog exercise patterns.

### P2 — Documentation and test completeness

- **Outdated README:** `tests/arena/route-contract-test-guide.md` describes invalid history as `REJECT`, whereas FIX01/FIX02 changed current `assess_contract` behavior to `REVIEW_REQUIRED`. Keep older historical notes labeled by version or add a current contract document so readers do not mistake an old contract for the live one.
- **Test breadth:** 76 is the expected cumulative test count; user output confirms `OK`, not the exact count in the last excerpt. Synthetic tests are not a replacement for fuzz/property-based testing, replay variants, latency measurements or Android field trials.

## Readiness table

| Area | Evidence | Decision |
| --- | --- | --- |
| Deterministic local route parser | Source inspected and previous local tests reported | Ready for further offline development |
| Overlap and repeated-shape review | Source inspected; heuristic only | Ready for offline experimentation |
| Contract merge and fail-safe review | Source inspected; FIX01/FIX02 applied | Ready for offline experimentation |
| Approximate historical input bounds | Source inspected; no execution deadline | Partial; not sufficient for untrusted server |
| Production identity, consent and moderation | No live integration audited | Blocked |
| Real concurrent ingestion | Harness unexecuted | Blocked |
| Actual GPS authenticity | Cannot be proven by these algorithms | Blocked |
| Verified award issuance and public ranking | Not enabled | Blocked |

## Recommended next small step

**03B4F AUDIT FIX03 — OFFLINE BOUNDARY & DOCUMENTATION:** Add a current-version contract README and deterministic adversarial tests for exceptionally large numeric inputs, unusual timestamp objects, input budget boundaries, history recovery cost and repeat-shape false positives. Do not rewrite working production behavior merely to satisfy tests; start with test evidence and isolated measurements. Preserve `REJECT` for malformed current evidence and `REVIEW_REQUIRED` for historical/service uncertainty. Keep all XP/verification disabled.

For future gateway implementation, separately design authenticated server-owned history retrieval, strict wire request-size limits, isolated worker CPU/memory/deadline bounds, review audit, privacy and safe concurrent tests. A second Supabase project is **not required for this read-only audit or offline hardening**, but the unexecuted concurrency gate cannot be marked PASS.

## Non-goals and release boundary

This document adds no API route, SQL migration, Android build, production GPS capture, scheduler, automated verification, score awarding or public leaderboard. A read-only source audit is not a penetration test, a measured scalability test or an assurance of a genuine dog walk. No commit/push is performed by the package.
