import TodaySteps from "@/components/today-steps";
import { getTheme } from "@/themes";
import { ThemeProvider } from "@shopify/restyle";
import { render, screen } from "@testing-library/react-native";

const renderSteps = (state: { picked: boolean; planned: boolean; completed: boolean; ignited: boolean }) =>
  render(
    <ThemeProvider theme={getTheme("dark")}>
      <TodaySteps {...state} />
    </ThemeProvider>
  );

describe("TodaySteps", () => {
  it("새날에는 첫 단계(문장 고르기)부터 안내한다", () => {
    renderSteps({ picked: false, planned: false, completed: false, ignited: false });
    expect(screen.getByLabelText("오늘의 단계 4단계 중 1단계, 문장 고르기")).toBeTruthy();
  });

  it("할 일을 정했으면 해내고 완료할 차례라고 알려 준다 (정하기만으로는 불씨가 켜지지 않는다)", () => {
    renderSteps({ picked: true, planned: true, completed: false, ignited: false });
    expect(screen.getByLabelText("오늘의 단계 4단계 중 3단계, 해내고 완료")).toBeTruthy();
  });

  it("완료했지만 아직 꾹 눌러 불씨를 켜지 않았으면 마지막 단계다", () => {
    renderSteps({ picked: true, planned: true, completed: true, ignited: false });
    expect(screen.getByLabelText("오늘의 단계 4단계 중 4단계, 불씨")).toBeTruthy();
  });

  it("모두 마치면 불씨를 켰다고 알려 준다", () => {
    renderSteps({ picked: true, planned: true, completed: true, ignited: true });
    expect(screen.getByLabelText("오늘의 단계를 모두 마치고 불씨를 켰어요")).toBeTruthy();
  });
});
