create or replace function public.update_place_by_owner_or_admin(
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
  current_place public.places;
  updated_place public.places;
  caller_is_admin boolean;
begin
  select *
  into current_place
  from public.places
  where id = target_place_id;

  if current_place.id is null then
    raise exception 'place not found' using errcode = 'P0002';
  end if;

  caller_is_admin := public.is_admin();

  if not caller_is_admin
    and current_place.created_by is distinct from auth.uid() then
    raise exception 'place edit access denied' using errcode = '42501';
  end if;

  if nullif(trim(place_name), '') is null then
    raise exception 'place name is required' using errcode = '22023';
  end if;

  if nullif(trim(place_country), '') is null
    or nullif(trim(place_city), '') is null
    or nullif(trim(place_address), '') is null then
    raise exception 'place location fields are required' using errcode = '22023';
  end if;

  if place_latitude is null
    or place_latitude < -90
    or place_latitude > 90 then
    raise exception 'invalid latitude' using errcode = '22023';
  end if;

  if place_longitude is null
    or place_longitude < -180
    or place_longitude > 180 then
    raise exception 'invalid longitude' using errcode = '22023';
  end if;

  update public.places
  set
    name = trim(place_name),
    category = place_category,
    description = nullif(trim(place_description), ''),
    country = trim(place_country),
    city = trim(place_city),
    address = trim(place_address),
    latitude = place_latitude,
    longitude = place_longitude,
    phone = nullif(trim(place_phone), ''),
    website = nullif(trim(place_website), ''),
    cane_corso_friendly = coalesce(place_cane_corso_friendly, false),
    status = case
      when caller_is_admin then status
      else 'pending'
    end,
    verified = case
      when caller_is_admin then verified
      else false
    end,
    moderation_note = case
      when caller_is_admin then moderation_note
      else null
    end,
    updated_at = now()
  where id = target_place_id
  returning * into updated_place;

  return updated_place;
end;
$$;

revoke all on function public.update_place_by_owner_or_admin(
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

grant execute on function public.update_place_by_owner_or_admin(
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
