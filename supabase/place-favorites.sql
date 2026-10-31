create table if not exists public.place_favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  place_id uuid not null references public.places(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, place_id)
);

create index if not exists place_favorites_user_id_idx
on public.place_favorites(user_id);

create index if not exists place_favorites_place_id_idx
on public.place_favorites(place_id);

alter table public.place_favorites enable row level security;

drop policy if exists "place_favorites_select_owner" on public.place_favorites;
create policy "place_favorites_select_owner"
on public.place_favorites
for select
to authenticated
using (
  user_id = auth.uid()
);

drop policy if exists "place_favorites_insert_owner" on public.place_favorites;
create policy "place_favorites_insert_owner"
on public.place_favorites
for insert
to authenticated
with check (
  user_id = auth.uid()
);

drop policy if exists "place_favorites_delete_owner" on public.place_favorites;
create policy "place_favorites_delete_owner"
on public.place_favorites
for delete
to authenticated
using (
  user_id = auth.uid()
);

revoke all on table public.place_favorites from anon;
grant select, insert, delete on table public.place_favorites to authenticated;
grant all on table public.place_favorites to service_role;
