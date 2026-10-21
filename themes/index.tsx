import { useTheme } from "@shopify/restyle";
import light, { Theme } from "./light";
import dark from "./dark";
import nature from "./nature";
import ocean from "./ocean";
import sunset from "./sunset";
import sepia from "./sepia";
import ember from "./ember";
import gold from "./gold";

export type ThemeId = "light" | "dark" | "nature" | "ocean" | "sunset" | "sepia" | "ember" | "gold";

export type ThemeMeta = {
  id: ThemeId;
  name: string;
  theme: Theme;
  unlockAt?: number; // 스트릭 마일스톤 보상: 최장 연속 점화가 이 일수에 닿으면 열린다
};

export const themeList: ThemeMeta[] = [
  { id: "light", name: "라이트", theme: light },
  { id: "dark", name: "다크", theme: dark },
  { id: "nature", name: "숲", theme: nature },
  { id: "ocean", name: "바다", theme: ocean },
  { id: "sunset", name: "노을", theme: sunset },
  { id: "sepia", name: "세피아", theme: sepia },
  { id: "ember", name: "잉걸불", theme: ember, unlockAt: 30 },
  { id: "gold", name: "황금 불꽃", theme: gold, unlockAt: 100 },
];

export const getTheme = (themeId: ThemeId): Theme =>
  themeList.find((meta) => meta.id === themeId)!.theme;

export type { Theme };

/**
 * 지금 테마(색·간격·글자 스타일). 화면과 컴포넌트는 이 훅으로 테마를 읽는다.
 * ThemeProvider 밖에서 그려지는 화면(ErrorBoundary)만 테마 스토어를 직접 읽는다.
 */
export const useAppTheme = () => useTheme<Theme>();
