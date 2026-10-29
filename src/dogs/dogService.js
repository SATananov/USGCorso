import { supabase } from '../lib/supabase';

const DOG_FIELDS =
  'id, owner_id, name, sex, color, birth_date, country, city, kennel, breeder, registration_number, description, community_visible, photo_path, created_at, updated_at';

export async function getMyDogs(userId) {
  if (!userId) {
    return { data: [], error: null };
  }

  return supabase
    .from('dogs')
    .select(DOG_FIELDS)
    .eq('owner_id', userId)
    .order('created_at', { ascending: false });
}

export async function createDog(userId, dog) {
  const payload = {
    owner_id: userId,
    name: requiredText(dog.name),
    sex: requiredText(dog.sex),
    color: nullableText(dog.color),
    birth_date: nullableText(dog.birthDate),
    country: nullableText(dog.country),
    city: nullableText(dog.city),
    kennel: nullableText(dog.kennel),
    breeder: nullableText(dog.breeder),
    registration_number: nullableText(dog.registrationNumber),
    description: nullableText(dog.description),
    community_visible: Boolean(dog.communityVisible),
  };

  return supabase
    .from('dogs')
    .insert(payload)
    .select(DOG_FIELDS)
    .single();
}

export async function updateDog(userId, dogId, dog) {
  const payload = {
    name: requiredText(dog.name),
    sex: requiredText(dog.sex),
    color: nullableText(dog.color),
    birth_date: nullableText(dog.birthDate),
    country: nullableText(dog.country),
    city: nullableText(dog.city),
    kennel: nullableText(dog.kennel),
    breeder: nullableText(dog.breeder),
    registration_number: nullableText(dog.registrationNumber),
    description: nullableText(dog.description),
    community_visible: Boolean(dog.communityVisible),
    updated_at: new Date().toISOString(),
  };

  return supabase
    .from('dogs')
    .update(payload)
    .eq('id', dogId)
    .eq('owner_id', userId)
    .select(DOG_FIELDS)
    .single();
}

export async function deleteDog(userId, dogId) {
  const { data: dog, error: loadError } = await supabase
    .from('dogs')
    .select('photo_path')
    .eq('id', dogId)
    .eq('owner_id', userId)
    .maybeSingle();

  if (loadError) {
    return { data: null, error: loadError };
  }

  if (dog?.photo_path) {
    const removeResult = await supabase.storage
      .from('corso-photos')
      .remove([dog.photo_path]);

    if (removeResult.error) {
      return { data: null, error: removeResult.error };
    }
  }

  return supabase
    .from('dogs')
    .delete()
    .eq('id', dogId)
    .eq('owner_id', userId);
}

function nullableText(value) {
  if (typeof value !== 'string') {
    return value ?? null;
  }

  const text = value.trim();
  return text || null;
}

function requiredText(value) {
  return nullableText(value) || '';
}
