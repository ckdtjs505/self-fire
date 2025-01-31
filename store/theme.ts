import { getCurrentTheme, themeId } from "@/themes";
import { Theme } from "@/themes/dark";
import { create } from "zustand";

interface ThemeStore {
  currentThemeId : themeId,
  currentTheme : Theme,
  updateThemeId : (state : themeId) => void
}

export const useThemeStore = create<ThemeStore>((set) => ({
  currentThemeId: "dark",
  currentTheme: getCurrentTheme("dark"),
  updateThemeId: (state: themeId) =>
    set({
      currentThemeId: state,
      currentTheme: getCurrentTheme(state),
    }),
}));
