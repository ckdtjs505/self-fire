import { DEFAULT_WIDGET_STYLE, sanitizeWidgetStyle, WIDGET_STYLE_KEY, WidgetStyle } from "@/data/widget-style";
import { refreshWidgets } from "@/widgets/refresh-widgets";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { stateStorage } from "@/utils/storage";

interface WidgetStyleStore extends WidgetStyle {
  updateStyle: (patch: Partial<WidgetStyle>) => void;
  resetStyle: () => void;
}

// 홈 화면 위젯 꾸미기 (data/widget-style.ts 참고). 바꾸면 놓여 있는 위젯을 바로 다시 그린다.
export const useWidgetStyleStore = create<WidgetStyleStore>()(
  persist(
    (set) => ({
      ...DEFAULT_WIDGET_STYLE,
      updateStyle: (patch) => {
        set(patch);
        refreshWidgets();
      },
      resetStyle: () => {
        set(DEFAULT_WIDGET_STYLE);
        refreshWidgets();
      },
    }),
    {
      name: WIDGET_STYLE_KEY,
      storage: createJSONStorage(() => stateStorage),
      partialize: ({ paletteId, opacity, textSize, showAuthor }) => ({ paletteId, opacity, textSize, showAuthor }),
      merge: (persisted, current) => ({ ...current, ...sanitizeWidgetStyle(persisted) }),
    }
  )
);
