create table if not exists public.notification_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  moderation boolean not null default true,
  events boolean not null default true,
  community boolean not null default true,
  lost_found boolean not null default true,
  preferred_language text not null default 'en'
    check (preferred_language in ('en', 'bg', 'it')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.push_devices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  expo_push_token text not null unique,
  platform text not null check (platform in ('android', 'ios')),
  device_name text,
  enabled boolean not null default true,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists push_devices_user_id_idx
  on public.push_devices(user_id);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null
    check (category in ('moderation', 'events', 'community', 'lost_found', 'system')),
  event_type text not null default 'system',
  title text not null,
  body text not null,
  entity_type text,
  entity_id text,
  data jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_created_idx
  on public.notifications(user_id, created_at desc);

create index if not exists notifications_user_unread_idx
  on public.notifications(user_id, read_at)
  where read_at is null;

alter table public.notification_preferences enable row level security;
alter table public.push_devices enable row level security;
alter table public.notifications enable row level security;

drop policy if exists notification_preferences_select_own
  on public.notification_preferences;
create policy notification_preferences_select_own
  on public.notification_preferences
  for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists notification_preferences_insert_own
  on public.notification_preferences;
create policy notification_preferences_insert_own
  on public.notification_preferences
  for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists notification_preferences_update_own
  on public.notification_preferences;
create policy notification_preferences_update_own
  on public.notification_preferences
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists push_devices_select_own
  on public.push_devices;
create policy push_devices_select_own
  on public.push_devices
  for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists push_devices_insert_own
  on public.push_devices;
create policy push_devices_insert_own
  on public.push_devices
  for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists push_devices_update_own
  on public.push_devices;
create policy push_devices_update_own
  on public.push_devices
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists push_devices_delete_own
  on public.push_devices;
create policy push_devices_delete_own
  on public.push_devices
  for delete
  to authenticated
  using (user_id = auth.uid());

drop policy if exists notifications_select_own
  on public.notifications;
create policy notifications_select_own
  on public.notifications
  for select
  to authenticated
  using (user_id = auth.uid());

revoke insert, update, delete on public.notifications from authenticated;
grant select on public.notifications to authenticated;

create or replace function public.set_notification_preferences_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists notification_preferences_set_updated_at
  on public.notification_preferences;
create trigger notification_preferences_set_updated_at
before update on public.notification_preferences
for each row
execute function public.set_notification_preferences_updated_at();

create or replace function public.get_notification_preferences()
returns setof public.notification_preferences
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  insert into public.notification_preferences (user_id)
  values (current_user_id)
  on conflict (user_id) do nothing;

  return query
  select *
  from public.notification_preferences
  where user_id = current_user_id;
end;
$$;

create or replace function public.update_notification_preferences(
  next_moderation boolean,
  next_events boolean,
  next_community boolean,
  next_lost_found boolean,
  next_preferred_language text
)
returns setof public.notification_preferences
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  if next_preferred_language not in ('en', 'bg', 'it') then
    raise exception 'Unsupported notification language';
  end if;

  insert into public.notification_preferences (
    user_id,
    moderation,
    events,
    community,
    lost_found,
    preferred_language
  )
  values (
    current_user_id,
    next_moderation,
    next_events,
    next_community,
    next_lost_found,
    next_preferred_language
  )
  on conflict (user_id)
  do update set
    moderation = excluded.moderation,
    events = excluded.events,
    community = excluded.community,
    lost_found = excluded.lost_found,
    preferred_language = excluded.preferred_language,
    updated_at = now();

  return query
  select *
  from public.notification_preferences
  where user_id = current_user_id;
end;
$$;

create or replace function public.mark_notification_read(
  target_notification_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  update public.notifications
  set read_at = coalesce(read_at, now())
  where id = target_notification_id
    and user_id = current_user_id;
end;
$$;

create or replace function public.mark_all_notifications_read()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  update public.notifications
  set read_at = now()
  where user_id = current_user_id
    and read_at is null;
end;
$$;

revoke all on function public.get_notification_preferences() from public;
revoke all on function public.update_notification_preferences(
  boolean,
  boolean,
  boolean,
  boolean,
  text
) from public;
revoke all on function public.mark_notification_read(uuid) from public;
revoke all on function public.mark_all_notifications_read() from public;

grant execute on function public.get_notification_preferences() to authenticated;
grant execute on function public.update_notification_preferences(
  boolean,
  boolean,
  boolean,
  boolean,
  text
) to authenticated;
grant execute on function public.mark_notification_read(uuid) to authenticated;
grant execute on function public.mark_all_notifications_read() to authenticated;
