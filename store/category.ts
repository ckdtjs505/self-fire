import { CATEGORIES, CategoryId } from "@/data/quote-categories";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface CategoryStore {
  // null이면 전체
  currentCategoryId: CategoryId | null;
  updateCategoryId: (id: CategoryId | null) => void;
}

const isCategoryId = (value: unknown): value is CategoryId => CATEGORIES.some((c) => c.id === value);

// 메인 화면에서 고른 명언 카테고리
export const useCategoryStore = create<CategoryStore>()(
  persist(
    (set) => ({
      currentCategoryId: null,
      updateCategoryId: (id) => set({ currentCategoryId: id }),
    }),
    {
      name: "category-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ currentCategoryId: state.currentCategoryId }),
      merge: (persisted, current) => {
        const savedId = (persisted as Partial<CategoryStore> | undefined)?.currentCategoryId;
        return { ...current, currentCategoryId: isCategoryId(savedId) ? savedId : null };
      },
    }
  )
);
