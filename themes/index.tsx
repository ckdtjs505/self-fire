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
  { id: "light", name: "라이트", theme: light },
  { id: "dark", name: "다크", theme: dark },
  { id: "nature", name: "숲", theme: nature },
  { id: "ocean", name: "바다", theme: ocean },
  { id: "sunset", name: "노을", theme: sunset },
  { id: "sepia", name: "세피아", theme: sepia },
];

export const getTheme = (themeId: ThemeId): Theme =>
  themeList.find((meta) => meta.id === themeId)!.theme;

export type { Theme };
