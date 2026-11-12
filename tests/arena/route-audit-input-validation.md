# USG Arena — Route Input Validation

Baseline: `9c8d5c1ace605c66832d0ac50695b07c6ac5b09e`.

Offline-only safety update to `route_contract.py`. Preserves `REJECT` for malformed new route evidence and preserves `eligible_for_award=False` for all outcomes. A malformed historical record no longer rejects a valid current candidate: it becomes `REVIEW_REQUIRED` with `HISTORY_CORRUPTED`. Valid historical records continue to be compared and related risk reasons are retained.

History not provided as a list/tuple becomes `REVIEW_REQUIRED` with `INVALID_HISTORY`; more than 1000 sessions or 6000 total listed samples becomes `REVIEW_REQUIRED` with `HISTORY_BUDGET_EXCEEDED`. Unexpected analyzer exceptions result in `REVIEW_REQUIRED` with `INTERNAL_REVIEW_FAILURE`; no raw exception text or coordinates are returned.

This is a bounded offline **sample-count** check, not an enforcement of memory bytes, CPU time or serialization size. Those limits must be enforced by a future trusted gateway/worker. Python local caller data are untrusted; no production security guarantees result from this patch.

Adds `test_route_input_validation.py` with 14 regression tests and updates 3 old tests to reflect the safer review policy. The previously verified test suite had 47 tests; expected after APPLY is **61 tests**, but the complete set must be checked on the user's Windows repository. Original route and fair-play modules, concurrency harness, Android and Supabase remain untouched. No automatic verification, awards or public rankings.

Run from USGCorso root:

```powershell
python -m unittest discover -s tests/arena -p "test_route*.py" -v

git status --short
git diff --check
```

After validation passes, review the changed paths and commit only after user acceptance.
