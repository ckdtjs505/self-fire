jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);
jest.mock("@/data/quotes.json", () => []);
jest.mock("react-native-toast-message", () => ({ show: jest.fn(), hide: jest.fn() }));
jest.mock("@/utils/analytics", () => ({ trackEvent: jest.fn() }));
jest.mock("@/utils/haptics", () => ({ tapHaptic: jest.fn() }));

const mockDismissTo = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({ back: jest.fn(), dismissTo: mockDismissTo }),
}));

import FavoritesScreen from "@/app/favorites";
import { Quote } from "@/models";
import { useFavoriteQuoteStore } from "@/store/quote";
import { getTheme } from "@/themes";
import { ThemeProvider } from "@shopify/restyle";
import { act, fireEvent, render, screen } from "@testing-library/react-native";
import Toast from "react-native-toast-message";
import { SafeAreaProvider } from "react-native-safe-area-context";

const SAFE_AREA_METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

const quotes: Quote[] = [
  { id: "1", text: "포기하지 마라.", author: "윈스턴 처칠" },
  { id: "2", text: "실패는 성공의 어머니다.", author: "토머스 에디슨" },
];

const renderScreen = () =>
  render(
    <SafeAreaProvider initialMetrics={SAFE_AREA_METRICS}>
      <ThemeProvider theme={getTheme("dark")}>
        <FavoritesScreen />
      </ThemeProvider>
    </SafeAreaProvider>
  );

beforeEach(() => {
  jest.clearAllMocks();
  useFavoriteQuoteStore.setState({ favorites: ["1", "2"], favoritesData: quotes, customQuotes: [] });
});

describe("FavoritesScreen", () => {
  it("저장한 문장이 없으면 안내만 보여 준다", () => {
    useFavoriteQuoteStore.setState({ favorites: [], favoritesData: [] });
    renderScreen();
    expect(screen.getByText("아직 저장한 문장이 없어요")).toBeTruthy();
    expect(screen.queryByLabelText("명언 검색")).toBeNull();
  });

  it("최근 저장순으로 보여 주고 내용·작성자로 찾는다", () => {
    renderScreen();
    const texts = screen.getAllByText(/포기하지|실패는/).map((node) => node.props.children);
    expect(texts).toEqual(["실패는 성공의 어머니다.", "포기하지 마라."]);

    fireEvent.changeText(screen.getByLabelText("명언 검색"), "처칠");
    expect(screen.getByText("2개 중 1개")).toBeTruthy();
    expect(screen.queryByText("실패는 성공의 어머니다.")).toBeNull();

    fireEvent.changeText(screen.getByLabelText("명언 검색"), "없는말");
    expect(screen.getByText("‘없는말’에 맞는 문장이 없어요")).toBeTruthy();
    fireEvent.press(screen.getByText("검색어 지우기"));
    expect(screen.getByText("포기하지 마라.")).toBeTruthy();
  });

  it("명언을 누르면 홈의 저장한 문장 보기에서 그 명언부터 연다", () => {
    renderScreen();
    fireEvent.press(screen.getByText("포기하지 마라."));
    expect(mockDismissTo).toHaveBeenCalledWith({
      pathname: "/",
      params: expect.objectContaining({ view: "favorites", quote: "1" }),
    });
  });

  it("저장을 취소하고 되돌릴 수 있다", () => {
    renderScreen();
    fireEvent.press(screen.getAllByLabelText("저장 취소")[0]);
    expect(useFavoriteQuoteStore.getState().favorites).toEqual(["1"]);

    const { onUndo } = (Toast.show as jest.Mock).mock.calls[0][0].props;
    act(() => onUndo());
    expect(useFavoriteQuoteStore.getState().favorites).toEqual(["1", "2"]);
  });
});
