import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleRestNotification(seconds: number): Promise<string> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Descanso finalizado!',
      body: 'Hora da próxima série 💪',
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds,
    },
  });
  return id;
}

export async function cancelRestNotification(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}