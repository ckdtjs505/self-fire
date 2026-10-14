import { toDateString } from "@/utils/date";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface StreakState {
  currentStreak: number;
  longestStreak: number;
  lastOpenDate: string | null; // "YYYY-MM-DD"
  checkAndUpdateStreak: () => void;
}

const getYesterdayString = () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return toDateString(yesterday);
};

// 연속 방문 일수(스트릭) 관리
export const useStreakStore = create<StreakState>()(
  persist(
    (set, get) => ({
      currentStreak: 0,
      longestStreak: 0,
      lastOpenDate: null,

      // 오늘 처음 열었으면 스트릭을 갱신한다.
      // 어제도 열었으면 +1, 하루 이상 건너뛰었으면 1부터 다시 시작한다.
      checkAndUpdateStreak: () => {
        const today = toDateString();
        const { lastOpenDate, currentStreak, longestStreak } = get();
        if (lastOpenDate === today) return;

        const newStreak = lastOpenDate === getYesterdayString() ? currentStreak + 1 : 1;
        set({
          currentStreak: newStreak,
          longestStreak: Math.max(longestStreak, newStreak),
          lastOpenDate: today,
        });
      },
    }),
    {
      name: "streak-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
