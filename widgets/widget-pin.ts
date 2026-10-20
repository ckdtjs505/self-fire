// ─────────────────────────────────────────────────────────────
// widgets/widget-pin.ts
// 홈 화면 위젯 추가 안내.
//   - 불씨를 3일·7일 이어 간 날, 점화 완료 시트에서 한 번씩 위젯 추가를 제안한다.
//     (습관이 막 생기는 때 / 이미 위젯을 놓았으면 제안하지 않음)
//   - 버튼을 누르면 런처의 '홈 화면에 추가' 창을 바로 띄운다. (Android 8+ requestPinAppWidget)
//   - 런처가 지원하지 않으면 직접 추가하는 방법을 알려 준다.
// ─────────────────────────────────────────────────────────────

import { trackEvent } from "@/utils/analytics";
import { Platform } from "react-native";
import { getWidgetInfo, requestPinWidget } from "react-native-android-widget";
import Toast from "react-native-toast-message";
import { FLAME_WIDGET, QUOTE_WIDGET } from "./self-fire-widgets";

export type WidgetName = typeof QUOTE_WIDGET | typeof FLAME_WIDGET;

// 위젯 추가를 제안하는 연속 일수
export const WIDGET_PROMPT_STREAKS = [3, 7];

export const isWidgetSupported = Platform.OS === "android";

// 점화 완료 시트에서 위젯 추가를 제안할지. (이미 놓은 위젯이 있는지는 따로 확인한다)
export const shouldPromptWidget = ({
  supported,
  streak,
  promptedStreaks,
}: {
  supported: boolean;
  streak: number;
  promptedStreaks: number[];
}) => supported && WIDGET_PROMPT_STREAKS.includes(streak) && !promptedStreaks.includes(streak);

// 홈 화면에 놓인 SelfFire 위젯 수 (확인하지 못하면 0)
export const countInstalledWidgets = async (): Promise<number> => {
  if (!isWidgetSupported) return 0;
  try {
    const lists = await Promise.all([QUOTE_WIDGET, FLAME_WIDGET].map((name) => getWidgetInfo(name)));
    return lists.reduce((sum, list) => sum + list.length, 0);
  } catch {
    return 0;
  }
};

// 런처의 위젯 추가 창을 띄운다. 지원하지 않으면 직접 추가하는 방법을 알려 준다.
// source: 어디서 눌렀는지 (ignite_sheet | settings)
export const pinWidget = async (widgetName: WidgetName, source: string) => {
  let accepted = false;
  try {
    accepted = await requestPinWidget({ widgetName });
  } catch {
    accepted = false;
  }
  trackEvent("widget_pin_request", { widget: widgetName, source, accepted });
  if (!accepted) {
    Toast.show({
      type: "info",
      text2: "홈 화면 빈 곳을 길게 누른 뒤 위젯 > SelfFire에서 추가할 수 있어요",
      visibilityTime: 5000,
    });
  }
  return accepted;
};
