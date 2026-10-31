create table if not exists public.place_review_helpful (
  user_id uuid not null references auth.users(id) on delete cascade,
  review_id uuid not null references public.place_reviews(id) on delete cascade,
  place_id uuid not null references public.places(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, review_id)
);

create index if not exists place_review_helpful_review_id_idx
on public.place_review_helpful(review_id);

create index if not exists place_review_helpful_place_id_idx
on public.place_review_helpful(place_id);

alter table public.place_review_helpful enable row level security;

drop policy if exists "place_review_helpful_select_authenticated"
on public.place_review_helpful;

create policy "place_review_helpful_select_authenticated"
on public.place_review_helpful
for select
to authenticated
using (true);

drop policy if exists "place_review_helpful_insert_owner"
on public.place_review_helpful;

create policy "place_review_helpful_insert_owner"
on public.place_review_helpful
for insert
to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.place_reviews review
    where review.id = review_id
      and review.place_id = place_id
      and review.user_id <> auth.uid()
  )
);

drop policy if exists "place_review_helpful_delete_owner"
on public.place_review_helpful;

create policy "place_review_helpful_delete_owner"
on public.place_review_helpful
for delete
to authenticated
using (user_id = auth.uid());

revoke all on table public.place_review_helpful from anon;
grant select, insert, delete on table public.place_review_helpful to authenticated;
grant all on table public.place_review_helpful to service_role;
