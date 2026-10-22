import { Quote } from "@/models";
import { toDateString } from "@/utils/date";
import { Deed, normalizeDeedText, upsertDeed } from "@/utils/deed";
import { stateStorage } from "@/utils/storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type DeedQuote = Pick<Quote, "id" | "text" | "author">;

// 그날 따라 살기로 고른 문장. 한 줄을 남기기 전까지는 바꿀 수 있다.
export type QuotePick = { date: string; quote: DeedQuote };

type PersistedDeed = {
  // 날짜별 실천 한 줄 (오래된 순)
  deeds: Deed[];
  // 가장 최근에 고른 오늘의 문장 (날짜가 지나면 쓰지 않는다)
  pick: QuotePick | null;
};

interface DeedState extends PersistedDeed {
  // 오늘의 한 줄을 남기거나 고친다. 다듬은 뒤 비어 있으면 저장하지 않고 null.
  saveToday: (quote: DeedQuote, text: string) => Deed | null;
  // 오늘의 문장을 정하거나 바꾼다. 오늘의 한 줄을 이미 남겼으면 그 문장으로 굳어 있어 false.
  pickToday: (quote: DeedQuote) => boolean;
}

// 문장대로 한 일 한 줄 관리. 규칙은 utils/deed.ts 참고.
export const useDeedStore = create<DeedState>()(
  persist<DeedState, [], [], PersistedDeed>(
    (set, get) => ({
      deeds: [],
      pick: null,

      pickToday: (quote) => {
        const today = toDateString();
        if (get().deeds.some((d) => d.date === today)) return false;
        set({ pick: { date: today, quote: { id: quote.id, text: quote.text, author: quote.author } } });
        return true;
      },

      saveToday: (quote, text) => {
        const line = normalizeDeedText(text);
        if (!line) return null;
        const deed: Deed = {
          date: toDateString(),
          text: line,
          quote: { id: quote.id, text: quote.text, author: quote.author },
        };
        // 한 줄이 따른 문장이 곧 오늘 고른 문장이다. (한 줄을 남긴 뒤 문장을 바꿔도 둘이 어긋나지 않게)
        set({ deeds: upsertDeed(get().deeds, deed), pick: { date: deed.date, quote: deed.quote } });
        return deed;
      },
    }),
    {
      name: "deed-storage",
      storage: createJSONStorage(() => stateStorage),
      partialize: (state) => ({ deeds: state.deeds, pick: state.pick }),
    }
  )
);

// 오늘 남긴 한 줄 (없으면 null)
export const useTodayDeed = () => {
  const today = toDateString();
  return useDeedStore((s) => s.deeds.find((d) => d.date === today) ?? null);
};

// 오늘의 문장: 한 줄을 남겼으면 그 한 줄이 따른 문장, 아니면 오늘 고른 문장 (둘 다 없으면 null)
export const selectTodayQuote = (state: PersistedDeed, today: string = toDateString()): DeedQuote | null =>
  state.deeds.find((d) => d.date === today)?.quote ?? (state.pick?.date === today ? state.pick.quote : null);

export const useTodayQuote = (): DeedQuote | null => {
  const today = toDateString();
  return useDeedStore((s) => selectTodayQuote(s, today));
};
