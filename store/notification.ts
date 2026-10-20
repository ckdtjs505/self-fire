import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { getAllModeCandidates, getDailyQuote } from "@/data/daily-quote";
import { quotes as bundledQuotes, loadSyncedQuotes } from "@/data/quotes";
import { Quote } from "@/models";
import { useCategoryStore } from "@/store/category";
import { useFavoriteQuoteStore } from "@/store/quote";
import { useStreakStore, whenStreakHydrated } from "@/store/streak";
import { toDateString } from "@/utils/date";

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

// 알림을 눌렀을 때 앱이 할 일을 알 수 있도록 알림에 담아 두는 데이터
export type NotificationData =
  | { type: "daily"; quoteId: string; text: string; author: string }
  | { type: "streak" };

// 저녁 불씨 알림에 필요한 스트릭 상태
export type StreakReminderInput = {
  currentStreak: number;
  // 오늘 이미 불씨를 점화했는지
  ignitedToday: boolean;
};

// 불씨가 꺼지기 전 알림 시각. 오늘의 명언 알림(정각 단위)과 겹치지 않게 30분에 보낸다.
export const STREAK_REMINDER_HOUR = 21;
export const STREAK_REMINDER_MINUTE = 30;

// 오늘·내일 저녁에 보낼 불씨 알림.
//   - 오늘: 아직 점화하지 않았고 이어 온 불씨가 있으면 오늘 저녁에 알린다.
//   - 내일: 오늘 점화했으면 내일 저녁에 알린다. (내일 앱을 열어 점화하면 다시 예약하며 사라진다)
// 그 뒤로는 스트릭이 이미 끊겼을 수 있어 예약하지 않는다.
export const getStreakReminders = (
  { currentStreak, ignitedToday }: StreakReminderInput,
  now: Date = new Date(),
): { date: Date; body: string }[] => {
  if (currentStreak <= 0) return [];
  const at = (dayOffset: number) =>
    new Date(now.getFullYear(), now.getMonth(), now.getDate() + dayOffset, STREAK_REMINDER_HOUR, STREAK_REMINDER_MINUTE);

  const date = ignitedToday ? at(1) : at(0);
  if (date <= now) return [];
  return [{ date, body: `${currentStreak}일째 이어 온 불씨가 오늘 밤 꺼질 수 있어요. 지금 지펴 주세요 🔥` }];
};

// 반복(DAILY) 알림은 내용이 고정되므로, 앞으로 며칠치를 날짜별로 그날의 '오늘의 명언'으로 예약한다.
// 앱을 열 때마다 다시 채우므로 이 기간 안에 한 번이라도 앱을 열면 알림이 끊기지 않는다.
const DAYS_AHEAD = 30;

// 기존 예약을 지우고, 앞으로 DAYS_AHEAD일 동안 매일 hour:minute에 그날의 '오늘의 명언' 알림을 예약한다.
// candidates는 홈 화면 '전체' 모드와 같은 후보여야 알림 명언과 그날 홈 화면의 첫 명언이 같아진다.
export const scheduleUpcoming = async (
  hour: number,
  minute: number,
  candidates: Quote[],
  now: Date = new Date(),
  streak: StreakReminderInput | null = null,
) => {
  await Notifications.cancelAllScheduledNotificationsAsync();

  for (let day = 0; day <= DAYS_AHEAD; day++) {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + day, hour, minute);
    const quote = getDailyQuote(candidates, date);
    if (date <= now || !quote) continue;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "🔥 오늘의 명언",
        body: `"${quote.text}" - ${quote.author}`,
        sound: true,
        data: { type: "daily", quoteId: quote.id, text: quote.text, author: quote.author } satisfies NotificationData,
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date },
    });
  }

  for (const reminder of streak ? getStreakReminders(streak, now) : []) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "🔥 불씨가 꺼지기 전에",
        body: reminder.body,
        sound: true,
        data: { type: "streak" } satisfies NotificationData,
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: reminder.date },
    });
  }
};

// 저녁 불씨 알림을 꺼 두었으면 null
const loadStreakReminderInput = async (): Promise<StreakReminderInput | null> => {
  await waitForHydration(useNotificationStore);
  if (!useNotificationStore.getState().streakReminderEnabled) return null;
  await whenStreakHydrated();
  const { currentStreak, lastStreakDate } = useStreakStore.getState();
  return { currentStreak, ignitedToday: lastStreakDate === toDateString() };
};

// 지금 설정으로 알림을 다시 예약한다.
const scheduleWithCurrentState = async (hour: number, minute: number) =>
  scheduleUpcoming(hour, minute, await loadDailyCandidates(), new Date(), await loadStreakReminderInput());

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
          const { notificationHour, notificationMinute } = get();
          await scheduleWithCurrentState(notificationHour, notificationMinute);
        } else {
          await Notifications.cancelAllScheduledNotificationsAsync();
        }
        set({ isEnabled: enabled });
        return enabled;
      },

      markReminderOffered: () => set({ hasOfferedReminder: true }),

      setTime: async (hour: number, minute: number) => {
        set({ notificationHour: hour, notificationMinute: minute });
        const { isEnabled } = get();
        if (isEnabled) {
          await scheduleWithCurrentState(hour, minute);
        }
      },

      setStreakReminderEnabled: async (enabled: boolean) => {
        set({ streakReminderEnabled: enabled });
        const { isEnabled, notificationHour, notificationMinute } = get();
        if (isEnabled) {
          await scheduleWithCurrentState(notificationHour, notificationMinute);
        }
      },
    }),
    {
      name: "notification-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

type PersistedStore = {
  persist: { hasHydrated: () => boolean; onFinishHydration: (fn: () => void) => () => void };
};

const waitForHydration = (store: PersistedStore) =>
  new Promise<void>((resolve) => {
    if (store.persist.hasHydrated()) return resolve();
    const unsubscribe = store.persist.onFinishHydration(() => {
      unsubscribe();
      resolve();
    });
  });

// 홈 화면 '전체' 모드와 같은 후보 명언 (기본 + 동기화된 명언 + 나만의 명언, 카테고리·즐겨찾기 반영)
export async function loadDailyCandidates(): Promise<Quote[]> {
  await Promise.all([waitForHydration(useFavoriteQuoteStore), waitForHydration(useCategoryStore)]);
  const synced = await loadSyncedQuotes();
  const bundledIds = new Set(bundledQuotes.map((q) => q.id));
  const { customQuotes, favorites } = useFavoriteQuoteStore.getState();
  const all = [...bundledQuotes, ...synced.filter((q) => !bundledIds.has(q.id)), ...customQuotes];
  const { currentCategoryId, interestIds } = useCategoryStore.getState();
  return getAllModeCandidates(all, currentCategoryId, new Set(favorites), interestIds);
}

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
    const { isEnabled, notificationHour, notificationMinute } = useNotificationStore.getState();
    if (!isEnabled) return;

    const { granted } = await Notifications.getPermissionsAsync();
    if (!granted) {
      await Notifications.cancelAllScheduledNotificationsAsync();
      useNotificationStore.setState({ isEnabled: false });
      return;
    }
    await scheduleWithCurrentState(notificationHour, notificationMinute);
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
