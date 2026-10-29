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

export async function uploadDogPhoto(userId, dogId, uri, contentType) {
  const path = `${userId}/${dogId}/main`;

  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const uploadResult = await supabase.storage
    .from(BUCKET)
    .upload(path, decode(base64), {
      contentType: contentType || 'image/jpeg',
      upsert: true,
    });

  if (uploadResult.error) {
    return uploadResult;
  }

  return supabase
    .from('dogs')
    .update({
      photo_path: path,
      updated_at: new Date().toISOString(),
    })
    .eq('id', dogId)
    .eq('owner_id', userId)
    .select('id, photo_path')
    .single();
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
