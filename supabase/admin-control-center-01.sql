create or replace function public.admin_list_pending_place_media()
returns table (
  id uuid,
  owner_user_id uuid,
  place_id uuid,
  place_name text,
  storage_path text,
  caption text,
  created_at timestamptz,
  uploader_name text,
  uploader_username text
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
    m.id,
    m.owner_user_id,
    m.entity_id,
    p.name,
    m.storage_path,
    m.caption,
    m.created_at,
    pr.display_name,
    pr.username
  from public.media_items m
  join public.places p
    on p.id = m.entity_id
  left join public.profiles pr
    on pr.id = m.owner_user_id
  where m.entity_type = 'place'
    and m.status = 'pending'
  order by m.created_at asc;
end;
$$;

revoke all on function public.admin_list_pending_place_media() from public;
grant execute on function public.admin_list_pending_place_media() to authenticated;
