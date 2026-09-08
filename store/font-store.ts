import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type FontId = "system" | "NotoSansKR_400Regular" | "NanumMyeongjo_400Regular" | "GowunDodum_400Regular" | "Jua_400Regular" | "NanumPenScript_400Regular";

interface FontStore {
  currentFontId: FontId;
  updateFontId: (state: FontId) => void;
}

export const useFontStore = create<FontStore>((set) => ({
  currentFontId: "system",
  updateFontId: (state: FontId) => {
    AsyncStorage.setItem("fontId", state);
    set({
      currentFontId: state,
    });
  },
}));

// Load initial font
AsyncStorage.getItem("fontId").then((font) => {
  if (font) {
    useFontStore.getState().updateFontId(font as FontId);
  }
});
