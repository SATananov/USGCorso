import { supabase } from '../lib/supabase';

export const COMMUNITY_PAGE_SIZE = 20;
export const COMMUNITY_CATEGORIES = [
  'health_care',
  'clinics_services',
  'cane_corso',
  'app_help',
];

export async function getCommunityQuestions(category = null, offset = 0) {
  if (category && !COMMUNITY_CATEGORIES.includes(category)) {
    return { data: [], error: new Error('Unsupported question category') };
  }
  const safeOffset = Number.isInteger(offset) && offset >= 0 ? offset : 0;
  return supabase.rpc('community_list_questions', {
    question_category: category,
    page_offset: safeOffset,
    page_size: COMMUNITY_PAGE_SIZE,
  });
}

export async function createCommunityQuestion({ category, title, body, city }) {
  const cleanTitle = String(title ?? '').trim();
  const cleanBody = String(body ?? '').trim();
  const cleanCity = String(city ?? '').trim();
  if (!COMMUNITY_CATEGORIES.includes(category)
      || cleanTitle.length < 8 || cleanTitle.length > 160
      || cleanBody.length < 20 || cleanBody.length > 5000
      || (cleanCity && (cleanCity.length < 2 || cleanCity.length > 100))) {
    return { data: null, error: new Error('Invalid community question') };
  }

  return supabase.rpc('community_create_question', {
    question_category: category,
    question_title: cleanTitle,
    question_body: cleanBody,
    question_city: cleanCity || null,
  });
}
