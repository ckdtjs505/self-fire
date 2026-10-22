// ─────────────────────────────────────────────────────────────
// notifications.ts
// '오늘의 명언'·저녁 불씨 알림 예약.
// 알림 설정은 store/notification.ts가 들고 있고, 여기서는 설정을 받아 예약만 한다.
// 명언 후보(services/daily-candidates.ts)와 스트릭을 읽는 일도 여기서 맡아,
// 알림 스토어가 다른 스토어를 직접 알지 않게 한다.
// ─────────────────────────────────────────────────────────────

import { orderQuotesForDay } from "@/data/daily-quote";
import { notificationDataSchema } from "@/data/schemas";
import { Quote } from "@/models";
import { loadDailyCandidates, loadTodayPick } from "@/services/daily-candidates";
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
//   - 내일: 오늘 점화했으면 내일 저녁에 알린다. (내일 한 줄을 남겨 점화하면 다시 예약하며 사라진다)
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
  return [{ date, body: `${currentStreak}일째 이어 온 불씨가 오늘 밤 꺼질 수 있어요. 문장대로 한 일을 한 줄 남겨 지펴 주세요 🔥` }];
};

// 하루에 받을 수 있는 알림 횟수
export const MAX_NOTIFICATION_TIMES = 3;

export type NotificationTime = { hour: number; minute: number };

// 시각 순으로 정렬하고 같은 시각은 하나만 남긴다.
export const normalizeTimes = (times: NotificationTime[]): NotificationTime[] =>
  times
    .slice()
    .sort((a, b) => a.hour * 60 + a.minute - (b.hour * 60 + b.minute))
    .filter((t, i, arr) => i === 0 || t.hour !== arr[i - 1].hour || t.minute !== arr[i - 1].minute)
    .slice(0, MAX_NOTIFICATION_TIMES);

// 반복(DAILY) 알림은 내용이 고정되므로, 앞으로 며칠치를 날짜별로 그날의 명언으로 예약한다.
// 앱을 열 때마다 다시 채우므로 이 기간 안에 한 번이라도 앱을 열면 알림이 끊기지 않는다.
const DAYS_AHEAD = 30;
// iOS는 예약 알림을 64개까지만 들고 있으므로, 하루 알림이 여러 번이면 예약 기간을 줄인다.
// (저녁 불씨 알림 몫을 남겨 둔다)
const MAX_SCHEDULED_DAILY = 60;

export const daysAheadFor = (timesPerDay: number) =>
  Math.min(DAYS_AHEAD, Math.floor(MAX_SCHEDULED_DAILY / Math.max(1, timesPerDay)));

// 기존 예약을 지우고, 앞으로 며칠 동안 매일 정한 시각마다 그날의 명언 알림을 예약한다.
// 하루 n번째 알림에는 그날 홈 화면의 n번째 명언을 보낸다. (첫 알림 = '오늘의 명언')
// candidates는 홈 화면 '전체' 모드와 같은 후보여야 알림 명언과 그날 홈 화면의 명언 순서가 같아진다.
// todayPick: 오늘 고른 문장. 있으면 오늘 남은 알림의 첫 명언으로 보낸다. (홈 화면 첫 명언과 같다)
export const scheduleUpcoming = async (
  times: NotificationTime[],
  candidates: Quote[],
  now: Date = new Date(),
  streak: StreakReminderInput | null = null,
  todayPick: Quote | null = null,
) => {
  await Notifications.cancelAllScheduledNotificationsAsync();

  const slots = normalizeTimes(times);
  const daysAhead = daysAheadFor(slots.length);
  for (let day = 0; day <= daysAhead; day++) {
    const dayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + day);
    const at = ({ hour, minute }: NotificationTime) =>
      new Date(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate(), hour, minute);
    const daily = orderQuotesForDay(candidates, dayDate);

    // 오늘 고른 문장이 있으면 오늘 남은 알림에 오늘의 문장부터 차례로 싣는다.
    // 그 밖의 날은 하루 n번째 알림에 그날 홈 화면의 n번째 명언을 싣는다.
    const isPickedDay = day === 0 && !!todayPick;
    const ordered = isPickedDay ? [todayPick, ...daily.filter((q) => q.id !== todayPick.id)] : daily;
    const daySlots = isPickedDay ? slots.filter((slot) => at(slot) > now) : slots;

    for (const [index, slot] of daySlots.entries()) {
      const date = at(slot);
      const quote = ordered[index % Math.max(1, ordered.length)];
      if (date <= now || !quote) continue;

      const title = index > 0 ? "🔥 불씨 한 줄 더" : isPickedDay ? "🔥 오늘 따르는 문장" : "🔥 오늘의 명언";
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body: `"${quote.text}" - ${quote.author}`,
          sound: true,
          data: { type: "daily", quoteId: quote.id, text: quote.text, author: quote.author } satisfies NotificationData,
        },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date },
      });
    }
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
  notificationTimes: NotificationTime[];
  streakReminderEnabled: boolean;
};

/** 지금 명언 후보·오늘 고른 문장·스트릭으로 알림을 다시 예약한다. */
export const rescheduleNotifications = async ({ notificationTimes, streakReminderEnabled }: ReminderSettings) =>
  scheduleUpcoming(
    notificationTimes,
    await loadDailyCandidates(),
    new Date(),
    await loadStreakReminderInput(streakReminderEnabled),
    await loadTodayPick(),
  );
