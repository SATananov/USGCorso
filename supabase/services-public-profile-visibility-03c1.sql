begin;

alter table public.professional_profiles
  add column if not exists profile_image_url text;

create table if not exists public.professional_profile_public_visibility (
  profile_id uuid not null
    references public.professional_profiles(id)
    on delete cascade,
  field_key text not null,
  is_public boolean not null default false,
  approved_by uuid references auth.users(id) on delete set null,
  approved_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (profile_id, field_key),
  constraint professional_profile_public_visibility_field_key_not_blank
    check (length(trim(field_key)) > 0)
);

alter table public.professional_profile_public_visibility
  enable row level security;

revoke all on table public.professional_profile_public_visibility
  from anon;

revoke all on table public.professional_profile_public_visibility
  from authenticated;

create policy "professional_profile_public_visibility_admin_select"
on public.professional_profile_public_visibility
for select
to authenticated
using (public.is_admin());

create or replace function public.admin_set_professional_profile_field_visibility(
  target_profile_id uuid,
  target_field_key text,
  target_is_public boolean
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'admin access required' using errcode = '42501';
  end if;

  if target_profile_id is null then
    raise exception 'profile id is required' using errcode = '22023';
  end if;

  if target_field_key is null or length(trim(target_field_key)) = 0 then
    raise exception 'field key is required' using errcode = '22023';
  end if;

  insert into public.professional_profile_public_visibility (
    profile_id,
    field_key,
    is_public,
    approved_by,
    approved_at,
    updated_at
  )
  values (
    target_profile_id,
    trim(target_field_key),
    target_is_public,
    auth.uid(),
    case when target_is_public then now() else null end,
    now()
  )
  on conflict (profile_id, field_key)
  do update set
    is_public = excluded.is_public,
    approved_by = excluded.approved_by,
    approved_at = excluded.approved_at,
    updated_at = now();
end;
$$;

revoke all on function public.admin_set_professional_profile_field_visibility(
  uuid,
  text,
  boolean
) from public;

grant execute on function public.admin_set_professional_profile_field_visibility(
  uuid,
  text,
  boolean
) to authenticated;

create or replace function public.get_public_professional_profile(
  profile_id uuid
)
returns table (
  id uuid,
  profile_type text,
  categories text[],
  display_name text,
  country text,
  region text,
  city text,
  short_description text,
  verified boolean,
  public_image_url text
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  return query
  select
    p.id,
    p.profile_type,
    p.categories,
    p.display_name,
    p.country,
    p.region,
    p.city,
    p.short_description,
    p.verified,
    case
      when exists (
        select 1
        from public.professional_profile_public_visibility v
        where v.profile_id = p.id
          and v.field_key = 'profile_image_url'
          and v.is_public = true
      )
      then p.profile_image_url
      else null
    end as public_image_url
  from public.professional_profiles p
  where p.id = profile_id
    and p.status = 'approved';
end;
$$;

revoke all on function public.get_public_professional_profile(uuid)
  from public;

grant execute on function public.get_public_professional_profile(uuid)
  to anon;

grant execute on function public.get_public_professional_profile(uuid)
  to authenticated;

commit;
