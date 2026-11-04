import { supabase } from '../lib/supabase';

export function getDogCareEntries(userId, dogId) {
  if (!userId || !dogId) return Promise.resolve({ data: [], error: null });
  return supabase.from('dog_care_entries')
    .select('id, dog_id, owner_id, entry_date, kind, food_name, amount_g, care_type, notes, created_at')
    .eq('owner_id', userId).eq('dog_id', dogId)
    .order('entry_date', { ascending: false }).order('created_at', { ascending: false }).limit(200);
}

export function saveDogCareEntry(userId, dogId, entry, entryId = null) {
  const payload = {
    entry_date: entry.entryDate,
    kind: entry.kind,
    food_name: entry.kind === 'feeding' ? entry.foodName : null,
    amount_g: entry.kind === 'feeding' ? entry.amountG : null,
    care_type: entry.kind === 'care' ? entry.careType : null,
    notes: entry.notes || null,
  };
  if (entryId) {
    return supabase.from('dog_care_entries').update(payload)
      .eq('id', entryId).eq('dog_id', dogId).eq('owner_id', userId)
      .select('id').single();
  }
  return supabase.from('dog_care_entries')
    .insert({ ...payload, dog_id: dogId, owner_id: userId }).select('id').single();
}

export function deleteDogCareEntry(userId, dogId, entryId) {
  return supabase.from('dog_care_entries').delete()
    .eq('id', entryId).eq('dog_id', dogId).eq('owner_id', userId).select('id');
}
