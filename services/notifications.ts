// ─────────────────────────────────────────────────────────────
// notifications.ts
// '오늘의 명언'·저녁 불씨 알림 예약.
// 알림 설정은 store/notification.ts가 들고 있고, 여기서는 설정을 받아 예약만 한다.
// 명언 후보(services/daily-candidates.ts)와 스트릭을 읽는 일도 여기서 맡아,
// 알림 스토어가 다른 스토어를 직접 알지 않게 한다.
// ─────────────────────────────────────────────────────────────

import { getDailyQuote } from "@/data/daily-quote";
import { notificationDataSchema } from "@/data/schemas";
import { Quote } from "@/models";
import { loadDailyCandidates } from "@/services/daily-candidates";
import { useStreakStore, whenStreakHydrated } from "@/store/streak";
import { toDateString } from "@/utils/date";
import * as Notifications from "expo-notifications";
import { z } from "zod";

// 알림을 눌렀을 때 앱이 할 일을 알 수 있도록 알림에 담아 두는 데이터
export type NotificationData = z.infer<typeof notificationDataSchema>;

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

// 저녁 불씨 알림에 넣을 지금 스트릭 (알림을 꺼 두었으면 null)
const loadStreakReminderInput = async (enabled: boolean): Promise<StreakReminderInput | null> => {
  if (!enabled) return null;
  await whenStreakHydrated();
  const { currentStreak, lastStreakDate } = useStreakStore.getState();
  return { currentStreak, ignitedToday: lastStreakDate === toDateString() };
};

export type ReminderSettings = {
  notificationHour: number;
  notificationMinute: number;
  streakReminderEnabled: boolean;
};

/** 지금 명언 후보·스트릭으로 알림을 다시 예약한다. */
export const rescheduleNotifications = async ({ notificationHour, notificationMinute, streakReminderEnabled }: ReminderSettings) =>
  scheduleUpcoming(
    notificationHour,
    notificationMinute,
    await loadDailyCandidates(),
    new Date(),
    await loadStreakReminderInput(streakReminderEnabled),
  );
