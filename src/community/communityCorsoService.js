import { supabase } from '../lib/supabase';
import { getDogPhotoUrl } from '../dogs/dogPhotoService';

export async function getCommunityCorsos() {
  const result = await supabase.rpc('community_corso_list');

  if (result.error || !result.data?.length) {
    return result;
  }

  const data = await Promise.all(
    result.data.map(async (corso) => {
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
