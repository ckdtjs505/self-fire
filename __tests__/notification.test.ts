jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);
jest.mock("expo-notifications", () => ({
  cancelAllScheduledNotificationsAsync: jest.fn(() => Promise.resolve()),
  scheduleNotificationAsync: jest.fn(() => Promise.resolve("id")),
  SchedulableTriggerInputTypes: { DATE: "date" },
}));
jest.mock("@/data/quotes", () => ({
  quotes: [],
  loadSyncedQuotes: jest.fn(() => Promise.resolve([])),
}));

import { getDailyQuote, orderQuotesForDay } from "@/data/daily-quote";
import { Quote } from "@/models";
import * as Notifications from "expo-notifications";
import { daysAheadFor, getStreakReminders, normalizeTimes, scheduleUpcoming } from "@/services/notifications";

const candidates: Quote[] = Array.from({ length: 100 }, (_, i) => ({
  id: String(i),
  text: `명언 ${i}`,
  author: "작가",
}));

const schedule = Notifications.scheduleNotificationAsync as jest.Mock;

describe("scheduleUpcoming", () => {
  beforeEach(() => schedule.mockClear());

  it("오늘 알림 시각이 지났으면 내일부터 30일치를 예약한다", async () => {
    await scheduleUpcoming([{ hour: 8, minute: 0 }], candidates, new Date(2026, 9, 14, 9, 0));

    expect(Notifications.cancelAllScheduledNotificationsAsync).toHaveBeenCalled();
    expect(schedule).toHaveBeenCalledTimes(30);

    const dates = schedule.mock.calls.map(([req]) => req.trigger.date as Date);
    expect(dates[0]).toEqual(new Date(2026, 9, 15, 8, 0));
    expect(dates[29]).toEqual(new Date(2026, 10, 13, 8, 0));
  });

  it("날짜마다 그날 홈 화면의 첫 명언(오늘의 명언)으로 예약한다", async () => {
    await scheduleUpcoming([{ hour: 8, minute: 0 }], candidates, new Date(2026, 9, 14, 9, 0));

    schedule.mock.calls.forEach(([req]) => {
      const daily = getDailyQuote(candidates, req.trigger.date)!;
      expect(req.content.body).toBe(`"${daily.text}" - ${daily.author}`);
    });
  });

  it("오늘 알림 시각이 아직 안 지났으면 오늘 것도 예약한다", async () => {
    await scheduleUpcoming([{ hour: 21, minute: 30 }], candidates, new Date(2026, 9, 14, 9, 0));
    expect(schedule).toHaveBeenCalledTimes(31);
    expect(schedule.mock.calls[0][0].trigger.date).toEqual(new Date(2026, 9, 14, 21, 30));
  });
});

describe("하루 여러 번 알림", () => {
  beforeEach(() => schedule.mockClear());

  const times = [
    { hour: 21, minute: 0 },
    { hour: 8, minute: 0 },
    { hour: 12, minute: 30 },
  ];

  it("시각마다 예약하고, iOS 예약 한도에 맞춰 기간을 줄인다", async () => {
    await scheduleUpcoming(times, candidates, new Date(2026, 9, 14, 9, 0));

    // 오늘은 12:30·21:00 두 번 + 내일부터 20일 × 3번
    expect(schedule).toHaveBeenCalledTimes(2 + 20 * 3);
    const dates = schedule.mock.calls.map(([req]) => req.trigger.date as Date);
    expect(dates.slice(0, 3)).toEqual([
      new Date(2026, 9, 14, 12, 30),
      new Date(2026, 9, 14, 21, 0),
      new Date(2026, 9, 15, 8, 0),
    ]);
  });

  it("하루 n번째 알림에는 그날 홈 화면의 n번째 명언을 보낸다", async () => {
    await scheduleUpcoming(times, candidates, new Date(2026, 9, 14, 7, 0));

    const ordered = orderQuotesForDay(candidates, new Date(2026, 9, 14));
    const todays = schedule.mock.calls.slice(0, 3).map(([req]) => req.content);
    expect(todays.map((c) => c.data.quoteId)).toEqual([ordered[0].id, ordered[1].id, ordered[2].id]);
    expect(todays[0].title).toBe("🔥 오늘의 명언");
    expect(todays[1].title).not.toBe("🔥 오늘의 명언");
  });

  it("시각은 정렬하고 중복을 없애며 최대 3개만 남긴다", () => {
    expect(
      normalizeTimes([
        { hour: 21, minute: 0 },
        { hour: 8, minute: 0 },
        { hour: 21, minute: 0 },
        { hour: 12, minute: 0 },
        { hour: 23, minute: 0 },
      ]),
    ).toEqual([
      { hour: 8, minute: 0 },
      { hour: 12, minute: 0 },
      { hour: 21, minute: 0 },
    ]);
  });

  it("예약 기간은 하루 한 번이면 30일, 세 번이면 20일이다", () => {
    expect(daysAheadFor(1)).toBe(30);
    expect(daysAheadFor(2)).toBe(30);
    expect(daysAheadFor(3)).toBe(20);
  });
});

describe("알림 데이터", () => {
  beforeEach(() => schedule.mockClear());

  it("오늘의 명언 알림에 그 명언을 담아 알림을 누르면 보여 줄 수 있게 한다", async () => {
    await scheduleUpcoming([{ hour: 8, minute: 0 }], candidates, new Date(2026, 9, 14, 9, 0));

    const [req] = schedule.mock.calls[0];
    const daily = getDailyQuote(candidates, req.trigger.date)!;
    expect(req.content.data).toEqual({ type: "daily", quoteId: daily.id, text: daily.text, author: daily.author });
  });
});

describe("getStreakReminders", () => {
  const morning = new Date(2026, 9, 14, 9, 0);

  it("오늘 아직 점화하지 않았으면 오늘 밤 9시 30분에 알린다", () => {
    const reminders = getStreakReminders({ currentStreak: 5, ignitedToday: false }, morning);
    expect(reminders).toHaveLength(1);
    expect(reminders[0].date).toEqual(new Date(2026, 9, 14, 21, 30));
    expect(reminders[0].body).toContain("5일째");
  });

  it("오늘 점화했으면 내일 밤에 알린다", () => {
    const reminders = getStreakReminders({ currentStreak: 6, ignitedToday: true }, morning);
    expect(reminders.map((r) => r.date)).toEqual([new Date(2026, 9, 15, 21, 30)]);
  });

  it("알림 시각이 이미 지났으면 오늘 것은 보내지 않는다", () => {
    expect(getStreakReminders({ currentStreak: 5, ignitedToday: false }, new Date(2026, 9, 14, 22, 0))).toEqual([]);
  });

  it("이어 온 불씨가 없으면 보내지 않는다", () => {
    expect(getStreakReminders({ currentStreak: 0, ignitedToday: false }, morning)).toEqual([]);
  });

  it("스트릭 정보를 넘기면 오늘의 명언 알림과 함께 예약한다", async () => {
    schedule.mockClear();
    await scheduleUpcoming([{ hour: 8, minute: 0 }], candidates, morning, { currentStreak: 3, ignitedToday: false });

    expect(schedule).toHaveBeenCalledTimes(31);
    const last = schedule.mock.calls[30][0];
    expect(last.content.data).toEqual({ type: "streak" });
    expect(last.trigger.date).toEqual(new Date(2026, 9, 14, 21, 30));
  });
});
