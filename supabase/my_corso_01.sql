create table if not exists public.dogs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  sex text not null check (sex in ('male', 'female')),
  birth_date date,
  country text,
  city text,
  kennel text,
  breeder text,
  registration_number text,
  description text check (description is null or char_length(description) <= 400),
  community_visible boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists dogs_owner_id_idx
on public.dogs(owner_id);

create index if not exists dogs_community_visible_idx
on public.dogs(community_visible)
where community_visible = true;

alter table public.dogs enable row level security;

drop policy if exists "dogs_select_owner_or_shared" on public.dogs;
create policy "dogs_select_owner_or_shared"
on public.dogs
for select
to authenticated
using (
  owner_id = auth.uid()
  or community_visible = true
);

drop policy if exists "dogs_insert_owner" on public.dogs;
create policy "dogs_insert_owner"
on public.dogs
for insert
to authenticated
with check (
  owner_id = auth.uid()
);

drop policy if exists "dogs_update_owner" on public.dogs;
create policy "dogs_update_owner"
on public.dogs
for update
to authenticated
using (
  owner_id = auth.uid()
)
with check (
  owner_id = auth.uid()
);

drop policy if exists "dogs_delete_owner" on public.dogs;
create policy "dogs_delete_owner"
on public.dogs
for delete
to authenticated
using (
  owner_id = auth.uid()
);

revoke all on table public.dogs from anon;
grant select, insert, update, delete on table public.dogs to authenticated;
grant all on table public.dogs to service_role;
