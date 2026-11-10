grant update on table public.dog_weight_measurements to authenticated;

drop policy if exists dog_weight_measurements_update_owner on public.dog_weight_measurements;
create policy dog_weight_measurements_update_owner
on public.dog_weight_measurements
for update to authenticated
using (
  owner_id = (select auth.uid())
  and exists (
    select 1 from public.dogs d
    where d.id = dog_id and d.owner_id = (select auth.uid())
  )
)
with check (
  owner_id = (select auth.uid())
  and exists (
    select 1 from public.dogs d
    where d.id = dog_id and d.owner_id = (select auth.uid())
  )
);
