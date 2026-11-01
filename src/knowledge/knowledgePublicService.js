import { supabase } from '../lib/supabase';

export async function getPublicKnowledgeItems() {
  return supabase.rpc('list_public_knowledge_items');
}
