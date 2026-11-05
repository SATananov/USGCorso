create or replace function public.usg_arena_dog_ranking_preview()
returns table (
  place bigint,
  verified_points bigint
)
language sql
stable
security definer
set search_path = ''
as $$
  with eligible as (
    select d.id as dog_id, d.owner_id
    from public.dogs d
    join public.usg_arena_owner_consent oc
      on oc.owner_id = d.owner_id and oc.opted_in = true
    join public.usg_arena_dog_consent dc
      on dc.dog_id = d.id and dc.owner_id = d.owner_id and dc.opted_in = true
    where d.community_visible = true
      and d.moderation_status = 'approved'
  ),
  scores as (
    select e.dog_id, sum(a.points)::bigint as score
    from eligible e
    join public.usg_arena_verified_awards a
      on a.dog_id = e.dog_id and a.owner_id = e.owner_id
    group by e.dog_id
  ),
  ranked as (
    select row_number() over (order by s.score desc, s.dog_id) as position,
      s.score
    from scores s
    where s.score > 0
  )
  select r.position, r.score
  from ranked r
  where r.position <= 20
  order by r.position;
$$;

create or replace function public.usg_arena_owner_ranking_preview()
returns table (
  place bigint,
  verified_points bigint
)
language sql
stable
security definer
set search_path = ''
as $$
  with eligible as (
    select d.id as dog_id, d.owner_id
    from public.dogs d
    join public.usg_arena_owner_consent oc
      on oc.owner_id = d.owner_id and oc.opted_in = true
    join public.usg_arena_dog_consent dc
      on dc.dog_id = d.id and dc.owner_id = d.owner_id and dc.opted_in = true
    where d.community_visible = true
      and d.moderation_status = 'approved'
  ),
  scores as (
    select e.owner_id, sum(a.points)::bigint as score
    from eligible e
    join public.usg_arena_verified_awards a
      on a.dog_id = e.dog_id and a.owner_id = e.owner_id
    group by e.owner_id
  ),
  ranked as (
    select row_number() over (order by s.score desc, s.owner_id) as position,
      s.score
    from scores s
    where s.score > 0
  )
  select r.position, r.score
  from ranked r
  where r.position <= 20
  order by r.position;
$$;

revoke all on function public.usg_arena_dog_ranking_preview() from public, anon, authenticated;
revoke all on function public.usg_arena_owner_ranking_preview() from public, anon, authenticated;
