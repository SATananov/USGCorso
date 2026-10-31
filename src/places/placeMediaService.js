import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system/legacy';

import { supabase } from '../lib/supabase';

const BUCKET = 'place-media';

export async function getPlaceMedia(placeId) {
  const { data, error } = await supabase.rpc('get_place_media_for_viewer', {
    target_place_id: placeId,
  });

  if (error) {
    return { data: [], error };
  }

  const hydrated = await Promise.all(
    (data ?? []).map(async (item) => {
      const signed = await supabase.storage
        .from(BUCKET)
        .createSignedUrl(item.storage_path, 3600);

      return {
        ...item,
        signed_url: signed.data?.signedUrl ?? null,
      };
    })
  );

  return { data: hydrated, error: null };
}

export async function uploadPlaceMedia(userId, placeId, uri, contentType, caption) {
  const mime = contentType || 'image/jpeg';
  const extension = mime === 'image/png' ? 'png' : mime === 'image/webp' ? 'webp' : 'jpg';
  const objectName = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${extension}`;
  const storagePath = `${userId}/${placeId}/${objectName}`;

  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const upload = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, decode(base64), {
      contentType: mime,
      upsert: false,
    });

  if (upload.error) {
    return upload;
  }

  const created = await supabase.rpc('create_place_media', {
    target_place_id: placeId,
    target_storage_path: storagePath,
    target_caption: caption?.trim() || null,
  });

  if (created.error) {
    await supabase.storage.from(BUCKET).remove([storagePath]);
    return created;
  }

  return created;
}

export async function deletePlaceMedia(mediaId) {
  const deleted = await supabase.rpc('delete_place_media', {
    target_media_id: mediaId,
  });

  if (deleted.error) {
    return deleted;
  }

  if (deleted.data?.storage_path) {
    const removed = await supabase.storage
      .from(BUCKET)
      .remove([deleted.data.storage_path]);

    if (removed.error) {
      return { data: deleted.data, error: removed.error };
    }
  }

  return deleted;
}

export async function moderatePlaceMedia(mediaId, status) {
  return supabase.rpc('moderate_place_media', {
    target_media_id: mediaId,
    target_status: status,
  });
}

export async function setPlaceMediaCover(mediaId) {
  return supabase.rpc('set_place_media_cover', {
    target_media_id: mediaId,
  });
}
