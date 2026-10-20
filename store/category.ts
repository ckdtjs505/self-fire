import { CATEGORIES, CategoryId } from "@/data/quote-categories";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface CategoryStore {
  // null이면 전체
  currentCategoryId: CategoryId | null;
  // 관심 주제: '전체'에서 이 주제들의 명언만 보여 준다. (비어 있으면 모든 명언)
  interestIds: CategoryId[];
  // 첫 실행 주제 고르기를 마쳤는지 (건너뛰어도 true)
  hasPickedInterests: boolean;
  updateCategoryId: (id: CategoryId | null) => void;
  setInterests: (ids: CategoryId[]) => void;
}

const isCategoryId = (value: unknown): value is CategoryId => CATEGORIES.some((c) => c.id === value);

// 메인 화면에서 고른 명언 카테고리와 관심 주제
export const useCategoryStore = create<CategoryStore>()(
  persist(
    (set) => ({
      currentCategoryId: null,
      interestIds: [],
      hasPickedInterests: false,
      updateCategoryId: (id) => set({ currentCategoryId: id }),
      setInterests: (ids) => set({ interestIds: ids, hasPickedInterests: true }),
    }),
    {
      name: "category-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        currentCategoryId: state.currentCategoryId,
        interestIds: state.interestIds,
        hasPickedInterests: state.hasPickedInterests,
      }),
      merge: (persisted, current) => {
        const saved = (persisted as Partial<CategoryStore> | undefined) ?? {};
        return {
          ...current,
          currentCategoryId: isCategoryId(saved.currentCategoryId) ? saved.currentCategoryId : null,
          interestIds: Array.isArray(saved.interestIds) ? saved.interestIds.filter(isCategoryId) : [],
          hasPickedInterests: saved.hasPickedInterests === true,
        };
      },
    }
  )
);
