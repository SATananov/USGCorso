import { supabase } from '../lib/supabase';

export async function deleteMyAccount() {
  return supabase.functions.invoke('delete-account', {
    body: {
      confirm: 'DELETE',
    },
  });
}
