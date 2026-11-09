import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { CORSO_CARE_CHANNEL, ensureCareNotificationChannel, getCareNotificationPermission } from './corsoCareNotifications';

const types = {
  bg: ['Ваксина', 'Обезпаразитяване', 'Ветеринар', 'Тренировка', 'Друго'],
  en: ['Vaccine', 'Deworming', 'Vet visit', 'Training', 'Other'],
  it: ['Vaccino', 'Vermifugo', 'Veterinario', 'Addestramento', 'Altro'],
};
const kinds = ['vaccine', 'deworming', 'vet', 'training', 'other'];
const storageKey = userId => `usg:corso-care:01:${userId}`;
const reminderOffset = { at_time: 0, '2h': 7200000, '1d': 86400000 };

function scheduledTime(item) {
  if (!Object.prototype.hasOwnProperty.call(reminderOffset, item.reminder)) return null;
  const day = /^(\d{4})-(\d{2})-(\d{2})$/.exec(item.date || '');
  const time = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(item.time || '');
  if (!day || !time) return null;
  const value = new Date(Number(day[1]), Number(day[2]) - 1, Number(day[3]), Number(time[1]), Number(time[2]));
  if (value.getFullYear() !== Number(day[1]) || value.getMonth() !== Number(day[2]) - 1 || value.getDate() !== Number(day[3])) return null;
  const result = value.getTime() - reminderOffset[item.reminder];
  return result > Date.now() ? result : null;
}

let inFlight = Promise.resolve();
let activeCareUserId;

export function activateCareReminderSession(userId) {
  activeCareUserId = userId || null;
}

export function clearInactiveCareReminders(userId) {
  const allowedUserId = userId || null;
  const job = inFlight.catch(() => {}).then(async () => {
    if (activeCareUserId !== allowedUserId) return { failed: false };
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const presented = await Notifications.getPresentedNotificationsAsync();
    let failed = false;
    for (const notification of scheduled) {
      const data = notification.content?.data;
      if (data?.usgCorsoCare !== true || (allowedUserId && String(data.userId) === String(allowedUserId))) continue;
      try { await Notifications.cancelScheduledNotificationAsync(notification.identifier); }
      catch { failed = true; }
    }
    for (const notification of presented) {
      const data = notification.request?.content?.data;
      if (data?.usgCorsoCare !== true || (allowedUserId && String(data.userId) === String(allowedUserId))) continue;
      try { await Notifications.dismissNotificationAsync(notification.request.identifier); }
      catch { failed = true; }
    }
    return { failed };
  });
  inFlight = job.catch(() => {});
  return job;
}

export function reconcileCareReminders(input) {
  const job = inFlight.catch(() => {}).then(() => reconcile(input));
  inFlight = job;
  return job;
}

async function reconcile({ userId, dogs, language, records }) {
  if (!userId || (activeCareUserId !== undefined && activeCareUserId !== userId)) return { failed: false };
  const all = records || JSON.parse((await AsyncStorage.getItem(storageKey(userId))) || '[]');
  if (!Array.isArray(all)) throw new Error('Invalid Corso Care records');
  const dogNames = new Map((dogs || []).map(dog => [String(dog.id), dog.name]));
  const labels = types[language] || types.en;
  const desired = new Map();
  for (const item of all) {
    const timestamp = scheduledTime(item);
    const dogName = dogNames.get(String(item.dogId));
    if (!timestamp || !dogName || !item.id) continue;
    const category = labels[Math.max(0, kinds.indexOf(item.kind))];
    const title = `USG CORSO · ${dogName}`;
    const body = `${category} · ${item.date} ${item.time}${item.note ? ` · ${String(item.note).slice(0, 120)}` : ''}`;
    const signature = JSON.stringify([timestamp, title, body, language]);
    desired.set(String(item.id), { item, timestamp, title, body, signature });
  }
  await ensureCareNotificationChannel();
  const scheduled = (await Notifications.getAllScheduledNotificationsAsync()).filter(
    notification => notification.content?.data?.usgCorsoCare === true
  );
  const permission = await getCareNotificationPermission();
  const kept = new Set();
  const blocked = new Set();
  let failed = false;
  for (const notification of scheduled) {
    const data = notification.content.data || {};
    const wanted = data.userId === userId ? desired.get(String(data.itemId)) : null;
    if (permission && wanted && notification.trigger?.channelId === CORSO_CARE_CHANNEL && !kept.has(String(data.itemId)) && data.signature === wanted.signature) {
      kept.add(String(data.itemId));
      continue;
    }
    try { await Notifications.cancelScheduledNotificationAsync(notification.identifier); }
    catch {
      failed = true;
      if (String(data.userId) === String(userId) && data.itemId) blocked.add(String(data.itemId));
    }
  }
  if (!permission || desired.size === 0) return { failed };
  for (const [id, entry] of desired) {
    if (kept.has(id) || blocked.has(id) || (activeCareUserId !== undefined && activeCareUserId !== userId)) continue;
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: entry.title,
          body: entry.body,
          data: { usgCorsoCare: true, userId, itemId: id, signature: entry.signature },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: new Date(entry.timestamp),
          channelId: CORSO_CARE_CHANNEL,
        },
      });
    } catch { failed = true; }
  }
  return { failed };
}
