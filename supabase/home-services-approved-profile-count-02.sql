begin;

create or replace function public.home_public_counters()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'places',
      (
        select count(*)
        from public.places
        where status = 'approved'
      ),
    'community_corsos',
      (
        select count(*)
        from public.dogs
        where community_visible = true
          and moderation_status = 'approved'
      ),
    'knowledge',
      (
        select count(*)
        from public.content_items
        where status = 'approved'
          and section_key = 'knowledge'
      ),
    'services',
      (
        select count(*)
        from public.professional_profiles
        where status = 'approved'
      ),
    'events',
      (
        select count(*)
        from public.content_items
        where status = 'approved'
          and section_key = 'events'
      )
  );
$$;

revoke all on function public.home_public_counters() from public;
revoke all on function public.home_public_counters() from anon;
grant execute on function public.home_public_counters() to authenticated;

commit;
