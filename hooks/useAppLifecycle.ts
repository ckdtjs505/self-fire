// ─────────────────────────────────────────────────────────────
// useAppLifecycle.ts
// 루트 레이아웃이 앱 전체에 대해 하는 일 (app/_layout.tsx에서 한 번 부른다).
//   - 화면 조회 기록 (screen_view)
//   - 첫 화면이 뜨면 강제 업데이트 확인, 오늘의 명언 알림 예약 갱신
//   - 백그라운드에 한동안 있다가 돌아오면 메인 화면으로 이동
//   - 알림을 누르면 그 알림의 명언을 홈 화면에 보여 준다
// ─────────────────────────────────────────────────────────────

import { notificationDataSchema } from "@/data/schemas";
import { checkForcedUpdate } from "@/services/bootstrap";
import { refreshDailyNotifications, usePendingQuoteStore } from "@/store/notification";
import { trackEvent, trackScreen } from "@/utils/analytics";
import * as Notifications from "expo-notifications";
import { router, usePathname } from "expo-router";
import { useEffect, useRef } from "react";
import { AppState } from "react-native";

// 이 시간 이상 백그라운드에 있다가 돌아오면 메인 화면으로 이동한다.
const RETURN_TO_MAIN_AFTER_MS = 30 * 1000;
// 작성 중인 내용이 사라지지 않도록 복귀 시에도 유지하는 화면
const KEEP_SCREEN_PATHS = ["/add-quote"];
// Analytics 화면 이름. 라우트 경로를 소문자로 바꾸기 전의 이름을 그대로 써서 지난 통계와 이어지게 한다.
const SCREEN_NAMES: Record<string, string> = {
  "/": "Home",
  "/settings": "SettingScreen",
  "/privacy": "PrivacyScreen",
  "/terms": "TermsScreen",
  "/my-quotes": "MyQuotesScreen",
  "/add-quote": "AddQuoteScreen",
};

export const useAppLifecycle = () => {
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;
  const backgroundedAt = useRef<number | null>(null);
  // 앱을 열게 한(또는 실행 중에 누른) 알림. 처음 실행할 때 누른 알림도 함께 받는다.
  const notificationResponse = Notifications.useLastNotificationResponse();

  // 화면 전환마다 screen_view를 기록한다.
  useEffect(() => {
    trackScreen(SCREEN_NAMES[pathname] ?? pathname.replace(/^\//, ""));
  }, [pathname]);

  useEffect(() => {
    checkForcedUpdate();
    refreshDailyNotifications();

    // 한동안 다른 앱에 있다가 돌아오면 명언(메인) 화면을 보여준다.
    // - iOS의 'inactive'(결제 시트, 권한 팝업 등)는 앱을 떠난 것으로 보지 않는다.
    // - 권한 설정·링크 등 잠깐 다녀온 경우와 명언 작성 중에는 화면을 유지한다.
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "background") {
        backgroundedAt.current = Date.now();
      } else if (nextAppState === "active" && backgroundedAt.current !== null) {
        const awayMs = Date.now() - backgroundedAt.current;
        backgroundedAt.current = null;
        if (awayMs >= RETURN_TO_MAIN_AFTER_MS && !KEEP_SCREEN_PATHS.includes(pathnameRef.current)) {
          router.replace("/(navi)");
        }
      }
    });

    return () => subscription.remove();
  }, []);

  // 알림을 누르면 홈으로 가서 그 알림의 명언을 보여 준다. (불씨 알림은 홈으로만)
  // 처리한 알림은 비워서 다음 실행 때 다시 처리하지 않는다.
  useEffect(() => {
    if (!notificationResponse) return;
    if (notificationResponse.actionIdentifier !== Notifications.DEFAULT_ACTION_IDENTIFIER) return;
    Notifications.clearLastNotificationResponse();

    const parsed = notificationDataSchema.safeParse(notificationResponse.notification.request.content.data);
    const data = parsed.success ? parsed.data : null;
    trackEvent("notification_open", { type: data?.type ?? "unknown" });
    if (data?.type === "daily" && data.quoteId && data.text) {
      usePendingQuoteStore.getState().setQuote({ id: data.quoteId, text: data.text, author: data.author });
    }
    // 명언을 작성 중이면 화면을 유지한다. (홈으로 돌아가면 그때 보여 준다)
    if (pathnameRef.current !== "/" && !KEEP_SCREEN_PATHS.includes(pathnameRef.current)) router.replace("/(navi)");
  }, [notificationResponse]);
};
