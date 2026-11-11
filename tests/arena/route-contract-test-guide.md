# USG ARENA 03B4F — VERIFIER 03 CONTRACT TEST 01

Baseline: `dfeaaa683de44c634e6847ef4fbc862201eab023`.

Offline integration contract for the existing `route_verifier.py` and `route_fair_play.py`. This step adds `route_contract.py` and 17 unit tests without touching the older modules.

The `assess_contract(candidate, previous_sessions)` function accepts a candidate object with `owner_id`, `dog_id`, `started_at`, `ended_at`, `reported_distance_m`, `reported_duration_s` and `samples`. History is a list or tuple of objects accepted by `assess_fair_play`. All example coordinates are synthetic.

Decision priority: malformed route -> `REJECT` without running Fair Play; invalid/oversized history -> `REJECT`; Fair Play input `REJECT` -> `REJECT`; either analyser `REVIEW_REQUIRED` -> `REVIEW_REQUIRED`; otherwise -> `CANDIDATE_ONLY`. Reason codes are kept in source order without duplicates. **No `VERIFIED` result, no XP awards, no external or database access.**

Run locally from repo root:

```powershell
python -m unittest discover -s tests/arena -p "test_route*.py" -v
```

Expected: 47 tests (existing 30 + new 17) and `OK`.

Important: this is not a production verifier, authentication layer, fair-play guarantee, data-retention process or award issuer. Source modules are unchanged. The existing two-database-connection concurrency harness is not run and remains a separate open gate. Repeated legitimate routes may be flagged. Test suite does not validate real device GPS or prevent spoofing.
