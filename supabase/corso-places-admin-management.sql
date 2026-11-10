alter table public.places
drop constraint if exists places_status_check;

alter table public.places
add constraint places_status_check
check (
  status in (
    'pending',
    'approved',
    'changes_requested',
    'rejected',
    'archived'
  )
);

create or replace function public.admin_list_places_by_status(
  target_status text
)
returns setof public.places
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'administrator access required' using errcode = '42501';
  end if;

  if target_status not in ('pending', 'approved', 'rejected', 'archived') then
    raise exception 'invalid place status' using errcode = '22023';
  end if;

  return query
  select p.*
  from public.places p
  where (
    target_status = 'pending'
    and p.status in ('pending', 'changes_requested')
  )
  or (
    target_status <> 'pending'
    and p.status = target_status
  )
  order by p.updated_at desc;
end;
$$;

revoke all on function public.admin_list_places_by_status(text) from public;
grant execute on function public.admin_list_places_by_status(text) to authenticated;

create or replace function public.admin_set_place_status(
  target_place_id uuid,
  target_status text
)
returns public.places
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_place public.places;
begin
  if not public.is_admin() then
    raise exception 'administrator access required' using errcode = '42501';
  end if;

  if target_status not in ('pending', 'approved', 'rejected', 'archived') then
    raise exception 'invalid place status' using errcode = '22023';
  end if;

  update public.places
  set
    status = target_status,
    moderation_note = case
      when target_status = 'pending' then null
      else moderation_note
    end,
    verified = false,
    updated_at = now()
  where id = target_place_id
  returning * into updated_place;

  if updated_place.id is null then
    raise exception 'place not found' using errcode = 'P0002';
  end if;

  return updated_place;
end;
$$;

revoke all on function public.admin_set_place_status(uuid, text) from public;
grant execute on function public.admin_set_place_status(uuid, text) to authenticated;

create or replace function public.admin_update_place(
  target_place_id uuid,
  place_name text,
  place_category text,
  place_description text,
  place_country text,
  place_city text,
  place_address text,
  place_latitude double precision,
  place_longitude double precision,
  place_phone text,
  place_website text,
  place_cane_corso_friendly boolean
)
returns public.places
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_place public.places;
begin
  if not public.is_admin() then
    raise exception 'administrator access required' using errcode = '42501';
  end if;

  if place_latitude is null or place_latitude < -90 or place_latitude > 90 then
    raise exception 'invalid latitude' using errcode = '22023';
  end if;

  if place_longitude is null or place_longitude < -180 or place_longitude > 180 then
    raise exception 'invalid longitude' using errcode = '22023';
  end if;

  update public.places
  set
    name = coalesce(nullif(trim(place_name), ''), name),
    category = place_category,
    description = nullif(trim(place_description), ''),
    country = coalesce(nullif(trim(place_country), ''), country),
    city = coalesce(nullif(trim(place_city), ''), city),
    address = coalesce(nullif(trim(place_address), ''), address),
    latitude = place_latitude,
    longitude = place_longitude,
    phone = nullif(trim(place_phone), ''),
    website = nullif(trim(place_website), ''),
    cane_corso_friendly = coalesce(place_cane_corso_friendly, false),
    updated_at = now()
  where id = target_place_id
  returning * into updated_place;

  if updated_place.id is null then
    raise exception 'place not found' using errcode = 'P0002';
  end if;

  return updated_place;
end;
$$;

revoke all on function public.admin_update_place(
  uuid,
  text,
  text,
  text,
  text,
  text,
  text,
  double precision,
  double precision,
  text,
  text,
  boolean
) from public;

grant execute on function public.admin_update_place(
  uuid,
  text,
  text,
  text,
  text,
  text,
  text,
  double precision,
  double precision,
  text,
  text,
  boolean
) to authenticated;

create or replace function public.admin_delete_place(
  target_place_id uuid
)
returns text[]
language plpgsql
security definer
set search_path = public
as $$
declare
  storage_paths text[];
begin
  if not public.is_admin() then
    raise exception 'administrator access required' using errcode = '42501';
  end if;

  if not exists (
    select 1
    from public.places
    where id = target_place_id
  ) then
    raise exception 'place not found' using errcode = 'P0002';
  end if;

  select coalesce(array_agg(m.storage_path), array[]::text[])
  into storage_paths
  from public.media_items m
  where m.entity_type = 'place'
    and m.entity_id = target_place_id;

  delete from public.media_items
  where entity_type = 'place'
    and entity_id = target_place_id;

  delete from public.places
  where id = target_place_id;

  return storage_paths;
end;
$$;

revoke all on function public.admin_delete_place(uuid) from public;
grant execute on function public.admin_delete_place(uuid) to authenticated;

create or replace function public.admin_update_place_media_caption(
  target_media_id uuid,
  target_caption text
)
returns public.media_items
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_media public.media_items;
begin
  if not public.is_admin() then
    raise exception 'administrator access required' using errcode = '42501';
  end if;

  if target_caption is not null and char_length(target_caption) > 160 then
    raise exception 'caption too long' using errcode = '22023';
  end if;

  update public.media_items
  set caption = nullif(trim(target_caption), '')
  where id = target_media_id
    and entity_type = 'place'
  returning * into updated_media;

  if updated_media.id is null then
    raise exception 'place media not found' using errcode = 'P0002';
  end if;

  return updated_media;
end;
$$;

revoke all on function public.admin_update_place_media_caption(uuid, text) from public;
grant execute on function public.admin_update_place_media_caption(uuid, text) to authenticated;

create or replace function public.admin_delete_place_media(
  target_media_id uuid
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  media_row public.media_items;
  replacement_id uuid;
begin
  if not public.is_admin() then
    raise exception 'administrator access required' using errcode = '42501';
  end if;

  select *
  into media_row
  from public.media_items
  where id = target_media_id
    and entity_type = 'place';

  if media_row.id is null then
    raise exception 'place media not found' using errcode = 'P0002';
  end if;

  delete from public.media_items
  where id = target_media_id;

  if media_row.is_cover then
    select id
    into replacement_id
    from public.media_items
    where entity_type = 'place'
      and entity_id = media_row.entity_id
      and status = 'approved'
    order by created_at asc
    limit 1;

    if replacement_id is not null then
      update public.media_items
      set is_cover = true
      where id = replacement_id;
    end if;
  end if;

  return media_row.storage_path;
end;
$$;

revoke all on function public.admin_delete_place_media(uuid) from public;
grant execute on function public.admin_delete_place_media(uuid) to authenticated;
