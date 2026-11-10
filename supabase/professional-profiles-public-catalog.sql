begin;

create table if not exists public.professional_profiles (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique references auth.users(id) on delete cascade,
  profile_type text not null,
  categories text[] not null,
  display_name text not null,
  country text,
  region text,
  city text,
  short_description text,
  status text not null default 'pending',
  verified boolean not null default false,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint professional_profiles_type_check
    check (profile_type in ('professional', 'organization')),
  constraint professional_profiles_categories_not_empty
    check (cardinality(categories) > 0),
  constraint professional_profiles_categories_match_type
    check (
      (
        profile_type = 'professional'
        and categories <@ array[
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
        ]::text[]
      )
      or
      (
        profile_type = 'organization'
        and categories <@ array[
          'caneCorsoClubs',
          'breedAssociations',
          'kennelOrganizations',
          'workingDogClubs',
          'rescueOrganizations',
          'eventOrganizations',
          'trainingAssociations',
          'veterinaryAssociations',
          'culturalOrganizations'
        ]::text[]
      )
    ),
  constraint professional_profiles_display_name_not_blank
    check (length(trim(display_name)) > 0),
  constraint professional_profiles_status_check
    check (status in ('draft', 'pending', 'approved', 'rejected', 'needs_changes', 'archived'))
);

create index if not exists professional_profiles_status_idx
  on public.professional_profiles(status);

create index if not exists professional_profiles_categories_gin_idx
  on public.professional_profiles using gin(categories);

alter table public.professional_profiles enable row level security;

drop policy if exists "professional_profiles_owner_select"
  on public.professional_profiles;

create policy "professional_profiles_owner_select"
on public.professional_profiles
for select
to authenticated
using (auth.uid() = owner_id or public.is_admin());

revoke all on table public.professional_profiles from anon;
revoke all on table public.professional_profiles from authenticated;
grant select on table public.professional_profiles to authenticated;

create or replace function public.list_public_professional_profiles(
  category_key text
)
returns table (
  id uuid,
  profile_type text,
  categories text[],
  display_name text,
  country text,
  region text,
  city text,
  short_description text,
  verified boolean
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if category_key is null or length(trim(category_key)) = 0 then
    raise exception 'category is required' using errcode = '22023';
  end if;

  return query
  select
    p.id,
    p.profile_type,
    p.categories,
    p.display_name,
    p.country,
    p.region,
    p.city,
    p.short_description,
    p.verified
  from public.professional_profiles p
  where p.status = 'approved'
    and trim(category_key) = any(p.categories)
  order by
    p.verified desc,
    p.display_name asc;
end;
$$;

revoke all on function public.list_public_professional_profiles(text) from public;
grant execute on function public.list_public_professional_profiles(text) to anon;
grant execute on function public.list_public_professional_profiles(text) to authenticated;

create or replace function public.get_public_professional_profile(
  profile_id uuid
)
returns table (
  id uuid,
  profile_type text,
  categories text[],
  display_name text,
  country text,
  region text,
  city text,
  short_description text,
  verified boolean
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  return query
  select
    p.id,
    p.profile_type,
    p.categories,
    p.display_name,
    p.country,
    p.region,
    p.city,
    p.short_description,
    p.verified
  from public.professional_profiles p
  where p.id = profile_id
    and p.status = 'approved';
end;
$$;

revoke all on function public.get_public_professional_profile(uuid) from public;
grant execute on function public.get_public_professional_profile(uuid) to anon;
grant execute on function public.get_public_professional_profile(uuid) to authenticated;

commit;
