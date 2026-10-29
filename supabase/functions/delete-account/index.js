import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

function chunk(items, size) {
  const result = [];

  for (let index = 0; index < items.length; index += size) {
    result.push(items.slice(index, index + size));
  }

  return result;
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return json({ ok: false, code: 'method_not_allowed' }, 405);
  }

  const authorization = request.headers.get('Authorization');

  if (!authorization) {
    return json({ ok: false, code: 'unauthorized' }, 401);
  }

  const body = await request.json().catch(() => null);

  if (body?.confirm !== 'DELETE') {
    return json({ ok: false, code: 'confirmation_required' }, 400);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return json({ ok: false, code: 'server_configuration' }, 500);
  }

  const userClient = createClient(supabaseUrl, anonKey, {
    global: {
      headers: {
        Authorization: authorization,
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser();

  if (userError || !user) {
    return json({ ok: false, code: 'unauthorized' }, 401);
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const { data: roleRow, error: roleError } = await adminClient
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .maybeSingle();

  if (roleError) {
    console.error('delete-account role_check_failed', roleError);
    return json({ ok: false, code: 'role_check_failed' }, 500);
  }

  if (roleRow?.role === 'admin') {
    const { count, error: adminCountError } = await adminClient
      .from('user_roles')
      .select('user_id', { count: 'exact', head: true })
      .eq('role', 'admin');

    if (adminCountError) {
      console.error('delete-account admin_count_failed', adminCountError);
      return json({ ok: false, code: 'role_check_failed' }, 500);
    }

    if ((count ?? 0) <= 1) {
      return json({ ok: false, code: 'last_admin' });
    }
  }

  const { data: ownedObjects, error: storageLookupError } = await adminClient.rpc(
    'account_owned_storage_objects',
    {
      target_user_id: user.id,
    }
  );

  if (storageLookupError) {
    console.error('delete-account storage_lookup_failed', storageLookupError);
    return json({ ok: false, code: 'storage_lookup_failed' }, 500);
  }

  const byBucket = new Map();

  for (const item of ownedObjects ?? []) {
    const names = byBucket.get(item.bucket_id) ?? [];
    names.push(item.name);
    byBucket.set(item.bucket_id, names);
  }

  for (const [bucketId, names] of byBucket.entries()) {
    for (const batch of chunk(names, 1000)) {
      const { error: removeError } = await adminClient.storage
        .from(bucketId)
        .remove(batch);

      if (removeError) {
        console.error('delete-account storage_delete_failed', { bucketId, removeError });
        return json({ ok: false, code: 'storage_delete_failed' }, 500);
      }
    }
  }

  const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id);

  if (deleteError) {
    console.error('delete-account auth_delete_failed', deleteError);
    return json({ ok: false, code: 'auth_delete_failed' }, 500);
  }

  return json({ ok: true });
});


