create or replace function public.usg_arena_progress_snapshot(p_dog_id uuid)
returns table (
  dog_xp bigint,
  owner_xp bigint,
  arena_points bigint,
  activities_count bigint,
  completed_missions bigint,
  badges_count bigint
)
language plpgsql
stable
security invoker
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
    coalesce((select sum(p.dog_xp)::bigint from public.usg_point_events p
      where p.owner_id = v_owner and p.dog_id = p_dog_id), 0::bigint),
    coalesce((select sum(p.owner_xp)::bigint from public.usg_point_events p
      where p.owner_id = v_owner), 0::bigint),
    coalesce((select sum(p.arena_points)::bigint from public.usg_point_events p
      where p.owner_id = v_owner and p.dog_id = p_dog_id), 0::bigint),
    (select count(*) from public.usg_dog_activities a
      where a.owner_id = v_owner and a.dog_id = p_dog_id),
    (select count(*) from public.usg_user_challenges c
      where c.owner_id = v_owner and c.dog_id = p_dog_id and c.status = 'completed'),
    (select count(*) from public.usg_achievements a
      where a.owner_id = v_owner and a.dog_id = p_dog_id);
end;
$$;

revoke all on function public.usg_arena_progress_snapshot(uuid) from public, anon;
grant execute on function public.usg_arena_progress_snapshot(uuid) to authenticated;
