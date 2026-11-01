import { supabase } from '../lib/supabase';

export async function getIsAdmin() {
  return supabase.rpc('is_admin');
}

export async function createContentItem(values) {
  return supabase.rpc('create_content_item', {
    target_section: values.section,
    target_content_type: values.contentType,
    target_title: values.title?.trim() || null,
    target_body: values.body?.trim() || null,
    target_context_type: values.contextType || null,
    target_context_id: values.contextId || null,
  });
}

export async function updateMyContentItem(itemId, values) {
  return supabase.rpc('update_my_content_item', {
    target_item_id: itemId,
    target_title: values.title?.trim() || null,
    target_body: values.body?.trim() || null,
    target_content_type: values.contentType,
  });
}

export async function deleteMyContentItem(itemId) {
  return supabase.rpc('delete_my_content_item', {
    target_item_id: itemId,
  });
}

export async function deleteMyContentItemWithAssets(itemId) {
  const assetsResult = await getMyContentAssets(itemId);

  if (assetsResult.error) {
    return assetsResult;
  }

  const paths = (assetsResult.data ?? [])
    .map((asset) => asset.storage_path)
    .filter(Boolean);

  const deleteResult = await deleteMyContentItem(itemId);

  if (deleteResult.error) {
    return deleteResult;
  }

  if (paths.length > 0) {
    const storageResult = await supabase.storage
      .from('usg-content')
      .remove(paths);

    if (storageResult.error) {
      return {
        data: deleteResult.data,
        error: storageResult.error,
        deleted: true,
      };
    }
  }

  return {
    data: deleteResult.data,
    error: null,
    deleted: true,
  };
}

export async function getMyContentItems(section = null) {
  return supabase.rpc('list_my_content_items', {
    target_section: section,
  });
}

export async function getAdminContentItems({
  section = null,
  status = null,
} = {}) {
  return supabase.rpc('admin_list_content_items', {
    target_section: section,
    target_status: status,
  });
}

export async function adminSetContentStatus(itemId, status, note = '') {
  return supabase.rpc('admin_set_content_status', {
    target_item_id: itemId,
    target_status: status,
    target_note: note.trim() || null,
  });
}

export async function adminUpdateContentItem(itemId, values) {
  return supabase.rpc('admin_update_content_item', {
    target_item_id: itemId,
    target_title: values.title?.trim() || null,
    target_body: values.body?.trim() || null,
    target_content_type: values.contentType,
  });
}

export async function getAdminContentAudit(limit = 100) {
  return supabase.rpc('admin_list_content_audit', {
    target_limit: limit,
  });
}

export async function getAdminContentItemDetails(itemId) {
  return supabase.rpc('admin_get_content_item_details', {
    target_item_id: itemId,
  });
}

export async function getAdminContentAssets(itemId) {
  const result = await supabase.rpc('admin_list_content_assets', {
    target_item_id: itemId,
  });

  if (result.error) {
    return result;
  }

  const hydrated = await Promise.all(
    (result.data ?? []).map(async (asset) => {
      const signed = await supabase.storage
        .from('usg-content')
        .createSignedUrl(asset.storage_path, 3600);

      return {
        ...asset,
        signed_url: signed.data?.signedUrl ?? null,
      };
    })
  );

  return {
    data: hydrated,
    error: null,
  };
}

export async function adminDeleteContentAsset(assetId) {
  const result = await supabase.rpc('admin_delete_content_asset', {
    target_asset_id: assetId,
  });

  if (result.error) {
    return result;
  }

  const storagePath = result.data;

  if (storagePath) {
    const storageResult = await supabase.storage
      .from('usg-content')
      .remove([storagePath]);

    if (storageResult.error) {
      return { data: storagePath, error: storageResult.error };
    }
  }

  return { data: storagePath, error: null };
}

export async function adminDeleteContentItem(itemId) {
  const result = await supabase.rpc('admin_delete_content_item', {
    target_item_id: itemId,
  });

  if (result.error) {
    return result;
  }

  const paths = Array.isArray(result.data) ? result.data : [];

  if (paths.length > 0) {
    const storageResult = await supabase.storage
      .from('usg-content')
      .remove(paths);

    if (storageResult.error) {
      return { data: paths, error: storageResult.error };
    }
  }

  return { data: paths, error: null };
}

export async function getAdminSharedContentItemDetails(itemId) {
  return supabase.rpc('admin_get_shared_content_item_details', {
    target_item_id: itemId,
  });
}

export async function getAdminSharedContentAssets(itemId) {
  const result = await supabase.rpc('admin_list_shared_content_assets', {
    target_item_id: itemId,
  });

  if (result.error) {
    return result;
  }

  const hydrated = await Promise.all(
    (result.data ?? []).map(async (asset) => {
      const signed = await supabase.storage
        .from('usg-content')
        .createSignedUrl(asset.storage_path, 3600);

      return {
        ...asset,
        signed_url: signed.data?.signedUrl ?? null,
      };
    })
  );

  return {
    data: hydrated,
    error: null,
  };
}

export async function adminDeleteSharedContentAsset(assetId) {
  const result = await supabase.rpc('admin_delete_shared_content_asset', {
    target_asset_id: assetId,
  });

  if (result.error) {
    return result;
  }

  const storagePath = result.data;

  if (storagePath) {
    const storageResult = await supabase.storage
      .from('usg-content')
      .remove([storagePath]);

    if (storageResult.error) {
      return { data: storagePath, error: storageResult.error };
    }
  }

  return { data: storagePath, error: null };
}

export async function adminDeleteSharedContentItem(itemId) {
  const result = await supabase.rpc('admin_delete_shared_content_item', {
    target_item_id: itemId,
  });

  if (result.error) {
    return result;
  }

  const paths = Array.isArray(result.data) ? result.data : [];

  if (paths.length > 0) {
    const storageResult = await supabase.storage
      .from('usg-content')
      .remove(paths);

    if (storageResult.error) {
      return { data: paths, error: storageResult.error };
    }
  }

  return { data: paths, error: null };
}


export async function registerMyContentAsset(itemId, values) {
  return supabase.rpc('register_my_content_asset', {
    target_item_id: itemId,
    target_asset_type: values.assetType,
    target_storage_path: values.storagePath,
    target_file_name: values.fileName || null,
    target_mime_type: values.mimeType || null,
  });
}

export async function getMyContentAssets(itemId) {
  const result = await supabase.rpc('list_my_content_assets', {
    target_item_id: itemId,
  });

  if (result.error) {
    return result;
  }

  const hydrated = await Promise.all(
    (result.data ?? []).map(async (asset) => {
      const signed = await supabase.storage
        .from('usg-content')
        .createSignedUrl(asset.storage_path, 3600);

      return {
        ...asset,
        signed_url: signed.data?.signedUrl ?? null,
      };
    })
  );

  return {
    data: hydrated,
    error: null,
  };
}
