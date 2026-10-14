jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

import { useStreakStore } from "@/store/streak";
import { toDateString } from "@/utils/date";

const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return toDateString(d);
};

describe("checkAndUpdateStreak", () => {
  it("어제 열었으면 1 증가", () => {
    useStreakStore.setState({ currentStreak: 3, longestStreak: 3, lastOpenDate: daysAgo(1) });
    useStreakStore.getState().checkAndUpdateStreak();
    expect(useStreakStore.getState()).toMatchObject({ currentStreak: 4, longestStreak: 4, lastOpenDate: daysAgo(0) });
  });

  it("오늘 이미 열었으면 그대로", () => {
    useStreakStore.setState({ currentStreak: 3, longestStreak: 5, lastOpenDate: daysAgo(0) });
    useStreakStore.getState().checkAndUpdateStreak();
    expect(useStreakStore.getState()).toMatchObject({ currentStreak: 3, longestStreak: 5 });
  });

  it("하루 이상 건너뛰면 1부터 다시 (최장 기록은 유지)", () => {
    useStreakStore.setState({ currentStreak: 7, longestStreak: 7, lastOpenDate: daysAgo(2) });
    useStreakStore.getState().checkAndUpdateStreak();
    expect(useStreakStore.getState()).toMatchObject({ currentStreak: 1, longestStreak: 7 });
  });
});
