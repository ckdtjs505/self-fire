import { CARD_BACKGROUNDS, CardBackgroundId } from "@/data/card-backgrounds";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface CardBackgroundStore {
  currentBackgroundId: CardBackgroundId;
  updateBackgroundId: (id: CardBackgroundId) => void;
}

const isCardBackgroundId = (value: unknown): value is CardBackgroundId =>
  CARD_BACKGROUNDS.some((bg) => bg.id === value);

// 명언 카드 배경 이미지
export const useCardBackgroundStore = create<CardBackgroundStore>()(
  persist(
    (set) => ({
      currentBackgroundId: "none",
      updateBackgroundId: (id) => set({ currentBackgroundId: id }),
    }),
    {
      name: "card-background-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ currentBackgroundId: state.currentBackgroundId }),
      merge: (persisted, current) => {
        const savedId = (persisted as Partial<CardBackgroundStore> | undefined)?.currentBackgroundId;
        return { ...current, currentBackgroundId: isCardBackgroundId(savedId) ? savedId : "none" };
      },
    }
  )
);
