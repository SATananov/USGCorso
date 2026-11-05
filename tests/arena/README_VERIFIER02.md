# USG ARENA 03B4F — VERIFIER 02

Base commit: `70543348b5eafb01e5acf9334863e66495647a21`.

Advanced local fair-play checks compare a candidate GPS trace with a bounded collection of previous synthetic traces. Never send real route coordinates or secrets to this program as part of public demonstrations. No network, database, service keys, Android, award issuance or ranking writes occur.

Run all local unit tests:

```powershell
python -m unittest discover -s tests/arena -p 'test_route*.py' -v
```

New logic: an overlap of at least 50% of the shorter window for the same owner+dog triggers `OVERLAPPING_SESSION`; identical quantized sampled route shapes (7 evenly spaced samples, 4 decimal coordinate places) trigger `REPEATED_TRACE_REVIEW`. Outcomes are `CANDIDATE_ONLY`, `REVIEW_REQUIRED`, or `REJECT` for malformed local input. There is no `VERIFIED` outcome. Identical legitimate walking routes may be flagged; spoofed or re-timed traces may escape detection. Both thresholds and fingerprints are illustrative, not calibrated or suitable as a production fraud decision.

The new module does not change the existing `assess_route` API. In any future integration, run it only after basic route checks, and never use a `CANDIDATE_ONLY` result to award points. Do not store fingerprints or cross-session comparisons until privacy policy and retention controls are approved. Concurrency harness remains unexecuted.

Expected: 14 earlier verifier tests + 16 new fair-play tests = 30. No commit/push until user reviews PASS.
