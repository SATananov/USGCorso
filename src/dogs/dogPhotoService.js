import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system/legacy';

import { supabase } from '../lib/supabase';

const BUCKET = 'corso-photos';

export async function getDogPhotoUrl(path) {
  if (!path) {
    return { data: null, error: null };
  }

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, 3600);

  return {
    data: data?.signedUrl ?? null,
    error,
  };
}

export async function uploadDogPhoto(
  userId,
  dogId,
  uri,
  contentType
) {
  const mimeType = normalizeImageMimeType(contentType);
  const extension = mimeType === 'image/png'
    ? 'png'
    : mimeType === 'image/webp'
      ? 'webp'
      : 'jpg';
  const path = `${userId}/${dogId}/main-${Date.now()}.${extension}`;

  const currentResult = await supabase
    .from('dogs')
    .select('photo_path')
    .eq('id', dogId)
    .eq('owner_id', userId)
    .maybeSingle();

  if (currentResult.error) {
    return currentResult;
  }

  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const uploadResult = await supabase.storage
    .from(BUCKET)
    .upload(path, decode(base64), {
      contentType: mimeType,
      upsert: false,
    });

  if (uploadResult.error) {
    return uploadResult;
  }

  const updateResult = await supabase
    .from('dogs')
    .update({
      photo_path: path,
      updated_at: new Date().toISOString(),
    })
    .eq('id', dogId)
    .eq('owner_id', userId)
    .select('id, photo_path')
    .single();

  if (updateResult.error) {
    await supabase.storage.from(BUCKET).remove([path]);
    return updateResult;
  }

  const previousPath = currentResult.data?.photo_path;

  if (previousPath && previousPath !== path) {
    await supabase.storage.from(BUCKET).remove([previousPath]);
  }

  return updateResult;
}

function normalizeImageMimeType(value) {
  if (value === 'image/png' || value === 'image/webp') {
    return value;
  }

  return 'image/jpeg';
}

export async function deleteDogPhoto(userId, dogId, photoPath) {
  if (photoPath) {
    const removeResult = await supabase.storage
      .from(BUCKET)
      .remove([photoPath]);

    if (removeResult.error) {
      return removeResult;
    }
  }

  return supabase
    .from('dogs')
    .update({
      photo_path: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', dogId)
    .eq('owner_id', userId)
    .select('id, photo_path')
    .single();
}
