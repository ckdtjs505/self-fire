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
    muted: "#6E655C",
    border: "rgba(31,27,23,0.09)",
    primary: "#C9461A",
    primarySoft: "rgba(201,70,26,0.10)",
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
  // 글자 크기 단계: display 34 · title 26 · heading 19 · stat 15 · body 15 · label 13 · caption 13 · overline 12 · micro 11
  // 새 화면은 fontSize를 직접 쓰지 말고 이 variant를 쓴다.
  textVariants: {
    defaults: {
      color: "$foreground",
      fontSize: 16,
    },
    // 큰 숫자 (나의 모닥불 일수 등)
    display: {
      color: "$foreground",
      fontSize: 34,
      fontWeight: "900",
      letterSpacing: -0.8,
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
    // 작은 버튼·칩·라벨 글자
    label: {
      color: "$foreground",
      fontSize: 13,
      fontWeight: "700",
    },
    // 통계 칸·배지의 숫자
    stat: {
      color: "$foreground",
      fontSize: 15,
      fontWeight: "800",
    },
    // 아주 작은 보조 글자 (요일, 워터마크 등)
    micro: {
      color: "$muted",
      fontSize: 11,
      fontWeight: "600",
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
