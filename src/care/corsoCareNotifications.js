import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

export const CORSO_CARE_CHANNEL = 'usg-corso-care-alerts-v2';
export const CORSO_CARE_LEGACY_CHANNEL = 'usg-corso-care';

export async function ensureCareNotificationChannel() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CORSO_CARE_CHANNEL, {
    name: 'USG Corso Care Alerts',
    importance: Notifications.AndroidImportance.HIGH,
    enableVibrate: true,
    vibrationPattern: [0, 250, 150, 350],
    lightColor: '#C8A96B',
  });
}

export async function getCareNotificationPermission() {
  const result = await Notifications.getPermissionsAsync();
  return result.granted === true;
}

export async function requestCareNotificationPermission() {
  await ensureCareNotificationChannel();
  const status = await Notifications.getPermissionsAsync();
  if (status.granted) return true;
  if (!status.canAskAgain) return false;
  const result = await Notifications.requestPermissionsAsync();
  return result.granted === true;
}

export async function scheduleCareNotification({ date, title, body, data = {} }) {
  const timestamp = date instanceof Date ? date.getTime() : new Date(date).getTime();
  if (!Number.isFinite(timestamp) || timestamp <= Date.now()) {
    throw new Error('Care reminder date must be in the future');
  }
  await ensureCareNotificationChannel();
  if (!(await getCareNotificationPermission())) {
    throw new Error('Care notification permission is not granted');
  }
  return Notifications.scheduleNotificationAsync({
    content: {
      title: String(title || 'Corso Care'),
      body: String(body || ''),
      data,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: new Date(timestamp),
      ...(Platform.OS === 'android' ? { channelId: CORSO_CARE_CHANNEL } : {}),
    },
  });
}

export async function cancelCareNotification(identifier) {
  if (!identifier) return;
  await Notifications.cancelScheduledNotificationAsync(identifier);
}

export async function getScheduledCareNotifications() {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  return scheduled.filter(item => [CORSO_CARE_CHANNEL, CORSO_CARE_LEGACY_CHANNEL].includes(item.trigger?.channelId));
}
