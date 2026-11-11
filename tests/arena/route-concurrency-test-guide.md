# USG ARENA 03B4F — CONCURRENCY 01

Status: test harness only. **DO NOT RUN against the production USGCorso Supabase project.**

Checkpoint: `2ed54d3d4a3470f900ae22e3604fd58c5d66a347`

## Purpose

Two real database connections call `usg_arena_ingest_gps_evidence_server` concurrently. Test A uses the same owner, dog, submission key and full payload in both connections; both calls should succeed with exactly the same session ID. Test B uses the same submission key but a different reported distance; exactly one call should succeed and one should be rejected with SQLSTATE `22023`. Each test must result in exactly one session and two samples before cleanup. The harness deletes only records created by its random submission keys in the isolated environment.

## Safe environment and prerequisites

1. Create a **separate, isolated Supabase test project** with the relevant USG Arena migrations and synthetic auth user, dog and both opt-in consent records. Do **not** clone real GPS or personal data.
2. In the **test project only**, run `ISOLATED_TEST_ONLY_SETUP.sql` to mark it as a test environment. Never run this setup SQL in production.
3. On your developer PC install Python 3.11+ and `psycopg[binary]`: `py -m pip install "psycopg[binary]"`.
4. Obtain a direct database connection string from the isolated project. Keep it secret; never paste it in chat, Git, logs, or the app. It needs a database role capable of executing the server function, selecting and deleting the synthetic test sessions. **Never embed the service-role key in mobile code.**
5. In PowerShell set `$env:TEST_DATABASE_URL = '<your-isolated-project-connection-string>'` privately and `$env:USG_ARENA_ISOLATED_TEST = 'YES'`.
6. Run `py tests/arena/route_concurrency_isolated.py` from the USGCorso project root. Afterwards clear the session variable: `Remove-Item Env:TEST_DATABASE_URL,Env:USG_ARENA_ISOLATED_TEST`.

## Safety

The script refuses to run without an explicit environment flag and test marker. This is an additional guard, **not** a guarantee: use only the isolated test project. The script does no remote work until manually started. It does not grant new API access, issue awards, deploy a function, change production schema, or enable GPS tracking.

A two-connection test does not establish general concurrency or anti-spoofing safety. Later tests must cover different keys describing the same walk, consent withdrawal races, transaction timeouts, retention/review concurrency and genuine GPS validation. Only report PASS when output has both test cases PASS and cleanup PASS. If the script blocks, preserve the failure output (without secrets) for diagnosis.
