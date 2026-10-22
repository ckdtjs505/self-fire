import { refreshDailyNotifications } from "@/store/notification";
import { refreshWidgets } from "@/widgets/refresh-widgets";
import { DependencyList, useEffect } from "react";

// 연달아 바뀌는 경우(즐겨찾기 여러 번 등)를 묶어서 한 번만 예약하기 위한 대기 시간
export const BACKGROUND_REFRESH_DELAY_MS = 1000;

/**
 * 오늘의 명언을 정하는 후보(카테고리·즐겨찾기·명언 목록)나 오늘 고른 문장이 바뀌면 알림 명언도 다시 예약한다.
 * 홈 화면 위젯도 같은 명언과 불씨 상태(스트릭·오늘 점화 여부)로 다시 그린다.
 * deps 중 하나라도 바뀌면 잠시 기다렸다가 한 번만 갱신한다.
 */
export const useBackgroundRefresh = (deps: DependencyList) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      refreshDailyNotifications();
      refreshWidgets();
    }, BACKGROUND_REFRESH_DELAY_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
};
