import { supabase } from '../lib/supabase';

export async function getMyMapPresence(userId) {
  if (!userId) {
    return { data: null, error: null };
  }

  return supabase
    .from('user_map_presence')
    .select('sharing_enabled, discovery_allowed, updated_at')
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
    return { data: null, error: new Error('authentication required') };
  }

  const enabled = Boolean(sharingEnabled);

  let query = supabase
    .from('user_map_presence')
    .update({
      latitude: enabled ? Number(latitude) : null,
      longitude: enabled ? Number(longitude) : null,
      sharing_enabled: enabled,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId);

  if (enabled) {
    query = query.eq('discovery_allowed', true);
  }

  const result = await query
    .select('sharing_enabled, discovery_allowed, updated_at')
    .maybeSingle();

  if (result.error) {
    return result;
  }

  if (enabled && !result.data) {
    return {
      data: null,
      error: new Error('Location sharing is not allowed for this account'),
    };
  }

  return result;
}

export async function setMyMapDiscovery(userId, discoveryAllowed) {
  if (!userId) {
    return { data: null, error: new Error('authentication required') };
  }

  const enabled = Boolean(discoveryAllowed);

  return supabase
    .from('user_map_presence')
    .upsert(
      {
        user_id: userId,
        discovery_allowed: enabled,
        ...(!enabled
          ? {
              sharing_enabled: false,
              latitude: null,
              longitude: null,
            }
          : {}),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    )
    .select('sharing_enabled, discovery_allowed, updated_at')
    .single();
}

export async function getVisibleMapUsers() {
  return supabase.rpc('list_visible_map_users');
}
