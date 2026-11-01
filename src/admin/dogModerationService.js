import { supabase } from '../lib/supabase';

export async function getAdminDogsByModeration(status = null) {
  return supabase.rpc('admin_list_dogs_by_moderation', {
    target_status: status,
  });
}

export async function setAdminDogModeration(dogId, status, note = '') {
  return supabase.rpc('admin_set_dog_moderation', {
    target_dog_id: dogId,
    target_status: status,
    target_note: note || null,
  });
}

export async function clearAdminDogDescription(dogId, note = '') {
  return supabase.rpc('admin_clear_dog_description', {
    target_dog_id: dogId,
    target_note: note || null,
  });
}
