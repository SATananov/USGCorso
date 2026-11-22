import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'usgcorso:ota-reload-intent:v1';
const MAX_AGE_MS = 5 * 60 * 1000;

export async function markOtaReloadIntent(updateId) {
  if (!updateId) return;
  await AsyncStorage.setItem(KEY, JSON.stringify({ updateId, createdAt: Date.now() }));
}

export async function consumeOtaReloadIntent(currentUpdateId) {
  const stored = await AsyncStorage.getItem(KEY);
  if (!stored) return false;
  await AsyncStorage.removeItem(KEY);
  try {
    const intent = JSON.parse(stored);
    return Boolean(
      currentUpdateId &&
      intent.updateId === currentUpdateId &&
      typeof intent.createdAt === 'number' &&
      Date.now() >= intent.createdAt &&
      Date.now() - intent.createdAt <= MAX_AGE_MS
    );
  } catch {
    return false;
  }
}

export async function clearOtaReloadIntent() {
  await AsyncStorage.removeItem(KEY);
}
