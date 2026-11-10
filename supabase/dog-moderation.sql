begin;

alter table public.dogs
  add column if not exists moderation_status text,
  add column if not exists moderation_note text,
  add column if not exists moderated_at timestamptz,
  add column if not exists moderated_by uuid references auth.users(id) on delete set null;

update public.dogs
set moderation_status = case
  when community_visible then 'approved'
  else 'private'
end
where moderation_status is null;

alter table public.dogs
  alter column moderation_status set default 'private',
  alter column moderation_status set not null;

alter table public.dogs
  drop constraint if exists dogs_moderation_status_check;

alter table public.dogs
  add constraint dogs_moderation_status_check
  check (
    moderation_status in (
      'private',
      'pending',
      'approved',
      'rejected',
      'needs_changes'
    )
  );

create index if not exists dogs_moderation_status_idx
  on public.dogs (moderation_status);

create index if not exists dogs_community_moderation_idx
  on public.dogs (community_visible, moderation_status);

create or replace function public.apply_dog_moderation_state()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  caller_is_admin boolean := false;
  public_content_changed boolean := false;
begin
  if auth.uid() is not null then
    caller_is_admin := public.is_admin();
  end if;

  if not new.community_visible then
    new.moderation_status := 'private';
    new.moderation_note := null;
    new.moderated_at := null;
    new.moderated_by := null;
    return new;
  end if;

  if caller_is_admin then
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.moderation_status := 'pending';
    new.moderation_note := null;
    new.moderated_at := null;
    new.moderated_by := null;
    return new;
  end if;

  public_content_changed :=
    old.community_visible is distinct from new.community_visible
    or old.name is distinct from new.name
    or old.sex is distinct from new.sex
    or old.color is distinct from new.color
    or old.birth_date is distinct from new.birth_date
    or old.country is distinct from new.country
    or old.city is distinct from new.city
    or old.kennel is distinct from new.kennel
    or old.breeder is distinct from new.breeder
    or old.registration_number is distinct from new.registration_number
    or old.description is distinct from new.description
    or old.photo_path is distinct from new.photo_path;

  if public_content_changed then
    new.moderation_status := 'pending';
    new.moderation_note := null;
    new.moderated_at := null;
    new.moderated_by := null;
  end if;

  return new;
end;
$$;

drop trigger if exists dogs_apply_moderation_state on public.dogs;

create trigger dogs_apply_moderation_state
before insert or update on public.dogs
for each row
execute function public.apply_dog_moderation_state();

create or replace function public.admin_list_dogs_by_moderation(
  target_status text default null
)
returns setof public.dogs
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'admin access required' using errcode = '42501';
  end if;

  if target_status is not null
    and target_status not in (
      'private',
      'pending',
      'approved',
      'rejected',
      'needs_changes'
    ) then
    raise exception 'invalid moderation status' using errcode = '22023';
  end if;

  return query
  select d.*
  from public.dogs d
  where target_status is null
     or d.moderation_status = target_status
  order by d.updated_at desc nulls last, d.created_at desc;
end;
$$;

create or replace function public.admin_set_dog_moderation(
  target_dog_id uuid,
  target_status text,
  target_note text default null
)
returns public.dogs
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_row public.dogs;
begin
  if not public.is_admin() then
    raise exception 'admin access required' using errcode = '42501';
  end if;

  if target_status not in (
    'approved',
    'rejected',
    'needs_changes'
  ) then
    raise exception 'invalid moderation status' using errcode = '22023';
  end if;

  update public.dogs
  set
    moderation_status = target_status,
    moderation_note = nullif(trim(coalesce(target_note, '')), ''),
    moderated_at = now(),
    moderated_by = auth.uid(),
    updated_at = now()
  where id = target_dog_id
    and community_visible = true
  returning * into updated_row;

  if updated_row.id is null then
    raise exception 'public dog not found' using errcode = 'P0002';
  end if;

  return updated_row;
end;
$$;

create or replace function public.admin_clear_dog_description(
  target_dog_id uuid,
  target_note text default null
)
returns public.dogs
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_row public.dogs;
begin
  if not public.is_admin() then
    raise exception 'admin access required' using errcode = '42501';
  end if;

  update public.dogs
  set
    description = null,
    moderation_status = case
      when community_visible then 'needs_changes'
      else 'private'
    end,
    moderation_note = nullif(trim(coalesce(target_note, '')), ''),
    moderated_at = now(),
    moderated_by = auth.uid(),
    updated_at = now()
  where id = target_dog_id
  returning * into updated_row;

  if updated_row.id is null then
    raise exception 'dog not found' using errcode = 'P0002';
  end if;

  return updated_row;
end;
$$;

create or replace function public.submit_my_dog_for_moderation(
  target_dog_id uuid
)
returns public.dogs
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_row public.dogs;
begin
  if auth.uid() is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;

  update public.dogs
  set
    moderation_status = case
      when community_visible then 'pending'
      else 'private'
    end,
    moderation_note = null,
    moderated_at = null,
    moderated_by = null,
    updated_at = now()
  where id = target_dog_id
    and owner_id = auth.uid()
  returning * into updated_row;

  if updated_row.id is null then
    raise exception 'dog not found or access denied' using errcode = 'P0002';
  end if;

  return updated_row;
end;
$$;

revoke all on function public.admin_list_dogs_by_moderation(text) from public;
revoke all on function public.admin_set_dog_moderation(uuid, text, text) from public;
revoke all on function public.admin_clear_dog_description(uuid, text) from public;
revoke all on function public.submit_my_dog_for_moderation(uuid) from public;

grant execute on function public.admin_list_dogs_by_moderation(text) to authenticated;
grant execute on function public.admin_set_dog_moderation(uuid, text, text) to authenticated;
grant execute on function public.admin_clear_dog_description(uuid, text) to authenticated;
grant execute on function public.submit_my_dog_for_moderation(uuid) to authenticated;

commit;
