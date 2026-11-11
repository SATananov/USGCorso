select
  c.relname as table_name,
  c.relrowsecurity as rls_enabled,
  has_table_privilege('anon', c.oid, 'SELECT') as anon_select,
  has_table_privilege('anon', c.oid, 'INSERT') as anon_insert,
  has_table_privilege('authenticated', c.oid, 'SELECT') as user_select,
  has_table_privilege('authenticated', c.oid, 'INSERT') as user_insert,
  has_table_privilege('authenticated', c.oid, 'UPDATE') as user_update,
  has_table_privilege('authenticated', c.oid, 'DELETE') as user_delete
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in ('usg_arena_gps_evidence_sessions', 'usg_arena_gps_evidence_samples')
  and c.relkind in ('r', 'p')
order by c.relname;

select
  p.proname as function_name,
  p.prosecdef as security_definer,
  p.proconfig as security_settings,
  has_function_privilege('anon', p.oid, 'EXECUTE') as anon_execute,
  has_function_privilege('authenticated', p.oid, 'EXECUTE') as user_execute,
  has_function_privilege('service_role', p.oid, 'EXECUTE') as service_execute
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname = 'usg_arena_ingest_gps_evidence_server';

select
  count(*)::bigint as total_sessions,
  count(*) filter (where review_status = 'pending')::bigint as pending_sessions,
  count(*) filter (where review_status = 'verified')::bigint as verified_sessions,
  count(*) filter (where review_status = 'rejected')::bigint as rejected_sessions,
  count(*) filter (where ended_at < now() - interval '30 days')::bigint as sessions_older_than_30_days,
  count(*) filter (where ended_at < now() - interval '90 days')::bigint as sessions_older_than_90_days
from public.usg_arena_gps_evidence_sessions;

select count(*)::bigint as total_samples
from public.usg_arena_gps_evidence_samples;

select
  indexname,
  indexdef
from pg_indexes
where schemaname = 'public'
  and indexname in (
    'usg_arena_gps_evidence_submission_unique',
    'usg_arena_gps_evidence_sample_unique'
  )
order by indexname;

select
  policyname,
  cmd,
  roles
from pg_policies
where schemaname = 'public'
  and tablename in ('usg_arena_gps_evidence_sessions', 'usg_arena_gps_evidence_samples')
order by tablename, policyname;
