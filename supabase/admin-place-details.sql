create or replace function public.admin_get_place_details(
  target_place_id uuid
)
returns table (
  id uuid,
  created_by uuid,
  owner_display_name text,
  owner_username text,
  name text,
  category text,
  description text,
  country text,
  city text,
  address text,
  latitude double precision,
  longitude double precision,
  phone text,
  website text,
  cane_corso_friendly boolean,
  verified boolean,
  status text,
  moderation_note text,
  created_at timestamptz,
  updated_at timestamptz,
  review_count bigint,
  average_rating numeric,
  favorite_count bigint
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
    p.id,
    p.created_by,
    pr.display_name,
    pr.username,
    p.name,
    p.category,
    p.description,
    p.country,
    p.city,
    p.address,
    p.latitude,
    p.longitude,
    p.phone,
    p.website,
    p.cane_corso_friendly,
    p.verified,
    p.status,
    p.moderation_note,
    p.created_at,
    p.updated_at,
    count(distinct r.id),
    coalesce(avg(r.rating), 0)::numeric,
    count(distinct f.user_id)
  from public.places p
  left join public.profiles pr
    on pr.id = p.created_by
  left join public.place_reviews r
    on r.place_id = p.id
  left join public.place_favorites f
    on f.place_id = p.id
  where p.id = target_place_id
  group by
    p.id,
    pr.display_name,
    pr.username;
end;
$$;

revoke all on function public.admin_get_place_details(uuid) from public;
grant execute on function public.admin_get_place_details(uuid) to authenticated;

create or replace function public.admin_list_place_media_for_place(
  target_place_id uuid
)
returns table (
  id uuid,
  owner_user_id uuid,
  place_id uuid,
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

  return query
  select
    m.id,
    m.owner_user_id,
    m.entity_id,
    m.storage_path,
    m.caption,
    m.is_cover,
    m.status,
    m.created_at,
    pr.display_name,
    pr.username
  from public.media_items m
  left join public.profiles pr
    on pr.id = m.owner_user_id
  where m.entity_type = 'place'
    and m.entity_id = target_place_id
  order by
    m.is_cover desc,
    case m.status
      when 'pending' then 1
      when 'approved' then 2
      else 3
    end,
    m.created_at desc;
end;
$$;

revoke all on function public.admin_list_place_media_for_place(uuid) from public;
grant execute on function public.admin_list_place_media_for_place(uuid) to authenticated;
