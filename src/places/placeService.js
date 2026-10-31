import { supabase } from '../lib/supabase';

export async function getApprovedPlaces() {
  return supabase
    .from('places')
    .select(
      'id, created_by, name, category, description, country, city, address, latitude, longitude, phone, website, cane_corso_friendly, verified, status, created_at'
    )
    .eq('status', 'approved')
    .order('verified', { ascending: false })
    .order('name', { ascending: true });
}

export async function getPlaceById(id) {
  return supabase
    .from('places')
    .select(
      'id, created_by, name, category, description, country, city, address, latitude, longitude, phone, website, cane_corso_friendly, verified, status, created_at'
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
      country: values.country.trim() || null,
      city: values.city.trim() || null,
      address: values.address.trim() || null,
      latitude: values.latitude,
      longitude: values.longitude,
      phone: values.phone.trim() || null,
      website: values.website.trim() || null,
      cane_corso_friendly: Boolean(values.caneCorsoFriendly),
      status: 'pending',
      verified: false,
    })
    .select('id')
    .single();
}

export async function getFavoritePlaceIds(userId) {
  return supabase
    .from('place_favorites')
    .select('place_id')
    .eq('user_id', userId);
}

export async function isPlaceFavorite(userId, placeId) {
  return supabase
    .from('place_favorites')
    .select('place_id')
    .eq('user_id', userId)
    .eq('place_id', placeId)
    .maybeSingle();
}

export async function addPlaceFavorite(userId, placeId) {
  return supabase
    .from('place_favorites')
    .insert({
      user_id: userId,
      place_id: placeId,
    });
}

export async function removePlaceFavorite(userId, placeId) {
  return supabase
    .from('place_favorites')
    .delete()
    .eq('user_id', userId)
    .eq('place_id', placeId);
}

export async function getPlaceReviews(placeId) {
  return supabase
    .from('place_reviews')
    .select('id, user_id, rating, comment, created_at, updated_at')
    .eq('place_id', placeId)
    .order('updated_at', { ascending: false });
}

export async function savePlaceReview(userId, placeId, rating, comment) {
  return supabase
    .from('place_reviews')
    .upsert(
      {
        user_id: userId,
        place_id: placeId,
        rating,
        comment: comment.trim() || null,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'user_id,place_id',
      }
    )
    .select('id, user_id, rating, comment, created_at, updated_at')
    .single();
}

export async function deletePlaceReview(userId, placeId) {
  return supabase
    .from('place_reviews')
    .delete()
    .eq('user_id', userId)
    .eq('place_id', placeId);
}

export async function getPlaceReviewHelpful(placeId) {
  return supabase
    .from('place_review_helpful')
    .select('review_id, user_id')
    .eq('place_id', placeId);
}

export async function addPlaceReviewHelpful(userId, placeId, reviewId) {
  return supabase
    .from('place_review_helpful')
    .insert({
      user_id: userId,
      place_id: placeId,
      review_id: reviewId,
    });
}

export async function removePlaceReviewHelpful(userId, reviewId) {
  return supabase
    .from('place_review_helpful')
    .delete()
    .eq('user_id', userId)
    .eq('review_id', reviewId);
}

export async function getPlaceReviewSummaryRows() {
  const [reviewsResult, helpfulResult] = await Promise.all([
    supabase
      .from('place_reviews')
      .select('place_id, rating'),
    supabase
      .from('place_review_helpful')
      .select('place_id'),
  ]);

  return {
    reviews: reviewsResult,
    helpful: helpfulResult,
  };
}

export async function updatePlaceByOwnerOrAdmin(placeId, values) {
  return supabase.rpc('update_place_by_owner_or_admin', {
    target_place_id: placeId,
    place_name: values.name.trim(),
    place_category: values.category,
    place_description: values.description.trim() || null,
    place_country: values.country.trim(),
    place_city: values.city.trim(),
    place_address: values.address.trim(),
    place_latitude: Number(values.latitude),
    place_longitude: Number(values.longitude),
    place_phone: values.phone.trim() || null,
    place_website: values.website.trim() || null,
    place_cane_corso_friendly: Boolean(values.caneCorsoFriendly),
  });
}
