import { supabase } from '../lib/supabase';

// Review reads and moderation writes are authorized by server-side RPC checks;
// the Admin screen role gate is only a navigation guard.
export async function getAdminCommunityContent() {
  const result = await supabase.rpc('community_admin_list_content', {
    p_question_limit: 100,
    p_question_offset: 0,
    p_answer_limit: 100,
  });
  if (result.error) return { data: null, error: result.error };

  const questions = Array.isArray(result.data?.questions) ? result.data.questions : [];
  const answers = questions.flatMap((question) => (
    Array.isArray(question.answers) ? question.answers : []
  ));
  return { data: { questions, answers }, error: null };
}

export function hideCommunityQuestion(questionId) {
  return supabase.rpc('community_moderate_question', {
    target_question_id: questionId,
    next_status: 'hidden',
  });
}

export function hideCommunityAnswer(answerId) {
  return supabase.rpc('community_moderate_answer', {
    target_answer_id: answerId,
    next_status: 'hidden',
  });
}
