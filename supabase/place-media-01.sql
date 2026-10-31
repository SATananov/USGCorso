insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'place-media',
  'place-media',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create table if not exists public.media_items (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  entity_type text not null,
  entity_id uuid not null,
  storage_path text not null unique,
  caption text,
  is_cover boolean not null default false,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  constraint media_items_entity_type_check
    check (entity_type in ('place', 'dog', 'community_post', 'event', 'service')),
  constraint media_items_status_check
    check (status in ('pending', 'approved', 'rejected')),
  constraint media_items_caption_length
    check (caption is null or char_length(caption) <= 160)
);

create index if not exists media_items_entity_idx
on public.media_items (entity_type, entity_id, status, created_at desc);

alter table public.media_items enable row level security;

drop policy if exists "media_items_select_visible" on public.media_items;

create policy "media_items_select_visible"
on public.media_items
for select
to authenticated
using (
  status = 'approved'
  or owner_user_id = auth.uid()
  or public.is_admin()
  or (
    entity_type = 'place'
    and exists (
      select 1
      from public.places p
      where p.id = media_items.entity_id
        and p.created_by = auth.uid()
    )
  )
);

revoke all on table public.media_items from anon;
revoke all on table public.media_items from authenticated;
grant select on table public.media_items to authenticated;

create or replace function public.create_place_media(
  target_place_id uuid,
  target_storage_path text,
  target_caption text
)
returns public.media_items
language plpgsql
security definer
set search_path = public
as $$
declare
  current_place public.places;
  caller_can_manage boolean;
  next_status text;
  next_cover boolean;
  created_row public.media_items;
begin
  select *
  into current_place
  from public.places
  where id = target_place_id;

  if current_place.id is null then
    raise exception 'place not found' using errcode = 'P0002';
  end if;

  if auth.uid() is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;

  if target_storage_path is null
    or target_storage_path not like auth.uid()::text || '/%'
    or target_storage_path not like '%/' || target_place_id::text || '/%' then
    raise exception 'invalid storage path' using errcode = '22023';
  end if;

  caller_can_manage :=
    public.is_admin()
    or current_place.created_by is not distinct from auth.uid();

  next_status := case
    when caller_can_manage then 'approved'
    else 'pending'
  end;

  next_cover :=
    next_status = 'approved'
    and not exists (
      select 1
      from public.media_items m
      where m.entity_type = 'place'
        and m.entity_id = target_place_id
        and m.status = 'approved'
        and m.is_cover = true
    );

  insert into public.media_items (
    owner_user_id,
    entity_type,
    entity_id,
    storage_path,
    caption,
    is_cover,
    status
  )
  values (
    auth.uid(),
    'place',
    target_place_id,
    target_storage_path,
    nullif(trim(target_caption), ''),
    next_cover,
    next_status
  )
  returning * into created_row;

  return created_row;
end;
$$;

create or replace function public.delete_place_media(target_media_id uuid)
returns table (id uuid, storage_path text)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_media public.media_items;
  current_place public.places;
begin
  select *
  into current_media
  from public.media_items
  where media_items.id = target_media_id
    and entity_type = 'place';

  if current_media.id is null then
    raise exception 'media not found' using errcode = 'P0002';
  end if;

  select *
  into current_place
  from public.places
  where places.id = current_media.entity_id;

  if current_media.owner_user_id <> auth.uid()
    and not public.is_admin()
    and current_place.created_by is distinct from auth.uid() then
    raise exception 'media delete access denied' using errcode = '42501';
  end if;

  return query
  delete from public.media_items
  where media_items.id = target_media_id
  returning media_items.id, media_items.storage_path;
end;
$$;

create or replace function public.moderate_place_media(
  target_media_id uuid,
  target_status text
)
returns public.media_items
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_row public.media_items;
begin
  if not public.is_admin() then
    raise exception 'admin access required' using errcode = '42501';
  end if;

  if target_status not in ('approved', 'rejected') then
    raise exception 'invalid moderation status' using errcode = '22023';
  end if;

  update public.media_items
  set
    status = target_status,
    is_cover = case
      when target_status = 'rejected' then false
      else is_cover
    end
  where id = target_media_id
    and entity_type = 'place'
  returning * into updated_row;

  if updated_row.id is null then
    raise exception 'media not found' using errcode = 'P0002';
  end if;

  return updated_row;
