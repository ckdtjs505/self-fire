jest.mock("react-native-android-widget", () => ({
  getWidgetInfo: jest.fn(),
  requestPinWidget: jest.fn(),
}));
jest.mock("react-native-toast-message", () => ({ show: jest.fn() }));
jest.mock("@/utils/analytics", () => ({ trackEvent: jest.fn() }));
jest.mock("@/widgets/self-fire-widgets", () => ({ QUOTE_WIDGET: "Quote", FLAME_WIDGET: "Flame" }));

import { shouldPromptWidget, WIDGET_PROMPT_STREAKS } from "@/widgets/widget-pin";

describe("shouldPromptWidget", () => {
  it("불씨를 3일·7일 이어 간 날에 제안한다", () => {
    expect(WIDGET_PROMPT_STREAKS).toEqual([3, 7]);
    expect(shouldPromptWidget({ supported: true, streak: 3, promptedStreaks: [] })).toBe(true);
    expect(shouldPromptWidget({ supported: true, streak: 7, promptedStreaks: [3] })).toBe(true);
  });

  it("다른 날에는 제안하지 않는다", () => {
    [1, 2, 4, 6, 8, 30].forEach((streak) =>
      expect(shouldPromptWidget({ supported: true, streak, promptedStreaks: [] })).toBe(false),
    );
  });

  it("같은 일수에서 이미 제안했으면 다시 묻지 않는다", () => {
    expect(shouldPromptWidget({ supported: true, streak: 3, promptedStreaks: [3] })).toBe(false);
  });

  it("위젯을 지원하지 않는 기기(iOS·웹)에서는 제안하지 않는다", () => {
    expect(shouldPromptWidget({ supported: false, streak: 3, promptedStreaks: [] })).toBe(false);
  });
});
