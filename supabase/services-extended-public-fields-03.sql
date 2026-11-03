begin;

alter table public.professional_profiles
  add column if not exists contact_person text,
  add column if not exists phone text,
  add column if not exists email text,
  add column if not exists website text,
  add column if not exists address text,
  add column if not exists facebook_url text,
  add column if not exists instagram_url text;

drop function if exists public.admin_list_professional_profiles_visibility();

create function public.admin_list_professional_profiles_visibility()
returns table (
  id uuid,
  profile_type text,
  categories text[],
  display_name text,
  status text,
  verified boolean,
  profile_image_url text,
  profile_image_public boolean,
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
  if not public.is_admin() then
    raise exception 'admin access required' using errcode = '42501';
  end if;

  return query
  select
    p.id,
    p.profile_type,
    p.categories,
    p.display_name,
    p.status,
    p.verified,
    p.profile_image_url,
    coalesce(
      (
        select v.is_public
        from public.professional_profile_public_visibility v
        where v.profile_id = p.id
          and v.field_key = 'profile_image_url'
        limit 1
      ),
      false
    ) as profile_image_public,
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
  order by p.updated_at desc, p.display_name asc;
end;
$$;

revoke all on function public.admin_list_professional_profiles_visibility() from public;
grant execute on function public.admin_list_professional_profiles_visibility() to authenticated;

drop function if exists public.get_public_professional_profile(uuid);

create function public.get_public_professional_profile(profile_id uuid)
returns table (
  id uuid,
  profile_type text,
  categories text[],
  display_name text,
  country text,
  region text,
  city text,
  short_description text,
  verified boolean,
  public_image_url text,
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
  return query
  select
    p.id,
    p.profile_type,
    p.categories,
    p.display_name,
    case when exists (select 1 from public.professional_profile_public_visibility v where v.profile_id = p.id and v.field_key = 'country' and v.is_public = true) then p.country else null end,
    case when exists (select 1 from public.professional_profile_public_visibility v where v.profile_id = p.id and v.field_key = 'region' and v.is_public = true) then p.region else null end,
    case when exists (select 1 from public.professional_profile_public_visibility v where v.profile_id = p.id and v.field_key = 'city' and v.is_public = true) then p.city else null end,
    case when exists (select 1 from public.professional_profile_public_visibility v where v.profile_id = p.id and v.field_key = 'short_description' and v.is_public = true) then p.short_description else null end,
    p.verified,
    case when exists (select 1 from public.professional_profile_public_visibility v where v.profile_id = p.id and v.field_key = 'profile_image_url' and v.is_public = true) then p.profile_image_url else null end,
    case when exists (select 1 from public.professional_profile_public_visibility v where v.profile_id = p.id and v.field_key = 'contact_person' and v.is_public = true) then p.contact_person else null end,
    case when exists (select 1 from public.professional_profile_public_visibility v where v.profile_id = p.id and v.field_key = 'phone' and v.is_public = true) then p.phone else null end,
    case when exists (select 1 from public.professional_profile_public_visibility v where v.profile_id = p.id and v.field_key = 'email' and v.is_public = true) then p.email else null end,
    case when exists (select 1 from public.professional_profile_public_visibility v where v.profile_id = p.id and v.field_key = 'website' and v.is_public = true) then p.website else null end,
    case when exists (select 1 from public.professional_profile_public_visibility v where v.profile_id = p.id and v.field_key = 'address' and v.is_public = true) then p.address else null end,
    case when exists (select 1 from public.professional_profile_public_visibility v where v.profile_id = p.id and v.field_key = 'facebook_url' and v.is_public = true) then p.facebook_url else null end,
    case when exists (select 1 from public.professional_profile_public_visibility v where v.profile_id = p.id and v.field_key = 'instagram_url' and v.is_public = true) then p.instagram_url else null end
  from public.professional_profiles p
  where p.id = profile_id
    and p.status = 'approved';
end;
$$;

revoke all on function public.get_public_professional_profile(uuid) from public;
grant execute on function public.get_public_professional_profile(uuid) to anon;
grant execute on function public.get_public_professional_profile(uuid) to authenticated;

commit;
