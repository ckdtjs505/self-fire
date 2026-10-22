jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

import { getDailyQuote } from "@/data/daily-quote";
import {
  buildWidgetSnapshot,
  loadWidgetSnapshot,
  resolveWidgetView,
  saveWidgetSnapshot,
  WIDGET_DAYS_AHEAD,
  WidgetSnapshot,
} from "@/data/widget-snapshot";
import { Quote } from "@/models";

const candidates: Quote[] = Array.from({ length: 100 }, (_, i) => ({
  id: String(i),
  text: `명언 ${i}`,
  author: "작가",
}));

const now = new Date(2026, 9, 18, 9, 0);

const snapshotWith = (flame: Partial<WidgetSnapshot>): WidgetSnapshot => ({
  ...buildWidgetSnapshot({ candidates, currentStreak: 3, lastStreakDate: null, freezeUsedWeek: null, lastIgnitedDate: null, now }),
  ...flame,
});

describe("buildWidgetSnapshot", () => {
  it("오늘부터 날짜별로 그날 홈 화면의 첫 명언(오늘의 명언)을 담는다", () => {
    const { quotes } = buildWidgetSnapshot({
      candidates,
      currentStreak: 3,
      lastStreakDate: "2026-10-18",
      freezeUsedWeek: null,
      lastIgnitedDate: "2026-10-18",
      now,
    });

    expect(quotes).toHaveLength(WIDGET_DAYS_AHEAD);
    expect(quotes[0].date).toBe("2026-10-18");
    expect(quotes[WIDGET_DAYS_AHEAD - 1].date).toBe("2026-10-31");
    quotes.forEach((q, day) => {
      const daily = getDailyQuote(candidates, new Date(2026, 9, 18 + day))!;
      expect(q).toEqual({ date: q.date, text: daily.text, author: daily.author });
    });
  });

  it("오늘 고른 문장이 있으면 오늘은 그 문장을 '오늘 따르는 문장'으로 담고, 내일부터는 오늘의 명언을 담는다", () => {
    const todayPick: Quote = { id: "picked", text: "오늘 고른 문장", author: "나" };
    const snapshot = buildWidgetSnapshot({
      candidates,
      todayPick,
      currentStreak: 3,
      lastStreakDate: null,
      freezeUsedWeek: null,
      lastIgnitedDate: null,
      now,
    });

    expect(snapshot.quotes[0]).toEqual({ date: "2026-10-18", text: todayPick.text, author: todayPick.author, picked: true });
    expect(snapshot.quotes[1].picked).toBeUndefined();
    expect(resolveWidgetView(snapshot, now).quote).toEqual({ text: todayPick.text, author: todayPick.author, picked: true });
    // 오래 앱을 열지 않아 지난날의 문장을 보여 줄 때는 '오늘 따르는 문장'이라 하지 않는다
    const stale = { ...snapshot, quotes: [snapshot.quotes[0]] };
    expect(resolveWidgetView(stale, new Date(2026, 9, 20)).quote?.picked).toBe(false);
  });

  it("후보 명언이 없으면 명언 없이 만든다", () => {
    const snapshot = buildWidgetSnapshot({
      candidates: [],
      currentStreak: 0,
      lastStreakDate: null,
      freezeUsedWeek: null,
      lastIgnitedDate: null,
      now,
    });
    expect(snapshot.quotes).toEqual([]);
    expect(resolveWidgetView(snapshot, now).quote).toBeNull();
  });
});

describe("resolveWidgetView", () => {
  it("앱을 열지 않아도 날짜가 바뀌면 그날의 명언을 고른다", () => {
    const snapshot = snapshotWith({});
    const nextDay = new Date(2026, 9, 19, 0, 1);
    expect(resolveWidgetView(snapshot, nextDay).quote?.text).toBe(snapshot.quotes[1].text);
  });

  it("저장된 기간이 지나면 마지막 명언을 계속 보여 준다", () => {
    const snapshot = snapshotWith({});
    const later = new Date(2026, 11, 1);
    expect(resolveWidgetView(snapshot, later).quote?.text).toBe(snapshot.quotes[WIDGET_DAYS_AHEAD - 1].text);
  });

  it("오늘 불씨를 지폈으면 lit", () => {
    const view = resolveWidgetView(snapshotWith({ lastStreakDate: "2026-10-18", lastIgnitedDate: "2026-10-18" }), now);
    expect(view).toMatchObject({ flame: "lit", streak: 3 });
  });

  it("어제까지 이어 왔고 오늘은 아직이면 waiting", () => {
    const view = resolveWidgetView(snapshotWith({ lastStreakDate: "2026-10-17", lastIgnitedDate: "2026-10-17" }), now);
    expect(view).toMatchObject({ flame: "waiting", streak: 3 });
  });

  it("어제 하루를 빠뜨렸어도 이번 주 불씨 지키기가 남았으면 waiting", () => {
    const view = resolveWidgetView(snapshotWith({ lastStreakDate: "2026-10-16", lastIgnitedDate: "2026-10-16" }), now);
    expect(view).toMatchObject({ flame: "waiting", streak: 3 });
  });

  it("어제 하루를 빠뜨렸고 그 주 불씨 지키기를 이미 썼으면 out", () => {
    // 2026-10-17(토)은 2026-10-12(월)로 시작하는 주
    const view = resolveWidgetView(
      snapshotWith({ lastStreakDate: "2026-10-16", freezeUsedWeek: "2026-10-12", lastIgnitedDate: "2026-10-16" }),
      now
    );
    expect(view).toMatchObject({ flame: "out", streak: 0 });
  });

  it("이틀 이상 건너뛰었으면 꺼진(out) 상태로 연속 일수 0", () => {
    const view = resolveWidgetView(snapshotWith({ lastStreakDate: "2026-10-15", lastIgnitedDate: "2026-10-15" }), now);
    expect(view).toMatchObject({ flame: "out", streak: 0 });
  });

  it("예전 버전 스냅샷(lastOpenDate)도 읽는다", () => {
    const legacy = { ...snapshotWith({}), lastStreakDate: undefined, lastOpenDate: "2026-10-17" } as unknown as WidgetSnapshot;
    expect(resolveWidgetView(legacy, now)).toMatchObject({ flame: "waiting", streak: 3 });
  });

  it("스냅샷이 없으면(앱을 아직 열지 않음) 명언 없이 꺼진 상태", () => {
    expect(resolveWidgetView(null, now)).toEqual({ quote: null, flame: "out", streak: 0 });
  });
});

describe("save/loadWidgetSnapshot", () => {
  it("저장한 스냅샷을 그대로 읽는다", async () => {
    const snapshot = snapshotWith({ lastStreakDate: "2026-10-18" });
    await saveWidgetSnapshot(snapshot);
    expect(await loadWidgetSnapshot()).toEqual(snapshot);
  });
});
