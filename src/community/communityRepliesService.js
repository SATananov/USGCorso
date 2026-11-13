import { supabase } from '../lib/supabase';

export async function getCommunityReplies(questionId) {
  if (!questionId) return { data: [], error: new Error('Question is required') };
  return supabase.rpc('community_list_answers', {
    target_question_id: questionId,
    reply_limit: 100,
  });
}

export async function createCommunityReply({ questionId, body }) {
  const cleanBody = String(body ?? '').trim();
  if (!questionId || cleanBody.length < 2 || cleanBody.length > 3000) {
    return { data: null, error: new Error('Invalid reply') };
  }
  return supabase.rpc('community_create_answer', {
    target_question_id: questionId,
    answer_body: cleanBody,
  });
}
