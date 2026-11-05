create table if not exists public.usg_arena_verified_awards (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  dog_id uuid not null references public.dogs(id) on delete cascade,
  source_type text not null check (source_type in ('verified_gps', 'moderated_event')),
  source_id uuid not null,
  points integer not null check (points between 1 and 100),
  awarded_at timestamptz not null default now(),
  constraint usg_arena_verified_awards_unique_source unique (source_type, source_id)
);

create index if not exists usg_arena_verified_awards_owner_dog_idx
  on public.usg_arena_verified_awards(owner_id, dog_id, awarded_at desc);

alter table public.usg_arena_verified_awards enable row level security;

revoke all on public.usg_arena_verified_awards from public, anon, authenticated;

create or replace function public.usg_arena_my_ranking_readiness(p_dog_id uuid)
returns table (
  owner_opted_in boolean,
  dog_opted_in boolean,
  dog_public_and_approved boolean,
  eligible_for_future_ranking boolean,
  verified_arena_points bigint
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_owner uuid := (select auth.uid());
begin
  if v_owner is null or p_dog_id is null or not exists (
    select 1 from public.dogs d
    where d.id = p_dog_id and d.owner_id = v_owner
  ) then
    raise exception 'Dog not owned by current user' using errcode = '42501';
  end if;

  return query
  select
    coalesce(oc.opted_in, false),
    coalesce(dc.opted_in, false),
    (coalesce(d.community_visible, false) and d.moderation_status = 'approved'),
    (coalesce(oc.opted_in, false)
      and coalesce(dc.opted_in, false)
      and coalesce(d.community_visible, false)
      and d.moderation_status = 'approved'),
    coalesce((
      select sum(a.points)::bigint
      from public.usg_arena_verified_awards a
      where a.owner_id = v_owner and a.dog_id = p_dog_id
    ), 0::bigint)
  from public.dogs d
  left join public.usg_arena_owner_consent oc
    on oc.owner_id = v_owner
  left join public.usg_arena_dog_consent dc
    on dc.owner_id = v_owner and dc.dog_id = d.id
  where d.id = p_dog_id and d.owner_id = v_owner;
end;
$$;

revoke all on function public.usg_arena_my_ranking_readiness(uuid) from public, anon;
grant execute on function public.usg_arena_my_ranking_readiness(uuid) to authenticated;
