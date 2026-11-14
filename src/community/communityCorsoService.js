import { supabase } from '../lib/supabase';
import { getDogPhotoUrl } from '../dogs/dogPhotoService';

export async function getCommunityCorsos() {
  const [result, summary] = await Promise.all([
    supabase.rpc('community_corso_list'),
    supabase.rpc('community_corso_vote_summary'),
  ]);

  if (result.error || !result.data?.length) {
    return result;
  }

  const voteByDog = new Map(
    (summary.error ? [] : summary.data ?? []).map((vote) => [vote.dog_id, vote])
  );

  const data = await Promise.all(
    result.data.map(async (entry) => {
      const summaryVote = voteByDog.get(entry.id);
      const count = summaryVote?.vote_count;
      const numericCount = count == null ? null : Number(count);
      const corso = {
        ...entry,
        vote_count: Number.isSafeInteger(numericCount) && numericCount >= 0 ? numericCount : null,
        viewer_has_voted: Boolean(summaryVote?.viewer_has_voted),
        viewer_can_vote: Boolean(summaryVote?.viewer_can_vote),
      };
      if (!corso.photo_path) {
        return { ...corso, photo_url: null };
      }

      const photo = await getDogPhotoUrl(corso.photo_path);

      return {
        ...corso,
        photo_url: photo.data ?? null,
      };
    })
  );

  return { data, error: null };
}

export async function setCommunityCorsoVote(dogId, liked) {
  return supabase.rpc('community_corso_set_vote', {
    p_dog_id: dogId,
    p_like: liked,
  });
}
