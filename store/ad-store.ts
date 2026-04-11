import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
