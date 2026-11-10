begin;

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
    end,
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
    end,
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
    end,
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
    end,
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

commit;
