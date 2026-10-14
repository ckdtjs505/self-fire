import { getTheme, Theme, ThemeId } from "@/themes";
import { create } from "zustand";

interface ThemeStore {
  currentThemeId: ThemeId;
  currentTheme: Theme;
  updateThemeId: (themeId: ThemeId) => void;
}

export const useThemeStore = create<ThemeStore>((set) => ({
  currentThemeId: "dark",
  currentTheme: getTheme("dark"),
  updateThemeId: (themeId) =>
    set({
      currentThemeId: themeId,
      currentTheme: getTheme(themeId),
    }),
}));
