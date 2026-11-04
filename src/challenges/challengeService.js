import { supabase } from '../lib/supabase';

export function getChallengeCatalog() {
  return supabase.from('usg_challenges')
    .select('id, slug, activity_kind, target_count, dog_xp_bonus, owner_xp_bonus')
    .eq('active', true).order('created_at', { ascending: true });
}

export function getDogChallenges(userId, dogId) {
  return supabase.from('usg_user_challenges')
    .select('id, challenge_id, custom_title, activity_kind, target_count, progress_count, status, created_at, completed_at')
    .eq('owner_id', userId).eq('dog_id', dogId)
    .order('created_at', { ascending: false }).limit(100);
}

export function joinChallenge(dogId, challengeId) {
  return supabase.rpc('usg_join_challenge', { p_dog_id: dogId, p_challenge_id: challengeId });
}

export function createPersonalChallenge(dogId, title, kind, targetCount) {
  return supabase.rpc('usg_create_personal_challenge', {
    p_dog_id: dogId, p_title: title, p_kind: kind, p_target: targetCount,
  });
}

export function recordActivity(dogId, kind, durationMinutes, distanceKm = null, notes = null) {
  return supabase.rpc('usg_record_activity', {
    p_dog_id: dogId,
    p_kind: kind,
    p_duration_min: durationMinutes,
    p_distance_km: distanceKm,
    p_notes: notes,
  });
}

export function getDogActivities(userId, dogId) {
  return supabase.from('usg_dog_activities')
    .select('id, kind, activity_date, duration_min, distance_km, notes, created_at')
    .eq('owner_id', userId).eq('dog_id', dogId)
    .order('created_at', { ascending: false }).limit(100);
}

export function getDogPointEvents(userId, dogId) {
  return supabase.from('usg_point_events')
    .select('id, dog_xp, owner_xp, arena_points, source_type, source_id, awarded_at')
    .eq('owner_id', userId).eq('dog_id', dogId)
    .order('awarded_at', { ascending: false }).limit(500);
}

export function getOwnerPointEvents(userId) {
  return supabase.from('usg_point_events')
    .select('id, owner_xp, awarded_at')
    .eq('owner_id', userId)
    .order('awarded_at', { ascending: false }).limit(1000);
}

export function getDogTimeline(userId, dogId) {
  return supabase.from('usg_timeline_events')
    .select('id, event_type, event_code, source_id, occurred_at')
    .eq('owner_id', userId).eq('dog_id', dogId)
    .order('occurred_at', { ascending: false }).limit(100);
}

export function getDogAchievements(userId, dogId) {
  return supabase.from('usg_achievements')
    .select('id, code, unlocked_at')
    .eq('owner_id', userId).eq('dog_id', dogId)
    .order('unlocked_at', { ascending: false });
}

export function getArenaProgressSnapshot(dogId) {
  return supabase.rpc('usg_arena_progress_snapshot', { p_dog_id: dogId }).then(result => ({
    data: result.data?.[0] ?? null,
    error: result.error,
  }));
}
