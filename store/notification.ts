import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { quotes as defaultQuotes } from "@/data/quotes";

interface NotificationState {
  isEnabled: boolean;
  notificationHour: number;
  notificationMinute: number;
  setEnabled: (enabled: boolean) => Promise<void>;
  setTime: (hour: number, minute: number) => Promise<void>;
}

const getRandomQuote = () => {
  const idx = Math.floor(Math.random() * defaultQuotes.length);
  return defaultQuotes[idx];
};

const scheduleDaily = async (hour: number, minute: number) => {
  await Notifications.cancelAllScheduledNotificationsAsync();
  const quote = getRandomQuote();
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "🔥 오늘의 명언",
      body: `"${quote.text}" - ${quote.author}`,
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
};

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      isEnabled: false,
      notificationHour: 8,
      notificationMinute: 0,

      setEnabled: async (enabled: boolean) => {
        if (enabled) {
          const { status } = await Notifications.requestPermissionsAsync();
          if (status !== "granted") {
            set({ isEnabled: false });
            return;
          }
          const { notificationHour, notificationMinute } = get();
          await scheduleDaily(notificationHour, notificationMinute);
        } else {
          await Notifications.cancelAllScheduledNotificationsAsync();
        }
        set({ isEnabled: enabled });
      },

      setTime: async (hour: number, minute: number) => {
        set({ notificationHour: hour, notificationMinute: minute });
        const { isEnabled } = get();
        if (isEnabled) {
          await scheduleDaily(hour, minute);
        }
      },
    }),
    {
      name: "notification-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
