# USG ARENA 03B4F — VERIFIER 03 / INTEGRATION DESIGN 01

Status: DESIGN ONLY — not implemented or deployed.
Baseline: `b6138778a357c9165545d556e9a78eefdb8a59c3`.
Scope: design integration boundary between existing Python GPS checks and private Supabase staging. No changes to database, Android, ranking, XP or deployed endpoint.

## A. Verified source baseline

1. `tests/arena/route_verifier.py` exposes `assess_route(started_at, ended_at, reported_distance_m, reported_duration_s, samples)` -> `VerificationResult(decision, reasons, usable_samples, calculated_distance_m, covered_duration_s, max_segment_speed_mps)`.
2. `tests/arena/route_fair_play.py` exposes `assess_fair_play(candidate, previous_sessions)` -> `FairPlayResult(decision, reasons, compared_sessions)`. Both analyzers are locally deterministic and have no network/database access.
3. Local tests: 30 PASS confirmed by developer environment on Windows; no production route samples evaluated.
4. `usg_arena_ingest_gps_evidence_server` accepts trusted caller parameters (including owner_id), checks dog ownership and both opt-ins, bounds time/distance/size, normalizes and stores samples, and is granted to `service_role` only. It does NOT authenticate the actual external requester or verify a physical walk.
5. `usg_arena_retention_cleanup_server` is service-only; `dry_run` default, manual deletion requires explicit confirmation. Pending/rejected older than policy cutoff are candidates, but verified, held or award-linked evidence is protected.
6. `usg_arena_verified_awards` has unique `(source_type, source_id)` but no award-issuer integration is present. Ranking and real award issuance remain disabled.
7. Concurrency harness exists but real two-connection tests are **NOT RUN**.

## B. Proposed end-to-end architecture

`Samsung app (foreground GPS, optional consent)`
   -> `Authenticated HTTPS gateway (not yet implemented)`
   -> `private service-only ingest RPC`
   -> `pending GPS evidence + immutable samples`
   -> `isolated trusted Python verifier (not yet implemented)`
   -> `human/automated review queue with audit`
   -> `separate award-issuer transaction (future, disabled)`
   -> `privacy-filtered ranking read (future, disabled)`.

The current mobile GPS flow is summary-to-manual-activity. It does not yet transmit route samples to this gateway.

## C. Trust / authentication

- The user-facing app uses only a publishable Supabase key and JWT; it never receives `service_role`, database URLs, raw server credentials, or unrestricted RPC grants.
- Gateway validates JWT signature, issuer, audience and expiry using supported Supabase auth verification; derives owner_id exclusively from verified auth subject, never request body.
- Gateway checks dog ownership, opt-in for both owner and dog, content moderation rules, size/rate limits, duplicate submission key, replay windows and device/account abuse signals.
- All direct database sample/ingestion functions remain non-executable/non-readable to anon and authenticated roles; service credentials live only in trusted server runtime.
- Do not trust client-calculated distance, accuracy or timestamps as proof; all are attacker-controlled inputs until independently assessed.
- Separate ingestion permissions from review and award issuance capabilities wherever possible. Keep narrow database privilege boundaries.

## D. Canonical data contract (proposal)

Client-to-gateway JSON envelope:
- `dog_id`: UUID (owner_id never accepted)
- `submission_key`: UUID, stable across retries
- `started_at`, `ended_at`: offset-aware ISO 8601 timestamps
- `reported_distance_m`: integer
- `reported_duration_s`: integer
- `samples`: 2–300 ordered objects `{measured_at, latitude, longitude, accuracy_m}`

Gateway validates total bytes and schema before DB access, then uses verified owner identity to invoke existing service-only ingestion RPC. The current SQL payload upper limit is 131072 bytes for `p_samples`; external limits may be stricter.

Response returns opaque `session_id`, `status=pending`, and `receipt_version`, never a verified claim, coordinates, or awarded points. Same-key exact retry returns identical session ID, inconsistent retry produces conflict. Return generic non-sensitive errors and correlation ID.

## E. Mapping Python modules to a future trusted runtime

Current Python modules are standard-library-only; deployment environment could be an isolated Python worker on a trustworthy server (not Expo/React Native). A Supabase Edge Function uses a different runtime, so it cannot import the Python modules directly. Choose one of:
1. **Preferred for code reuse**: authenticated gateway + separate Python verification worker, using service-side database credentials and bounded job execution.
2. A reimplementation of both algorithms in TypeScript for a supported server runtime, only after golden-fixture parity tests demonstrate equivalent decisions/reason codes. Do not silently port and assume identical behavior.

