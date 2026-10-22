jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

import {
  DEFAULT_WIDGET_STYLE,
  getWidgetPalette,
  loadWidgetStyle,
  sanitizeWidgetStyle,
  WIDGET_STYLE_KEY,
  withOpacity,
} from "@/data/widget-style";
import { appStorage } from "@/utils/storage";

describe("sanitizeWidgetStyle", () => {
  it("알 수 없는 값은 기본값으로 되돌린다", () => {
    expect(sanitizeWidgetStyle(null)).toEqual(DEFAULT_WIDGET_STYLE);
    expect(sanitizeWidgetStyle({ paletteId: "neon", opacity: 33, textSize: "huge", showAuthor: "yes" })).toEqual(
      DEFAULT_WIDGET_STYLE
    );
  });

  it("올바른 값은 그대로 둔다", () => {
    const style = { paletteId: "ocean", opacity: 70, textSize: "large", showAuthor: false } as const;
    expect(sanitizeWidgetStyle(style)).toEqual(style);
  });
});

describe("getWidgetPalette", () => {
  it("자동은 시스템 다크 모드에 따라, 고정 색은 늘 같은 색을 고른다", () => {
    expect(getWidgetPalette("auto", false)).not.toEqual(getWidgetPalette("auto", true));
    expect(getWidgetPalette("sepia", false)).toEqual(getWidgetPalette("sepia", true));
    expect(getWidgetPalette("dark", false)).toEqual(getWidgetPalette("auto", true));
  });
});

describe("withOpacity", () => {
  it("불투명도(%)를 #RRGGBBAA 알파로 붙인다", () => {
    expect(withOpacity("#FFFFFF", 100)).toBe("#FFFFFF");
    expect(withOpacity("#FFFFFF", 50)).toBe("#FFFFFF80");
    expect(withOpacity("#1E1B19", 85)).toBe("#1E1B19D9");
  });
});

describe("loadWidgetStyle", () => {
  it("zustand persist 형식으로 저장된 값을 읽고, 없거나 깨졌으면 기본값을 쓴다", async () => {
    await appStorage.removeItem(WIDGET_STYLE_KEY);
    expect(await loadWidgetStyle()).toEqual(DEFAULT_WIDGET_STYLE);

    await appStorage.setItem(
      WIDGET_STYLE_KEY,
      JSON.stringify({ state: { paletteId: "nature", opacity: 50, textSize: "small", showAuthor: false }, version: 0 })
    );
    expect(await loadWidgetStyle()).toEqual({ paletteId: "nature", opacity: 50, textSize: "small", showAuthor: false });

    await appStorage.setItem(WIDGET_STYLE_KEY, "{broken");
    expect(await loadWidgetStyle()).toEqual(DEFAULT_WIDGET_STYLE);
  });
});
