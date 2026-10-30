create or replace function public.admin_list_pending_places()
returns setof public.places
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'administrator access required' using errcode = '42501';
  end if;

  return query
  select p.*
  from public.places p
  where p.status = 'pending'
  order by p.created_at desc;
end;
$$;

revoke all on function public.admin_list_pending_places() from public;
grant execute on function public.admin_list_pending_places() to authenticated;

create or replace function public.admin_review_place(
  target_place_id uuid,
  decision text
)
returns public.places
language plpgsql
security definer
set search_path = public
as $$
declare
  reviewed public.places;
begin
  if not public.is_admin() then
    raise exception 'administrator access required' using errcode = '42501';
  end if;

  if decision not in ('approved', 'rejected') then
    raise exception 'invalid moderation decision' using errcode = '22023';
  end if;

  update public.places
  set
    status = decision,
    verified = false,
    updated_at = now()
  where id = target_place_id
    and status = 'pending'
  returning * into reviewed;

  if reviewed.id is null then
    raise exception 'pending place not found' using errcode = 'P0002';
  end if;

  return reviewed;
end;
$$;

revoke all on function public.admin_review_place(uuid, text) from public;
grant execute on function public.admin_review_place(uuid, text) to authenticated;
