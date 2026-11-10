import AsyncStorage from '@react-native-async-storage/async-storage';
const recordsKey = userId => `@usgcorso/care-history/04a/${userId}`;
const dogKey = userId => `@usgcorso/care-history/04a/selected-dog/${userId}`;
async function readRecords(userId) {
  if (!userId) return [];
  const raw = await AsyncStorage.getItem(recordsKey(userId));
  if (!raw) return [];
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) throw new Error('Invalid local care history');
  return parsed;
}
export async function getCareHistoryExtensions(userId, dogId) {
  return (await readRecords(userId)).filter(item => item.userId === userId && item.dogId === dogId);
}
export async function saveCareHistoryExtension(userId, dogId, value, {
  linkedEntryId = null,
  recordId = null
} = {}) {
  if (!userId || !dogId) throw new Error('A user and dog are required');
  const all = await readRecords(userId);
  const existing = all.find(item => recordId && item.id === recordId || linkedEntryId && item.linkedEntryId === linkedEntryId) || null;
  const item = {
    ...value,
    id: existing?.id || `local-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    linkedEntryId: linkedEntryId || existing?.linkedEntryId || null,
    userId,
    dogId,
    updatedAt: new Date().toISOString()
  };
  const next = existing ? all.map(entry => entry.id === existing.id ? item : entry) : [...all, item];
  await AsyncStorage.setItem(recordsKey(userId), JSON.stringify(next));
  return item;
}
export async function deleteCareHistoryExtension(userId, recordId) {
  if (!userId || !recordId) return;
  const all = await readRecords(userId);
  const next = all.filter(item => item.id !== recordId && item.linkedEntryId !== recordId);
  if (next.length !== all.length) await AsyncStorage.setItem(recordsKey(userId), JSON.stringify(next));
}
export async function getCareHistorySelectedDog(userId) {
  if (!userId) return null;
  return AsyncStorage.getItem(dogKey(userId));
}
export async function setCareHistorySelectedDog(userId, dogId) {
  if (!userId || !dogId) return;
  await AsyncStorage.setItem(dogKey(userId), String(dogId));
}
