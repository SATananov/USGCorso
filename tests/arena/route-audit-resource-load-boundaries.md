# USG Arena — Route Resource and Load Boundaries

Baseline: `6d292b2fc58a6547649c6658aa12e6ee87a35ad5`.

Offline test-only change. The 12 new synthetic tests cover the 300-sample route maximum, 301/1-sample rejection, history session count limits, estimated history-budget short-circuit, invalid-route precedence, malformed extra fields, fair-play call boundaries and deterministic results. The tests verify no approval or XP awards.

The 262144-byte threshold is an **estimate based on fixed per-entry weights**, not a measured serialized payload size or actual memory cap. These tests do not measure CPU, wall clock, memory pressure, throughput under concurrent clients, or protection against malicious Python objects. They do not prove server readiness.

No Python verification algorithm, SQL, Supabase, Android, production route, award logic or public ranking is modified.

Run in PowerShell from the repository root:

```powershell
python -m unittest discover -s tests/arena -p "test_route*.py" -v

git status --short
git diff --check
```

Expected count: 92 previous tests + 12 new tests = **104 tests**, subject to the user's actual local run. Do not commit or push until test results and Git changes have been reviewed.
