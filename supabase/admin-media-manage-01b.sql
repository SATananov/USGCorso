create or replace function public.admin_list_place_media(
  target_status text
)
returns table (
  id uuid,
  owner_user_id uuid,
  place_id uuid,
  place_name text,
  storage_path text,
  caption text,
  is_cover boolean,
  status text,
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

  if target_status not in ('pending', 'approved', 'rejected') then
    raise exception 'invalid media status' using errcode = '22023';
  end if;

  return query
  select
    m.id,
    m.owner_user_id,
    m.entity_id,
    p.name,
    m.storage_path,
    m.caption,
    m.is_cover,
    m.status,
    m.created_at,
    pr.display_name,
    pr.username
  from public.media_items m
  join public.places p
    on p.id = m.entity_id
  left join public.profiles pr
    on pr.id = m.owner_user_id
  where m.entity_type = 'place'
    and m.status = target_status
  order by
    m.is_cover desc,
    m.created_at desc;
end;
$$;

revoke all on function public.admin_list_place_media(text) from public;
grant execute on function public.admin_list_place_media(text) to authenticated;
