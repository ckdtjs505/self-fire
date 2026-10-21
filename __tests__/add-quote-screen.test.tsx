jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);
jest.mock("react-native-toast-message", () => ({ show: jest.fn() }));
jest.mock("@/utils/analytics", () => ({ trackEvent: jest.fn() }));
jest.mock("@react-navigation/native", () => ({ usePreventRemove: jest.fn() }));

const mockBack = jest.fn();
let mockParams: Record<string, string> = {};
jest.mock("expo-router", () => ({
  useRouter: () => ({ back: mockBack }),
  useNavigation: () => ({ dispatch: jest.fn() }),
  useLocalSearchParams: () => mockParams,
}));

import AddQuoteScreen from "@/app/AddQuoteScreen";
import { useFavoriteQuoteStore } from "@/store/quote";
import { getTheme } from "@/themes";
import { ThemeProvider } from "@shopify/restyle";
import { fireEvent, render, screen } from "@testing-library/react-native";
import Toast from "react-native-toast-message";
import { SafeAreaProvider } from "react-native-safe-area-context";

const SAFE_AREA_METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

const renderScreen = () =>
  render(
    <SafeAreaProvider initialMetrics={SAFE_AREA_METRICS}>
      <ThemeProvider theme={getTheme("dark")}>
        <AddQuoteScreen />
      </ThemeProvider>
    </SafeAreaProvider>
  );

beforeEach(() => {
  jest.clearAllMocks();
  mockParams = {};
  useFavoriteQuoteStore.setState({ favorites: [], favoritesData: [], customQuotes: [] });
});

describe("AddQuoteScreen", () => {
  it("내용 없이 저장하면 안내하고 닫지 않는다", () => {
    renderScreen();
    fireEvent.press(screen.getByText("저장"));
    expect(Toast.show).toHaveBeenCalledWith(expect.objectContaining({ type: "error" }));
    expect(mockBack).not.toHaveBeenCalled();
    expect(useFavoriteQuoteStore.getState().customQuotes).toHaveLength(0);
  });

  it("새 명언을 저장하고, 작성자를 비우면 '나'로 저장한다", () => {
    renderScreen();
    expect(screen.getByText("명언 추가")).toBeTruthy();
    fireEvent.changeText(screen.getByPlaceholderText("가슴을 뛰게 하는 명언을 입력하세요."), "시작이 반이다.");
    fireEvent.press(screen.getByText("저장"));

    expect(useFavoriteQuoteStore.getState().customQuotes).toEqual([
      expect.objectContaining({ text: "시작이 반이다.", author: "나" }),
    ]);
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it("id가 있으면 수정 모드로 열고 기존 명언을 고친다", () => {
    useFavoriteQuoteStore.setState({ customQuotes: [{ id: "custom-1", text: "옛 내용", author: "나" }] });
    mockParams = { id: "custom-1", text: "옛 내용", author: "나" };
    renderScreen();
    expect(screen.getByText("명언 수정")).toBeTruthy();

    fireEvent.changeText(screen.getByDisplayValue("옛 내용"), "새 내용");
    fireEvent.press(screen.getByText("저장"));
    expect(useFavoriteQuoteStore.getState().customQuotes).toEqual([{ id: "custom-1", text: "새 내용", author: "나" }]);
  });
});
