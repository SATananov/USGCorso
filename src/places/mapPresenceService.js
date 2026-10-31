import { supabase } from '../lib/supabase';

export async function getMyMapPresence(userId) {
  if (!userId) {
    return { data: null, error: null };
  }

  return supabase
    .from('user_map_presence')
    .select('sharing_enabled, updated_at')
    .eq('user_id', userId)
    .maybeSingle();
}

export async function setMyMapPresence(
  userId,
  latitude,
  longitude,
  sharingEnabled
) {
  if (!userId) {
    return { data: null, error: null };
  }

  return supabase
    .from('user_map_presence')
    .upsert(
      {
        user_id: userId,
        latitude: sharingEnabled ? Number(latitude) : null,
        longitude: sharingEnabled ? Number(longitude) : null,
        sharing_enabled: Boolean(sharingEnabled),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    )
    .select('sharing_enabled, updated_at')
    .single();
}

export async function getVisibleMapUsers() {
  return supabase.rpc('list_visible_map_users');
}
