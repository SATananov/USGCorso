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

export async function getAdminProfessionalProfilesVisibility() {
  return supabase.rpc('admin_list_professional_profiles_visibility');
}

export async function setAdminProfessionalProfileFieldVisibility(
  profileId,
  fieldKey,
  isPublic
) {
  return supabase.rpc('admin_set_professional_profile_field_visibility', {
    target_profile_id: profileId,
    target_field_key: fieldKey,
    target_is_public: isPublic,
  });
}

export async function getAdminProfessionalProfileFieldVisibility(profileId) {
  return supabase.rpc('admin_get_professional_profile_field_visibility', {
    target_profile_id: profileId,
  });
}

export async function getMyProfessionalProfile() {
  return supabase.rpc('get_my_professional_profile');
}

export async function saveMyProfessionalProfile({
  displayName,
  shortDescription,
  country,
  region,
  city,
  contactPerson,
  phone,
  email,
  website,
  address,
  facebookUrl,
  instagramUrl,
}) {
  return supabase.rpc('save_my_professional_profile', {
    target_display_name: displayName,
    target_short_description: shortDescription,
    target_country: country,
    target_region: region,
    target_city: city,
    target_contact_person: contactPerson,
    target_phone: phone,
    target_email: email,
    target_website: website,
    target_address: address,
    target_facebook_url: facebookUrl,
    target_instagram_url: instagramUrl,
  });
}

export async function getPublicProfessionalProfileCategoryCounts() {
  return supabase.rpc('list_public_professional_profile_category_counts');
}
