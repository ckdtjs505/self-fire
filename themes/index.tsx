import light, { Theme } from "./light";
import dark from "./dark";
import nature from "./nature";
import ocean from "./ocean";
import sunset from "./sunset";
import sepia from "./sepia";
type themeMeta = {
  id: themeId;
  name: string;
  theme: Theme;
};

export type themeId = "light" | "dark" | "nature" | "ocean" | "sunset" | "sepia";

export const themelist: themeMeta[] = [
  {
    id: "light",
    name: "Light",
    theme: light,
  },
  {
    id: "dark",
    name: "Dark",
    theme: dark,
  },
  {
    id: "nature",
    name: "Nature",
    theme: nature,
  },
  {
    id: "ocean",
    name: "Ocean",
    theme: ocean,
  },
  {
    id: "sunset",
    name: "Sunset",
    theme: sunset,
  },
  {
    id: "sepia",
    name: "Sepia",
    theme: sepia,
  },
];

export const getCurrentTheme = (themeId: themeId) => {
  const currentThemeIdx = themelist.findIndex((theme, number) => {
    return theme.id === themeId;
  });

  return themelist[currentThemeIdx].theme;
};

export type { Theme };
