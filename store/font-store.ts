import { create } from "zustand";
import { appStorage } from "@/utils/storage";

export type FontId =
  | "system"
  | "NotoSansKR_400Regular"
  | "NanumMyeongjo_400Regular"
  | "GowunDodum_400Regular"
  | "Jua_400Regular"
  | "NanumPenScript_400Regular";

const FONT_ID_KEY = "fontId";
const FONT_SIZE_KEY = "fontSize";

/**
 * FontId를 Text 스타일의 fontFamily 값으로 변환한다.
 * "system"이면 undefined를 반환해 기기 기본 폰트를 사용한다.
 */
export const toFontFamily = (fontId: FontId): string | undefined =>
  fontId === "system" ? undefined : fontId;

interface FontStore {
  currentFontId: FontId;
  currentFontSize: number;
  updateFontId: (fontId: FontId) => void;
  updateFontSize: (size: number) => void;
}

export const useFontStore = create<FontStore>((set) => ({
  currentFontId: "system",
  currentFontSize: 26,
  updateFontId: (fontId) => {
    appStorage.setItem(FONT_ID_KEY, fontId);
    set({ currentFontId: fontId });
  },
  updateFontSize: (size) => {
    appStorage.setItem(FONT_SIZE_KEY, size.toString());
    set({ currentFontSize: size });
  },
}));

// 앱 시작 시 저장된 폰트 설정을 불러온다. 다 불러오면 끝나는 Promise (app/_layout.tsx에서 기다린다)
export const fontSettingsLoaded: Promise<void> = Promise.all([
  appStorage.getItem(FONT_ID_KEY),
  appStorage.getItem(FONT_SIZE_KEY),
]).then(([fontId, size]) => {
  const { updateFontId, updateFontSize } = useFontStore.getState();
  if (fontId) updateFontId(fontId as FontId);
  if (size) updateFontSize(parseInt(size, 10));
}).catch(() => {});
