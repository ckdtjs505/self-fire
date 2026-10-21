// ─────────────────────────────────────────────────────────────
// widgets/refresh-widgets.ts
// 앱에서 위젯 데이터(스냅샷)를 새로 저장하고, 홈 화면에 놓인 위젯을 바로 다시 그린다.
// 앱 시작, 오늘의 명언 후보(카테고리·즐겨찾기·명언)가 바뀔 때, 불씨를 지폈을 때 호출한다.
// ─────────────────────────────────────────────────────────────

import { buildWidgetSnapshot, resolveWidgetView, saveWidgetSnapshot } from "@/data/widget-snapshot";
import { LAST_IGNITED_DATE_KEY } from "@/hooks/useDailyIgnite";
import { loadDailyCandidates } from "@/store/notification";
import { useStreakStore, whenStreakHydrated } from "@/store/streak";
import { Platform } from "react-native";
import { requestWidgetUpdate } from "react-native-android-widget";
import { FLAME_WIDGET, QUOTE_WIDGET, renderSelfFireWidget } from "./self-fire-widgets";
import { appStorage } from "@/utils/storage";

// 저장·갱신이 겹치면 오래된 스냅샷이 나중에 저장될 수 있으므로 한 번에 하나씩 실행한다.
let refreshQueue: Promise<void> = Promise.resolve();

export const refreshWidgets = () => {
  if (Platform.OS !== "android") return Promise.resolve();
  refreshQueue = refreshQueue.then(refreshNow);
  return refreshQueue;
};

const refreshNow = async () => {
  try {
    await whenStreakHydrated();
    const { currentStreak, lastStreakDate, freezeUsedWeek } = useStreakStore.getState();
    const snapshot = buildWidgetSnapshot({
      candidates: await loadDailyCandidates(),
      currentStreak,
      lastStreakDate,
      freezeUsedWeek,
      lastIgnitedDate: await appStorage.getItem(LAST_IGNITED_DATE_KEY),
    });
    await saveWidgetSnapshot(snapshot);

    const view = resolveWidgetView(snapshot);
    await Promise.all(
      [QUOTE_WIDGET, FLAME_WIDGET].map((widgetName) =>
        requestWidgetUpdate({
          widgetName,
          renderWidget: ({ width, height }) => renderSelfFireWidget(widgetName, view, width, height),
        }),
      ),
    );
  } catch (e) {
    console.warn("Failed to refresh widgets:", e);
  }
};
