// ─────────────────────────────────────────────────────────────
// card-backgrounds.ts
// 명언 카드 배경 이미지. 'none'이면 테마의 면 색을 그대로 쓴다.
//   - tone: 이미지 밝기. 'dark'면 흰 글씨, 'light'면 어두운 글씨로 그린다.
// ─────────────────────────────────────────────────────────────

import { ImageSourcePropType } from "react-native";

export type CardBackgroundId =
  | "none"
  | "sunset"
  | "ocean"
  | "forest"
  | "dawn"
  | "night"
  | "ember"
  | "paper"
  | "aurora";

export type CardBackground = {
  id: CardBackgroundId;
  label: string;
  source?: ImageSourcePropType;
  tone?: "dark" | "light";
};

export const CARD_BACKGROUNDS: CardBackground[] = [
  { id: "none", label: "없음" },
  { id: "sunset", label: "노을", source: require("@/assets/images/card-bg/sunset.jpg"), tone: "dark" },
  { id: "ember", label: "불씨", source: require("@/assets/images/card-bg/ember.jpg"), tone: "dark" },
  { id: "ocean", label: "바다", source: require("@/assets/images/card-bg/ocean.jpg"), tone: "dark" },
  { id: "forest", label: "숲", source: require("@/assets/images/card-bg/forest.jpg"), tone: "dark" },
  { id: "night", label: "밤하늘", source: require("@/assets/images/card-bg/night.jpg"), tone: "dark" },
  { id: "aurora", label: "오로라", source: require("@/assets/images/card-bg/aurora.jpg"), tone: "dark" },
  { id: "dawn", label: "새벽", source: require("@/assets/images/card-bg/dawn.jpg"), tone: "light" },
  { id: "paper", label: "종이", source: require("@/assets/images/card-bg/paper.jpg"), tone: "light" },
];

export const getCardBackground = (id: CardBackgroundId): CardBackground =>
  CARD_BACKGROUNDS.find((bg) => bg.id === id) ?? CARD_BACKGROUNDS[0];

// 배경 위 글씨 색. 이미지 위에서도 읽히도록 테마 색 대신 흰색/먹색을 쓴다.
export const CARD_TEXT_COLORS = {
  dark: { foreground: "#FFFFFF", muted: "rgba(255,255,255,0.75)", scrim: "rgba(0,0,0,0.18)" },
  light: { foreground: "#2A2420", muted: "rgba(42,36,32,0.65)", scrim: "rgba(255,255,255,0.12)" },
} as const;
