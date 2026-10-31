drop function if exists public.list_visible_map_users();

create or replace function public.list_visible_map_users()
returns table (
  user_id uuid,
  display_name text,
  username text,
  avatar_preset text,
  bio text,
  country text,
  city text,
  latitude double precision,
  longitude double precision,
  updated_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.user_id,
    pr.display_name,
    pr.username,
    pr.avatar_preset,
    pr.bio,
    pr.country,
    pr.city,
    p.latitude,
    p.longitude,
    p.updated_at
  from public.user_map_presence p
  left join public.profiles pr on pr.id = p.user_id
  where p.sharing_enabled = true
    and p.latitude is not null
    and p.longitude is not null
    and p.updated_at >= now() - interval '15 minutes'
    and p.user_id <> auth.uid()
  order by p.updated_at desc;
$$;

revoke all on function public.list_visible_map_users() from public;
grant execute on function public.list_visible_map_users() to authenticated;
