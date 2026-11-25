begin;

do $$
begin
  if to_regclass('public.dogs') is null
    or to_regclass('public.profiles') is null
    or to_regprocedure('public.is_admin()') is null
    or not exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'dogs'
        and column_name = 'moderation_status'
    )
    or not exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'dogs'
        and column_name = 'photo_path'
    )
  then
    raise exception 'dog moderation, photo and Admin prerequisites must be applied first';
  end if;
end;
$$;

drop function if exists public.community_corso_list();

create function public.community_corso_list()
returns table (
  id uuid,
  owner_id uuid,
  name text,
  sex text,
  color text,
  birth_date date,
  country text,
  city text,
  kennel text,
  breeder text,
  registration_number text,
  description text,
  photo_path text,
  created_at timestamptz,
  owner_display_name text,
  owner_username text,
  owner_avatar_preset text
)
language sql
security definer
set search_path = public
stable
as $$
  select
    d.id,
    d.owner_id,
    d.name,
    d.sex,
    d.color,
    d.birth_date,
    d.country,
    d.city,
    d.kennel,
    d.breeder,
    d.registration_number,
    d.description,
    d.photo_path,
    d.created_at,
    p.display_name as owner_display_name,
    p.username as owner_username,
    p.avatar_preset as owner_avatar_preset
  from public.dogs d
  left join public.profiles p
    on p.id = d.owner_id
  where d.community_visible = true
    and d.moderation_status = 'approved'
  order by d.created_at desc;
$$;

revoke all on function public.community_corso_list() from public;
revoke all on function public.community_corso_list() from anon;
grant execute on function public.community_corso_list() to authenticated;
grant execute on function public.community_corso_list() to service_role;

commit;
