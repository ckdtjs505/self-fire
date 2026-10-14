import { createTheme } from "@shopify/restyle";

// ─────────────────────────────────────────────────────────────
// 디자인 토큰
// 모든 테마는 같은 색 역할(semantic color)을 갖고, 값만 다르다.
//   background   화면 바탕
//   surface      카드·시트·헤더 버튼처럼 바탕 위에 떠 있는 면
//   surfaceMuted 입력창·칩처럼 면 안에서 한 단계 들어간 영역
//   foreground   본문 글자
//   muted        보조 글자 (설명, 작성자 등)
//   border       얇은 구분선·테두리
//   primary      강조색 (선택 상태, 주요 버튼)
//   primarySoft  강조색을 옅게 깐 배경
//   onPrimary    강조색 위의 글자
//   flame        불씨(즐겨찾기·스트릭) 색
// ─────────────────────────────────────────────────────────────
export type Palette = {
  background: string;
  surface: string;
  surfaceMuted: string;
  foreground: string;
  muted: string;
  border: string;
  primary: string;
  primarySoft: string;
  onPrimary: string;
  flame: string;
};

export const makeColors = (p: Palette) => ({
  white: "#FFFFFF",
  black: "#000000",
  red: "#EF4444",
  transparent: "transparent",

  $background: p.background,
  $surface: p.surface,
  $surfaceMuted: p.surfaceMuted,
  $foreground: p.foreground,
  $muted: p.muted,
  $border: p.border,
  $primary: p.primary,
  $primarySoft: p.primarySoft,
  $onPrimary: p.onPrimary,
  $flame: p.flame,
});

const theme = createTheme({
  spacing: {
    "0": 0,
    xs: 4,
    s: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 48,
    hg: 128,
  },
  breakpoints: {
    phone: 0,
    tablet: 768,
  },
  colors: makeColors({
    background: "#F6F3EE",
    surface: "#FFFFFF",
    surfaceMuted: "#EFEAE3",
    foreground: "#1F1B17",
    muted: "#857C72",
    border: "rgba(31,27,23,0.09)",
    primary: "#E2531B",
    primarySoft: "rgba(226,83,27,0.10)",
    onPrimary: "#FFFFFF",
    flame: "#F0521F",
  }),
  borderRadii: {
    xs: 6,
    sm: 10,
    md: 16,
    lg: 24,
    xl: 32,
    pill: 999,
  },
  textVariants: {
    defaults: {
      color: "$foreground",
      fontSize: 16,
    },
    // 화면 제목
    title: {
      color: "$foreground",
      fontSize: 26,
      fontWeight: "800",
      letterSpacing: -0.6,
    },
    // 시트·섹션 제목
    heading: {
      color: "$foreground",
      fontSize: 19,
      fontWeight: "700",
      letterSpacing: -0.3,
    },
    body: {
      color: "$foreground",
      fontSize: 15,
      fontWeight: "500",
    },
    caption: {
      color: "$muted",
      fontSize: 13,
    },
    // 섹션 머리말 (작은 대문자 느낌)
    overline: {
      color: "$muted",
      fontSize: 12,
      fontWeight: "700",
      letterSpacing: 0.4,
    },
  },
  barStyle: "dark",
});

export type Theme = typeof theme;
export default theme;
