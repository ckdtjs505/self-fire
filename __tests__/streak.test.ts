jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

import { useStreakStore } from "@/store/streak";
import { toDateString } from "@/utils/date";
import {
  daysBetween,
  igniteStreak,
  isUnlocked,
  nextMilestone,
  reconcileStreak,
  StreakRecord,
  weekKey,
} from "@/utils/streak";

// 2026-10-21은 수요일 (그 주 월요일 = 2026-10-19)
const TODAY = "2026-10-21";

const record = (r: Partial<StreakRecord>): StreakRecord => ({
  currentStreak: 3,
  longestStreak: 3,
  lastStreakDate: "2026-10-20",
  freezeUsedWeek: null,
  ...r,
});

describe("날짜 계산", () => {
  it("daysBetween", () => {
    expect(daysBetween("2026-10-20", TODAY)).toBe(1);
    expect(daysBetween("2026-09-30", "2026-10-01")).toBe(1);
    expect(daysBetween("2026-12-31", "2027-01-02")).toBe(2);
  });

  it("weekKey는 그 주 월요일", () => {
    expect(weekKey("2026-10-19")).toBe("2026-10-19"); // 월
    expect(weekKey(TODAY)).toBe("2026-10-19"); // 수
    expect(weekKey("2026-10-25")).toBe("2026-10-19"); // 일
    expect(weekKey("2026-10-26")).toBe("2026-10-26"); // 다음 월
  });
});

describe("igniteStreak — 점화해야 +1", () => {
  it("어제 점화했으면 1 증가", () => {
    const { record: r } = igniteStreak(record({}), TODAY);
    expect(r).toMatchObject({ currentStreak: 4, longestStreak: 4, lastStreakDate: TODAY });
  });

  it("오늘 이미 점화했으면 그대로", () => {
    const { record: r } = igniteStreak(record({ lastStreakDate: TODAY, longestStreak: 5 }), TODAY);
    expect(r).toMatchObject({ currentStreak: 3, longestStreak: 5 });
  });

  it("처음 점화하면 1", () => {
    const { record: r } = igniteStreak(record({ currentStreak: 0, longestStreak: 0, lastStreakDate: null }), TODAY);
    expect(r).toMatchObject({ currentStreak: 1, longestStreak: 1, lastStreakDate: TODAY });
  });

  it("이틀 이상 건너뛰면 1부터 다시 (최장 기록은 유지)", () => {
    const { record: r } = igniteStreak(record({ currentStreak: 7, longestStreak: 7, lastStreakDate: "2026-10-18" }), TODAY);
    expect(r).toMatchObject({ currentStreak: 1, longestStreak: 7 });
  });
});

describe("불씨 지키기 (주 1회)", () => {
  it("어제 하루를 빠뜨려도 이번 주에 안 썼으면 지켜 준다 (빠진 날은 세지 않음)", () => {
    const { record: r, frozenDate } = reconcileStreak(record({ lastStreakDate: "2026-10-19" }), TODAY);
    expect(frozenDate).toBe("2026-10-20");
    expect(r).toMatchObject({ currentStreak: 3, lastStreakDate: "2026-10-20", freezeUsedWeek: "2026-10-19" });

    const { record: ignited } = igniteStreak(r, TODAY);
    expect(ignited.currentStreak).toBe(4);
  });

  it("같은 주에 두 번째로 빠뜨리면 꺼진다", () => {
    const { record: r, frozenDate } = reconcileStreak(
      record({ lastStreakDate: "2026-10-19", freezeUsedWeek: "2026-10-19" }),
      TODAY
    );
    expect(frozenDate).toBeNull();
    expect(r.currentStreak).toBe(0);
  });

  it("지난주에 썼으면 이번 주에 다시 쓸 수 있다", () => {
    const { frozenDate } = reconcileStreak(
      record({ lastStreakDate: "2026-10-19", freezeUsedWeek: "2026-10-12" }),
      TODAY
    );
    expect(frozenDate).toBe("2026-10-20");
  });

  it("빠진 날(일요일)의 주를 기준으로 센다", () => {
    // 일요일 2026-10-25를 빠뜨리고 월요일에 열면 지난주(10-19) 횟수를 쓴다
    const { record: r, frozenDate } = reconcileStreak(record({ lastStreakDate: "2026-10-24" }), "2026-10-26");
    expect(frozenDate).toBe("2026-10-25");
    expect(r.freezeUsedWeek).toBe("2026-10-19");
  });

  it("이틀을 빠뜨리면 지킬 수 없다", () => {
    const { record: r, frozenDate } = reconcileStreak(record({ lastStreakDate: "2026-10-18" }), TODAY);
    expect(frozenDate).toBeNull();
    expect(r.currentStreak).toBe(0);
  });

  it("이미 꺼진 스트릭에는 쓰지 않는다", () => {
    const { frozenDate } = reconcileStreak(record({ currentStreak: 0, lastStreakDate: "2026-10-19" }), TODAY);
    expect(frozenDate).toBeNull();
  });
});

