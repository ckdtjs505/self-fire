import { Quote } from "@/models";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { stateStorage } from "@/utils/storage";

interface FavoritesQuoteStore {
  // 즐겨찾기(저장한 문장)한 명언 ID 목록
  favorites: string[];
  // 즐겨찾기한 명언의 내용 (사이드바에서 바로 표시하기 위해 함께 저장)
  favoritesData: Quote[];
  // 사용자가 직접 작성한 명언 목록
  customQuotes: Quote[];
  addFavorite: (id: string, quote?: Quote) => void;
  removeFavorite: (id: string) => void;
  addCustomQuote: (text: string, author: string) => void;
  removeCustomQuote: (id: string) => void;
  updateCustomQuote: (id: string, text: string, author: string) => void;
}

// 즐겨찾기한 명언 및 나만의 명언 상태 관리
export const useFavoriteQuoteStore = create<FavoritesQuoteStore>()(
  persist(
    (set) => ({
      favorites: [],
      favoritesData: [],
      customQuotes: [],

      addFavorite: (id, quote) =>
        set((state) => {
          if (state.favorites.includes(id)) return state;
          const favoritesData = state.favoritesData || [];
          return {
            favorites: [...state.favorites, id],
            favoritesData: quote ? [...favoritesData, quote] : favoritesData,
          };
        }),

      removeFavorite: (id) =>
        set((state) => ({
          favorites: state.favorites.filter((favoriteId) => favoriteId !== id),
          favoritesData: (state.favoritesData || []).filter((q) => q.id !== id),
        })),

      addCustomQuote: (text, author) =>
        set((state) => ({
          customQuotes: [...state.customQuotes, { id: `custom-${Date.now()}`, text, author }],
        })),

      removeCustomQuote: (id) =>
        set((state) => ({
          customQuotes: state.customQuotes.filter((q) => q.id !== id),
        })),

      updateCustomQuote: (id, text, author) =>
        set((state) => ({
          customQuotes: state.customQuotes.map((q) => (q.id === id ? { ...q, text, author } : q)),
        })),
    }),
    {
      name: "favorites",
      storage: createJSONStorage(() => stateStorage),
    }
  )
);
