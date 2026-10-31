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

  return data ?? [];
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
