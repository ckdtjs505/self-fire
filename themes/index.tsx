import light, { Theme } from "./light";
import dark from "./dark";
type themeMeta = {
  id: themeId;
  name: string;
  theme: Theme;
};

export type themeId = "light" | "dark";

export const themelist: themeMeta[] = [
  {
    id: "light",
    name: "light",
    theme: light,
  },
  {
    id: "dark",
    name: "dark",
    theme: dark,
  },
];

export const getCurrentTheme = (themeId: themeId) => {
  const currentThemeIdx = themelist.findIndex((theme, number) => {
    return theme.id === themeId;
  });

  return themelist[currentThemeIdx].theme;
};

export type { Theme };
