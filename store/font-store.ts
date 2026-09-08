import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type FontId = "system" | "NotoSansKR_400Regular" | "NanumMyeongjo_400Regular" | "GowunDodum_400Regular" | "Jua_400Regular" | "NanumPenScript_400Regular";

interface FontStore {
  currentFontId: FontId;
  currentFontSize: number;
  updateFontId: (state: FontId) => void;
  updateFontSize: (size: number) => void;
}

export const useFontStore = create<FontStore>((set) => ({
  currentFontId: "system",
  currentFontSize: 26,
  updateFontId: (state: FontId) => {
    AsyncStorage.setItem("fontId", state);
    set({
      currentFontId: state,
    });
  },
  updateFontSize: (size: number) => {
    AsyncStorage.setItem("fontSize", size.toString());
    set({
      currentFontSize: size,
    });
  }
}));

// Load initial font settings
Promise.all([
  AsyncStorage.getItem("fontId"),
  AsyncStorage.getItem("fontSize")
]).then(([font, size]) => {
  if (font) {
    useFontStore.getState().updateFontId(font as FontId);
  }
  if (size) {
    useFontStore.getState().updateFontSize(parseInt(size, 10));
  }
});
