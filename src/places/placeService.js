import { supabase } from '../lib/supabase';

export async function getApprovedPlaces() {
  return supabase
    .from('places')
    .select(
      'id, name, category, description, country, city, address, latitude, longitude, phone, website, verified, status, created_at'
    )
    .eq('status', 'approved')
    .order('verified', { ascending: false })
    .order('name', { ascending: true });
}

export async function getPlaceById(id) {
  return supabase
    .from('places')
    .select(
      'id, name, category, description, country, city, address, latitude, longitude, phone, website, verified, status, created_at'
    )
    .eq('id', id)
    .single();
}

export async function createPlace(userId, values) {
  return supabase
    .from('places')
    .insert({
      created_by: userId,
      name: values.name.trim(),
      category: values.category,
      description: values.description.trim() || null,
      country: values.country.trim(),
      city: values.city.trim(),
      address: values.address.trim(),
      latitude: values.latitude,
      longitude: values.longitude,
      phone: values.phone.trim() || null,
      website: values.website.trim() || null,
      status: 'pending',
      verified: false,
    })
    .select('id')
    .single();
}
