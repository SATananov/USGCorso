create table if not exists public.usg_arena_owner_consent (
  owner_id uuid primary key references auth.users(id) on delete cascade,
  opted_in boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists public.usg_arena_dog_consent (
  dog_id uuid primary key references public.dogs(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  opted_in boolean not null default false,
  updated_at timestamptz not null default now()
);

create index if not exists usg_arena_dog_consent_owner_idx
  on public.usg_arena_dog_consent(owner_id);

alter table public.usg_arena_owner_consent enable row level security;
alter table public.usg_arena_dog_consent enable row level security;

revoke all on public.usg_arena_owner_consent from public, anon, authenticated;
revoke all on public.usg_arena_dog_consent from public, anon, authenticated;
grant select on public.usg_arena_owner_consent to authenticated;
grant select on public.usg_arena_dog_consent to authenticated;

create policy usg_arena_owner_consent_self_read
on public.usg_arena_owner_consent
for select to authenticated
using (owner_id = (select auth.uid()));

create policy usg_arena_dog_consent_self_read
on public.usg_arena_dog_consent
for select to authenticated
using (
  owner_id = (select auth.uid())
  and exists (
    select 1 from public.dogs d
    where d.id = dog_id and d.owner_id = (select auth.uid())
  )
);

create or replace function public.usg_arena_set_owner_consent(p_opted_in boolean)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_owner uuid := (select auth.uid());
begin
  if v_owner is null or p_opted_in is null then
    raise exception 'Invalid consent request' using errcode = '42501';
  end if;

  insert into public.usg_arena_owner_consent (owner_id, opted_in, updated_at)
  values (v_owner, p_opted_in, now())
  on conflict (owner_id) do update
  set opted_in = excluded.opted_in, updated_at = now();
  return p_opted_in;
end;
$$;

create or replace function public.usg_arena_set_dog_consent(p_dog_id uuid, p_opted_in boolean)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_owner uuid := (select auth.uid());
begin
  if v_owner is null or p_dog_id is null or p_opted_in is null or not exists (
    select 1 from public.dogs d
    where d.id = p_dog_id and d.owner_id = v_owner
  ) then
    raise exception 'Dog not owned by current user' using errcode = '42501';
  end if;

  insert into public.usg_arena_dog_consent (dog_id, owner_id, opted_in, updated_at)
  values (p_dog_id, v_owner, p_opted_in, now())
  on conflict (dog_id) do update
  set opted_in = excluded.opted_in, updated_at = now()
  where public.usg_arena_dog_consent.owner_id = v_owner;

  if not found then
    raise exception 'Consent update denied' using errcode = '42501';
  end if;
  return p_opted_in;
end;
$$;

revoke all on function public.usg_arena_set_owner_consent(boolean) from public, anon;
revoke all on function public.usg_arena_set_dog_consent(uuid, boolean) from public, anon;
grant execute on function public.usg_arena_set_owner_consent(boolean) to authenticated;
grant execute on function public.usg_arena_set_dog_consent(uuid, boolean) to authenticated;
