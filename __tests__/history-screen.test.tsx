jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);
jest.mock("@/utils/haptics", () => ({ tapHaptic: jest.fn() }));

const mockDismissTo = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({ back: jest.fn(), dismissTo: mockDismissTo }),
}));

import HistoryScreen from "@/app/history";
import { useDeedStore } from "@/store/deed";
import { usePendingQuoteStore } from "@/store/notification";
import { getTheme } from "@/themes";
import { Deed } from "@/utils/deed";
import { ThemeProvider } from "@shopify/restyle";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

const SAFE_AREA_METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

const quote = { id: "q-1", text: "천 리 길도 한 걸음부터", author: "속담" };
const doneDeed: Deed = { date: "2026-10-21", text: "계단으로 오르기", quote, completed: true };
const legacyDeed: Deed = { date: "2026-09-30", text: "미뤄 둔 전화 걸기", quote };
const pendingDeed: Deed = { date: "2026-10-22", text: "아직 못 한 일", quote, completed: false };

const renderScreen = () =>
  render(
    <SafeAreaProvider initialMetrics={SAFE_AREA_METRICS}>
      <ThemeProvider theme={getTheme("dark")}>
        <HistoryScreen />
      </ThemeProvider>
    </SafeAreaProvider>
  );

describe("해낸 일 화면", () => {
  beforeEach(() => {
    mockDismissTo.mockClear();
    usePendingQuoteStore.setState({ quote: null });
  });

  it("해낸 일이 없으면 안내만 보여 준다", () => {
    useDeedStore.setState({ deeds: [pendingDeed], pick: null });
    renderScreen();
    expect(screen.getByText("아직 해낸 일이 없어요")).toBeTruthy();
    expect(screen.queryByText(pendingDeed.text)).toBeNull();
  });

  it("해낸 일만 달별로 보여 주고, 완료 여부가 없는 예전 기록도 해낸 일로 넣는다", () => {
    useDeedStore.setState({ deeds: [legacyDeed, doneDeed, pendingDeed], pick: null });
    renderScreen();
    expect(screen.getByText("문장대로 해낸 날 · 2일")).toBeTruthy();
    expect(screen.getByText("2026년 10월")).toBeTruthy();
    expect(screen.getByText("2026년 9월")).toBeTruthy();
    expect(screen.getByText(doneDeed.text)).toBeTruthy();
    expect(screen.getByText(legacyDeed.text)).toBeTruthy();
    expect(screen.queryByText(pendingDeed.text)).toBeNull();
  });

  it("해낸 일을 누르면 홈으로 돌아가 그날 따른 문장을 연다", () => {
    useDeedStore.setState({ deeds: [doneDeed], pick: null });
    renderScreen();
    fireEvent.press(screen.getByText(doneDeed.text));
    expect(usePendingQuoteStore.getState().quote).toEqual(quote);
    expect(mockDismissTo).toHaveBeenCalledWith("/");
  });
});
