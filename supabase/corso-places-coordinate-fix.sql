update public.places
set
  latitude = 41.645538772714,
  longitude = 25.368160770259,
  address = 'ул. „Републиканска“ 9, Кърджали'
where name = 'ZOOmarket';

update public.places
set
  latitude = 41.6352124,
  longitude = 25.3536284,
  address = 'кв. Възрожденци, ул. „Христо Г. Данов“ 8, Кърджали'
where name = 'Ветеринарен център МАГИ ВЕТ';

select
  name,
  address,
  latitude,
  longitude
from public.places
where name in (
  'ZOOmarket',
  'Ветеринарен център МАГИ ВЕТ',
  'Royal Paw - Grooming Salon Kardzhali'
)
order by name;
