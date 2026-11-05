# USG ARENA — 03B4F VERIFICATION AUDIT 01

**Mode:** READ-ONLY source audit. No runtime, SQL, Android, award or ranking changes.
**Source checkpoint:** `a7fac5ea5a018c261a278543ed47234c08fcb4a3`
**Review inputs:** `tests/arena/route_verifier.py`, `route_fair_play.py`, `route_contract.py`, the three corresponding test files, and `README_CONTRACT01.md`, retrieved from the repository at this commit.

## Executive finding

**Outcome: OFFLINE FOUNDATION ACCEPTABLE; NOT PRODUCTION-READY.** The 47 tests were reported as PASS in the user's Windows environment before this audit. This source audit is a static review, **not** a repetition of those tests, a concurrency exercise, a security penetration test, or a demonstration of GPS authenticity. No automatic ranking/verified awards should be enabled.

## Verified from source

- `assess_route` validates ordered GPS sample timestamps, bounded numeric fields, time duration, accuracy and geometric distance. Structural errors return `REJECT`; weak or unusual signals return `REVIEW_REQUIRED`; plausible traces return `CANDIDATE_ONLY`.
- `assess_fair_play` checks same-owner/same-dog time overlap (50% of shorter session) and seven-anchor rounded geographic shape; both are review signals, not fraud verdicts.
- `assess_contract` prioritizes `REJECT` over `REVIEW_REQUIRED`, deduplicates reason codes, and exposes `eligible_for_award=False` only. It has no `VERIFIED` branch or database access.
- `assess_contract` skips Fair Play when the route itself is structurally invalid; inputs are not intentionally mutated.
- No external requests, service-role credentials, database queries, Android location permissions, or point issuance appear in these three modules.

## Findings, with evidence and recommended direction

### F01 — High: malformed historical session blocks unrelated new candidate

**Evidence:** `route_fair_play.py`: `previous = [_read(item) for item in previous_sessions]` validates every supplied historical entry before filtering by owner/dog. Any invalid historical item returns `FairPlayResult('REJECT', ('INVALID_INPUT',), 0)`; `route_contract.py` then rejects even a well-formed current candidate. This can become a denial-of-review condition when history is stale or corrupted.

**Direction:** in future trusted ingestion, fetch bounded authoritative history for only the same owner/dog; quarantine invalid historical records; make their corruption an explicit `REVIEW_REQUIRED`/operational error rather than silently treating the new trace as fraudulent. Test policy and audit before changing outcome semantics.

### F02 — High: bounded entry count but no total processing budget

**Evidence:** `assess_fair_play` allows up to 1000 history entries; each `_read` can accept up to 300 samples. This permits up to 300,000 historical points, plus strings and nested objects; there is no aggregate bytes, CPU or wall-clock limit in the pure-Python API. The database ingress has separate limits, but this offline caller does not inherit them automatically.

**Direction:** bound input bytes, history time window, server-owned number of sessions, total points, and worker runtime in a future server adapter; do not permit arbitrary client-supplied history.

### F03 — Medium: shape fingerprint is heuristic and can both collide and miss replays

**Evidence:** `_shape` samples seven anchors evenly by **index**, rounds latitude/longitude to four decimals, and compares equality. Sampling changes and GPS noise may change fingerprints; unrelated walks on the same familiar path can match. No time-based resampling, confidence, or calibration is present.

**Direction:** preserve `REPEATED_TRACE_REVIEW` as an inconclusive flag. Add synthetic adversarial tests, timestamp-resampled alternatives, privacy review and field calibration before using it in enforcement.

### F04 — Medium: route-quality checks are not antifraud / proof of a dog walking

**Evidence:** `assess_route` uses user-supplied coordinates, reported distance and timestamps; computes Haversine distance and speed, with provisional thresholds (10 usable samples, coverage 70%, median accuracy 25m, 8 m/s maximum segment speed, max(150m, 20%) distance tolerance). This detects implausibilities, not mock-location software, clock tampering, device sharing, vehicles, or owner/dog presence.

**Direction:** keep all results provisional; only a trusted authenticated reviewer or stronger evidence workflow may approve verified status. No automated award based on `CANDIDATE_ONLY`.

