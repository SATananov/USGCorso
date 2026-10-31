import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system/legacy';

import { supabase } from '../lib/supabase';
import { registerMyContentAsset } from './contentGovernanceService';

const BUCKET = 'usg-content';

function extensionForMime(mimeType) {
  if (mimeType === 'image/png') {
    return 'png';
  }

  if (mimeType === 'image/webp') {
    return 'webp';
  }

  return 'jpg';
}

export async function uploadMyContentImage(userId, itemId, asset) {
  const mimeType = asset.mimeType || 'image/jpeg';
  const extension = extensionForMime(mimeType);
  const objectName = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${extension}`;
  const storagePath = `${userId}/${itemId}/${objectName}`;

  const base64 = await FileSystem.readAsStringAsync(asset.uri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const upload = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, decode(base64), {
      contentType: mimeType,
      upsert: false,
    });

  if (upload.error) {
    return upload;
  }

  const registered = await registerMyContentAsset(itemId, {
    assetType: 'image',
    storagePath,
    fileName: asset.fileName || objectName,
    mimeType,
  });

  if (registered.error) {
    await supabase.storage.from(BUCKET).remove([storagePath]);
    return registered;
  }

  return registered;
}
