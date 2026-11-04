create table if not exists public.usg_challenges (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  activity_kind text not null check (activity_kind in ('walk', 'play', 'training', 'scent', 'social')),
  target_count integer not null check (target_count between 1 and 30),
  dog_xp_bonus integer not null default 50 check (dog_xp_bonus between 0 and 100),
  owner_xp_bonus integer not null default 25 check (owner_xp_bonus between 0 and 100),
  arena_bonus integer not null default 0 check (arena_bonus between 0 and 100),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.usg_user_challenges (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  dog_id uuid not null references public.dogs(id) on delete cascade,
  challenge_id uuid references public.usg_challenges(id),
  custom_title text,
  activity_kind text not null check (activity_kind in ('walk', 'play', 'training', 'scent', 'social')),
  target_count integer not null check (target_count between 1 and 30),
  progress_count integer not null default 0 check (progress_count >= 0),
  status text not null default 'active' check (status in ('active', 'completed')),
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  constraint usg_user_challenges_source check (
    (challenge_id is not null and custom_title is null) or
    (challenge_id is null and nullif(btrim(custom_title), '') is not null and char_length(custom_title) <= 80)
  )
);

create unique index if not exists usg_user_challenges_official_once_idx
on public.usg_user_challenges(owner_id, dog_id, challenge_id)
where challenge_id is not null;
create index if not exists usg_user_challenges_owner_dog_idx
on public.usg_user_challenges(owner_id, dog_id, created_at desc);

create table if not exists public.usg_dog_activities (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  dog_id uuid not null references public.dogs(id) on delete cascade,
  activity_date date not null default (now() at time zone 'utc')::date,
  kind text not null check (kind in ('walk', 'play', 'training', 'scent', 'social')),
  duration_min integer not null check (duration_min between 5 and 120),
  distance_km numeric(5,2),
  notes text check (notes is null or char_length(notes) <= 240),
  created_at timestamptz not null default now(),
  constraint usg_dog_activities_walk_distance check (
    (kind = 'walk' and distance_km between 0.10 and 5.00)
    or (kind <> 'walk' and distance_km is null)
  ),
  constraint usg_dog_activities_once_daily unique (dog_id, activity_date, kind)
);
create index if not exists usg_dog_activities_owner_dog_idx
on public.usg_dog_activities(owner_id, dog_id, activity_date desc);

create table if not exists public.usg_point_events (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  dog_id uuid not null references public.dogs(id) on delete cascade,
  source_type text not null check (source_type in ('activity', 'challenge')),
  source_id uuid not null,
  dog_xp integer not null check (dog_xp between 0 and 100),
  owner_xp integer not null check (owner_xp between 0 and 100),
  arena_points integer not null default 0 check (arena_points between 0 and 100),
  awarded_at timestamptz not null default now(),
  constraint usg_point_events_unique_source unique (source_type, source_id)
);
create index if not exists usg_point_events_dog_idx
on public.usg_point_events(owner_id, dog_id, awarded_at desc);
create index if not exists usg_point_events_owner_idx
on public.usg_point_events(owner_id, awarded_at desc);

create table if not exists public.usg_achievements (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  dog_id uuid not null references public.dogs(id) on delete cascade,
  code text not null check (code in ('first_activity', 'first_challenge')),
  unlocked_at timestamptz not null default now(),
  constraint usg_achievements_once unique (dog_id, code)
);

create table if not exists public.usg_timeline_events (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  dog_id uuid not null references public.dogs(id) on delete cascade,
  event_type text not null check (event_type in ('activity', 'challenge', 'achievement')),
  source_id uuid not null,
  event_code text not null,
  occurred_at timestamptz not null default now(),
  constraint usg_timeline_unique_source unique (event_type, source_id)
);
create index if not exists usg_timeline_events_owner_dog_idx
on public.usg_timeline_events(owner_id, dog_id, occurred_at desc);

insert into public.usg_challenges
(slug, activity_kind, target_count, dog_xp_bonus, owner_xp_bonus, arena_bonus)
values
('first-three-walks', 'walk', 3, 50, 25, 0),
('three-training-sessions', 'training', 3, 50, 25, 0),
('three-scent-games', 'scent', 3, 50, 25, 0),
('three-play-sessions', 'play', 3, 50, 25, 0),
('three-calm-social-sessions', 'social', 3, 50, 25, 0)
on conflict (slug) do nothing;

alter table public.usg_challenges enable row level security;
alter table public.usg_user_challenges enable row level security;
alter table public.usg_dog_activities enable row level security;
alter table public.usg_point_events enable row level security;
alter table public.usg_achievements enable row level security;
alter table public.usg_timeline_events enable row level security;

revoke all on public.usg_challenges, public.usg_user_challenges,
  public.usg_dog_activities, public.usg_point_events,
  public.usg_achievements, public.usg_timeline_events from anon, public, authenticated;
grant select on public.usg_challenges, public.usg_user_challenges,
  public.usg_dog_activities, public.usg_point_events,
  public.usg_achievements, public.usg_timeline_events to authenticated;

create policy usg_challenges_read on public.usg_challenges
for select to authenticated using (active = true);

create policy usg_user_challenges_read on public.usg_user_challenges
for select to authenticated using (
  owner_id = (select auth.uid()) and exists (
    select 1 from public.dogs d where d.id = dog_id and d.owner_id = (select auth.uid())
  )
);
create policy usg_dog_activities_read on public.usg_dog_activities
for select to authenticated using (
  owner_id = (select auth.uid()) and exists (
    select 1 from public.dogs d where d.id = dog_id and d.owner_id = (select auth.uid())
  )
);
create policy usg_point_events_read on public.usg_point_events
for select to authenticated using (
  owner_id = (select auth.uid()) and exists (
    select 1 from public.dogs d where d.id = dog_id and d.owner_id = (select auth.uid())
  )
);
create policy usg_achievements_read on public.usg_achievements
for select to authenticated using (
  owner_id = (select auth.uid()) and exists (
    select 1 from public.dogs d where d.id = dog_id and d.owner_id = (select auth.uid())
  )
);
create policy usg_timeline_read on public.usg_timeline_events
for select to authenticated using (
  owner_id = (select auth.uid()) and exists (
    select 1 from public.dogs d where d.id = dog_id and d.owner_id = (select auth.uid())
  )
);

create or replace function public.usg_join_challenge(p_dog_id uuid, p_challenge_id uuid)
returns uuid
language plpgsql security definer set search_path = ''
as $$
declare
  v_owner uuid := (select auth.uid());
  v_challenge public.usg_challenges%rowtype;
  v_id uuid;
begin
  if v_owner is null or not exists (
    select 1 from public.dogs where id = p_dog_id and owner_id = v_owner
  ) then raise exception 'Dog not owned by current user' using errcode = '42501'; end if;
  select * into v_challenge from public.usg_challenges where id = p_challenge_id and active = true;
  if not found then raise exception 'Challenge not found'; end if;
  insert into public.usg_user_challenges
    (owner_id, dog_id, challenge_id, activity_kind, target_count)
  values (v_owner, p_dog_id, p_challenge_id, v_challenge.activity_kind, v_challenge.target_count)
  on conflict do nothing returning id into v_id;
  if v_id is null then
    select id into v_id from public.usg_user_challenges
    where owner_id = v_owner and dog_id = p_dog_id and challenge_id = p_challenge_id;
  end if;
  return v_id;
end;
$$;

create or replace function public.usg_create_personal_challenge(
  p_dog_id uuid, p_title text, p_kind text, p_target integer
)
returns uuid
language plpgsql security definer set search_path = ''
as $$
declare
  v_owner uuid := (select auth.uid());
  v_id uuid;
begin
  if v_owner is null or not exists (
    select 1 from public.dogs where id = p_dog_id and owner_id = v_owner
  ) then raise exception 'Dog not owned by current user' using errcode = '42501'; end if;
  if p_title is null or char_length(btrim(p_title)) not between 1 and 80
    or p_kind not in ('walk', 'play', 'training', 'scent', 'social')
    or p_target not between 1 and 30 then
    raise exception 'Invalid personal challenge';
  end if;
  if (select count(*) from public.usg_user_challenges
    where owner_id = v_owner and dog_id = p_dog_id and challenge_id is null and status = 'active') >= 5 then
    raise exception 'Maximum five active personal challenges';
  end if;
  insert into public.usg_user_challenges
    (owner_id, dog_id, custom_title, activity_kind, target_count)
  values (v_owner, p_dog_id, btrim(p_title), p_kind, p_target)
  returning id into v_id;
  return v_id;
end;
$$;

create or replace function public.usg_record_activity(
  p_dog_id uuid, p_kind text, p_duration_min integer,
  p_distance_km numeric default null, p_notes text default null
)
returns uuid
language plpgsql security definer set search_path = ''
as $$
declare
  v_owner uuid := (select auth.uid());
  v_activity uuid;
  v_dog_xp integer;
  v_owner_xp integer;
  v_challenge record;
  v_bonus record;
  v_achievement uuid;
begin
  if v_owner is null or not exists (
    select 1 from public.dogs where id = p_dog_id and owner_id = v_owner
  ) then raise exception 'Dog not owned by current user' using errcode = '42501'; end if;
  if p_kind is null or p_kind not in ('walk', 'play', 'training', 'scent', 'social')
    or p_duration_min is null or p_duration_min not between 5 and 120
    or (p_kind <> 'walk' and p_duration_min < 10)
    or (p_kind = 'walk' and (p_distance_km is null or p_distance_km not between 0.10 and 5.00))
    or (p_kind <> 'walk' and p_distance_km is not null)
    or (p_notes is not null and char_length(p_notes) > 240) then
    raise exception 'Invalid activity';
  end if;

  v_dog_xp := case p_kind
    when 'walk' then least(50, greatest(1, floor(p_distance_km * 10)::integer))
    when 'training' then 25
    when 'scent' then 20
    when 'social' then 20
    when 'play' then 15
  end;
  v_owner_xp := ceil(v_dog_xp / 2.0)::integer;

  insert into public.usg_dog_activities (owner_id, dog_id, kind, duration_min, distance_km, notes)
  values (v_owner, p_dog_id, p_kind, p_duration_min, p_distance_km, nullif(btrim(p_notes), ''))
  returning id into v_activity;

  insert into public.usg_point_events
    (owner_id, dog_id, source_type, source_id, dog_xp, owner_xp, arena_points)
  values (v_owner, p_dog_id, 'activity', v_activity, v_dog_xp, v_owner_xp, 0);

  insert into public.usg_timeline_events
    (owner_id, dog_id, event_type, source_id, event_code)
  values (v_owner, p_dog_id, 'activity', v_activity, p_kind);

  insert into public.usg_achievements (owner_id, dog_id, code)
  values (v_owner, p_dog_id, 'first_activity')
  on conflict do nothing returning id into v_achievement;
  if v_achievement is not null then
    insert into public.usg_timeline_events
      (owner_id, dog_id, event_type, source_id, event_code)
    values (v_owner, p_dog_id, 'achievement', v_achievement, 'first_activity');
  end if;

  for v_challenge in
    select id, challenge_id, target_count, progress_count
    from public.usg_user_challenges
    where owner_id = v_owner and dog_id = p_dog_id
      and activity_kind = p_kind and status = 'active'
    order by created_at, id for update
  loop
    update public.usg_user_challenges
    set progress_count = least(target_count, progress_count + 1),
        status = case when progress_count + 1 >= target_count then 'completed' else 'active' end,
        completed_at = case when progress_count + 1 >= target_count then now() else null end
    where id = v_challenge.id;

    if v_challenge.progress_count + 1 >= v_challenge.target_count then
      if v_challenge.challenge_id is null then
        insert into public.usg_point_events
          (owner_id, dog_id, source_type, source_id, dog_xp, owner_xp, arena_points)
        values (v_owner, p_dog_id, 'challenge', v_challenge.id, 30, 15, 0);
      else
        select dog_xp_bonus, owner_xp_bonus into v_bonus
        from public.usg_challenges where id = v_challenge.challenge_id;
        insert into public.usg_point_events
          (owner_id, dog_id, source_type, source_id, dog_xp, owner_xp, arena_points)
        values (v_owner, p_dog_id, 'challenge', v_challenge.id,
          v_bonus.dog_xp_bonus, v_bonus.owner_xp_bonus, 0);
      end if;

      insert into public.usg_timeline_events
        (owner_id, dog_id, event_type, source_id, event_code)
      values (v_owner, p_dog_id, 'challenge', v_challenge.id, 'challenge_completed');

      insert into public.usg_achievements (owner_id, dog_id, code)
      values (v_owner, p_dog_id, 'first_challenge')
      on conflict do nothing returning id into v_achievement;
      if v_achievement is not null then
        insert into public.usg_timeline_events
          (owner_id, dog_id, event_type, source_id, event_code)
        values (v_owner, p_dog_id, 'achievement', v_achievement, 'first_challenge');
      end if;
    end if;
  end loop;

  return v_activity;
end;
$$;

revoke all on function public.usg_join_challenge(uuid, uuid) from public, anon;
revoke all on function public.usg_create_personal_challenge(uuid, text, text, integer) from public, anon;
revoke all on function public.usg_record_activity(uuid, text, integer, numeric, text) from public, anon;
grant execute on function public.usg_join_challenge(uuid, uuid) to authenticated;
grant execute on function public.usg_create_personal_challenge(uuid, text, text, integer) to authenticated;
grant execute on function public.usg_record_activity(uuid, text, integer, numeric, text) to authenticated;
