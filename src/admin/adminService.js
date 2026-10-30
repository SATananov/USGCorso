import { supabase } from '../lib/supabase';

export async function getMyRole(userId) {
  if (!userId) {
    return { data: null, error: null };
  }

  return supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .maybeSingle();
}

export async function getAdminUsers() {
  return supabase.rpc('admin_list_users');
}

export async function getAdminPendingPlaces() {
  return supabase.rpc('admin_list_pending_places');
}

export async function reviewAdminPlace(placeId, decision) {
  return supabase.rpc('admin_review_place', {
    target_place_id: placeId,
    decision,
  });
}

export async function updateAdminPlace(placeId, values) {
  return supabase.rpc('admin_update_place', {
    target_place_id: placeId,
    place_name: values.name?.trim() || null,
    place_category: values.category,
    place_description: values.description?.trim() || null,
    place_country: values.country?.trim() || null,
    place_city: values.city?.trim() || null,
    place_address: values.address?.trim() || null,
    place_latitude: Number(values.latitude),
    place_longitude: Number(values.longitude),
    place_phone: values.phone?.trim() || null,
    place_website: values.website?.trim() || null,
    place_cane_corso_friendly: Boolean(values.caneCorsoFriendly),
  });
}

export async function requestAdminPlaceChanges(placeId, note) {
  return supabase.rpc('admin_request_place_changes', {
    target_place_id: placeId,
    review_note: note.trim(),
  });
}
