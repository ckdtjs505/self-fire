import { Quote } from "@/models";
import { toDateString } from "@/utils/date";
import { Deed, normalizeDeedText, upsertDeed } from "@/utils/deed";
import { stateStorage } from "@/utils/storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type PersistedDeed = {
  // 날짜별 실천 한 줄 (오래된 순)
  deeds: Deed[];
};

interface DeedState extends PersistedDeed {
  // 오늘의 한 줄을 남기거나 고친다. 다듬은 뒤 비어 있으면 저장하지 않고 null.
  saveToday: (quote: Pick<Quote, "id" | "text" | "author">, text: string) => Deed | null;
}

// 문장대로 한 일 한 줄 관리. 규칙은 utils/deed.ts 참고.
export const useDeedStore = create<DeedState>()(
  persist<DeedState, [], [], PersistedDeed>(
    (set, get) => ({
      deeds: [],

      saveToday: (quote, text) => {
        const line = normalizeDeedText(text);
        if (!line) return null;
        const deed: Deed = {
          date: toDateString(),
          text: line,
          quote: { id: quote.id, text: quote.text, author: quote.author },
        };
        set({ deeds: upsertDeed(get().deeds, deed) });
        return deed;
      },
    }),
    {
      name: "deed-storage",
      storage: createJSONStorage(() => stateStorage),
      partialize: (state) => ({ deeds: state.deeds }),
    }
  )
);

// 오늘 남긴 한 줄 (없으면 null)
export const useTodayDeed = () => {
  const today = toDateString();
  return useDeedStore((s) => s.deeds.find((d) => d.date === today) ?? null);
};
