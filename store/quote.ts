import { create } from "zustand";
import { persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface FavoritesQuoteStore {
  favorites: string[];
  addFavorite: (id: string) => void;
  removeFavorite: (id: string) => void;
}

// 즐겨찾기한 명언 리스트 상태 관리
export const useFavoriteQuoteStore = create<FavoritesQuoteStore>()(
  persist(
    (set) => ({
      favorites: [], // 즐겨찾기 리스트
      addFavorite: (id: string) =>
        set((state) =>
          state.favorites.some((_id) => _id === id)
            ? state
            : { favorites: [...state.favorites,id] },
        ),
      removeFavorite: (id: string) =>
        set((state) => ({
          favorites: state.favorites.filter((_id) => _id !== id),
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
