begin;

create or replace function public.notify_admins_content_pending()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  admin_row record;
  target_language text;
  notification_title text;
  notification_body text;
  item_label text;
begin
  if new.status <> 'pending' then
    return new;
  end if;

  if tg_op = 'UPDATE' and old.status = 'pending' then
    return new;
  end if;

  item_label := coalesce(nullif(trim(new.title), ''), new.content_type, 'material');

  for admin_row in
    select ur.user_id
    from public.user_roles ur
    where ur.role = 'admin'
  loop
    select coalesce(np.preferred_language, 'en')
    into target_language
    from public.notification_preferences np
    where np.user_id = admin_row.user_id
      and np.moderation = true;

    if not found then
      if exists (
        select 1
        from public.notification_preferences np
        where np.user_id = admin_row.user_id
          and np.moderation = false
      ) then
        continue;
      end if;

      target_language := 'en';
    end if;

    if target_language = 'bg' then
      notification_title := 'Нов материал за преглед';
      notification_body := 'Потребител изпрати "' || item_label || '" за одобрение.';
    elsif target_language = 'it' then
      notification_title := 'Nuovo contenuto da revisionare';
      notification_body := 'Un utente ha inviato "' || item_label || '" per l’approvazione.';
    else
      notification_title := 'New material awaiting review';
      notification_body := 'A user submitted "' || item_label || '" for approval.';
    end if;

    insert into public.notifications (
      user_id, category, event_type, title, body, entity_type, entity_id, data
    )
    values (
      admin_row.user_id,
      'moderation',
      'content_pending_review',
      notification_title,
      notification_body,
      'content_item',
      new.id::text,
      jsonb_build_object(
        'status', new.status,
        'section_key', new.section_key,
        'content_type', new.content_type,
        'title', new.title,
        'owner_user_id', new.owner_user_id
      )
    );
  end loop;

  return new;
end;
$$;

drop trigger if exists content_item_pending_admin_notification
  on public.content_items;

create trigger content_item_pending_admin_notification
after insert or update of status on public.content_items
for each row
when (new.status = 'pending')
execute function public.notify_admins_content_pending();

create or replace function public.notify_admins_professional_pending()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  admin_row record;
  target_language text;
  notification_title text;
  notification_body text;
  profile_label text;
begin
  if new.status <> 'pending' then
    return new;
  end if;

  if tg_op = 'UPDATE' and old.status = 'pending' then
    return new;
  end if;

  profile_label := coalesce(nullif(trim(new.profile_name), ''), 'USG professional profile');

  for admin_row in
    select ur.user_id
    from public.user_roles ur
    where ur.role = 'admin'
  loop
    select coalesce(np.preferred_language, 'en')
    into target_language
    from public.notification_preferences np
    where np.user_id = admin_row.user_id
      and np.moderation = true;

    if not found then
      if exists (
        select 1
        from public.notification_preferences np
        where np.user_id = admin_row.user_id
          and np.moderation = false
      ) then
        continue;
      end if;

      target_language := 'en';
    end if;

    if target_language = 'bg' then
      notification_title := 'Нова професионална заявка';
      notification_body := 'Получена е заявка за "' || profile_label || '".';
    elsif target_language = 'it' then
      notification_title := 'Nuova candidatura professionale';
      notification_body := 'È stata ricevuta una candidatura per "' || profile_label || '".';
    else
      notification_title := 'New professional application';
      notification_body := 'A new application was received for "' || profile_label || '".';
    end if;

    insert into public.notifications (
      user_id, category, event_type, title, body, entity_type, entity_id, data
    )
    values (
      admin_row.user_id,
      'moderation',
      'professional_application_pending',
      notification_title,
      notification_body,
      'professional_application',
      new.id::text,
      jsonb_build_object(
        'status', new.status,
        'requested_type', new.requested_type,
        'profile_name', new.profile_name,
        'categories', new.categories,
        'user_id', new.user_id
      )
    );
  end loop;

  return new;
end;
$$;

drop trigger if exists professional_application_pending_admin_notification
  on public.professional_applications;

create trigger professional_application_pending_admin_notification
after insert or update of status on public.professional_applications
for each row
when (new.status = 'pending')
execute function public.notify_admins_professional_pending();

commit;
