begin;

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

do $$
declare
  policy_row record;
begin
  for policy_row in
    select policyname
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and cmd = 'SELECT'
      and qual ilike '%corso-photos%'
  loop
    execute format(
      'drop policy if exists %I on storage.objects',
      policy_row.policyname
    );
  end loop;
end;
$$;

create policy "corso_photos_select_moderated"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'corso-photos'
  and exists (
    select 1
    from public.dogs d
    where d.photo_path = storage.objects.name
      and (
        d.owner_id = auth.uid()
        or public.is_admin()
        or (
          d.community_visible = true
          and d.moderation_status = 'approved'
        )
      )
  )
);

commit;
