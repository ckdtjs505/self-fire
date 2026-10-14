import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { quotes as defaultQuotes } from "@/data/quotes";
import { shuffle } from "@/utils/shuffle";

interface NotificationState {
  isEnabled: boolean;
  notificationHour: number;
  notificationMinute: number;
  setEnabled: (enabled: boolean) => Promise<void>;
  setTime: (hour: number, minute: number) => Promise<void>;
}

// 반복(DAILY) 알림은 내용이 고정되므로, 앞으로 며칠치를 날짜별로 다른 명언으로 예약한다.
// 앱을 열 때마다 다시 채우므로 이 기간 안에 한 번이라도 앱을 열면 알림이 끊기지 않는다.
const DAYS_AHEAD = 30;

// 기존 예약을 지우고, 앞으로 DAYS_AHEAD일 동안 매일 hour:minute에 서로 다른 명언 알림을 예약한다.
export const scheduleUpcoming = async (hour: number, minute: number, now: Date = new Date()) => {
  await Notifications.cancelAllScheduledNotificationsAsync();
  const picked = shuffle(defaultQuotes).slice(0, DAYS_AHEAD + 1);

  for (let day = 0; day <= DAYS_AHEAD; day++) {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + day, hour, minute);
    const quote = picked[day];
    if (date <= now || !quote) continue;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "🔥 오늘의 명언",
        body: `"${quote.text}" - ${quote.author}`,
        sound: true,
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date },
    });
  }
};

// '오늘의 명언' 알림 설정 (켜짐 여부, 알림 시각)
export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      isEnabled: false,
      notificationHour: 8,
      notificationMinute: 0,

      setEnabled: async (enabled: boolean) => {
        if (enabled) {
          const { granted } = await Notifications.requestPermissionsAsync();
          if (!granted) {
            set({ isEnabled: false });
            return;
          }
          const { notificationHour, notificationMinute } = get();
          await scheduleUpcoming(notificationHour, notificationMinute);
        } else {
          await Notifications.cancelAllScheduledNotificationsAsync();
        }
        set({ isEnabled: enabled });
      },

      setTime: async (hour: number, minute: number) => {
        set({ notificationHour: hour, notificationMinute: minute });
        const { isEnabled } = get();
        if (isEnabled) {
          await scheduleUpcoming(hour, minute);
        }
      },
    }),
    {
      name: "notification-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

const waitForHydration = () =>
  new Promise<void>((resolve) => {
    if (useNotificationStore.persist.hasHydrated()) return resolve();
    const unsubscribe = useNotificationStore.persist.onFinishHydration(() => {
      unsubscribe();
      resolve();
    });
  });

/**
 * 앱 시작 시 호출: 알림이 켜져 있으면 예약 기간을 다시 채운다.
 * 그 사이 시스템 설정에서 알림 권한을 끈 경우에는 설정도 꺼 둔다.
 */
export const refreshDailyNotifications = async () => {
  try {
    await waitForHydration();
    const { isEnabled, notificationHour, notificationMinute } = useNotificationStore.getState();
    if (!isEnabled) return;

    const { granted } = await Notifications.getPermissionsAsync();
    if (!granted) {
      await Notifications.cancelAllScheduledNotificationsAsync();
      useNotificationStore.setState({ isEnabled: false });
      return;
    }
    await scheduleUpcoming(notificationHour, notificationMinute);
  } catch (e) {
    console.warn("Failed to refresh notifications:", e);
  }
};
