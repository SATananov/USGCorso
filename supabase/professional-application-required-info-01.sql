begin;

alter table public.professional_applications
  add column if not exists profile_name text,
  add column if not exists contact_phone text,
  add column if not exists contact_email text,
  add column if not exists country text,
  add column if not exists city text;

alter table public.professional_profiles
  add column if not exists contact_person text,
  add column if not exists phone text,
  add column if not exists email text,
  add column if not exists website text,
  add column if not exists address text,
  add column if not exists facebook_url text,
  add column if not exists instagram_url text;

drop function if exists public.submit_professional_application(
  text,
  text[],
  text
);

create function public.submit_professional_application(
  requested_role text,
  requested_categories text[],
  target_profile_name text,
  target_contact_phone text,
  target_contact_email text,
  target_country text,
  target_city text,
  application_message text
)
returns public.professional_applications
language plpgsql
security definer
set search_path = public
as $$
declare
  existing_application public.professional_applications;
  current_role text;
  saved_application public.professional_applications;
  normalized_categories text[];
  invalid_category text;
begin
  if auth.uid() is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;

  if requested_role not in ('professional', 'organization') then
    raise exception 'invalid requested role' using errcode = '22023';
  end if;

  if requested_categories is null or cardinality(requested_categories) = 0 then
    raise exception 'at least one category is required' using errcode = '22023';
  end if;

  if nullif(trim(coalesce(target_profile_name, '')), '') is null then
    raise exception 'profile name is required' using errcode = '22023';
  end if;

  if nullif(trim(coalesce(target_contact_phone, '')), '') is null then
    raise exception 'contact phone is required' using errcode = '22023';
  end if;

  if nullif(trim(coalesce(target_contact_email, '')), '') is null then
    raise exception 'contact email is required' using errcode = '22023';
  end if;

  if nullif(trim(coalesce(target_country, '')), '') is null then
    raise exception 'country is required' using errcode = '22023';
  end if;

  if nullif(trim(coalesce(target_city, '')), '') is null then
    raise exception 'city is required' using errcode = '22023';
  end if;

  if nullif(trim(coalesce(application_message, '')), '') is null then
    raise exception 'application description is required' using errcode = '22023';
  end if;

  select array_agg(distinct trim(value) order by trim(value))
  into normalized_categories
  from unnest(requested_categories) as value
  where trim(value) <> '';

  if normalized_categories is null or cardinality(normalized_categories) = 0 then
    raise exception 'at least one valid category is required' using errcode = '22023';
  end if;

  if requested_role = 'professional' then
    select value
    into invalid_category
    from unnest(normalized_categories) as value
    where value not in (
      'breeders',
      'trainers',
      'veterinary',
      'handlers',
      'transport',
      'petShops',
      'dogHotels',
      'sheltersRescues',
      'grooming',
      'rehabilitation',
      'behavior',
      'nutrition',
      'photographers'
    )
    limit 1;

    if invalid_category is not null then
      raise exception 'invalid professional category: %', invalid_category
        using errcode = '22023';
    end if;
  end if;

  if requested_role = 'organization' then
    select value
    into invalid_category
    from unnest(normalized_categories) as value
    where value not in (
      'caneCorsoClubs',
      'breedAssociations',
      'kennelOrganizations',
      'workingDogClubs',
      'rescueOrganizations',
      'eventOrganizations',
      'trainingAssociations',
      'veterinaryAssociations',
      'culturalOrganizations'
    )
    limit 1;

    if invalid_category is not null then
      raise exception 'invalid organization category: %', invalid_category
        using errcode = '22023';
    end if;
  end if;

  select role
  into current_role
  from public.user_roles
  where user_id = auth.uid();

  if current_role in ('professional', 'organization', 'admin') then
    raise exception 'account already has elevated access' using errcode = '42501';
  end if;

  select *
  into existing_application
  from public.professional_applications
  where user_id = auth.uid();

  if existing_application.status = 'approved' then
    raise exception 'application already approved' using errcode = '23505';
  end if;

  insert into public.professional_applications (
    user_id,
    requested_type,
    categories,
    profile_name,
    contact_phone,
    contact_email,
    country,
    city,
    message,
    status,
    admin_note,
    reviewed_by,
    reviewed_at,
    updated_at
  )
  values (
    auth.uid(),
    requested_role,
    normalized_categories,
    trim(target_profile_name),
    trim(target_contact_phone),
    lower(trim(target_contact_email)),
    trim(target_country),
    trim(target_city),
    trim(application_message),
    'pending',
    null,
    null,
    null,
    now()
  )
  on conflict (user_id)
  do update set
    requested_type = excluded.requested_type,
    categories = excluded.categories,
    profile_name = excluded.profile_name,
    contact_phone = excluded.contact_phone,
    contact_email = excluded.contact_email,
    country = excluded.country,
    city = excluded.city,
    message = excluded.message,
    status = 'pending',
    admin_note = null,
    reviewed_by = null,
    reviewed_at = null,
    updated_at = now()
  returning *
  into saved_application;

  return saved_application;
