create table if not exists public.places (
  id uuid primary key default gen_random_uuid(),
  created_by uuid references auth.users(id) on delete set null,
  name text not null,
  category text not null check (
    category in (
      'veterinary',
      'breeder',
      'trainer',
      'pet_shop',
      'large_dog_hotel',
      'pet_transport',
      'grooming',
      'pharmacy',
      'other'
    )
  ),
  description text,
  country text not null,
  city text not null,
  address text not null,
  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  phone text,
  website text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists places_status_category_idx
on public.places(status, category);

alter table public.places enable row level security;

drop policy if exists "places approved read" on public.places;
create policy "places approved read"
on public.places
for select
to authenticated
using (
  status = 'approved'
  or created_by = auth.uid()
);

drop policy if exists "places authenticated insert" on public.places;
create policy "places authenticated insert"
on public.places
for insert
to authenticated
with check (
  created_by = auth.uid()
  and status = 'pending'
  and verified = false
);

drop policy if exists "places owner pending update" on public.places;
create policy "places owner pending update"
on public.places
for update
to authenticated
using (
  created_by = auth.uid()
  and status = 'pending'
)
with check (
  created_by = auth.uid()
  and status = 'pending'
  and verified = false
);

drop policy if exists "places owner pending delete" on public.places;
create policy "places owner pending delete"
on public.places
for delete
to authenticated
using (
  created_by = auth.uid()
  and status = 'pending'
);
