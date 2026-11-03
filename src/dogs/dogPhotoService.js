import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system/legacy';

import { supabase } from '../lib/supabase';
import {
  completeStorageCleanupForBucket,
  queueStorageCleanupForBucket,
  recordStorageCleanupFailureForBucket,
  removeStoragePathsWithCleanup,
} from '../storage/storageCleanupService';

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

  const previousPath = currentResult.data?.photo_path;
  const previousPaths = previousPath && previousPath !== path
    ? [previousPath]
    : [];

  if (previousPaths.length > 0) {
    const queueResult = await queueStorageCleanupForBucket(BUCKET, previousPaths);

    if (queueResult.error) {
      await removeStoragePathsWithCleanup(BUCKET, [path]);
      return { data: null, error: queueResult.error };
    }
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
    await completeStorageCleanupForBucket(BUCKET, previousPaths);
    await removeStoragePathsWithCleanup(BUCKET, [path]);
    return updateResult;
  }

  if (previousPaths.length > 0) {
    const removeResult = await supabase.storage
      .from(BUCKET)
      .remove(previousPaths);

    if (removeResult.error) {
      await recordStorageCleanupFailureForBucket(
        BUCKET,
        previousPaths,
        removeResult.error
      );

      return {
        ...updateResult,
        cleanupPending: true,
      };
    }

    await completeStorageCleanupForBucket(BUCKET, previousPaths);
  }

  return {
    ...updateResult,
    cleanupPending: false,
  };
}

function normalizeImageMimeType(value) {
  if (value === 'image/png' || value === 'image/webp') {
    return value;
  }

  return 'image/jpeg';
}

export async function deleteDogPhoto(userId, dogId, photoPath) {
  const paths = photoPath ? [photoPath] : [];

  if (paths.length > 0) {
    const queueResult = await queueStorageCleanupForBucket(BUCKET, paths);

    if (queueResult.error) {
      return { data: null, error: queueResult.error };
    }
  }

  const updateResult = await supabase
    .from('dogs')
    .update({
      photo_path: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', dogId)
    .eq('owner_id', userId)
    .select('id, photo_path')
    .single();

  if (updateResult.error) {
    await completeStorageCleanupForBucket(BUCKET, paths);
    return updateResult;
  }

  if (paths.length > 0) {
    const removeResult = await supabase.storage
      .from(BUCKET)
      .remove(paths);

    if (removeResult.error) {
      await recordStorageCleanupFailureForBucket(BUCKET, paths, removeResult.error);
      return {
        ...updateResult,
        error: removeResult.error,
        deleted: true,
        cleanupPending: true,
      };
    }

    await completeStorageCleanupForBucket(BUCKET, paths);
  }

  return {
    ...updateResult,
    deleted: true,
    cleanupPending: false,
  };
}
