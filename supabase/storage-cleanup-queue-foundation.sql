begin;

create table if not exists public.storage_cleanup_queue (
  storage_path text primary key,
  bucket_id text not null default 'usg-content',
  requested_by uuid references auth.users(id) on delete set null,
  requested_at timestamptz not null default now(),
  retry_count integer not null default 0,
  last_error text
);

alter table public.storage_cleanup_queue enable row level security;

revoke all on table public.storage_cleanup_queue from anon;
revoke all on table public.storage_cleanup_queue from authenticated;

create or replace function public.queue_storage_cleanup(
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

  insert into public.storage_cleanup_queue (
    storage_path,
    bucket_id,
    requested_by,
    requested_at,
    retry_count,
    last_error
  )
  select
    path_value,
    'usg-content',
    auth.uid(),
    now(),
    0,
    null
  from unnest(coalesce(target_paths, array[]::text[])) as path_value
  where nullif(trim(path_value), '') is not null
  on conflict (storage_path) do update
  set
    requested_by = excluded.requested_by,
    requested_at = excluded.requested_at,
    last_error = null;
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
  if auth.uid() is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;

  delete from public.storage_cleanup_queue q
  where q.storage_path = any(coalesce(target_paths, array[]::text[]))
    and (
      q.requested_by = auth.uid()
      or public.is_admin()
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
  if auth.uid() is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;

  update public.storage_cleanup_queue q
  set
    retry_count = q.retry_count + 1,
    last_error = left(coalesce(target_error, 'storage cleanup failed'), 1000)
  where q.storage_path = any(coalesce(target_paths, array[]::text[]))
    and (
      q.requested_by = auth.uid()
      or public.is_admin()
    );
end;
$$;

create or replace function public.admin_list_storage_cleanup_queue()
returns table (
  storage_path text,
  bucket_id text,
  requested_by uuid,
  requested_at timestamptz,
  retry_count integer,
  last_error text
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'administrator access required' using errcode = '42501';
  end if;

  return query
  select
    q.storage_path,
    q.bucket_id,
    q.requested_by,
    q.requested_at,
    q.retry_count,
    q.last_error
  from public.storage_cleanup_queue q
  order by q.requested_at asc;
end;
$$;

grant execute on function public.queue_storage_cleanup(text[]) to authenticated;
grant execute on function public.complete_storage_cleanup(text[]) to authenticated;
grant execute on function public.record_storage_cleanup_failure(text[], text) to authenticated;
grant execute on function public.admin_list_storage_cleanup_queue() to authenticated;

commit;
