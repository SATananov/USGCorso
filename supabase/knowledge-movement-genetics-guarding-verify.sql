select
  coalesce(nullif(trim(ci.context_type), ''), 'basics') as category_key,
  ci.title as bg_title,
  en.title as en_title,
  it.title as it_title,
  ci.status
from public.content_items ci
left join public.knowledge_content_translations en
  on en.content_item_id = ci.id and en.language = 'en'
left join public.knowledge_content_translations it
  on it.content_item_id = ci.id and it.language = 'it'
where ci.section_key = 'knowledge'
  and ci.title in (
    'Движението проверява структурата',
    'Генетично разнообразие и отговорна селекция',
    'Родословието е инструмент, не присъда',
    'Охраната започва с различаване'
  )
order by category_key, ci.title;
