// ─────────────────────────────────────────────────────────────
// widgets/widget-task-handler.tsx
// 런처가 위젯을 그려 달라고 할 때(추가·주기 갱신·크기 변경) 앱 화면 없이 실행되는 헤드리스 작업.
// 앱이 저장해 둔 스냅샷을 읽어 지금 날짜에 맞는 명언과 불씨 상태로 그린다.
// 앱 화면이 없는 상태에서 실행되므로 알림·광고 같은 무거운 모듈은 가져오지 않는다.
// ─────────────────────────────────────────────────────────────

import { loadWidgetSnapshot, resolveWidgetView } from "@/data/widget-snapshot";
import { trackEvent } from "@/utils/analytics";
import type { WidgetTaskHandlerProps } from "react-native-android-widget";
import { renderSelfFireWidget } from "./self-fire-widgets";

export async function widgetTaskHandler({ widgetInfo, widgetAction, renderWidget }: WidgetTaskHandlerProps) {
  if (widgetAction === "WIDGET_DELETED") return;
  // 위젯 추가 안내의 효과를 보기 위해 기록한다. (안내 없이 직접 놓은 경우도 포함)
  if (widgetAction === "WIDGET_ADDED") trackEvent("widget_added", { widget: widgetInfo.widgetName });

  const view = resolveWidgetView(await loadWidgetSnapshot());
  renderWidget(renderSelfFireWidget(widgetInfo.widgetName, view, widgetInfo.width, widgetInfo.height));
}
