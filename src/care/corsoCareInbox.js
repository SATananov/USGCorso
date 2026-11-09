import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

const key = userId => `usg:corso-care:inbox:01:${userId}`;
const listeners = new Set();
let queue = Promise.resolve();

function enqueue(task) {
  const next = queue.catch(() => {}).then(task);
  queue = next.catch(() => {});
  return next;
}

function inform() {
  for (const listener of listeners) listener();
}

export function subscribeCareInbox(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function fromNotification(notification, userId) {
  const content = notification?.request?.content;
  const data = content?.data;
  if (data?.usgCorsoCare !== true || String(data.userId) !== String(userId) || !data.itemId) return null;
  const identifier = notification?.request?.identifier;
  if (!identifier) return null;
  const numericDate = Number(notification.date);
  const timestamp = Number.isFinite(numericDate) && numericDate > 0
    ? new Date(numericDate < 1e11 ? numericDate * 1000 : numericDate).toISOString()
    : new Date().toISOString();
  return {
    id: String(identifier),
    itemId: String(data.itemId),
    title: String(content.title || 'USG CORSO').slice(0, 160),
    body: String(content.body || '').slice(0, 400),
    createdAt: timestamp,
    readAt: null,
  };
}

async function read(userId) {
  const raw = await AsyncStorage.getItem(key(userId));
  if (!raw) return [];
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) throw new Error('Invalid care inbox');
  return parsed;
}

async function merge(userId, incoming) {
  if (!userId || !incoming.length) return;
  const current = await read(userId);
  const existing = new Map(current.map(item => [item.id, item]));
  let changed = false;
  for (const item of incoming) {
    if (existing.has(item.id)) continue;
    existing.set(item.id, item);
    changed = true;
  }
  if (!changed) return;
  const next = [...existing.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 100);
  await AsyncStorage.setItem(key(userId), JSON.stringify(next));
  inform();
}

export function recordCareNotification(notification, userId) {
  const item = fromNotification(notification, userId);
  if (!item) return Promise.resolve();
  return enqueue(() => merge(userId, [item]));
}

export async function getCareInbox(userId) {
  if (!userId) return [];
  return enqueue(async () => {
    const presented = await Notifications.getPresentedNotificationsAsync().catch(() => []);
    const incoming = presented.map(item => fromNotification(item, userId)).filter(Boolean);
    await merge(userId, incoming);
    return read(userId);
  });
}

export async function getUnreadCareCount(userId) {
  const items = await getCareInbox(userId);
  return items.filter(item => !item.readAt).length;
}

export function markCareInboxRead(userId, identifier) {
  if (!userId || !identifier) return Promise.resolve();
  return enqueue(async () => {
    const items = await read(userId);
    let changed = false;
    const next = items.map(item => {
      if (item.id !== identifier || item.readAt) return item;
      changed = true;
      return { ...item, readAt: new Date().toISOString() };
    });
    if (changed) {
      await AsyncStorage.setItem(key(userId), JSON.stringify(next));
      inform();
    }
  });
}

export function markAllCareInboxRead(userId) {
  if (!userId) return Promise.resolve();
  return enqueue(async () => {
    const items = await read(userId);
    if (!items.some(item => !item.readAt)) return;
    const now = new Date().toISOString();
    await AsyncStorage.setItem(key(userId), JSON.stringify(items.map(item => ({ ...item, readAt: item.readAt || now }))));
    inform();
  });
}

export async function getCareInboxTarget(userId, itemId) {
  const raw = await AsyncStorage.getItem(`usg:corso-care:01:${userId}`);
  const records = raw ? JSON.parse(raw) : [];
  const item = Array.isArray(records) ? records.find(entry => String(entry.id) === String(itemId)) : null;
  return item ? { careDate: item.date, careDogId: item.dogId } : null;
}
