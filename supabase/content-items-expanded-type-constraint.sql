alter table public.content_items
drop constraint if exists content_items_type_check;

alter table public.content_items
add constraint content_items_type_check
check (
  content_type in (
    'banner',
    'news',
    'text',
    'dog_profile',
    'image',
    'document',
    'place_description',
    'article',
    'brochure',
    'post',
    'comment',
    'report',
    'service_profile',
    'event',
    'poster',
    'match_profile',
    'request',
    'other'
  )
);
