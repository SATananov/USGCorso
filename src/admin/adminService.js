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

export async function getAdminPlacesByStatus(status) {
  return supabase.rpc('admin_list_places_by_status', {
    target_status: status,
  });
}

export async function getAdminPlaceDetails(placeId) {
  return supabase.rpc('admin_get_place_details', {
    target_place_id: placeId,
  });
}

export async function getAdminPlaceMediaForPlace(placeId) {
  const result = await supabase.rpc('admin_list_place_media_for_place', {
    target_place_id: placeId,
  });

  if (result.error) {
    return result;
  }

  const hydrated = await Promise.all(
    (result.data ?? []).map(async (item) => {
      const signed = await supabase.storage
        .from('place-media')
        .createSignedUrl(item.storage_path, 3600);

      return {
        ...item,
        signed_url: signed.data?.signedUrl ?? null,
      };
    })
  );

  return {
    data: hydrated,
    error: null,
  };
}

export async function setAdminPlaceStatus(placeId, status) {
  return supabase.rpc('admin_set_place_status', {
    target_place_id: placeId,
    target_status: status,
  });
}

export async function deleteAdminPlace(placeId) {
  const result = await supabase.rpc('admin_delete_place', {
    target_place_id: placeId,
  });

  if (result.error) {
    return result;
  }

  const paths = Array.isArray(result.data) ? result.data : [];

  if (paths.length > 0) {
    const storageResult = await supabase.storage
      .from('place-media')
      .remove(paths);

    if (storageResult.error) {
      return { data: result.data, error: storageResult.error };
    }
  }

  return { data: result.data, error: null };
}

export async function getAdminPlaceMediaByStatus(status) {
  const result = await supabase.rpc('admin_list_place_media', {
    target_status: status,
  });

  if (result.error) {
    return result;
  }

  const hydrated = await Promise.all(
    (result.data ?? []).map(async (item) => {
      const signed = await supabase.storage
        .from('place-media')
        .createSignedUrl(item.storage_path, 3600);

      return {
        ...item,
        signed_url: signed.data?.signedUrl ?? null,
      };
    })
  );

  return {
    data: hydrated,
    error: null,
  };
}

export async function getAdminPendingPlaceMedia() {
  return getAdminPlaceMediaByStatus('pending');
}

export async function reviewAdminPlaceMedia(mediaId, status) {
  return supabase.rpc('moderate_place_media', {
    target_media_id: mediaId,
    target_status: status,
  });
}

export async function setAdminPlaceMediaCover(mediaId) {
  return supabase.rpc('set_place_media_cover', {
    target_media_id: mediaId,
  });
}

export async function updateAdminPlaceMediaCaption(mediaId, caption) {
  return supabase.rpc('admin_update_place_media_caption', {
    target_media_id: mediaId,
    target_caption: caption.trim() || null,
  });
}

export async function deleteAdminPlaceMedia(mediaId) {
  const result = await supabase.rpc('admin_delete_place_media', {
    target_media_id: mediaId,
  });

  if (result.error) {
    return result;
  }

  const storagePath = result.data;

  if (storagePath) {
    const storageResult = await supabase.storage
      .from('place-media')
      .remove([storagePath]);

    if (storageResult.error) {
      return { data: storagePath, error: storageResult.error };
    }
  }

  return { data: storagePath, error: null };
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
