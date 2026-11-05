import { supabase } from '../lib/supabase';

export async function getArenaOwnerConsent(userId) {
  if (!userId) return { data: false, error: null };
  const result = await supabase.from('usg_arena_owner_consent')
    .select('opted_in').eq('owner_id', userId).maybeSingle();
  return { data: result.data?.opted_in === true, error: result.error };
}

export async function getArenaDogConsent(userId, dogId) {
  if (!userId || !dogId) return { data: false, error: null };
  const result = await supabase.from('usg_arena_dog_consent')
    .select('opted_in').eq('owner_id', userId).eq('dog_id', dogId).maybeSingle();
  return { data: result.data?.opted_in === true, error: result.error };
}

export function setArenaOwnerConsent(optedIn) {
  return supabase.rpc('usg_arena_set_owner_consent', { p_opted_in: optedIn });
}

export function setArenaDogConsent(dogId, optedIn) {
  return supabase.rpc('usg_arena_set_dog_consent', { p_dog_id: dogId, p_opted_in: optedIn });
}
