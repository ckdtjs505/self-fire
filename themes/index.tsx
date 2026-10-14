import light, { Theme } from "./light";
import dark from "./dark";
import nature from "./nature";
import ocean from "./ocean";
import sunset from "./sunset";
import sepia from "./sepia";

export type ThemeId = "light" | "dark" | "nature" | "ocean" | "sunset" | "sepia";

export type ThemeMeta = {
  id: ThemeId;
  name: string;
  theme: Theme;
};

export const themeList: ThemeMeta[] = [
  { id: "light", name: "Light", theme: light },
  { id: "dark", name: "Dark", theme: dark },
  { id: "nature", name: "Nature", theme: nature },
  { id: "ocean", name: "Ocean", theme: ocean },
  { id: "sunset", name: "Sunset", theme: sunset },
  { id: "sepia", name: "Sepia", theme: sepia },
];

export const getTheme = (themeId: ThemeId): Theme =>
  themeList.find((meta) => meta.id === themeId)!.theme;

export type { Theme };
