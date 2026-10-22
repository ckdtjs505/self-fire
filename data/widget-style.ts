// ─────────────────────────────────────────────────────────────
// data/widget-style.ts
// 홈 화면 위젯 꾸미기: 색상, 배경 투명도, 명언 글자 크기, 작가 표시.
// 설정 화면(store/widget-style.ts)에서 고르고, 위젯을 그릴 때(앱 안·헤드리스 작업 모두) 이 키를 읽는다.
// 위젯은 RemoteViews로 그려지므로 색은 테마 객체 대신 hex 값으로 따로 둔다. (themes/*.tsx 와 같은 색)
// ─────────────────────────────────────────────────────────────

import { appStorage } from "@/utils/storage";

// zustand persist 이름과 같아야 한다. (store/widget-style.ts)
export const WIDGET_STYLE_KEY = "widget-style-storage";

type Hex = `#${string}`;

export type WidgetPalette = { background: Hex; foreground: Hex; muted: Hex; flame: Hex; flameSoft: Hex };

export type WidgetPaletteId = "auto" | "light" | "dark" | "sepia" | "nature" | "ocean" | "sunset";

const LIGHT: WidgetPalette = { background: "#FFFFFF", foreground: "#1F1B17", muted: "#857C72", flame: "#F0521F", flameSoft: "#FDEDE6" };
const DARK: WidgetPalette = { background: "#1E1B19", foreground: "#F4EFE9", muted: "#A39A91", flame: "#FF6A2C", flameSoft: "#3A2419" };
const SEPIA: WidgetPalette = { background: "#FBF6EC", foreground: "#3A2A1B", muted: "#6F5A44", flame: "#D2541C", flameSoft: "#F3E2CF" };
const NATURE: WidgetPalette = { background: "#F9FBF6", foreground: "#1D2A1E", muted: "#5C6A55", flame: "#E0571F", flameSoft: "#E3EDDC" };
const OCEAN: WidgetPalette = { background: "#12232F", foreground: "#E7F1F6", muted: "#8EA6B4", flame: "#FF7A45", flameSoft: "#1D3646" };
const SUNSET: WidgetPalette = { background: "#321A16", foreground: "#FFEDE4", muted: "#CFA295", flame: "#FF9A5C", flameSoft: "#4A2820" };

// light/dark: 시스템 라이트·다크 모드일 때 각각 쓸 색. 자동만 둘이 다르다.
export const WIDGET_PALETTES: { id: WidgetPaletteId; name: string; light: WidgetPalette; dark: WidgetPalette }[] = [
  { id: "auto", name: "자동", light: LIGHT, dark: DARK },
  { id: "light", name: "라이트", light: LIGHT, dark: LIGHT },
  { id: "dark", name: "다크", light: DARK, dark: DARK },
  { id: "sepia", name: "세피아", light: SEPIA, dark: SEPIA },
  { id: "nature", name: "숲", light: NATURE, dark: NATURE },
  { id: "ocean", name: "바다", light: OCEAN, dark: OCEAN },
  { id: "sunset", name: "노을", light: SUNSET, dark: SUNSET },
];

// 배경 불투명도(%). 낮을수록 배경화면이 비친다.
export const WIDGET_OPACITIES = [100, 85, 70, 50] as const;
export type WidgetOpacity = (typeof WIDGET_OPACITIES)[number];

export type WidgetTextSize = "small" | "medium" | "large";
export const WIDGET_TEXT_SIZES: { id: WidgetTextSize; name: string; scale: number }[] = [
  { id: "small", name: "작게", scale: 0.88 },
  { id: "medium", name: "보통", scale: 1 },
  { id: "large", name: "크게", scale: 1.15 },
];

export type WidgetStyle = {
  paletteId: WidgetPaletteId;
  opacity: WidgetOpacity;
  textSize: WidgetTextSize;
  showAuthor: boolean;
};

export const DEFAULT_WIDGET_STYLE: WidgetStyle = { paletteId: "auto", opacity: 100, textSize: "medium", showAuthor: true };

// 저장된 값 중 알 수 없는 값은 기본값으로 되돌린다. (예전 버전·손상된 값)
export const sanitizeWidgetStyle = (value: unknown): WidgetStyle => {
  const v = (value && typeof value === "object" ? value : {}) as Partial<Record<keyof WidgetStyle, unknown>>;
  const d = DEFAULT_WIDGET_STYLE;
  return {
    paletteId: WIDGET_PALETTES.some((p) => p.id === v.paletteId) ? (v.paletteId as WidgetPaletteId) : d.paletteId,
    opacity: WIDGET_OPACITIES.includes(v.opacity as WidgetOpacity) ? (v.opacity as WidgetOpacity) : d.opacity,
    textSize: WIDGET_TEXT_SIZES.some((s) => s.id === v.textSize) ? (v.textSize as WidgetTextSize) : d.textSize,
    showAuthor: typeof v.showAuthor === "boolean" ? v.showAuthor : d.showAuthor,
  };
};

export const getWidgetPalette = (paletteId: WidgetPaletteId, dark: boolean): WidgetPalette => {
  const entry = WIDGET_PALETTES.find((p) => p.id === paletteId) ?? WIDGET_PALETTES[0];
  return dark ? entry.dark : entry.light;
};

export const getWidgetTextScale = (textSize: WidgetTextSize) =>
  WIDGET_TEXT_SIZES.find((s) => s.id === textSize)?.scale ?? 1;

// #RRGGBB 에 불투명도(%)를 붙여 #RRGGBBAA 로 만든다.
export const withOpacity = (hex: Hex, opacity: number): Hex => {
  if (opacity >= 100) return hex;
  const alpha = Math.round((Math.max(0, opacity) / 100) * 255)
    .toString(16)
    .padStart(2, "0")
    .toUpperCase();
  return `${hex.slice(0, 7)}${alpha}` as Hex;
};

// zustand persist가 저장한 값({ state, version })을 위젯 그리기용으로 읽는다.
export const loadWidgetStyle = async (): Promise<WidgetStyle> => {
  try {
    const str = await appStorage.getItem(WIDGET_STYLE_KEY);
    if (!str) return DEFAULT_WIDGET_STYLE;
    const parsed = JSON.parse(str);
    return sanitizeWidgetStyle(parsed?.state ?? parsed);
  } catch {
    return DEFAULT_WIDGET_STYLE;
  }
};