end;
$$;

revoke all on function public.submit_professional_application(
  text,
  text[],
  text,
  text,
  text,
  text,
  text,
  text
) from public;

grant execute on function public.submit_professional_application(
  text,
  text[],
  text,
  text,
  text,
  text,
  text,
  text
) to authenticated;

drop function if exists public.admin_list_professional_applications(text);

create function public.admin_list_professional_applications(
  target_status text default 'pending'
)
returns table (
  id uuid,
  user_id uuid,
  email text,
  display_name text,
  profile_name text,
  contact_phone text,
  contact_email text,
  country text,
  city text,
  requested_type text,
  categories text[],
  message text,
  status text,
  admin_note text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if not public.is_admin() then
    raise exception 'administrator access required' using errcode = '42501';
  end if;

  if target_status not in ('pending', 'approved', 'rejected', 'needs_changes') then
    raise exception 'invalid application status' using errcode = '22023';
  end if;

  return query
  select
    a.id,
    a.user_id,
    u.email::text,
    p.display_name,
    a.profile_name,
    a.contact_phone,
    a.contact_email,
    a.country,
    a.city,
    a.requested_type,
    a.categories,
    a.message,
    a.status,
    a.admin_note,
    a.reviewed_by,
    a.reviewed_at,
    a.created_at,
    a.updated_at
  from public.professional_applications a
  join auth.users u on u.id = a.user_id
  left join public.profiles p on p.id = a.user_id
  where a.status = target_status
  order by a.created_at asc;
end;
$$;

revoke all on function public.admin_list_professional_applications(text) from public;
grant execute on function public.admin_list_professional_applications(text) to authenticated;

create or replace function public.admin_review_professional_application(
  application_id uuid,
  decision text,
  review_note text default null
)
returns public.professional_applications
language plpgsql
security definer
set search_path = public
as $$
declare
  target_application public.professional_applications;
  reviewed_application public.professional_applications;
  target_current_role text;
  target_profile_id uuid;
begin
  if not public.is_admin() then
    raise exception 'administrator access required' using errcode = '42501';
  end if;

  if decision not in ('approved', 'rejected', 'needs_changes') then
    raise exception 'invalid review decision' using errcode = '22023';
  end if;

  select *
  into target_application
  from public.professional_applications
  where id = application_id
  for update;

  if target_application.id is null then
    raise exception 'application not found' using errcode = 'P0002';
  end if;

  if target_application.status <> 'pending' then
    raise exception 'only pending applications can be reviewed' using errcode = '22023';
  end if;

  select role
  into target_current_role
  from public.user_roles
  where user_id = target_application.user_id;

  if target_current_role is distinct from 'user' then
    raise exception 'application owner no longer has a standard user role' using errcode = '42501';
  end if;

  update public.professional_applications
  set
    status = decision,
    admin_note = nullif(trim(coalesce(review_note, '')), ''),
    reviewed_by = auth.uid(),
    reviewed_at = now(),
    updated_at = now()
  where id = application_id
  returning *
  into reviewed_application;

  if decision = 'approved' then
    insert into public.user_roles (user_id, role, updated_at)
    values (
      target_application.user_id,
      target_application.requested_type,
      now()
    )
    on conflict (user_id)
    do update set
      role = excluded.role,
      updated_at = now();

    insert into public.professional_profiles (
      owner_id,
      profile_type,
      categories,
      display_name,
      country,
      city,
      short_description,
      contact_person,
      phone,
      email,
      status,
      verified,
      updated_at
    )
    values (
      target_application.user_id,
      target_application.requested_type,
      target_application.categories,
      target_application.profile_name,
      target_application.country,
      target_application.city,
      target_application.message,
      target_application.profile_name,
      target_application.contact_phone,
      target_application.contact_email,
      'approved',
      false,
      now()
    )
    on conflict (owner_id)
    do update set
      profile_type = excluded.profile_type,
      categories = excluded.categories,
      display_name = excluded.display_name,
      country = excluded.country,
      city = excluded.city,
      short_description = excluded.short_description,
      contact_person = excluded.contact_person,
      phone = excluded.phone,
      email = excluded.email,
      updated_at = now()
    returning id into target_profile_id;

    insert into public.professional_profile_public_visibility (
      profile_id,
      field_key,
      is_public,
      approved_by,
      approved_at,
      updated_at
    )
    select
      target_profile_id,
      field_key,
      false,
      null,
      null,
      now()
    from (
      values
        ('profile_image_url'),
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
    on conflict (profile_id, field_key)
    do update set
      is_public = false,
      approved_by = null,
      approved_at = null,
      updated_at = now();
  end if;

  return reviewed_application;
end;
$$;

revoke all on function public.admin_review_professional_application(uuid, text, text)
  from public;

grant execute on function public.admin_review_professional_application(uuid, text, text)
  to authenticated;

commit;
