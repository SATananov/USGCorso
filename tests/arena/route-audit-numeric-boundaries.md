# USG Arena — Route Numeric Boundaries

Baseline: `2890ad9d74d3c3b62f5b1d7a16c8e11479f09bb2`.

This document covers offline regression tests. No changes to GPS algorithms, production code, Android, Supabase, migrations, XP, ranking or privacy settings.

Adds 16 synthetic unit tests for:

- Nonfinite distance, duration, coordinates and reported accuracy
- Boolean, numeric-string, complex and very large integer inputs
- Just-outside and exactly-on-boundary distance and duration values
- Extreme yet valid latitude/longitude boundaries, interpreted as a review signal when geometric jumps are implausible
- Accuracy values 0 and 100
- No awarding or input mutation on invalid evidence

Expected test count: 76 prior + 16 new = **92**.

Run from project root:

```powershell
python -m unittest discover -s tests/arena -p "test_route*.py" -v

git status --short
git diff --check
```

The tests verify numerical input behavior, not actual GPS authenticity or a trusted server boundary. The current 256 KiB historical budget is estimated, not a real memory or CPU limit. Automatic GPS approval and awards remain blocked.

Do not commit or push until the Windows test run and diff are reviewed.