### F05 — Medium: unexpected runtime exceptions not uniformly fail-closed

**Evidence:** `route_contract.py` checks candidate keys, then directly calls both analyzers. Both underlying modules catch common parse exceptions but do not have a unified bounded worker error contract for unexpected exceptions or resource exhaustion. In `route_fair_play`, the overlap and fingerprint computations occur outside its `try` block. An unforeseen exception could propagate rather than create a stable review/audit result.

**Direction:** add a narrow adapter boundary with a policy for unexpected errors, bounded executions, observability without GPS disclosure, and regression tests using fault injection. Preserve a distinction between invalid evidence and internal service failures.

### F06 — Medium: identity and history are caller asserted in the local contract

**Evidence:** `route_contract` accepts `owner_id`, `dog_id` and `previous_sessions` from the caller and passes them to analyzers. The local functions do not verify a JWT or authoritative ownership. This is acceptable in offline test fixtures, not a production API.

**Direction:** a trusted server must derive owner identity from verified authentication, check dog ownership/consent, load restricted history itself and prohibit direct client access to service-role ingestion/review/awards.

### F07 — Medium: concurrency and award authorization still unverified

**Evidence:** repo has a concurrency test harness, but the user intentionally chose not to execute two live DB connections; the three local modules do not write award records. Unique source indexes alone do not validate cross-key overlaps, ongoing consent, concurrent reviews, or source authenticity.

**Direction:** keep awarding and public competition disabled. Before activation, use safe separate-connection testing, atomic award issuance, review authorization, and replay/consent-race tests.

### F08 — Medium: privacy policy / retention lifecycle is incomplete

**Evidence:** local analyzers work with raw coordinates. No proof is provided in these files of deployed data redaction, route deletion after decisions, appeal process, or expiring verified/held GPS evidence. Design documents and separate retention migration exist, but this audit did not validate deployed infrastructure.

**Direction:** approve retention and appeal timelines, no-location logging, owner export/deletion rights and minimal-necessary access before collecting raw GPS at scale.

## Test coverage gap matrix

| Area | Existing evidence | Missing proof |
| --- | --- | --- |
| Bad coordinate/timestamp | Covered in unit tests | Fuzz/property-based tests, extreme timestamp formats |
| Distance/speed/signal | Basic unit tests | Noise calibration, long gaps, realistic device traces |
| Repeat/overlap | Synthetic unit tests | Reordered/interpolated traces, collision rates, spoof/replay variants |
| Result merging | Contract unit tests | Unexpected exception and service-failure policy |
| History size | Count-overflow test | Aggregate payload/CPU/time bounds |
| Identity | Owner/dog fixture separation | Authenticated, server-derived identity and authorization |
| Concurrent ingest | Script staged, not executed | Two-connection PASS, interleaving, retries, consent races |
| Verified awards | Source ledger uniqueness | Transactional trusted issuer, never double issue |
| GPS privacy | Architecture and private DB structures | Deployed access audits, logging, retention/appeals |

## Priority for next patch — 03B4F AUDIT FIX01 (offline only)

1. Add adversarial regression tests first, including malformed unrelated history, different GPS sampling density/noise, huge history budget, and analyzer fault injection.
2. Implement a *pure* fail-closed input/processing-boundary adapter; do not change production schema, client permissions or award logic.
3. Explicitly distinguish `INVALID_EVIDENCE` from `INTERNAL_REVIEW_FAILURE`, without treating backend faults as user fraud.
4. Run all 47 existing tests plus new tests on Windows; require no regressions.
5. Only then review the server gateway design, without enabling any endpoint.

## Release gates

- **PASS (previously user-reported):** 47/47 offline unit tests.
- **PASS (this audit):** read-only review against exact committed source files.
- **OPEN:** F01–F08, especially server auth, concurrency, spoof detection, false-positive calibration, privacy and auditable awards.
- **BLOCKED:** automatic verified GPS, Arena award issuance, public ranking, production ingestion endpoint.

**Verdict:** proceed with offline safety hardening only. Do not mark real GPS authenticity or concurrency as PASS.
