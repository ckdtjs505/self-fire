import { toDateString } from "@/utils/date";
import { igniteStreak, reconcileStreak, StreakRecord } from "@/utils/streak";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { stateStorage } from "@/utils/storage";

// 나의 모닥불 주간 기록에 쓰는 최근 점화 날짜 수
const IGNITED_DATES_LIMIT = 35;

type PersistedStreak = StreakRecord & {
  // 최근 불씨를 점화한 날짜들 ("YYYY-MM-DD", 오래된 순)
  ignitedDates: string[];
};

interface StreakState extends PersistedStreak {
  // 앱을 열 때 호출. 불씨 지키기로 지킨 날이 있으면 그 날짜를 돌려준다.
  reconcile: () => string | null;
  // 오늘 불씨를 점화했을 때 호출. 새로 해금된 마일스톤이 있으면 돌려준다.
  ignite: () => number | null;
}

const pickRecord = (state: StreakRecord): StreakRecord => ({
  currentStreak: state.currentStreak,
  longestStreak: state.longestStreak,
  lastStreakDate: state.lastStreakDate,
  freezeUsedWeek: state.freezeUsedWeek,
});

// 불씨 점화 일수(스트릭) 관리. 규칙은 utils/streak.ts 참고.
export const useStreakStore = create<StreakState>()(
  persist<StreakState, [], [], PersistedStreak>(
    (set, get) => ({
      currentStreak: 0,
      longestStreak: 0,
      lastStreakDate: null,
      freezeUsedWeek: null,
      ignitedDates: [],

      reconcile: () => {
        const { record, frozenDate } = reconcileStreak(pickRecord(get()));
        set(record);
        return frozenDate;
      },

      ignite: () => {
        const { record, unlockedMilestone } = igniteStreak(pickRecord(get()));
        const today = toDateString();
        const ignitedDates = get().ignitedDates.includes(today)
          ? get().ignitedDates
          : [...get().ignitedDates, today].slice(-IGNITED_DATES_LIMIT);
        set({ ...record, ignitedDates });
        return unlockedMilestone;
      },
    }),
    {
      name: "streak-storage",
      storage: createJSONStorage(() => stateStorage),
      version: 1,
      partialize: (state) => ({ ...pickRecord(state), ignitedDates: state.ignitedDates }),
      // v0: 앱을 연 날(lastOpenDate) 기준 스트릭. 이어 오던 기록은 그대로 넘겨 준다.
      migrate: (persisted, version) => {
        const state = (persisted ?? {}) as Partial<StreakRecord> & { lastOpenDate?: string | null };
        if (version === 0) {
          const record: StreakRecord = {
            currentStreak: state.currentStreak ?? 0,
            longestStreak: state.longestStreak ?? 0,
            lastStreakDate: state.lastOpenDate ?? null,
            freezeUsedWeek: null,
          };
          return { ...record, ignitedDates: [] } as unknown as StreakState;
        }
        return state as StreakState;
      },
    }
  )
);

// 저장된 스트릭을 다 불러온 뒤에 실행한다. (불러오기 전에 계산하면 저장값에 덮인다)
export const whenStreakHydrated = () =>
  new Promise<void>((resolve) => {
    if (useStreakStore.persist.hasHydrated()) return resolve();
    const unsubscribe = useStreakStore.persist.onFinishHydration(() => {
      unsubscribe();
      resolve();
    });
  });
