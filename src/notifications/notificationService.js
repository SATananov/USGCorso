import { supabase } from '../lib/supabase';

export async function getNotificationPreferences() {
  const { data, error } = await supabase.rpc('get_notification_preferences');

  if (error) {
    throw error;
  }

  return Array.isArray(data) ? data[0] ?? null : data;
}

export async function updateNotificationPreferences(preferences) {
  const { data, error } = await supabase.rpc('update_notification_preferences', {
    next_moderation: preferences.moderation,
    next_events: preferences.events,
    next_community: preferences.community,
    next_lost_found: preferences.lostFound,
    next_preferred_language: preferences.preferredLanguage,
  });

  if (error) {
    throw error;
  }

  return Array.isArray(data) ? data[0] ?? null : data;
}

export async function getNotifications(limit = 50) {
  const { data, error } = await supabase
    .from('notifications')
    .select(
      'id, category, event_type, title, body, entity_type, entity_id, data, read_at, created_at'
    )
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  const items = data ?? [];
  const contentIds = [
    ...new Set(
      items
        .filter(
          (item) =>
            item.entity_type === 'content_item' &&
            typeof item.entity_id === 'string' &&
            item.entity_id
        )
        .map((item) => item.entity_id)
    ),
  ];

  if (contentIds.length === 0) {
    return items;
  }

  const { data: existingContent, error: contentError } = await supabase
    .from('content_items')
    .select('id')
    .in('id', contentIds);

  if (contentError) {
    return items;
  }

  const existingIds = new Set((existingContent ?? []).map((item) => item.id));

  return items.map((item) =>
    item.entity_type === 'content_item' && item.entity_id
      ? { ...item, target_exists: existingIds.has(item.entity_id) }
      : item
  );
}

export async function getUnreadNotificationCount() {
  const { count, error } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .is('read_at', null);

  if (error) {
    throw error;
  }

  return count ?? 0;
}

export async function markNotificationRead(notificationId) {
  const { error } = await supabase.rpc('mark_notification_read', {
    target_notification_id: notificationId,
  });

  if (error) {
    throw error;
  }
}

export async function markAllNotificationsRead() {
  const { error } = await supabase.rpc('mark_all_notifications_read');

  if (error) {
    throw error;
  }
}
