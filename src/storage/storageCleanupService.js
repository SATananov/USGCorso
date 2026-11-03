import { supabase } from '../lib/supabase';

function normalizePaths(paths) {
  return [...new Set((paths ?? []).map((path) => path?.trim()).filter(Boolean))];
}

export async function queueStorageCleanupForBucket(bucketId, paths) {
  const targetPaths = normalizePaths(paths);

  if (targetPaths.length === 0) {
    return { error: null };
  }

  return supabase.rpc('queue_storage_cleanup_for_bucket', {
    target_bucket_id: bucketId,
    target_paths: targetPaths,
  });
}

export async function completeStorageCleanupForBucket(bucketId, paths) {
  const targetPaths = normalizePaths(paths);

  if (targetPaths.length === 0) {
    return { error: null };
  }

  return supabase.rpc('complete_storage_cleanup_for_bucket', {
    target_bucket_id: bucketId,
    target_paths: targetPaths,
  });
}

export async function recordStorageCleanupFailureForBucket(bucketId, paths, error) {
  const targetPaths = normalizePaths(paths);

  if (targetPaths.length === 0) {
    return { error: null };
  }

  return supabase.rpc('record_storage_cleanup_failure_for_bucket', {
    target_bucket_id: bucketId,
    target_paths: targetPaths,
    target_error: error?.message || String(error || 'storage cleanup failed'),
  });
}

export async function removeStoragePathsWithCleanup(bucketId, paths) {
  const targetPaths = normalizePaths(paths);

  if (targetPaths.length === 0) {
    return { error: null, cleanupPending: false };
  }

  const queueResult = await queueStorageCleanupForBucket(bucketId, targetPaths);

  if (queueResult.error) {
    return { error: queueResult.error, cleanupPending: false };
  }

  const storageResult = await supabase.storage
    .from(bucketId)
    .remove(targetPaths);

  if (storageResult.error) {
    await recordStorageCleanupFailureForBucket(
      bucketId,
      targetPaths,
      storageResult.error
    );

    return { error: storageResult.error, cleanupPending: true };
  }

  const completeResult = await completeStorageCleanupForBucket(
    bucketId,
    targetPaths
  );

  if (completeResult.error) {
    return { error: completeResult.error, cleanupPending: true };
  }

  return { error: null, cleanupPending: false };
}
