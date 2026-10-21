import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { stateStorage } from "@/utils/storage";

interface AdState {
  isAdFree: boolean;
  setAdFree: (isAdFree: boolean) => void;
}

export const useAdStore = create<AdState>()(
  persist(
    (set) => ({
      isAdFree: false,
      setAdFree: (isAdFree) => set({ isAdFree }),
    }),
    {
      name: "ad-storage",
      storage: createJSONStorage(() => stateStorage),
    }
  )
);
