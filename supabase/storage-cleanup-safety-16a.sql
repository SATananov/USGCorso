begin;

do $$
declare
  primary_key_name text;
begin
  if to_regclass('public.storage_cleanup_queue') is null then
    raise exception 'storage_cleanup_queue is required before STORAGE CLEANUP SAFETY 16A';
  end if;

  select conname
  into primary_key_name
  from pg_constraint
  where conrelid = 'public.storage_cleanup_queue'::regclass
    and contype = 'p'
  limit 1;

  if primary_key_name is not null then
    execute format(
      'alter table public.storage_cleanup_queue drop constraint %I',
      primary_key_name
    );
  end if;

  alter table public.storage_cleanup_queue
    add primary key (bucket_id, storage_path);
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.storage_cleanup_queue'::regclass
      and conname = 'storage_cleanup_queue_bucket_id_check'
  ) then
    alter table public.storage_cleanup_queue
      add constraint storage_cleanup_queue_bucket_id_check
      check (bucket_id in ('usg-content', 'place-media', 'corso-photos'));
  end if;
end;
$$;

create or replace function public.queue_storage_cleanup_for_bucket(
  target_bucket_id text,
  target_paths text[]
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;

  if target_bucket_id not in ('usg-content', 'place-media', 'corso-photos') then
    raise exception 'unsupported storage bucket' using errcode = '22023';
  end if;

  if not public.is_admin() and exists (
    select 1
    from unnest(coalesce(target_paths, array[]::text[])) as path_value
    where nullif(trim(path_value), '') is not null
      and split_part(trim(path_value), '/', 1) <> auth.uid()::text
  ) then
    raise exception 'storage path is outside the authenticated user namespace'
      using errcode = '42501';
  end if;

  if not public.is_admin() and exists (
    select 1
    from unnest(coalesce(target_paths, array[]::text[])) as path_value
    join public.storage_cleanup_queue q
      on q.bucket_id = target_bucket_id
     and q.storage_path = trim(path_value)
    where nullif(trim(path_value), '') is not null
      and q.requested_by is distinct from auth.uid()
  ) then
    raise exception 'storage cleanup entry is owned by another user'
      using errcode = '42501';
  end if;

  insert into public.storage_cleanup_queue (
    storage_path,
    bucket_id,
    requested_by,
    requested_at,
    retry_count,
    last_error
  )
  select distinct
    trim(path_value),
    target_bucket_id,
    auth.uid(),
    now(),
    0,
    null
  from unnest(coalesce(target_paths, array[]::text[])) as path_value
  where nullif(trim(path_value), '') is not null
  on conflict (bucket_id, storage_path) do update
  set
    requested_at = excluded.requested_at,
    retry_count = 0,
    last_error = null;
end;
$$;

create or replace function public.complete_storage_cleanup_for_bucket(
  target_bucket_id text,
  target_paths text[]
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;

  if target_bucket_id not in ('usg-content', 'place-media', 'corso-photos') then
    raise exception 'unsupported storage bucket' using errcode = '22023';
  end if;

  delete from public.storage_cleanup_queue q
  where q.bucket_id = target_bucket_id
    and q.storage_path in (
      select trim(path_value)
      from unnest(coalesce(target_paths, array[]::text[])) as path_value
      where nullif(trim(path_value), '') is not null
    )
    and (
      q.requested_by = auth.uid()
      or public.is_admin()
    );
end;
$$;

create or replace function public.record_storage_cleanup_failure_for_bucket(
  target_bucket_id text,
  target_paths text[],
  target_error text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;

  if target_bucket_id not in ('usg-content', 'place-media', 'corso-photos') then
    raise exception 'unsupported storage bucket' using errcode = '22023';
  end if;

  update public.storage_cleanup_queue q
  set
    retry_count = q.retry_count + 1,
    last_error = left(coalesce(target_error, 'storage cleanup failed'), 1000)
  where q.bucket_id = target_bucket_id
    and q.storage_path in (
      select trim(path_value)
      from unnest(coalesce(target_paths, array[]::text[])) as path_value
      where nullif(trim(path_value), '') is not null
    )
    and (
      q.requested_by = auth.uid()
      or public.is_admin()
    );
end;
$$;

create or replace function public.queue_storage_cleanup(
  target_paths text[]
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.queue_storage_cleanup_for_bucket(
    'usg-content',
    target_paths
  );
end;
$$;

create or replace function public.complete_storage_cleanup(
  target_paths text[]
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.complete_storage_cleanup_for_bucket(
    'usg-content',
    target_paths
  );
end;
$$;

create or replace function public.record_storage_cleanup_failure(
  target_paths text[],
  target_error text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.record_storage_cleanup_failure_for_bucket(
    'usg-content',
    target_paths,
    target_error
  );
end;
$$;

revoke all on function public.queue_storage_cleanup_for_bucket(text, text[]) from public, anon;
revoke all on function public.complete_storage_cleanup_for_bucket(text, text[]) from public, anon;
revoke all on function public.record_storage_cleanup_failure_for_bucket(text, text[], text) from public, anon;

grant execute on function public.queue_storage_cleanup_for_bucket(text, text[]) to authenticated;
grant execute on function public.complete_storage_cleanup_for_bucket(text, text[]) to authenticated;
grant execute on function public.record_storage_cleanup_failure_for_bucket(text, text[], text) to authenticated;

commit;
