import { supabase } from '../lib/supabase';

export async function getPublicProfessionalProfiles(categoryKey) {
  return supabase.rpc('list_public_professional_profiles', {
    category_key: categoryKey,
  });
}

export async function getPublicProfessionalProfile(profileId) {
  return supabase.rpc('get_public_professional_profile', {
    profile_id: profileId,
  });
}
