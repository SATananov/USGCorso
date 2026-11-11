select
  coalesce(context_type, 'basics') as category_key,
  count(*) as approved_count,
  string_agg(title, ' | ' order by updated_at desc) as titles
from public.content_items
where section_key = 'knowledge'
  and status = 'approved'
group by coalesce(context_type, 'basics')
order by category_key;
