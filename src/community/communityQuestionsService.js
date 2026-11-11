import { supabase } from '../lib/supabase';

const categoryKeys = ['health_care', 'clinics_services', 'cane_corso', 'app_help'];

export async function getCommunityQuestions(category = null) {
  if (category && !categoryKeys.includes(category)) {
    return { data: [], error: new Error('Unsupported question category') };
  }

  let query = supabase
    .from('community_questions')
    .select('id,category,title,body,city,is_resolved,created_at')
    .eq('moderation_status', 'approved')
    .order('created_at', { ascending: false })
    .limit(30);

  if (category) {
    query = query.eq('category', category);
  }

  return query;
}

export async function createCommunityQuestion({ authorId, category, title, body, city }) {
  if (!authorId || !categoryKeys.includes(category)) {
    return { data: null, error: new Error('Invalid question author or category') };
  }

  return supabase
    .from('community_questions')
    .insert({
      author_id: authorId,
      category,
      title,
      body,
      city: city || null,
    });
}
