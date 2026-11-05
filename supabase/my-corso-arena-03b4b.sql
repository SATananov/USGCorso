create table if not exists public.usg_arena_gps_evidence_sessions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  dog_id uuid not null references public.dogs(id) on delete cascade,
  started_at timestamptz not null,
  ended_at timestamptz not null,
  reported_distance_m integer not null check (reported_distance_m between 0 and 50000),
  reported_duration_s integer not null check (reported_duration_s between 1 and 86400),
  review_status text not null default 'pending' check (review_status in ('pending', 'rejected', 'verified')),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint usg_arena_gps_evidence_time_order check (ended_at > started_at),
  constraint usg_arena_gps_evidence_review_consistency check (
    (review_status = 'pending' and reviewed_at is null)
    or (review_status in ('rejected', 'verified') and reviewed_at is not null)
  )
);

create table if not exists public.usg_arena_gps_evidence_samples (
  id bigint generated always as identity primary key,
  session_id uuid not null references public.usg_arena_gps_evidence_sessions(id) on delete cascade,
  measured_at timestamptz not null,
  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  accuracy_m numeric(8,2) not null check (accuracy_m >= 0 and accuracy_m <= 10000),
  created_at timestamptz not null default now(),
  constraint usg_arena_gps_evidence_sample_unique unique (session_id, measured_at)
);

create index if not exists usg_arena_gps_evidence_owner_dog_idx
  on public.usg_arena_gps_evidence_sessions (owner_id, dog_id, created_at desc);
create index if not exists usg_arena_gps_evidence_status_idx
  on public.usg_arena_gps_evidence_sessions (review_status, created_at);
create index if not exists usg_arena_gps_evidence_samples_session_idx
  on public.usg_arena_gps_evidence_samples (session_id, measured_at);

alter table public.usg_arena_gps_evidence_sessions enable row level security;
alter table public.usg_arena_gps_evidence_samples enable row level security;

revoke all on public.usg_arena_gps_evidence_sessions from public, anon, authenticated;
revoke all on public.usg_arena_gps_evidence_samples from public, anon, authenticated;
revoke all on sequence public.usg_arena_gps_evidence_samples_id_seq from public, anon, authenticated;

comment on table public.usg_arena_gps_evidence_sessions is
  'Server-only GPS evidence staging. No client grants or policies. Not proof of authenticity and not an award issuer.';
comment on table public.usg_arena_gps_evidence_samples is
  'Sensitive location samples. No client access. Future trusted ingestion, retention and deletion required before collection.';
