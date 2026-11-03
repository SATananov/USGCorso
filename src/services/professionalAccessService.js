import { supabase } from '../lib/supabase';

export async function getMyProfessionalApplication() {
  return supabase.rpc('get_my_professional_application');
}

export async function submitProfessionalApplication({
  requestedType,
  categories,
  profileName,
  contactPhone,
  contactEmail,
  country,
  city,
  message,
}) {
  return supabase.rpc('submit_professional_application', {
    requested_role: requestedType,
    requested_categories: categories,
    target_profile_name: profileName?.trim() || null,
    target_contact_phone: contactPhone?.trim() || null,
    target_contact_email: contactEmail?.trim() || null,
    target_country: country?.trim() || null,
    target_city: city?.trim() || null,
    application_message: message?.trim() || null,
  });
}

export async function canManageServiceProfile() {
  return supabase.rpc('can_manage_service_profile');
}

export async function getAdminProfessionalApplications(status = 'pending') {
  return supabase.rpc('admin_list_professional_applications', {
    target_status: status,
  });
}

export async function reviewProfessionalApplication({
  applicationId,
  decision,
  note,
}) {
  return supabase.rpc('admin_review_professional_application', {
    application_id: applicationId,
    decision,
    review_note: note?.trim() || null,
  });
}
