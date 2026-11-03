begin;

create or replace function public.notify_content_item_approved()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_language text := 'en';
  notification_title text;
  notification_body text;
  item_label text;
begin
  if new.status <> 'approved'
    or old.status = 'approved'
    or new.owner_user_id is null then
    return new;
  end if;

  select coalesce(np.preferred_language, 'en')
  into target_language
  from public.notification_preferences np
  where np.user_id = new.owner_user_id
    and np.moderation = true;

  if not found then
    if exists (
      select 1
      from public.notification_preferences np
      where np.user_id = new.owner_user_id
        and np.moderation = false
    ) then
      return new;
    end if;

    target_language := 'en';
  end if;

  item_label := coalesce(nullif(trim(new.title), ''), new.content_type, 'material');

  if target_language = 'bg' then
    notification_title := 'Материалът ви е одобрен';
    notification_body := 'USG Admin одобри "' || item_label || '".';
  elsif target_language = 'it' then
    notification_title := 'Il tuo materiale è stato approvato';
    notification_body := 'USG Admin ha approvato "' || item_label || '".';
  else
    notification_title := 'Your material was approved';
    notification_body := 'USG Admin approved "' || item_label || '".';
  end if;

  if nullif(trim(coalesce(new.moderation_note, '')), '') is not null then
    if target_language = 'bg' then
      notification_body := notification_body || E'\nСъобщение от администратор: ' || trim(new.moderation_note);
    elsif target_language = 'it' then
      notification_body := notification_body || E'\nMessaggio dell’amministratore: ' || trim(new.moderation_note);
    else
      notification_body := notification_body || E'\nAdmin message: ' || trim(new.moderation_note);
    end if;
  end if;

  insert into public.notifications (
    user_id,
    category,
    event_type,
    title,
    body,
    entity_type,
    entity_id,
    data
  )
  values (
    new.owner_user_id,
    'moderation',
    'content_approved',
    notification_title,
    notification_body,
    'content_item',
    new.id::text,
    jsonb_build_object(
      'status', new.status,
      'section_key', new.section_key,
      'content_type', new.content_type,
      'title', new.title
    )
  );

  return new;
end;
$$;

drop trigger if exists content_item_approved_notification
  on public.content_items;

create trigger content_item_approved_notification
after update of status on public.content_items
for each row
when (
  new.status = 'approved'
  and old.status is distinct from new.status
)
execute function public.notify_content_item_approved();

create or replace function public.notify_professional_application_approved()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_language text := 'en';
  notification_title text;
  notification_body text;
  profile_label text;
begin
  if new.status <> 'approved'
    or old.status = 'approved'
    or new.user_id is null then
    return new;
  end if;

  select coalesce(np.preferred_language, 'en')
  into target_language
  from public.notification_preferences np
  where np.user_id = new.user_id
    and np.moderation = true;

  if not found then
    if exists (
      select 1
      from public.notification_preferences np
      where np.user_id = new.user_id
        and np.moderation = false
    ) then
      return new;
    end if;

    target_language := 'en';
  end if;

  profile_label := coalesce(nullif(trim(new.profile_name), ''), 'USG professional profile');

  if target_language = 'bg' then
    notification_title := 'Професионалният ви профил е одобрен';
    notification_body := 'USG Admin одобри "' || profile_label || '". Вече имате професионален достъп.';
  elsif target_language = 'it' then
    notification_title := 'Il tuo profilo professionale è stato approvato';
    notification_body := 'USG Admin ha approvato "' || profile_label || '". Ora hai accesso professionale.';
  else
    notification_title := 'Your professional profile was approved';
    notification_body := 'USG Admin approved "' || profile_label || '". You now have professional access.';
  end if;

  if nullif(trim(coalesce(new.admin_note, '')), '') is not null then
    if target_language = 'bg' then
      notification_body := notification_body || E'\nСъобщение от администратор: ' || trim(new.admin_note);
    elsif target_language = 'it' then
      notification_body := notification_body || E'\nMessaggio dell’amministratore: ' || trim(new.admin_note);
    else
      notification_body := notification_body || E'\nAdmin message: ' || trim(new.admin_note);
    end if;
  end if;

  insert into public.notifications (
    user_id,
    category,
    event_type,
    title,
    body,
    entity_type,
    entity_id,
    data
  )
  values (
    new.user_id,
    'moderation',
    'professional_application_approved',
    notification_title,
    notification_body,
    'professional_application',
    new.id::text,
    jsonb_build_object(
      'status', new.status,
      'requested_type', new.requested_type,
      'profile_name', new.profile_name,
      'categories', new.categories
    )
  );

  return new;
end;
$$;

drop trigger if exists professional_application_approved_notification
  on public.professional_applications;

create trigger professional_application_approved_notification
after update of status on public.professional_applications
for each row
when (
  new.status = 'approved'
  and old.status is distinct from new.status
)
execute function public.notify_professional_application_approved();

commit;
