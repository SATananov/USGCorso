alter table public.places
drop constraint if exists places_status_check;

alter table public.places
add constraint places_status_check
check (status in ('pending', 'approved', 'changes_requested', 'rejected'));

alter table public.places
add column if not exists moderation_note text;

create or replace function public.admin_list_pending_places()
returns setof public.places
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'administrator access required' using errcode = '42501';
  end if;

  return query
  select p.*
  from public.places p
  where p.status = 'pending'
  order by p.created_at desc;
end;
$$;

revoke all on function public.admin_list_pending_places() from public;
grant execute on function public.admin_list_pending_places() to authenticated;

create or replace function public.admin_review_place(
  target_place_id uuid,
  decision text
)
returns public.places
language plpgsql
security definer
set search_path = public
as $$
declare
  reviewed public.places;
begin
  if not public.is_admin() then
    raise exception 'administrator access required' using errcode = '42501';
  end if;

  if decision not in ('approved', 'rejected') then
    raise exception 'invalid moderation decision' using errcode = '22023';
  end if;

  update public.places
  set
    status = decision,
    verified = false,
    moderation_note = null,
    updated_at = now()
  where id = target_place_id
    and status = 'pending'
  returning * into reviewed;

  if reviewed.id is null then
    raise exception 'pending place not found' using errcode = 'P0002';
  end if;

  return reviewed;
end;
$$;

revoke all on function public.admin_review_place(uuid, text) from public;
grant execute on function public.admin_review_place(uuid, text) to authenticated;

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
    and status = 'pending'
  returning * into updated_place;

  if updated_place.id is null then
    raise exception 'pending place not found' using errcode = 'P0002';
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

create or replace function public.admin_request_place_changes(
  target_place_id uuid,
  review_note text
)
returns public.places
language plpgsql
security definer
set search_path = public
as $$
declare
  reviewed public.places;
begin
  if not public.is_admin() then
    raise exception 'administrator access required' using errcode = '42501';
  end if;

  if nullif(trim(review_note), '') is null then
    raise exception 'review note is required' using errcode = '22023';
  end if;

  update public.places
  set
    status = 'changes_requested',
    moderation_note = trim(review_note),
    verified = false,
    updated_at = now()
  where id = target_place_id
    and status = 'pending'
  returning * into reviewed;

  if reviewed.id is null then
    raise exception 'pending place not found' using errcode = 'P0002';
  end if;

  return reviewed;
end;
$$;

revoke all on function public.admin_request_place_changes(uuid, text) from public;
grant execute on function public.admin_request_place_changes(uuid, text) to authenticated;

drop policy if exists "places owner pending update" on public.places;

create policy "places owner pending or requested update"
on public.places
for update
to authenticated
using (
  created_by = auth.uid()
  and status in ('pending', 'changes_requested')
)
with check (
  created_by = auth.uid()
  and status in ('pending', 'changes_requested')
  and verified = false
);

create or replace function public.resubmit_place_after_changes(
  target_place_id uuid
)
returns public.places
language plpgsql
security invoker
set search_path = public
as $$
declare
  resubmitted public.places;
begin
  update public.places
  set
    status = 'pending',
    moderation_note = null,
    verified = false,
    updated_at = now()
  where id = target_place_id
    and created_by = auth.uid()
    and status = 'changes_requested'
  returning * into resubmitted;

  if resubmitted.id is null then
    raise exception 'place not available for resubmission' using errcode = 'P0002';
  end if;

  return resubmitted;
end;
$$;

revoke all on function public.resubmit_place_after_changes(uuid) from public;
grant execute on function public.resubmit_place_after_changes(uuid) to authenticated;