end;
$$;

create or replace function public.set_place_media_cover(target_media_id uuid)
returns public.media_items
language plpgsql
security definer
set search_path = public
as $$
declare
  current_media public.media_items;
  current_place public.places;
  updated_row public.media_items;
begin
  select *
  into current_media
  from public.media_items
  where id = target_media_id
    and entity_type = 'place'
    and status = 'approved';

  if current_media.id is null then
    raise exception 'approved media not found' using errcode = 'P0002';
  end if;

  select *
  into current_place
  from public.places
  where id = current_media.entity_id;

  if not public.is_admin()
    and current_place.created_by is distinct from auth.uid() then
    raise exception 'cover access denied' using errcode = '42501';
  end if;

  update public.media_items
  set is_cover = false
  where entity_type = 'place'
    and entity_id = current_media.entity_id;

  update public.media_items
  set is_cover = true
  where id = target_media_id
  returning * into updated_row;

  return updated_row;
end;
$$;

revoke all on function public.create_place_media(uuid, text, text) from public;
revoke all on function public.delete_place_media(uuid) from public;
revoke all on function public.moderate_place_media(uuid, text) from public;
revoke all on function public.set_place_media_cover(uuid) from public;

grant execute on function public.create_place_media(uuid, text, text) to authenticated;
grant execute on function public.delete_place_media(uuid) to authenticated;
grant execute on function public.moderate_place_media(uuid, text) to authenticated;
grant execute on function public.set_place_media_cover(uuid) to authenticated;

drop policy if exists "place_media_insert_own_path" on storage.objects;
drop policy if exists "place_media_select_visible" on storage.objects;
drop policy if exists "place_media_delete_allowed" on storage.objects;

create policy "place_media_insert_own_path"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'place-media'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "place_media_select_visible"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'place-media'
  and (
    (storage.foldername(name))[1] = auth.uid()::text
    or public.is_admin()
    or exists (
      select 1
      from public.media_items m
      left join public.places p
        on m.entity_type = 'place'
       and p.id = m.entity_id
      where m.storage_path = name
        and (
          m.status = 'approved'
          or m.owner_user_id = auth.uid()
          or p.created_by = auth.uid()
        )
    )
  )
);

create policy "place_media_delete_allowed"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'place-media'
  and (
    (storage.foldername(name))[1] = auth.uid()::text
    or public.is_admin()
    or exists (
      select 1
      from public.media_items m
      join public.places p
        on m.entity_type = 'place'
       and p.id = m.entity_id
      where m.storage_path = name
        and p.created_by = auth.uid()
    )
  )
);


create or replace function public.get_place_media_for_viewer(
  target_place_id uuid
)
returns table (
  id uuid,
  owner_user_id uuid,
  entity_type text,
  entity_id uuid,
  storage_path text,
  caption text,
  is_cover boolean,
  status text,
  created_at timestamptz
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  caller_is_admin boolean;
  caller_is_place_owner boolean;
begin
  if auth.uid() is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;

  caller_is_admin := public.is_admin();

  select exists (
    select 1
    from public.places p
    where p.id = target_place_id
      and p.created_by = auth.uid()
  )
  into caller_is_place_owner;

  return query
  select
    m.id,
    m.owner_user_id,
    m.entity_type,
    m.entity_id,
    m.storage_path,
    m.caption,
    m.is_cover,
    m.status,
    m.created_at
  from public.media_items m
  where m.entity_type = 'place'
    and m.entity_id = target_place_id
    and (
      m.status = 'approved'
      or m.owner_user_id = auth.uid()
      or caller_is_admin
      or caller_is_place_owner
    )
  order by
    m.is_cover desc,
    m.created_at desc;
end;
$$;

revoke all on function public.get_place_media_for_viewer(uuid) from public;
grant execute on function public.get_place_media_for_viewer(uuid) to authenticated;
