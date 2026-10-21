import { getTheme, Theme, ThemeId, themeList } from "@/themes";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { stateStorage } from "@/utils/storage";

interface ThemeStore {
  currentThemeId: ThemeId;
  currentTheme: Theme;
  updateThemeId: (themeId: ThemeId) => void;
}

const DEFAULT_THEME_ID: ThemeId = "dark";

const isThemeId = (value: unknown): value is ThemeId => themeList.some((meta) => meta.id === value);

// 선택한 테마. 테마 id만 저장하고, 앱 시작 시 id로 테마 객체를 다시 만든다.
export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      currentThemeId: DEFAULT_THEME_ID,
      currentTheme: getTheme(DEFAULT_THEME_ID),
      updateThemeId: (themeId) =>
        set({
          currentThemeId: themeId,
          currentTheme: getTheme(themeId),
        }),
    }),
    {
      name: "theme-storage",
      storage: createJSONStorage(() => stateStorage),
      partialize: (state) => ({ currentThemeId: state.currentThemeId }),
      merge: (persisted, current) => {
        const savedId = (persisted as Partial<ThemeStore> | undefined)?.currentThemeId;
        const themeId = isThemeId(savedId) ? savedId : current.currentThemeId;
        return { ...current, currentThemeId: themeId, currentTheme: getTheme(themeId) };
      },
    }
  )
);
