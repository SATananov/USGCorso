# USG ARENA 03B4F — AUDIT FIX02 / GPS Edge Cases & Resource Safety

Baseline: `3eaf85c54674798491e4e0287d685469e845ec6e`.

Offline-only safety hardening. No new API, DB migration, Android permission, GPS upload, verified status, awards, or public ranking.

## Changes

- `route_verifier.py` flags `GPS_SIGNAL_GAP` for a gap over 180 seconds between **usable** GPS measurements; this is a provisional review signal and not a rejection or accusation. Timestamp text is limited to 64 characters before parsing.
- `route_contract.py` checks history shape before passing records to the Fair Play verifier. Large strings, deep/unexpected payloads and excessive numbers of entries cause `REVIEW_REQUIRED` + `HISTORY_BUDGET_EXCEEDED`.
- The already-established limits of 1000 sessions and 6000 listed samples remain, with an additional conservative **estimated** historical processing budget of 262144 bytes. This is an approximation, not exact memory accounting. It avoids materializing/serializing the entire history.
- `REJECT` remains for malformed new route data. Corrupted prior records still produce `REVIEW_REQUIRED` + `HISTORY_CORRUPTED`. No path can grant awards.

## Tests

New: 15 synthetic offline edge-case tests in `test_route_audit_fix02.py`.

Expected total after patch: 61 previous tests + 15 = **76 tests**. Verify on Windows:

```powershell
python -m unittest discover -s tests/arena -p "test_route*.py" -v
```

## Limitations

- 180-second gap is a proposed threshold, not calibrated on real-world devices; gaps may arise in normal use and must not automatically punish owners.
- No wall-clock/CPU cancellation, OS memory isolation, per-request gateway byte limit, authentication or hardware integrity checks are provided here. A trusted deployed gateway/worker needs all of these.
- Previously accepted data can still have false positives/negatives. `CANDIDATE_ONLY` is not proof of walking and cannot issue XP.
- Concurrent database ingest remains untested. Do not enable GPS-based points or public ranking.

No commit or push until all tests and Git diff pass on the user's machine.
