create table if not exists public.place_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  place_id uuid not null references public.places(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text check (comment is null or char_length(comment) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, place_id)
);

create index if not exists place_reviews_place_id_idx
on public.place_reviews(place_id);

create index if not exists place_reviews_user_id_idx
on public.place_reviews(user_id);

alter table public.place_reviews enable row level security;

drop policy if exists "place_reviews_select_authenticated" on public.place_reviews;
create policy "place_reviews_select_authenticated"
on public.place_reviews
for select
to authenticated
using (true);

drop policy if exists "place_reviews_insert_owner" on public.place_reviews;
create policy "place_reviews_insert_owner"
on public.place_reviews
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "place_reviews_update_owner" on public.place_reviews;
create policy "place_reviews_update_owner"
on public.place_reviews
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "place_reviews_delete_owner" on public.place_reviews;
create policy "place_reviews_delete_owner"
on public.place_reviews
for delete
to authenticated
using (user_id = auth.uid());

revoke all on table public.place_reviews from anon;
grant select, insert, update, delete on table public.place_reviews to authenticated;
grant all on table public.place_reviews to service_role;
