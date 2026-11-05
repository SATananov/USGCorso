import { supabase } from '../lib/supabase';

export async function getPublicKnowledgeItems(categoryKey = null, language = 'bg') {
  return supabase.rpc('list_public_knowledge_items_v4', {
    target_category: categoryKey || null,
    target_language: language || 'bg',
    target_item_id: null,
  });
}

export async function getPublicKnowledgeItem(itemId, language = 'bg') {
  const result = await supabase.rpc('list_public_knowledge_items_v4', {
    target_category: null,
    target_language: language,
    target_item_id: itemId,
  });

  if (result.error) return result;
  return { data: result.data?.[0] ?? null, error: null };
}
