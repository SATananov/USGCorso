begin;

alter table public.usg_arena_gps_evidence_sessions
  add column if not exists submission_key uuid;

create unique index if not exists usg_arena_gps_evidence_submission_unique
  on public.usg_arena_gps_evidence_sessions(owner_id, submission_key)
  where submission_key is not null;

create or replace function public.usg_arena_ingest_gps_evidence_server(
  p_owner_id uuid,
  p_dog_id uuid,
  p_submission_key uuid,
  p_started_at timestamptz,
  p_ended_at timestamptz,
  p_reported_distance_m integer,
  p_reported_duration_s integer,
  p_samples jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_session_id uuid;
  v_sample record;
  v_previous_at timestamptz;
  v_count integer;
  v_now timestamptz := clock_timestamp();
begin
  if p_owner_id is null or p_dog_id is null or p_submission_key is null then
    raise exception 'Missing owner, dog or submission key' using errcode = '22023';
  end if;

  if not exists (
    select 1 from public.dogs d
    where d.id = p_dog_id and d.owner_id = p_owner_id
  ) then
    raise exception 'Dog ownership mismatch' using errcode = '23514';
  end if;

  if p_started_at is null or p_ended_at is null
    or p_started_at < v_now - interval '24 hours'
    or p_ended_at > v_now + interval '2 minutes'
    or p_ended_at <= p_started_at
    or p_ended_at - p_started_at > interval '2 hours'
    or p_reported_duration_s is null
    or p_reported_duration_s not between 300 and 7200
    or abs(extract(epoch from (p_ended_at - p_started_at)) - p_reported_duration_s) > 120
    or p_reported_distance_m is null
    or p_reported_distance_m not between 100 and 15000
  then
    raise exception 'Invalid GPS session bounds' using errcode = '22023';
  end if;

  if p_samples is null or jsonb_typeof(p_samples) is distinct from 'array'
    or pg_column_size(p_samples) > 131072
  then
    raise exception 'Invalid GPS samples payload' using errcode = '22023';
  end if;

  v_count := jsonb_array_length(p_samples);
  if v_count not between 2 and 300 then
    raise exception 'GPS sample count out of bounds' using errcode = '22023';
  end if;

  for v_sample in
    select *
    from pg_catalog.jsonb_to_recordset(p_samples)
      as sample(measured_at timestamptz, latitude double precision,
                longitude double precision, accuracy_m numeric)
  loop
    if v_sample.measured_at is null
      or v_sample.measured_at < p_started_at
      or v_sample.measured_at > p_ended_at
      or (v_previous_at is not null and v_sample.measured_at <= v_previous_at)
      or v_sample.latitude is null
      or not (v_sample.latitude between -90 and 90)
      or v_sample.longitude is null
      or not (v_sample.longitude between -180 and 180)
      or v_sample.accuracy_m is null
      or not (v_sample.accuracy_m between 0 and 100)
    then
      raise exception 'Invalid GPS sample or timestamp sequence' using errcode = '22023';
    end if;
    v_previous_at := v_sample.measured_at;
  end loop;

  insert into public.usg_arena_gps_evidence_sessions (
    owner_id, dog_id, submission_key, started_at, ended_at,
    reported_distance_m, reported_duration_s
  ) values (
    p_owner_id, p_dog_id, p_submission_key, p_started_at, p_ended_at,
    p_reported_distance_m, p_reported_duration_s
  ) returning id into v_session_id;

  insert into public.usg_arena_gps_evidence_samples (
    session_id, measured_at, latitude, longitude, accuracy_m
  )
  select v_session_id, sample.measured_at, sample.latitude,
    sample.longitude, sample.accuracy_m
  from pg_catalog.jsonb_to_recordset(p_samples)
    as sample(measured_at timestamptz, latitude double precision,
              longitude double precision, accuracy_m numeric);

  return v_session_id;
end;
$$;

revoke all on function public.usg_arena_ingest_gps_evidence_server(
  uuid, uuid, uuid, timestamptz, timestamptz, integer, integer, jsonb
) from public, anon, authenticated;
grant execute on function public.usg_arena_ingest_gps_evidence_server(
  uuid, uuid, uuid, timestamptz, timestamptz, integer, integer, jsonb
) to service_role;

comment on function public.usg_arena_ingest_gps_evidence_server(
  uuid, uuid, uuid, timestamptz, timestamptz, integer, integer, jsonb
) is 'Server-only bounded evidence staging. Requires trusted service credentials. Submitted location is not proof of a genuine walk. Does not award Arena points. Do not enable an ingestion endpoint until consent, anti-replay, server authentication and retention controls are implemented.';

commit;
