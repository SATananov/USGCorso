create table if not exists public.dog_weight_measurements (
  id uuid primary key default gen_random_uuid(),
  dog_id uuid not null references public.dogs(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  measured_on date not null,
  weight_kg numeric(5,2) not null check (weight_kg >= 0.10 and weight_kg <= 150.00),
  created_at timestamptz not null default now(),
  constraint dog_weight_measurements_dog_day_unique unique (dog_id, measured_on)
);

create index if not exists dog_weight_measurements_owner_dog_date_idx
on public.dog_weight_measurements (owner_id, dog_id, measured_on desc);

alter table public.dog_weight_measurements enable row level security;

revoke all on table public.dog_weight_measurements from public;
revoke all on table public.dog_weight_measurements from anon;
grant select, insert, delete on table public.dog_weight_measurements to authenticated;
grant all on table public.dog_weight_measurements to service_role;

drop policy if exists dog_weight_measurements_select_owner on public.dog_weight_measurements;
create policy dog_weight_measurements_select_owner
on public.dog_weight_measurements
for select to authenticated
using (
  owner_id = (select auth.uid())
  and exists (
    select 1 from public.dogs d
    where d.id = dog_id and d.owner_id = (select auth.uid())
  )
);

drop policy if exists dog_weight_measurements_insert_owner on public.dog_weight_measurements;
create policy dog_weight_measurements_insert_owner
on public.dog_weight_measurements
for insert to authenticated
with check (
  owner_id = (select auth.uid())
  and exists (
    select 1 from public.dogs d
    where d.id = dog_id and d.owner_id = (select auth.uid())
  )
);

drop policy if exists dog_weight_measurements_delete_owner on public.dog_weight_measurements;
create policy dog_weight_measurements_delete_owner
on public.dog_weight_measurements
for delete to authenticated
using (
  owner_id = (select auth.uid())
  and exists (
    select 1 from public.dogs d
    where d.id = dog_id and d.owner_id = (select auth.uid())
  )
);
