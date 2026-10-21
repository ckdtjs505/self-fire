jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);
jest.mock("@/data/quotes.json", () => []);
jest.mock("react-native-toast-message", () => ({ show: jest.fn() }));

import { useQuotePager } from "@/hooks/useQuotePager";
import { Quote } from "@/models";
import { useFavoriteQuoteStore } from "@/store/quote";
import { act, renderHook } from "@testing-library/react-native";
import Toast from "react-native-toast-message";

const quotes: Quote[] = Array.from({ length: 5 }, (_, i) => ({ id: String(i + 1), text: `명언 ${i + 1}`, author: "" }));

const render = (props: Partial<Parameters<typeof useQuotePager>[0]> = {}) =>
  renderHook((p: Parameters<typeof useQuotePager>[0]) => useQuotePager(p), {
    initialProps: { defaultQuotes: quotes, ...props },
  });

beforeEach(() => {
  jest.clearAllMocks();
  useFavoriteQuoteStore.setState({ favorites: [], favoritesData: [], customQuotes: [] });
});

describe("useQuotePager", () => {
  it("기본 명언으로 첫 목록을 만들고 앞뒤로 넘긴다", () => {
    const onNext = jest.fn();
    const { result } = render({ onNext });
    const first = result.current.currentQuote;
    expect(first).toBeDefined();
    expect(result.current.canGoPrev).toBe(false);

    act(() => result.current.showNextQuote());
    expect(onNext).toHaveBeenCalledTimes(1);
    expect(result.current.currentIndex).toBe(1);
    expect(result.current.canGoPrev).toBe(true);

    act(() => result.current.showPrevQuote());
    expect(result.current.currentQuote).toEqual(first);
    // 앞으로 돌아왔으므로 '새 명언으로' 대상(maxIndex)은 그대로
    expect(result.current.maxIndex).toBe(1);

    act(() => result.current.showLatestQuote());
    expect(result.current.currentIndex).toBe(1);
  });

  it("비어 있는 불씨 보관함을 고르면 안내만 하고 모드를 바꾸지 않는다", () => {
    const { result } = render();
    act(() => result.current.selectCategory("favorites"));
    expect(Toast.show).toHaveBeenCalled();
    expect(result.current.filterMode).toBe("all");
  });

  it("내 명언 ↔ 불씨 보관함을 오가면 모드별로 보던 위치를 복원한다", () => {
    act(() => {
      useFavoriteQuoteStore.getState().addCustomQuote("내 명언 1", "나");
      useFavoriteQuoteStore.getState().addFavorite("1", quotes[0]);
    });
    // Date.now()로 id를 만들므로 두 번째 명언은 따로 넣는다
    act(() =>
      useFavoriteQuoteStore.setState((s) => ({
        customQuotes: [...s.customQuotes, { id: "custom-2", text: "내 명언 2", author: "나" }],
      }))
    );
    const { result } = render();

    act(() => result.current.selectCategory("mine"));
    expect(result.current.filterMode).toBe("mine");
    act(() => result.current.showNextQuote());
    const viewing = result.current.currentQuote!;
    expect(result.current.currentIndex).toBe(1);
    // 내 명언은 정해진 목록이라 마지막 명언 다음으로 넘기지 않는다
    expect(result.current.canGoNext).toBe(false);

    act(() => result.current.selectCategory("favorites"));
    expect(result.current.selectedId).toBe("favorites");
    expect(result.current.currentQuote?.id).toBe("1");

    act(() => result.current.selectCategory("mine"));
    expect(result.current.currentIndex).toBe(1);
    expect(result.current.currentQuote).toEqual(viewing);
  });

  it("주제 탭(전체)을 고르면 '전체' 목록을 처음부터 다시 만든다", () => {
    act(() => useFavoriteQuoteStore.getState().addFavorite("1", quotes[0]));
    const { result } = render();
    act(() => result.current.selectCategory("favorites"));
    act(() => result.current.selectCategory(null));
    expect(result.current.filterMode).toBe("all");
    expect(result.current.currentIndex).toBe(0);
    // 즐겨찾기한 명언은 '전체' 목록에서 빠진다
    expect(result.current.currentQuote?.id).not.toBe("1");
  });

  it("보던 모드의 명언이 모두 사라지면 '전체'로 돌아간다", () => {
    act(() => useFavoriteQuoteStore.getState().addCustomQuote("내 명언", "나"));
    const { result } = render();
    act(() => result.current.selectCategory("mine"));
    expect(result.current.filterMode).toBe("mine");

    const id = useFavoriteQuoteStore.getState().customQuotes[0].id;
    act(() => useFavoriteQuoteStore.getState().removeCustomQuote(id));
    expect(result.current.filterMode).toBe("all");
  });

  it("openFavoritesKey가 바뀌면 불씨 보관함을 연다", () => {
    act(() => useFavoriteQuoteStore.getState().addFavorite("1", quotes[0]));
    const { result, rerender } = render();
    expect(result.current.filterMode).toBe("all");
    rerender({ defaultQuotes: quotes, openFavoritesKey: "123" });
    expect(result.current.filterMode).toBe("favorites");
  });
});
