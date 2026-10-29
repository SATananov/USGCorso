import { supabase } from '../lib/supabase';

export async function getMyProfile(userId) {
  if (!userId) {
    return { data: null, error: null };
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name, username, bio, country, city, avatar_preset, created_at, updated_at')
    .eq('id', userId)
    .maybeSingle();

  return { data, error };
}

export async function saveMyProfile(userId, profile) {
  const payload = {
    id: userId,
    display_name: nullableText(profile.displayName),
    username: nullableText(profile.username)?.toLowerCase() || null,
    bio: nullableText(profile.bio),
    country: nullableText(profile.country),
    city: nullableText(profile.city),
    avatar_preset: nullableText(profile.avatarPreset),
    updated_at: new Date().toISOString(),
  };

  return supabase
    .from('profiles')
    .upsert(payload, { onConflict: 'id' })
    .select('id, display_name, username, bio, country, city, avatar_preset, created_at, updated_at')
    .single();
}

export function getProfileCompletion(profile) {
  const values = [
    profile?.display_name,
    profile?.username,
    profile?.bio,
    profile?.country,
    profile?.city,
    profile?.avatar_preset,
  ];

  const filled = values.filter((value) => Boolean(nullableText(value))).length;

  return Math.round((filled / values.length) * 100);
}

export function isLocalProfileReady(profile) {
  return Boolean(nullableText(profile?.country) && nullableText(profile?.city));
}

function nullableText(value) {
  if (typeof value !== 'string') {
    return value ?? null;
  }

  const text = value.trim();
  return text || null;
}
