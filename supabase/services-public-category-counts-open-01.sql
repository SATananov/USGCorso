begin;

create or replace function public.list_public_professional_profile_category_counts()
returns table (
  category_key text,
  profile_count bigint
)
language sql
stable
security definer
set search_path = public
as $$
  select
    category_key,
    count(distinct p.id)::bigint as profile_count
  from public.professional_profiles p
  cross join lateral unnest(p.categories) as category_key
  where p.status = 'approved'
  group by category_key
  order by category_key;
$$;

revoke all on function public.list_public_professional_profile_category_counts()
  from public;

grant execute on function public.list_public_professional_profile_category_counts()
  to anon;

grant execute on function public.list_public_professional_profile_category_counts()
  to authenticated;

commit;
