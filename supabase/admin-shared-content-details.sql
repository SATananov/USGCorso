create or replace function public.admin_get_shared_content_item_details(
  target_item_id uuid
)
returns table (
  id uuid,
  owner_user_id uuid,
  owner_display_name text,
  owner_username text,
  section_key text,
  content_type text,
  title text,
  body text,
  context_type text,
  context_id uuid,
  status text,
  moderation_note text,
  approved_by uuid,
  approved_at timestamptz,
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
    ci.id,
    ci.owner_user_id,
    p.display_name,
    p.username,
    ci.section_key,
    ci.content_type,
    ci.title,
    ci.body,
    ci.context_type,
    ci.context_id,
    ci.status,
    ci.moderation_note,
    ci.approved_by,
    ci.approved_at,
    ci.created_at,
    ci.updated_at
  from public.content_items ci
  left join public.profiles p
    on p.id = ci.owner_user_id
  where ci.id = target_item_id
    and ci.section_key in (
      'home',
      'knowledge',
      'community',
      'services',
      'events',
      'corso_match',
      'about'
    );
end;
$$;

revoke all on function public.admin_get_shared_content_item_details(uuid) from public;
grant execute on function public.admin_get_shared_content_item_details(uuid) to authenticated;

create or replace function public.admin_list_shared_content_assets(
  target_item_id uuid
)
returns table (
  id uuid,
  content_item_id uuid,
  owner_user_id uuid,
  asset_type text,
  storage_path text,
  file_name text,
  mime_type text,
  created_at timestamptz
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
    ca.id,
    ca.content_item_id,
    ca.owner_user_id,
    ca.asset_type,
    ca.storage_path,
    ca.file_name,
    ca.mime_type,
    ca.created_at
  from public.content_assets ca
  join public.content_items ci
    on ci.id = ca.content_item_id
  where ca.content_item_id = target_item_id
    and ci.section_key in (
      'home',
      'knowledge',
      'community',
      'services',
      'events',
      'corso_match',
      'about'
    )
  order by ca.created_at asc;
end;
$$;

revoke all on function public.admin_list_shared_content_assets(uuid) from public;
grant execute on function public.admin_list_shared_content_assets(uuid) to authenticated;

create or replace function public.admin_delete_shared_content_asset(
  target_asset_id uuid
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  asset_row public.content_assets;
begin
  if not public.is_admin() then
    raise exception 'administrator access required' using errcode = '42501';
  end if;

  select ca.*
  into asset_row
  from public.content_assets ca
  join public.content_items ci
    on ci.id = ca.content_item_id
  where ca.id = target_asset_id
    and ci.section_key in (
      'home',
      'knowledge',
      'community',
      'services',
      'events',
      'corso_match',
      'about'
    );

  if asset_row.id is null then
    raise exception 'content asset not found' using errcode = 'P0002';
  end if;

  delete from public.content_assets
  where id = target_asset_id;

  return asset_row.storage_path;
end;
$$;

revoke all on function public.admin_delete_shared_content_asset(uuid) from public;
grant execute on function public.admin_delete_shared_content_asset(uuid) to authenticated;

create or replace function public.admin_delete_shared_content_item(
  target_item_id uuid
)
returns text[]
language plpgsql
security definer
set search_path = public
as $$
declare
  storage_paths text[];
begin
  if not public.is_admin() then
    raise exception 'administrator access required' using errcode = '42501';
  end if;

  if not exists (
    select 1
    from public.content_items
    where id = target_item_id
      and section_key in (
        'home',
        'knowledge',
        'community',
        'services',
        'events',
        'corso_match',
        'about'
      )
  ) then
    raise exception 'content item not found' using errcode = 'P0002';
  end if;

  select coalesce(array_agg(storage_path), array[]::text[])
  into storage_paths
  from public.content_assets
  where content_item_id = target_item_id;

  delete from public.content_items
  where id = target_item_id;

  return storage_paths;
end;
$$;

revoke all on function public.admin_delete_shared_content_item(uuid) from public;
grant execute on function public.admin_delete_shared_content_item(uuid) to authenticated;
