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

import { getDailyQuote } from "@/data/daily-quote";
import { Quote } from "@/models";
import * as Notifications from "expo-notifications";
import { scheduleUpcoming } from "@/store/notification";

const candidates: Quote[] = Array.from({ length: 100 }, (_, i) => ({
  id: String(i),
  text: `명언 ${i}`,
  author: "작가",
}));

const schedule = Notifications.scheduleNotificationAsync as jest.Mock;

describe("scheduleUpcoming", () => {
  beforeEach(() => schedule.mockClear());

  it("오늘 알림 시각이 지났으면 내일부터 30일치를 예약한다", async () => {
    await scheduleUpcoming(8, 0, candidates, new Date(2026, 9, 14, 9, 0));

    expect(Notifications.cancelAllScheduledNotificationsAsync).toHaveBeenCalled();
    expect(schedule).toHaveBeenCalledTimes(30);

    const dates = schedule.mock.calls.map(([req]) => req.trigger.date as Date);
    expect(dates[0]).toEqual(new Date(2026, 9, 15, 8, 0));
    expect(dates[29]).toEqual(new Date(2026, 10, 13, 8, 0));
  });

  it("날짜마다 그날 홈 화면의 첫 명언(오늘의 명언)으로 예약한다", async () => {
    await scheduleUpcoming(8, 0, candidates, new Date(2026, 9, 14, 9, 0));

    schedule.mock.calls.forEach(([req]) => {
      const daily = getDailyQuote(candidates, req.trigger.date)!;
      expect(req.content.body).toBe(`"${daily.text}" - ${daily.author}`);
    });
  });

  it("오늘 알림 시각이 아직 안 지났으면 오늘 것도 예약한다", async () => {
    await scheduleUpcoming(21, 30, candidates, new Date(2026, 9, 14, 9, 0));
    expect(schedule).toHaveBeenCalledTimes(31);
    expect(schedule.mock.calls[0][0].trigger.date).toEqual(new Date(2026, 9, 14, 21, 30));
  });
});
