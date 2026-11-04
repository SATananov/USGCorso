import { supabase } from '../lib/supabase';

const columns = 'id, owner_id, dog_id, entry_date, category, context, notes, created_at';

export function getDogBehaviorEntries(userId, dogId) {
  if (!userId || !dogId) return Promise.resolve({ data: [], error: null });
  return supabase.from('dog_behavior_entries').select(columns)
    .eq('owner_id', userId).eq('dog_id', dogId)
    .order('entry_date', { ascending: false }).order('created_at', { ascending: false }).limit(150);
}

export function saveDogBehaviorEntry(userId, dogId, entry, entryId = null) {
  const payload = {
    entry_date: entry.entryDate,
    category: entry.category,
    context: entry.context || null,
    notes: entry.notes,
  };
  if (entryId) return supabase.from('dog_behavior_entries').update(payload)
    .eq('id', entryId).eq('dog_id', dogId).eq('owner_id', userId)
    .select('id').single();
  return supabase.from('dog_behavior_entries')
    .insert({ ...payload, dog_id: dogId, owner_id: userId }).select('id').single();
}

export function deleteDogBehaviorEntry(userId, dogId, entryId) {
  return supabase.from('dog_behavior_entries').delete()
    .eq('id', entryId).eq('dog_id', dogId).eq('owner_id', userId).select('id');
}
