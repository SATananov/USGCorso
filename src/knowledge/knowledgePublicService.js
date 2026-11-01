import { supabase } from '../lib/supabase';

export async function getPublicKnowledgeItems(categoryKey = null, language = 'bg') {
  return supabase.rpc('list_public_knowledge_items_v3', {
    target_category: categoryKey || null,
    target_language: language || 'bg',
  });
}
