import { supabase } from '../lib/supabase';

export async function getRecognitionAdminNominations() {
  return supabase.rpc('usg_recognition_admin_list');
}

export async function decideRecognitionNomination(nominationId, approve, note) {
  return supabase.rpc('usg_recognition_admin_decide', {
    p_nomination_id: nominationId,
    p_approve: approve,
    p_note: note || null,
  });
}
