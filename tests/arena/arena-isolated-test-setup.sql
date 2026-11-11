create table if not exists public.usg_arena_test_environment (
  marker text primary key
);
insert into public.usg_arena_test_environment(marker)
values ('USG_ARENA_CONCURRENCY_ISOLATED_V1')
on conflict do nothing;
