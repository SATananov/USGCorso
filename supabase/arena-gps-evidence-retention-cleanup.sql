begin;

create table if not exists public.usg_arena_gps_retention_holds (
  session_id uuid primary key references public.usg_arena_gps_evidence_sessions(id) on delete restrict,
  reason text not null check (char_length(reason) between 3 and 500),
  created_at timestamptz not null default now()
);

alter table public.usg_arena_gps_retention_holds enable row level security;
revoke all on public.usg_arena_gps_retention_holds from public, anon, authenticated;

create or replace function public.usg_arena_retention_cleanup_server(
  p_execute boolean default false,
  p_limit integer default 50,
  p_confirmation text default null
)
returns table (
  execution_mode text,
  selected_sessions integer,
  selected_samples bigint,
  deleted_sessions integer,
  deleted_samples bigint
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_ids uuid[] := '{}'::uuid[];
  v_candidates integer := 0;
  v_samples bigint := 0;
  v_deleted integer := 0;
  v_now timestamptz := clock_timestamp();
begin
  if p_limit is null or p_limit not between 1 and 100 then
    raise exception 'Retention batch must be between 1 and 100' using errcode = '22023';
  end if;

  if p_execute is null then
    raise exception 'Execution mode is required' using errcode = '22023';
  end if;

  if p_execute and p_confirmation is distinct from 'DELETE_EXPIRED_GPS_EVIDENCE' then
    raise exception 'Explicit retention deletion confirmation required' using errcode = '22023';
  end if;

  if p_execute then
    perform pg_catalog.pg_advisory_xact_lock(28744, 38402);

    select coalesce(pg_catalog.array_agg(q.id order by q.created_at, q.id), '{}'::uuid[])
    into v_ids
    from (
      select s.id, s.created_at
      from public.usg_arena_gps_evidence_sessions s
      where (
        (s.review_status = 'pending' and s.created_at < v_now - interval '30 days')
        or (s.review_status = 'rejected' and s.reviewed_at < v_now - interval '30 days')
      )
      and not exists (
        select 1 from public.usg_arena_gps_retention_holds h where h.session_id = s.id
      )
      and not exists (
        select 1 from public.usg_arena_verified_awards a
        where a.source_type = 'verified_gps' and a.source_id = s.id
      )
      order by s.created_at, s.id
      limit p_limit
      for update of s skip locked
    ) q;
  else
    select coalesce(pg_catalog.array_agg(q.id order by q.created_at, q.id), '{}'::uuid[])
    into v_ids
    from (
      select s.id, s.created_at
      from public.usg_arena_gps_evidence_sessions s
      where (
        (s.review_status = 'pending' and s.created_at < v_now - interval '30 days')
        or (s.review_status = 'rejected' and s.reviewed_at < v_now - interval '30 days')
      )
      and not exists (
        select 1 from public.usg_arena_gps_retention_holds h where h.session_id = s.id
      )
      and not exists (
        select 1 from public.usg_arena_verified_awards a
        where a.source_type = 'verified_gps' and a.source_id = s.id
      )
      order by s.created_at, s.id
      limit p_limit
    ) q;
  end if;

  v_candidates := coalesce(pg_catalog.array_length(v_ids, 1), 0);
  select count(*) into v_samples
  from public.usg_arena_gps_evidence_samples sm
  where sm.session_id = any(v_ids);

  if p_execute and v_candidates > 0 then
    delete from public.usg_arena_gps_evidence_sessions s
    where s.id = any(v_ids)
      and (
        (s.review_status = 'pending' and s.created_at < v_now - interval '30 days')
        or (s.review_status = 'rejected' and s.reviewed_at < v_now - interval '30 days')
      )
      and not exists (
        select 1 from public.usg_arena_gps_retention_holds h where h.session_id = s.id
      )
      and not exists (
        select 1 from public.usg_arena_verified_awards a
        where a.source_type = 'verified_gps' and a.source_id = s.id
      );
    get diagnostics v_deleted = row_count;
    if v_deleted <> v_candidates then
      raise exception 'Retention candidates changed; transaction rolled back' using errcode = '40001';
    end if;
  end if;

  return query select
    case when p_execute then 'executed' else 'dry_run' end::text,
    v_candidates,
    v_samples,
    case when p_execute then v_deleted else 0 end,
    case when p_execute then v_samples else 0::bigint end;
end;
$$;

revoke all on function public.usg_arena_retention_cleanup_server(boolean, integer, text)
  from public, anon, authenticated;
grant execute on function public.usg_arena_retention_cleanup_server(boolean, integer, text)
  to service_role;

comment on function public.usg_arena_retention_cleanup_server(boolean, integer, text) is
  'Service-only bounded GPS retention. Defaults to dry-run. Deletes only pending older than 30 days or rejected reviewed more than 30 days ago, never verified, held, or award-linked evidence. No scheduler or automatic invocation. Execution requires explicit confirmation. Deletion cascades to GPS samples; perform audit before enabling real usage.';

commit;
