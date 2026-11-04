import { supabase } from '../lib/supabase';

export async function getDogWeightHistory(userId, dogId) {
  if (!userId || !dogId) {
    return { data: [], error: null };
  }

  return supabase
    .from('dog_weight_measurements')
    .select('id, dog_id, owner_id, measured_on, weight_kg, created_at')
    .eq('owner_id', userId)
    .eq('dog_id', dogId)
    .order('measured_on', { ascending: false })
    .limit(200);
}

export async function addDogWeight(userId, dogId, date, weightKg) {
  return supabase
    .from('dog_weight_measurements')
    .insert({ owner_id: userId, dog_id: dogId, measured_on: date, weight_kg: weightKg })
    .select('id, measured_on, weight_kg')
    .single();
}

export async function updateDogWeight(userId, dogId, measurementId, date, weightKg) {
  return supabase
    .from('dog_weight_measurements')
    .update({ measured_on: date, weight_kg: weightKg })
    .eq('owner_id', userId)
    .eq('dog_id', dogId)
    .eq('id', measurementId)
    .select('id, measured_on, weight_kg')
    .single();
}

export async function deleteDogWeight(userId, dogId, measurementId) {
  return supabase
    .from('dog_weight_measurements')
    .delete()
    .eq('owner_id', userId)
    .eq('dog_id', dogId)
    .eq('id', measurementId)
    .select('id');
}
