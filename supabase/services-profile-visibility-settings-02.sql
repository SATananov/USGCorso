begin;

create or replace function public.admin_get_professional_profile_field_visibility(
  target_profile_id uuid
)
returns table (
  field_key text,
  is_public boolean
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
    v.field_key,
    v.is_public
  from public.professional_profile_public_visibility v
  where v.profile_id = target_profile_id
  order by v.field_key;
end;
$$;

revoke all on function public.admin_get_professional_profile_field_visibility(uuid)
  from public;

grant execute on function public.admin_get_professional_profile_field_visibility(uuid)
  to authenticated;

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
  true,
  null,
  now(),
  now()
from public.professional_profiles p
cross join (
  values
    ('short_description'),
    ('country'),
    ('region'),
    ('city')
) as fields(field_key)
where p.status = 'approved'
on conflict (profile_id, field_key) do nothing;

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
  verified boolean,
  public_image_url text
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
    case
      when exists (
        select 1
        from public.professional_profile_public_visibility v
        where v.profile_id = p.id
          and v.field_key = 'country'
          and v.is_public = true
      )
      then p.country
      else null
    end as country,
    case
      when exists (
        select 1
        from public.professional_profile_public_visibility v
        where v.profile_id = p.id
          and v.field_key = 'region'
          and v.is_public = true
      )
      then p.region
      else null
    end as region,
    case
      when exists (
        select 1
        from public.professional_profile_public_visibility v
        where v.profile_id = p.id
          and v.field_key = 'city'
          and v.is_public = true
      )
      then p.city
      else null
    end as city,
    case
      when exists (
        select 1
        from public.professional_profile_public_visibility v
        where v.profile_id = p.id
          and v.field_key = 'short_description'
          and v.is_public = true
      )
      then p.short_description
      else null
    end as short_description,
    p.verified,
    case
      when exists (
        select 1
        from public.professional_profile_public_visibility v
        where v.profile_id = p.id
          and v.field_key = 'profile_image_url'
          and v.is_public = true
      )
      then p.profile_image_url
      else null
    end as public_image_url
  from public.professional_profiles p
  where p.id = profile_id
    and p.status = 'approved';
end;
$$;

revoke all on function public.get_public_professional_profile(uuid)
  from public;

grant execute on function public.get_public_professional_profile(uuid)
  to anon;

grant execute on function public.get_public_professional_profile(uuid)
  to authenticated;

commit;
