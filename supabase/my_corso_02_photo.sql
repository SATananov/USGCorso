alter table public.dogs
add column if not exists photo_path text;

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'corso-photos',
  'corso-photos',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "corso photos owner insert" on storage.objects;
drop policy if exists "corso photos owner update" on storage.objects;
drop policy if exists "corso photos owner delete" on storage.objects;
drop policy if exists "corso photos authenticated read" on storage.objects;

create policy "corso photos owner insert"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'corso-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "corso photos owner update"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'corso-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'corso-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "corso photos owner delete"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'corso-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "corso photos authenticated read"
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
        or d.community_visible = true
      )
  )
);

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
  order by d.created_at desc;
$$;

revoke all on function public.community_corso_list() from public;
revoke all on function public.community_corso_list() from anon;
grant execute on function public.community_corso_list() to authenticated;
grant execute on function public.community_corso_list() to service_role;
