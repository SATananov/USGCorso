import os
import sys
import uuid
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta, timezone
from threading import Barrier

import psycopg
from psycopg.types.json import Jsonb

MARKER = 'USG_ARENA_CONCURRENCY_ISOLATED_V1'
FUNCTION = 'public.usg_arena_ingest_gps_evidence_server'


def require_safe_environment(dsn):
    if os.environ.get('USG_ARENA_ISOLATED_TEST') != 'YES':
        raise RuntimeError('Blocked: set USG_ARENA_ISOLATED_TEST=YES only for an isolated test project')
    if not dsn:
        raise RuntimeError('Blocked: TEST_DATABASE_URL is missing')
    with psycopg.connect(dsn) as conn:
        with conn.cursor() as cur:
            cur.execute("select to_regclass('public.usg_arena_test_environment')")
            if cur.fetchone()[0] is None:
                raise RuntimeError('Blocked: test-only marker table is missing')
            cur.execute('select count(*) from public.usg_arena_test_environment where marker = %s', (MARKER,))
            if cur.fetchone()[0] != 1:
                raise RuntimeError('Blocked: isolated test marker not confirmed')
            cur.execute('select d.owner_id, d.id from public.dogs d join public.usg_arena_owner_consent oc on oc.owner_id=d.owner_id and oc.opted_in=true join public.usg_arena_dog_consent dc on dc.owner_id=d.owner_id and dc.dog_id=d.id and dc.opted_in=true order by d.id limit 1')
            row = cur.fetchone()
            if not row:
                raise RuntimeError('Blocked: isolated project needs one synthetic opted-in dog and owner')
            cur.execute('select has_function_privilege(current_user, %s, %s)', ('public.usg_arena_ingest_gps_evidence_server(uuid,uuid,uuid,timestamptz,timestamptz,integer,integer,jsonb)', 'EXECUTE'))
            if cur.fetchone()[0] is not True:
                raise RuntimeError('Blocked: test DB role cannot execute ingestion function')
            return row


def run_pair(dsn, owner_id, dog_id, key, changed):
    started = datetime.now(timezone.utc) - timedelta(minutes=12)
    ended = started + timedelta(minutes=5)
    samples = [
        {'measured_at': (started + timedelta(seconds=10)).isoformat(), 'latitude': 42.0, 'longitude': 25.0, 'accuracy_m': 10},
        {'measured_at': (ended - timedelta(seconds=10)).isoformat(), 'latitude': 42.001, 'longitude': 25.001, 'accuracy_m': 10},
    ]
    barrier = Barrier(2, timeout=20)

    def worker(distance):
        with psycopg.connect(dsn, autocommit=True, connect_timeout=10) as conn:
            barrier.wait()
            try:
                with conn.cursor() as cur:
                    cur.execute(
                        f'select {FUNCTION}(%s, %s, %s, %s, %s, %s, %s, %s)',
                        (owner_id, dog_id, key, started, ended, distance, 300, Jsonb(samples)),
                    )
                    return ('ok', cur.fetchone()[0])
            except psycopg.Error as exc:
                return ('error', exc.sqlstate)

    distances = (150, 160) if changed else (150, 150)
    with ThreadPoolExecutor(max_workers=2) as executor:
        futures = [executor.submit(worker, value) for value in distances]
        return [future.result(timeout=45) for future in futures]


def inspect_and_cleanup(dsn, owner_id, key):
    with psycopg.connect(dsn) as conn:
        with conn.cursor() as cur:
            cur.execute('select id from public.usg_arena_gps_evidence_sessions where owner_id=%s and submission_key=%s', (owner_id, key))
            ids = [r[0] for r in cur.fetchall()]
            count = 0
            if ids:
                cur.execute('select count(*) from public.usg_arena_gps_evidence_samples where session_id=any(%s)', (ids,))
                count = cur.fetchone()[0]
                cur.execute('delete from public.usg_arena_gps_evidence_sessions where owner_id=%s and submission_key=%s', (owner_id, key))
            return len(ids), count


def main():
    dsn = os.environ.get('TEST_DATABASE_URL')
    owner_id, dog_id = require_safe_environment(dsn)
    for title, changed in [('IDENTICAL_RETRY', False), ('CHANGED_RETRY', True)]:
        key = uuid.uuid4()
        try:
            result = run_pair(dsn, owner_id, dog_id, key, changed)
        finally:
            sessions, samples = inspect_and_cleanup(dsn, owner_id, key)
        print(f'{title}: outcomes={result}; test_rows_before_cleanup={sessions} sessions, {samples} samples')
        if changed:
            passed = len([r for r in result if r[0] == 'ok']) == 1 and len([r for r in result if r == ('error', '22023')]) == 1 and sessions == 1 and samples == 2
        else:
            passed = len(result) == 2 and all(r[0] == 'ok' for r in result) and result[0][1] == result[1][1] and sessions == 1 and samples == 2
        if not passed:
            print(f'FAIL: {title}')
            return 1
        print(f'PASS: {title}')
    print('PASS: Both two-connection tests completed; test-created rows cleaned')
    return 0


if __name__ == '__main__':
    try:
        sys.exit(main())
    except Exception as exc:
        print(f'BLOCKED/FAIL: {type(exc).__name__}: {exc}')
        sys.exit(1)
