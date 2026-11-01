import { supabase } from '../lib/supabase';

export async function getHomePublicCounters() {
  return supabase.rpc('home_public_counters');
}
