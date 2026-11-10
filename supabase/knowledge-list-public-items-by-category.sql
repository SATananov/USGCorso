create or replace function public.list_public_knowledge_items_v2(
  target_category text default null
)
returns table (
  id uuid,
  content_type text,
  title text,
  body text,
  updated_at timestamptz
)
language sql
security definer
set search_path = public
stable
as $$
  select
    ci.id,
    ci.content_type,
    ci.title,
    ci.body,
    ci.updated_at
  from public.content_items ci
  where ci.section_key = 'knowledge'
    and ci.status = 'approved'
    and (
      target_category is null
      or coalesce(nullif(trim(ci.context_type), ''), 'basics') = target_category
    )
  order by ci.updated_at desc, ci.id desc;
$$;

revoke all on function public.list_public_knowledge_items_v2(text) from public;
grant execute on function public.list_public_knowledge_items_v2(text) to anon;
grant execute on function public.list_public_knowledge_items_v2(text) to authenticated;
