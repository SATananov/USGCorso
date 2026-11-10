drop policy if exists "corso photos admin read" on storage.objects;
drop policy if exists "corso photos admin delete" on storage.objects;

create policy "corso photos admin read"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'corso-photos'
  and public.is_admin()
);

create policy "corso photos admin delete"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'corso-photos'
  and public.is_admin()
);

create or replace function public.admin_list_dogs()
returns table (
  id uuid,
  owner_id uuid,
  owner_display_name text,
  owner_username text,
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
  community_visible boolean,
  photo_path text,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'administrator access required' using errcode = '42501';
  end if;

  return query
  select
    d.id,
    d.owner_id,
    p.display_name,
    p.username,
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
    d.community_visible,
    d.photo_path,
    d.created_at,
    d.updated_at
  from public.dogs d
  left join public.profiles p
    on p.id = d.owner_id
  order by d.updated_at desc, d.created_at desc;
end;
$$;

revoke all on function public.admin_list_dogs() from public;
grant execute on function public.admin_list_dogs() to authenticated;

create or replace function public.admin_get_dog_details(
  target_dog_id uuid
)
returns table (
  id uuid,
  owner_id uuid,
  owner_display_name text,
  owner_username text,
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
  community_visible boolean,
  photo_path text,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'administrator access required' using errcode = '42501';
  end if;

  return query
  select
    d.id,
    d.owner_id,
    p.display_name,
    p.username,
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
    d.community_visible,
    d.photo_path,
    d.created_at,
    d.updated_at
  from public.dogs d
  left join public.profiles p
    on p.id = d.owner_id
  where d.id = target_dog_id;
end;
$$;

revoke all on function public.admin_get_dog_details(uuid) from public;
grant execute on function public.admin_get_dog_details(uuid) to authenticated;

create or replace function public.admin_update_dog(
  target_dog_id uuid,
  dog_name text,
  dog_sex text,
  dog_color text,
  dog_birth_date date,
  dog_country text,
  dog_city text,
  dog_kennel text,
  dog_breeder text,
  dog_registration_number text,
  dog_description text,
  dog_community_visible boolean
)
returns public.dogs
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_dog public.dogs;
begin
  if not public.is_admin() then
    raise exception 'administrator access required' using errcode = '42501';
  end if;

  if nullif(trim(dog_name), '') is null then
    raise exception 'dog name is required' using errcode = '22023';
  end if;

  if nullif(trim(dog_sex), '') is null then
    raise exception 'dog sex is required' using errcode = '22023';
  end if;

  update public.dogs
  set
    name = trim(dog_name),
    sex = trim(dog_sex),
    color = nullif(trim(dog_color), ''),
    birth_date = dog_birth_date,
    country = nullif(trim(dog_country), ''),
    city = nullif(trim(dog_city), ''),
    kennel = nullif(trim(dog_kennel), ''),
    breeder = nullif(trim(dog_breeder), ''),
    registration_number = nullif(trim(dog_registration_number), ''),
    description = nullif(trim(dog_description), ''),
    community_visible = coalesce(dog_community_visible, false),
    updated_at = now()
  where id = target_dog_id
  returning * into updated_dog;

  if updated_dog.id is null then
    raise exception 'dog not found' using errcode = 'P0002';
  end if;

  return updated_dog;
end;
$$;

revoke all on function public.admin_update_dog(
  uuid,
  text,
  text,
  text,
  date,
  text,
  text,
  text,
  text,
  text,
  text,
  boolean
) from public;

grant execute on function public.admin_update_dog(
  uuid,
  text,
  text,
  text,
  date,
  text,
  text,
  text,
  text,
  text,
  text,
  boolean
) to authenticated;

create or replace function public.admin_remove_dog_photo(
  target_dog_id uuid
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  old_path text;
begin
  if not public.is_admin() then
    raise exception 'administrator access required' using errcode = '42501';
  end if;

  update public.dogs
  set
    photo_path = null,
    updated_at = now()
  where id = target_dog_id
  returning photo_path into old_path;

  select d.photo_path
  into old_path
  from public.dogs d
  where d.id = target_dog_id;

  if not found then
    raise exception 'dog not found' using errcode = 'P0002';
  end if;

  return old_path;
end;
$$;

create or replace function public.admin_remove_dog_photo(
  target_dog_id uuid
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  old_path text;
begin
  if not public.is_admin() then
    raise exception 'administrator access required' using errcode = '42501';
  end if;

  select photo_path
  into old_path
  from public.dogs
  where id = target_dog_id;

  if not found then
    raise exception 'dog not found' using errcode = 'P0002';
  end if;

  update public.dogs
  set
    photo_path = null,
    updated_at = now()
  where id = target_dog_id;

  return old_path;
end;
$$;

revoke all on function public.admin_remove_dog_photo(uuid) from public;
grant execute on function public.admin_remove_dog_photo(uuid) to authenticated;

create or replace function public.admin_delete_dog(
  target_dog_id uuid
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  old_path text;
begin
  if not public.is_admin() then
    raise exception 'administrator access required' using errcode = '42501';
  end if;

  select photo_path
  into old_path
  from public.dogs
  where id = target_dog_id;

  if not found then
    raise exception 'dog not found' using errcode = 'P0002';
  end if;

  delete from public.dogs
  where id = target_dog_id;

  return old_path;
end;
$$;

revoke all on function public.admin_delete_dog(uuid) from public;
grant execute on function public.admin_delete_dog(uuid) to authenticated;
