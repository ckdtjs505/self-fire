jest.mock("react-native-worklets", () => require("react-native-worklets/src/mock"));
jest.mock("@/utils/haptics", () => ({ pulseHaptic: jest.fn(), successHaptic: jest.fn() }));

import { IgniteScreen } from "@/components/ignite-screen";
import { getTheme } from "@/themes";
import { pulseHaptic, successHaptic } from "@/utils/haptics";
import { ThemeProvider } from "@shopify/restyle";
import { act, fireEvent, render, screen } from "@testing-library/react-native";

const renderScreen = (onIgnited = jest.fn()) => {
  render(
    <ThemeProvider theme={getTheme("dark")}>
      <IgniteScreen onIgnited={onIgnited} previewText="오늘 걷는 한 걸음이 내일의 길이 된다" />
    </ThemeProvider>
  );
  return { onIgnited, flame: screen.getByLabelText("오늘의 불씨 켜기") };
};

const advance = (ms: number) => act(() => jest.advanceTimersByTime(ms));

beforeEach(() => {
  jest.useFakeTimers();
  jest.clearAllMocks();
});

afterEach(() => {
  jest.useRealTimers();
});

describe("IgniteScreen", () => {
  it("오늘의 명언 첫머리만 미리 보여 준다", () => {
    renderScreen();
    expect(screen.getByText("“오늘 걷는 한 걸음이 내일…", { includeHiddenElements: true })).toBeTruthy();
  });

  it("스크린리더로 두 번 탭하면 점화되고, 애니메이션이 끝나면 한 번만 알린다", async () => {
    const { onIgnited, flame } = renderScreen();

    fireEvent(flame, "accessibilityAction", { nativeEvent: { actionName: "activate" } });
    fireEvent(flame, "accessibilityAction", { nativeEvent: { actionName: "activate" } });
    expect(successHaptic).toHaveBeenCalledTimes(1);

    await advance(1000);
    expect(onIgnited).toHaveBeenCalledTimes(1);
  });

  it("끝까지 누르고 있으면 점화된다", async () => {
    const { onIgnited, flame } = renderScreen();

    fireEvent(flame, "touchStart");
    expect(pulseHaptic).toHaveBeenCalledWith(0);
    await advance(1600);
    expect(successHaptic).toHaveBeenCalledTimes(1);

    await advance(1000);
    expect(onIgnited).toHaveBeenCalledTimes(1);
  });

  it("중간에 손을 떼면 점화되지 않는다", async () => {
    const { onIgnited, flame } = renderScreen();

    fireEvent(flame, "touchStart");
    await advance(500);
    fireEvent(flame, "touchEnd");
    await advance(3000);

    expect(successHaptic).not.toHaveBeenCalled();
    expect(onIgnited).not.toHaveBeenCalled();
  });
});
