begin;

create or replace function public.get_my_professional_profile()
returns table (
  id uuid,
  owner_id uuid,
  profile_type text,
  categories text[],
  display_name text,
  status text,
  verified boolean,
  short_description text,
  country text,
  region text,
  city text,
  contact_person text,
  phone text,
  email text,
  website text,
  address text,
  facebook_url text,
  instagram_url text
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;

  return query
  select
    p.id,
    p.owner_id,
    p.profile_type,
    p.categories,
    p.display_name,
    p.status,
    p.verified,
    p.short_description,
    p.country,
    p.region,
    p.city,
    p.contact_person,
    p.phone,
    p.email,
    p.website,
    p.address,
    p.facebook_url,
    p.instagram_url
  from public.professional_profiles p
  where p.owner_id = auth.uid()
  limit 1;
end;
$$;

revoke all on function public.get_my_professional_profile() from public;
grant execute on function public.get_my_professional_profile() to authenticated;

create or replace function public.save_my_professional_profile(
  target_display_name text,
  target_short_description text default null,
  target_country text default null,
  target_region text default null,
  target_city text default null,
  target_contact_person text default null,
  target_phone text default null,
  target_email text default null,
  target_website text default null,
  target_address text default null,
  target_facebook_url text default null,
  target_instagram_url text default null
)
returns setof public.professional_profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  approved_application public.professional_applications%rowtype;
  resolved_type text;
  resolved_categories text[];
begin
  if current_user_id is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;

  if not public.is_professional() and not public.is_organization() then
    raise exception 'professional access required' using errcode = '42501';
  end if;

  if nullif(trim(target_display_name), '') is null then
    raise exception 'display name required' using errcode = '22023';
  end if;

  select *
  into approved_application
  from public.professional_applications a
  where a.user_id = current_user_id
    and a.status = 'approved'
  order by a.reviewed_at desc nulls last, a.created_at desc
  limit 1;

  resolved_type := coalesce(
    approved_application.requested_type,
    case
      when public.is_organization() then 'organization'
      else 'professional'
    end
  );

  resolved_categories := coalesce(
    approved_application.categories,
    (
      select p.categories
      from public.professional_profiles p
      where p.owner_id = current_user_id
      limit 1
    ),
    array[]::text[]
  );

  insert into public.professional_profiles (
    owner_id,
    profile_type,
    categories,
    display_name,
    short_description,
    country,
    region,
    city,
    contact_person,
    phone,
    email,
    website,
    address,
    facebook_url,
    instagram_url,
    status,
    verified,
    updated_at
  )
  values (
    current_user_id,
    resolved_type,
    resolved_categories,
    trim(target_display_name),
    nullif(trim(coalesce(target_short_description, '')), ''),
    nullif(trim(coalesce(target_country, '')), ''),
    nullif(trim(coalesce(target_region, '')), ''),
    nullif(trim(coalesce(target_city, '')), ''),
    nullif(trim(coalesce(target_contact_person, '')), ''),
    nullif(trim(coalesce(target_phone, '')), ''),
    nullif(trim(coalesce(target_email, '')), ''),
    nullif(trim(coalesce(target_website, '')), ''),
    nullif(trim(coalesce(target_address, '')), ''),
    nullif(trim(coalesce(target_facebook_url, '')), ''),
    nullif(trim(coalesce(target_instagram_url, '')), ''),
    'approved',
    false,
    now()
  )
  on conflict (owner_id)
  do update set
    display_name = excluded.display_name,
    short_description = excluded.short_description,
    country = excluded.country,
    region = excluded.region,
    city = excluded.city,
    contact_person = excluded.contact_person,
    phone = excluded.phone,
    email = excluded.email,
    website = excluded.website,
    address = excluded.address,
    facebook_url = excluded.facebook_url,
    instagram_url = excluded.instagram_url,
    updated_at = now();

  insert into public.professional_profile_public_visibility (
    profile_id,
    field_key,
    is_public,
    approved_by,
    approved_at,
    updated_at
  )
  select
    p.id,
    field_key,
    false,
    null,
    null,
    now()
  from public.professional_profiles p
  cross join (
    values
      ('short_description'),
      ('country'),
      ('region'),
      ('city'),
      ('contact_person'),
      ('phone'),
      ('email'),
      ('website'),
      ('address'),
      ('facebook_url'),
      ('instagram_url')
  ) as fields(field_key)
  where p.owner_id = current_user_id
  on conflict (profile_id, field_key)
  do update set
    is_public = false,
    approved_by = null,
    approved_at = null,
    updated_at = now();

  return query
  select p.*
  from public.professional_profiles p
  where p.owner_id = current_user_id;
end;
$$;

revoke all on function public.save_my_professional_profile(
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text
) from public;

grant execute on function public.save_my_professional_profile(
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text
) to authenticated;

commit;
