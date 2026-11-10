begin;

alter table public.user_roles
  drop constraint if exists user_roles_role_check;

alter table public.user_roles
  add constraint user_roles_role_check
  check (role in ('user', 'professional', 'organization', 'admin'));

create table if not exists public.professional_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  requested_type text not null,
  categories text[] not null,
  message text,
  status text not null default 'pending',
  admin_note text,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint professional_applications_type_check
    check (requested_type in ('professional', 'organization')),
  constraint professional_applications_status_check
    check (status in ('pending', 'approved', 'rejected', 'needs_changes')),
  constraint professional_applications_categories_not_empty
    check (cardinality(categories) > 0)
);

alter table public.professional_applications enable row level security;

drop policy if exists "professional_applications_select_own_or_admin"
  on public.professional_applications;

create policy "professional_applications_select_own_or_admin"
on public.professional_applications
for select
to authenticated
using (auth.uid() = user_id or public.is_admin());

revoke all on table public.professional_applications from anon;
revoke all on table public.professional_applications from authenticated;
grant select on table public.professional_applications to authenticated;

create or replace function public.is_professional()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = auth.uid()
      and role = 'professional'
  );
$$;

create or replace function public.is_organization()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = auth.uid()
      and role = 'organization'
  );
$$;

create or replace function public.can_manage_service_profile()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    auth.uid() is not null
    and (
      public.is_admin()
      or public.is_professional()
      or public.is_organization()
    );
$$;

revoke all on function public.is_professional() from public;
revoke all on function public.is_organization() from public;
revoke all on function public.can_manage_service_profile() from public;

grant execute on function public.is_professional() to authenticated;
grant execute on function public.is_organization() to authenticated;
grant execute on function public.can_manage_service_profile() to authenticated;

create or replace function public.submit_professional_application(
  requested_role text,
  requested_categories text[],
  application_message text default null
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
    nullif(trim(coalesce(application_message, '')), ''),
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

revoke all on function public.submit_professional_application(text, text[], text) from public;
grant execute on function public.submit_professional_application(text, text[], text) to authenticated;

create or replace function public.get_my_professional_application()
returns setof public.professional_applications
language sql
stable
security definer
set search_path = public
as $$
  select *
  from public.professional_applications
  where user_id = auth.uid();
$$;

revoke all on function public.get_my_professional_application() from public;
grant execute on function public.get_my_professional_application() to authenticated;

create or replace function public.admin_list_professional_applications(
  target_status text default 'pending'
)
returns table (
  id uuid,
  user_id uuid,
  email text,
  display_name text,
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
  end if;

  return reviewed_application;
end;
$$;

revoke all on function public.admin_review_professional_application(uuid, text, text) from public;
grant execute on function public.admin_review_professional_application(uuid, text, text) to authenticated;

commit;
