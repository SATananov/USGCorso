begin;

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
  city text
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
    p.city
  from public.professional_profiles p
  order by
    p.updated_at desc,
    p.display_name asc;
end;
$$;

revoke all on function public.admin_list_professional_profiles_visibility()
  from public;

grant execute on function public.admin_list_professional_profiles_visibility()
  to authenticated;

commit;
