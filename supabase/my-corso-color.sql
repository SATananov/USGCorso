alter table public.dogs
add column if not exists color text;

alter table public.dogs
drop constraint if exists dogs_color_check;

alter table public.dogs
add constraint dogs_color_check
check (
  color is null
  or color in (
    'black',
    'gray',
    'fawn',
    'red',
    'blackBrindle',
    'grayBrindle',
    'brindle'
  )
);
