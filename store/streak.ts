import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { toLocalDateString } from "@/utils/date";

interface StreakState {
  currentStreak: number;
  longestStreak: number;
  lastOpenDate: string | null; // "YYYY-MM-DD"
  checkAndUpdateStreak: () => void;
}

const getTodayString = () => toLocalDateString();

const getYesterdayString = () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return toLocalDateString(yesterday);
};

export const useStreakStore = create<StreakState>()(
  persist(
    (set, get) => ({
      currentStreak: 0,
      longestStreak: 0,
      lastOpenDate: null,

      checkAndUpdateStreak: () => {
        const today = getTodayString();
        const yesterday = getYesterdayString();
        const { lastOpenDate, currentStreak, longestStreak } = get();

        if (lastOpenDate === today) {
          return;
        }

        let newStreak: number;

        if (lastOpenDate === yesterday) {
          newStreak = currentStreak + 1;
        } else {
          newStreak = 1;
        }

        const newLongest = Math.max(longestStreak, newStreak);

        set({
          currentStreak: newStreak,
          longestStreak: newLongest,
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
