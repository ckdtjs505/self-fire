import { Quote } from "@/models";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface FavoritesQuoteStore {
  favorites: string[];
  favoritesData: Quote[];
  customQuotes: Quote[];
  addFavorite: (id: string, quote?: Quote) => void;
  removeFavorite: (id: string) => void;
  addCustomQuote: (text: string, author: string) => void;
  removeCustomQuote: (id: string) => void;
  updateCustomQuote: (id: string, text: string, author: string) => void;
}

// 즐겨찾기한 명언 리스트 및 나만의 명언 상태 관리
export const useFavoriteQuoteStore = create<FavoritesQuoteStore>()(
  persist(
    (set) => ({
      favorites: [], // 즐겨찾기 리스트
      favoritesData: [], // 즐겨찾기 명언 객체 데이터
      customQuotes: [], // 사용자가 만든 명언 리스트
      addFavorite: (id: string, quote?: Quote) =>
        set((state) =>
          state.favorites.some((_id) => _id === id)
            ? state
            : { 
                favorites: [...state.favorites, id],
                favoritesData: quote ? [...(state.favoritesData || []), quote] : (state.favoritesData || [])
              },
        ),
      removeFavorite: (id: string) =>
        set((state) => ({
          favorites: state.favorites.filter((_id) => _id !== id),
          favoritesData: (state.favoritesData || []).filter((q) => q.id !== id),
        })),
      addCustomQuote: (text: string, author: string) =>
        set((state) => ({
          customQuotes: [
            ...state.customQuotes,
            { id: `custom-${Date.now()}`, text, author },
          ],
        })),
      removeCustomQuote: (id: string) =>
        set((state) => ({
          customQuotes: state.customQuotes.filter((q) => q.id !== id),
        })),
      updateCustomQuote: (id: string, text: string, author: string) =>
        set((state) => ({
          customQuotes: state.customQuotes.map((q) =>
            q.id === id ? { ...q, text, author } : q,
          ),
        })),
    }),

    {
      name: "favorites",
      storage: {
        getItem: async (name) => {
          const value = await AsyncStorage.getItem(name);
          return value != null ? JSON.parse(value) : null; // `JSON.parse`로 변환
        },
        setItem: async (name, value) => {
          await AsyncStorage.setItem(name, JSON.stringify(value)); // `JSON.stringify`로 변환
        },
        removeItem: async (name) => {
          await AsyncStorage.removeItem(name);
        },
      },
      //partialize: (state )=> ({ favorites : state.favorites}),
    },
  ),
);
