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
