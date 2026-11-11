create or replace function public.register_my_content_asset(
  target_item_id uuid,
  target_asset_type text,
  target_storage_path text,
  target_file_name text,
  target_mime_type text
)
returns public.content_assets
language plpgsql
security definer
set search_path = public
as $$
declare
  current_item public.content_items;
  created_asset public.content_assets;
  expected_prefix text;
begin
  if auth.uid() is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;

  select *
  into current_item
  from public.content_items
  where id = target_item_id
    and owner_user_id = auth.uid();

  if current_item.id is null then
    raise exception 'content item not found or access denied' using errcode = '42501';
  end if;

  if target_asset_type not in ('image', 'pdf', 'document', 'brochure', 'other') then
    raise exception 'unsupported asset type';
  end if;

  expected_prefix := auth.uid()::text || '/' || target_item_id::text || '/';

  if target_storage_path is null
     or position(expected_prefix in target_storage_path) <> 1 then
    raise exception 'invalid storage path' using errcode = '42501';
  end if;

  insert into public.content_assets (
    content_item_id,
    owner_user_id,
    asset_type,
    storage_path,
    file_name,
    mime_type
  )
  values (
    target_item_id,
    auth.uid(),
    target_asset_type,
    target_storage_path,
    nullif(trim(target_file_name), ''),
    nullif(trim(target_mime_type), '')
  )
  returning * into created_asset;

  update public.content_items
  set updated_at = now()
  where id = target_item_id;

  insert into public.content_audit_log (
    content_item_id,
    actor_user_id,
    actor_role,
    action,
    from_status,
    to_status,
    details
  )
  values (
    target_item_id,
    auth.uid(),
    'user',
    'asset_added',
    current_item.status,
    current_item.status,
    jsonb_build_object(
      'asset_id', created_asset.id,
      'asset_type', created_asset.asset_type
    )
  );

  return created_asset;
end;
$$;

create or replace function public.list_my_content_assets(
  target_item_id uuid
)
returns setof public.content_assets
language sql
stable
security definer
set search_path = public
as $$
  select ca.*
  from public.content_assets ca
  join public.content_items ci
    on ci.id = ca.content_item_id
  where ca.content_item_id = target_item_id
    and ci.owner_user_id = auth.uid()
    and ca.owner_user_id = auth.uid()
  order by ca.created_at asc;
$$;

revoke all on function public.register_my_content_asset(
  uuid,
  text,
  text,
  text,
  text
) from public;
revoke all on function public.list_my_content_assets(uuid) from public;

grant execute on function public.register_my_content_asset(
  uuid,
  text,
  text,
  text,
  text
) to authenticated;
grant execute on function public.list_my_content_assets(uuid) to authenticated;