Verifier loads **only one private pending session** and at most a bounded history of the same authenticated owner+dog. The full source evidence must be read from restricted service-owned tables, not app-provided history.

Proposed algorithm:
1. Parse and validate DB evidence; require pending review status and no retention hold against review policy.
2. Run `assess_route` on the stored samples.
3. If `REJECT`, mark rejected only through a service review transaction; if `REVIEW_REQUIRED`, enqueue for manual review; if `CANDIDATE_ONLY`, continue, but never auto-verify solely because of this result.
4. Run `assess_fair_play` on bounded, relevant prior sessions; flag overlap and repeated trace for review, not automatic accusation.
5. Write a versioned review audit (proposed; no schema exists yet). Need human approval/independent evidence policy for genuine verification.
6. Award issuance is a **different** future transaction with unique source, current consent and eligibility checks; no awards from analyzer output.

Current DB review status constraint supports `pending`, `rejected`, `verified` only, not `needs_review`. The UI "review needed" should initially be an internal queue/flag without inventing a new status unless an explicit migration is approved. The analyzer's `REJECT` is a risk assessment, not permission for automatic database transition.

## F. Concurrent safety and retention

- Exact retry is specified, but two-connection concurrency not demonstrated. Keep integration disabled until this is tested with a safe isolated environment or controlled alternative.
- Different submission keys can represent overlapping sessions; treat that as a review signal, and add transactional duplicate-award protection before production.
- Retention may delete old `pending` or `rejected` sessions. Review worker must lock/check existence and current status at transition time; any stale job exits harmlessly.
- Manual hold/appeal and award-linked evidence cannot be cleaned by current retention function, but long-term retention for verified/held sessions needs a policy.
- Define race tests: simultaneous submission, consent withdrawal, review vs retention, repeat review, review vs award; guarantee no double awards.

## G. Security/privacy and operational gates

- No raw location in logs, public ranking, debug analytics, push messages or client-visible review text.
- Use short-lived, least-privilege service access; no secrets in `.env.example` or checked-in tests.
- Review the user's rights: consent, export, appeal, deletion, purpose limitation, data retention periods. GPS can expose home/work.
- Security monitoring should log session IDs, reason codes, policy versions and aggregate counters without coordinates.
- All review state changes and any future awards need identity, policy/version, timestamp and audit integrity.
- Android verification on a real physical device with foreground-only permission, BG/EN/IT in-app messaging, and no system Alert.

## H. Rollout gates / checkable next steps

**03B4F VERIFIER 03 DESIGN 01 — this step**
- Deliver design artifact only. PASS criteria: correct baseline/paths, no source code or SQL change, review by user.

**03B4F VERIFIER 03 CONTRACT TEST 01 — safe next step**
- Create a pure-Python, offline contract adapter that combines `assess_route` and `assess_fair_play` over synthetic fixtures.
- Assert fail-closed outcomes, bounded history, deterministic merged reason codes, and immutable input.
- Run all 30 existing tests plus new tests; no network, database or Expo.

**GATEWAY 01 — future (blocked)**
- Authenticated JWT-to-owner binding and private ingest endpoint; request/rate limits; isolated integration tests.
- No user-facing activation until owner/dog consent, privacy policy and concurrency checks are ready.

**REVIEW 01 — future (blocked)**
- Policy-versioned queue/audit, reviewer authorization and safe decision transitions; SQL migration with independent audit and rollback tests.

**AWARDS 01 — future (blocked)**
- Transactionally idempotent service-only award issuer, consent/eligibility checks, concurrent issue tests, public ranking off until audited.

## I. Explicit non-goals

No second Supabase test project required for DESIGN 01 or offline CONTRACT TEST 01. These do not prove production concurrency. No real GPS collection, automatic verification, admin permissions, SQL migrations, award issuance, public ranking, background scheduler or deployment.

## J. Source files inspected

- `tests/arena/route_verifier.py`
- `tests/arena/route_fair_play.py`
- `tests/arena/README_VERIFIER02.md`
- `supabase/my-corso-arena-03b4c-fix01.sql`
- `supabase/my-corso-arena-03b4e-retention02.sql`
- `supabase/my-corso-arena-03b3a.sql`

Reference commit: `b6138778a357c9165545d556e9a78eefdb8a59c3`.
