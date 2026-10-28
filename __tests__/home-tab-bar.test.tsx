jest.mock("@/utils/haptics", () => ({ tapHaptic: jest.fn() }));

import HomeTabBar from "@/components/home-tab-bar";
import { getTheme } from "@/themes";
import { ThemeProvider } from "@shopify/restyle";
import { fireEvent, render, screen } from "@testing-library/react-native";

const renderBar = (selected: "today" | "quotes", onSelect = jest.fn()) => {
  render(
    <ThemeProvider theme={getTheme("dark")}>
      <HomeTabBar selected={selected} onSelect={onSelect} />
    </ThemeProvider>
  );
  return onSelect;
};

describe("HomeTabBar", () => {
  it("고른 탭을 선택됨으로 알린다", () => {
    renderBar("today");
    expect(screen.getByRole("tab", { name: "오늘" }).props.accessibilityState).toEqual({ selected: true });
    expect(screen.getByRole("tab", { name: "명언" }).props.accessibilityState).toEqual({ selected: false });
  });

  it("다른 탭을 누르면 그 탭으로 바꾼다", () => {
    const onSelect = renderBar("today");
    fireEvent.press(screen.getByRole("tab", { name: "명언" }));
    expect(onSelect).toHaveBeenCalledWith("quotes");
  });

  it("지금 탭을 다시 누르면 아무것도 하지 않는다", () => {
    const onSelect = renderBar("quotes");
    fireEvent.press(screen.getByRole("tab", { name: "명언" }));
    expect(onSelect).not.toHaveBeenCalled();
  });
});
