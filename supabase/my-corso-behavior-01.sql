create table if not exists public.dog_behavior_entries (
  id uuid primary key default gen_random_uuid(),
  dog_id uuid not null references public.dogs(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  entry_date date not null,
  category text not null check (category in ('calm', 'social', 'training', 'stress', 'other')),
  context text check (context is null or char_length(context) <= 120),
  notes text not null check (char_length(btrim(notes)) between 1 and 600),
  created_at timestamptz not null default now()
);

create index if not exists dog_behavior_entries_owner_dog_date_idx
on public.dog_behavior_entries(owner_id, dog_id, entry_date desc);

alter table public.dog_behavior_entries enable row level security;
revoke all on public.dog_behavior_entries from anon, public;
grant select, insert, update, delete on public.dog_behavior_entries to authenticated;

drop policy if exists dog_behavior_entries_select_owner on public.dog_behavior_entries;
create policy dog_behavior_entries_select_owner on public.dog_behavior_entries
for select to authenticated using (
  owner_id = (select auth.uid()) and exists (
    select 1 from public.dogs d where d.id = dog_id and d.owner_id = (select auth.uid())
  )
);

drop policy if exists dog_behavior_entries_insert_owner on public.dog_behavior_entries;
create policy dog_behavior_entries_insert_owner on public.dog_behavior_entries
for insert to authenticated with check (
  owner_id = (select auth.uid()) and exists (
    select 1 from public.dogs d where d.id = dog_id and d.owner_id = (select auth.uid())
  )
);

drop policy if exists dog_behavior_entries_update_owner on public.dog_behavior_entries;
create policy dog_behavior_entries_update_owner on public.dog_behavior_entries
for update to authenticated using (
  owner_id = (select auth.uid()) and exists (
    select 1 from public.dogs d where d.id = dog_id and d.owner_id = (select auth.uid())
  )
) with check (
  owner_id = (select auth.uid()) and exists (
    select 1 from public.dogs d where d.id = dog_id and d.owner_id = (select auth.uid())
  )
);

drop policy if exists dog_behavior_entries_delete_owner on public.dog_behavior_entries;
create policy dog_behavior_entries_delete_owner on public.dog_behavior_entries
for delete to authenticated using (
  owner_id = (select auth.uid()) and exists (
    select 1 from public.dogs d where d.id = dog_id and d.owner_id = (select auth.uid())
  )
);