describe("마일스톤 보상", () => {
  it("7/30/100일에 처음 닿으면 알려 준다", () => {
    for (const m of [7, 30, 100]) {
      const { unlockedMilestone } = igniteStreak(record({ currentStreak: m - 1, longestStreak: m - 1 }), TODAY);
      expect(unlockedMilestone).toBe(m);
    }
  });

  it("이미 열린 마일스톤에 다시 닿으면 알리지 않는다", () => {
    const { unlockedMilestone } = igniteStreak(record({ currentStreak: 6, longestStreak: 12 }), TODAY);
    expect(unlockedMilestone).toBeNull();
  });

  it("마일스톤이 아닌 날은 null", () => {
    expect(igniteStreak(record({}), TODAY).unlockedMilestone).toBeNull();
  });

  it("해금은 최장 기록 기준", () => {
    expect(isUnlocked(undefined, 0)).toBe(true);
    expect(isUnlocked(7, 6)).toBe(false);
    expect(isUnlocked(7, 7)).toBe(true);
  });

  it("다음 마일스톤까지 남은 일수", () => {
    expect(nextMilestone(3)).toEqual({ milestone: 7, daysLeft: 4 });
    expect(nextMilestone(7)).toEqual({ milestone: 30, daysLeft: 23 });
    expect(nextMilestone(100)).toBeNull();
  });
});

describe("useStreakStore", () => {
  const daysAgo = (n: number) => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return toDateString(d);
  };

  it("앱을 여는 것(reconcile)만으로는 늘지 않는다", () => {
    useStreakStore.setState({ currentStreak: 3, longestStreak: 3, lastStreakDate: daysAgo(1), freezeUsedWeek: null });
    useStreakStore.getState().reconcile();
    expect(useStreakStore.getState()).toMatchObject({ currentStreak: 3, lastStreakDate: daysAgo(1) });
  });

  it("점화(ignite)하면 1 증가", () => {
    useStreakStore.setState({ currentStreak: 6, longestStreak: 6, lastStreakDate: daysAgo(1), freezeUsedWeek: null });
    expect(useStreakStore.getState().ignite()).toBe(7);
    expect(useStreakStore.getState()).toMatchObject({ currentStreak: 7, longestStreak: 7, lastStreakDate: daysAgo(0) });
  });

  it("v0(앱 열기 기준) 저장값을 이어받는다", async () => {
    const migrate = useStreakStore.persist.getOptions().migrate!;
    const migrated = await migrate({ currentStreak: 5, longestStreak: 9, lastOpenDate: "2026-10-20" }, 0);
    expect(migrated).toEqual({ currentStreak: 5, longestStreak: 9, lastStreakDate: "2026-10-20", freezeUsedWeek: null });
  });
});
