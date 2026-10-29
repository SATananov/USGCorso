create or replace function public.account_owned_storage_objects(target_user_id uuid)
returns table (
  bucket_id text,
  name text
)
language sql
security definer
set search_path = public, storage
as $$
  select
    o.bucket_id::text,
    o.name
  from storage.objects o
  where o.owner_id = target_user_id::text
  order by o.bucket_id, o.name;
$$;

revoke all on function public.account_owned_storage_objects(uuid) from public;
revoke all on function public.account_owned_storage_objects(uuid) from anon;
revoke all on function public.account_owned_storage_objects(uuid) from authenticated;
grant execute on function public.account_owned_storage_objects(uuid) to service_role;
revoke all on table public.user_roles from service_role;
grant select on table public.user_roles to service_role;

revoke all on table public.profiles from service_role;
grant select, delete on table public.profiles to service_role;

