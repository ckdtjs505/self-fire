// ─────────────────────────────────────────────────────────────
// notification.ts
// '오늘의 명언' 알림 설정 스토어. 예약 자체는 services/notifications.ts가 한다.
// ─────────────────────────────────────────────────────────────

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import * as Notifications from "expo-notifications";
import { Quote } from "@/models";
import { rescheduleNotifications } from "@/services/notifications";
import { waitForHydration } from "@/utils/hydration";
import { stateStorage } from "@/utils/storage";

interface NotificationState {
  isEnabled: boolean;
  notificationHour: number;
  notificationMinute: number;
  // 첫 점화 후 '알림 받기'를 한 번 제안했는지 (ignite-result-sheet.tsx)
  hasOfferedReminder: boolean;
  // 불씨가 꺼지기 전 저녁 알림 (오늘의 명언 알림이 켜져 있을 때만 보낸다)
  streakReminderEnabled: boolean;
  // 켜기에 성공하면 true (알림 권한을 거부하면 false)
  setEnabled: (enabled: boolean) => Promise<boolean>;
  markReminderOffered: () => void;
  setTime: (hour: number, minute: number) => Promise<void>;
  setStreakReminderEnabled: (enabled: boolean) => Promise<void>;
}

// '오늘의 명언' 알림 설정 (켜짐 여부, 알림 시각)
export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      isEnabled: false,
      notificationHour: 8,
      notificationMinute: 0,
      hasOfferedReminder: false,
      streakReminderEnabled: true,

      setEnabled: async (enabled: boolean) => {
        if (enabled) {
          const { granted } = await Notifications.requestPermissionsAsync();
          if (!granted) {
            set({ isEnabled: false });
            return false;
          }
          await rescheduleNotifications(get());
        } else {
          await Notifications.cancelAllScheduledNotificationsAsync();
        }
        set({ isEnabled: enabled });
        return enabled;
      },

      markReminderOffered: () => set({ hasOfferedReminder: true }),

      setTime: async (hour: number, minute: number) => {
        set({ notificationHour: hour, notificationMinute: minute });
        if (get().isEnabled) {
          await rescheduleNotifications(get());
        }
      },

      setStreakReminderEnabled: async (enabled: boolean) => {
        set({ streakReminderEnabled: enabled });
        if (get().isEnabled) {
          await rescheduleNotifications(get());
        }
      },
    }),
    {
      name: "notification-storage",
      storage: createJSONStorage(() => stateStorage),
    }
  )
);

// 예약 작업이 겹치면 취소·예약이 뒤섞여 알림이 중복될 수 있으므로 한 번에 하나씩 실행한다.
let refreshQueue: Promise<void> = Promise.resolve();

/**
 * 알림이 켜져 있으면 예약 기간을 다시 채운다. (앱 시작 시, 카테고리·즐겨찾기·명언이 바뀔 때 호출)
 * 그 사이 시스템 설정에서 알림 권한을 끈 경우에는 설정도 꺼 둔다.
 */
export const refreshDailyNotifications = () => {
  refreshQueue = refreshQueue.then(refreshNow);
  return refreshQueue;
};

const refreshNow = async () => {
  try {
    await waitForHydration(useNotificationStore);
    const settings = useNotificationStore.getState();
    if (!settings.isEnabled) return;

    const { granted } = await Notifications.getPermissionsAsync();
    if (!granted) {
      await Notifications.cancelAllScheduledNotificationsAsync();
      useNotificationStore.setState({ isEnabled: false });
      return;
    }
    await rescheduleNotifications(settings);
  } catch (e) {
    console.warn("Failed to refresh notifications:", e);
  }
};

// 알림을 눌러 앱을 열었을 때 홈 화면에 보여 줄 명언. 홈 화면이 꺼내 쓰고 비운다.
export const usePendingQuoteStore = create<{ quote: Quote | null; setQuote: (quote: Quote | null) => void }>()(
  (set) => ({
    quote: null,
    setQuote: (quote) => set({ quote }),
  }),
);
