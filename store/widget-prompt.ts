import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface WidgetPromptStore {
  // 위젯 추가를 이미 제안한 연속 일수 (같은 일수에서는 다시 묻지 않는다)
  promptedStreaks: number[];
  markPrompted: (streak: number) => void;
}

// 점화 완료 시트의 홈 화면 위젯 추가 제안 기록 (widgets/widget-pin.ts 참고)
export const useWidgetPromptStore = create<WidgetPromptStore>()(
  persist(
    (set) => ({
      promptedStreaks: [],
      markPrompted: (streak) =>
        set((state) =>
          state.promptedStreaks.includes(streak) ? state : { promptedStreaks: [...state.promptedStreaks, streak] },
        ),
    }),
    {
      name: "widget-prompt-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ promptedStreaks: state.promptedStreaks }),
    }
  )
);
