begin;

create or replace function public.notify_content_item_moderation_decision()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_language text := 'en';
  notification_title text;
  notification_body text;
  event_name text;
  item_label text;
begin
  if old.status is not distinct from new.status then
    return new;
  end if;

  if not public.is_admin() then
    return new;
  end if;

  if new.status not in ('approved', 'rejected', 'pending') then
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

  if new.status = 'approved' then
    event_name := 'content_approved';

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
  elsif new.status = 'rejected' then
    event_name := 'content_rejected';

    if target_language = 'bg' then
      notification_title := 'Материалът ви не беше одобрен';
      notification_body := 'USG Admin отхвърли "' || item_label || '".';
    elsif target_language = 'it' then
      notification_title := 'Il tuo materiale non è stato approvato';
      notification_body := 'USG Admin ha rifiutato "' || item_label || '".';
    else
      notification_title := 'Your material was not approved';
      notification_body := 'USG Admin rejected "' || item_label || '".';
    end if;
  else
    event_name := 'content_returned_for_review';

    if target_language = 'bg' then
      notification_title := 'Материалът ви е върнат за корекция';
      notification_body := 'USG Admin върна "' || item_label || '" за преглед и корекция.';
    elsif target_language = 'it' then
      notification_title := 'Il tuo materiale richiede modifiche';
      notification_body := 'USG Admin ha restituito "' || item_label || '" per revisione e correzione.';
    else
      notification_title := 'Your material needs changes';
      notification_body := 'USG Admin returned "' || item_label || '" for review and correction.';
    end if;
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
    event_name,
    notification_title,
    notification_body,
    'content_item',
    new.id::text,
    jsonb_build_object(
      'status', new.status,
      'section_key', new.section_key,
      'content_type', new.content_type,
      'title', new.title,
      'moderation_note', new.moderation_note
    )
  );

  return new;
end;
$$;

drop trigger if exists content_item_approved_notification
  on public.content_items;

drop trigger if exists content_item_moderation_notification
  on public.content_items;

create trigger content_item_moderation_notification
after update of status on public.content_items
for each row
when (old.status is distinct from new.status)
execute function public.notify_content_item_moderation_decision();

create or replace function public.notify_professional_application_decision()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_language text := 'en';
  notification_title text;
  notification_body text;
  event_name text;
  profile_label text;
begin
  if old.status is not distinct from new.status then
    return new;
  end if;

  if not public.is_admin() then
    return new;
  end if;

  if new.status not in ('approved', 'rejected', 'needs_changes') then
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

  if new.status = 'approved' then
    event_name := 'professional_application_approved';

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
  elsif new.status = 'rejected' then
    event_name := 'professional_application_rejected';

    if target_language = 'bg' then
      notification_title := 'Професионалната ви заявка не беше одобрена';
      notification_body := 'USG Admin отхвърли заявката за "' || profile_label || '".';
    elsif target_language = 'it' then
      notification_title := 'La tua candidatura professionale non è stata approvata';
      notification_body := 'USG Admin ha rifiutato la candidatura per "' || profile_label || '".';
    else
      notification_title := 'Your professional application was not approved';
      notification_body := 'USG Admin rejected the application for "' || profile_label || '".';
    end if;
  else
    event_name := 'professional_application_needs_changes';

    if target_language = 'bg' then
      notification_title := 'Професионалната ви заявка изисква промени';
      notification_body := 'USG Admin върна заявката за "' || profile_label || '" за корекция.';
    elsif target_language = 'it' then
      notification_title := 'La tua candidatura professionale richiede modifiche';
      notification_body := 'USG Admin ha restituito la candidatura per "' || profile_label || '" per correzioni.';
    else
      notification_title := 'Your professional application needs changes';
      notification_body := 'USG Admin returned the application for "' || profile_label || '" for changes.';
    end if;
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
    event_name,
    notification_title,
    notification_body,
    'professional_application',
    new.id::text,
    jsonb_build_object(
      'status', new.status,
      'requested_type', new.requested_type,
      'profile_name', new.profile_name,
      'categories', new.categories,
      'admin_note', new.admin_note
    )
  );

  return new;
end;
$$;

drop trigger if exists professional_application_approved_notification
  on public.professional_applications;

drop trigger if exists professional_application_moderation_notification
  on public.professional_applications;

create trigger professional_application_moderation_notification
after update of status on public.professional_applications
for each row
when (old.status is distinct from new.status)
execute function public.notify_professional_application_decision();

commit;
