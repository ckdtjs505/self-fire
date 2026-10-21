const mockLoaded = new Set<string>();
jest.mock("expo-font", () => ({
  isLoaded: (name: string) => mockLoaded.has(name),
  loadAsync: jest.fn(async (fonts: Record<string, unknown>) => {
    Object.keys(fonts).forEach((name) => mockLoaded.add(name));
  }),
}));

import { loadStartupFonts, QUOTE_MARK_FONT, useLoadedFont } from "@/utils/fonts";
import { renderHook, waitFor } from "@testing-library/react-native";
import * as Font from "expo-font";

beforeEach(() => {
  mockLoaded.clear();
  jest.clearAllMocks();
});

describe("loadStartupFonts", () => {
  it("따옴표 폰트와 고른 명언 폰트만 불러온다", async () => {
    await loadStartupFonts("Jua_400Regular");
    expect(Object.keys((Font.loadAsync as jest.Mock).mock.calls[0][0]).sort()).toEqual(
      [QUOTE_MARK_FONT, "Jua_400Regular"].sort()
    );
  });

  it("기본 폰트(system)를 골랐으면 따옴표 폰트만 불러온다", async () => {
    await loadStartupFonts("system");
    expect(Object.keys((Font.loadAsync as jest.Mock).mock.calls[0][0])).toEqual([QUOTE_MARK_FONT]);
  });
});

describe("useLoadedFont", () => {
  it("불러오기 전에는 기본 폰트(undefined), 불러온 뒤에는 그 폰트를 돌려준다", async () => {
    const { result } = renderHook(() => useLoadedFont("GowunDodum_400Regular"));
    expect(result.current).toBeUndefined();
    await waitFor(() => expect(result.current).toBe("GowunDodum_400Regular"));
  });

  it("이미 불러온 폰트는 바로 돌려준다", () => {
    mockLoaded.add("Jua_400Regular");
    const { result } = renderHook(() => useLoadedFont("Jua_400Regular"));
    expect(result.current).toBe("Jua_400Regular");
  });

  it("기본 폰트(undefined)는 그대로", () => {
    const { result } = renderHook(() => useLoadedFont(undefined));
    expect(result.current).toBeUndefined();
  });
});
