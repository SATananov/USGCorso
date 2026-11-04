create table if not exists public.dog_care_entries (
  id uuid primary key default gen_random_uuid(),
  dog_id uuid not null references public.dogs(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  entry_date date not null,
  kind text not null check (kind in ('feeding', 'care')),
  food_name text,
  amount_g numeric(8, 1),
  care_type text,
  notes text,
  created_at timestamptz not null default now(),
  constraint dog_care_entries_valid_fields check (
    (kind = 'feeding' and nullif(btrim(food_name), '') is not null and char_length(food_name) <= 100 and amount_g > 0 and amount_g <= 10000 and care_type is null)
    or (kind = 'care' and nullif(btrim(care_type), '') is not null and char_length(care_type) <= 100 and food_name is null and amount_g is null)
  ),
  constraint dog_care_entries_notes_limit check (notes is null or char_length(notes) <= 500)
);

create index if not exists dog_care_entries_owner_dog_date_idx
on public.dog_care_entries(owner_id, dog_id, entry_date desc);

alter table public.dog_care_entries enable row level security;

revoke all on public.dog_care_entries from anon, public;
grant select, insert, update, delete on public.dog_care_entries to authenticated;

drop policy if exists dog_care_entries_select_owner on public.dog_care_entries;
create policy dog_care_entries_select_owner on public.dog_care_entries
for select to authenticated using (
  owner_id = (select auth.uid()) and exists (
    select 1 from public.dogs d where d.id = dog_id and d.owner_id = (select auth.uid())
  )
);

drop policy if exists dog_care_entries_insert_owner on public.dog_care_entries;
create policy dog_care_entries_insert_owner on public.dog_care_entries
for insert to authenticated with check (
  owner_id = (select auth.uid()) and exists (
    select 1 from public.dogs d where d.id = dog_id and d.owner_id = (select auth.uid())
  )
);

drop policy if exists dog_care_entries_update_owner on public.dog_care_entries;
create policy dog_care_entries_update_owner on public.dog_care_entries
for update to authenticated
using (owner_id = (select auth.uid()) and exists (
  select 1 from public.dogs d where d.id = dog_id and d.owner_id = (select auth.uid())
))
with check (owner_id = (select auth.uid()) and exists (
  select 1 from public.dogs d where d.id = dog_id and d.owner_id = (select auth.uid())
));

drop policy if exists dog_care_entries_delete_owner on public.dog_care_entries;
create policy dog_care_entries_delete_owner on public.dog_care_entries
for delete to authenticated using (
  owner_id = (select auth.uid()) and exists (
    select 1 from public.dogs d where d.id = dog_id and d.owner_id = (select auth.uid())
  )
);
