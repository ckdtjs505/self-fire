// ─────────────────────────────────────────────────────────────
// _layout.tsx
// 앱 전체의 루트 레이아웃.
// - Firebase Analytics·Crashlytics 초기화 / 화면 조회 기록
// - AdMob 초기화 / 포그라운드 알림 핸들러 설정 / 오늘의 명언 알림 예약 갱신
// - 필요한 구글 폰트만 로드 (그동안 스플래시를 유지)
// - 강제 업데이트 체크
// - 알림을 누르면 그 알림의 명언을 홈 화면에 보여 준다
// - 화면을 그리다 에러가 나면 ErrorBoundary로 안내 화면을 보여 주고 Crashlytics에 기록
// - 백그라운드에 한동안 있다가 복귀 시 메인 화면으로 이동
// - SafeAreaProvider / ThemeProvider / Toast 등 전역 래퍼 제공
// ─────────────────────────────────────────────────────────────

import ErrorFallback from "@/components/error-fallback";
import StatusBar from "@/components/status-bar";
import { toastConfig } from "@/components/simple-toast";
import { notificationDataSchema } from "@/data/schemas";
import { refreshDailyNotifications, usePendingQuoteStore } from "@/store/notification";
import { fontSettingsLoaded, useFontStore } from "@/store/font-store";
import { useThemeStore } from "@/store/theme";
import { initAnalytics, trackEvent, trackScreen } from "@/utils/analytics";
import { loadStartupFonts } from "@/utils/fonts";
import { ThemeProvider } from "@shopify/restyle";
import * as Notifications from "expo-notifications";
import { router, Stack, usePathname } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useRef, useState } from "react";
import { AppState, Platform } from "react-native";
import mobileAds from "react-native-google-mobile-ads";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import SpInAppUpdates, { IAUUpdateKind, StartUpdateOptions } from "sp-react-native-in-app-updates";

// 폰트를 불러올 때까지 스플래시를 유지한다.
SplashScreen.preventAutoHideAsync().catch(() => {});

// ── 분석·크래시 리포트 초기화 ─────────────────────────────────
initAnalytics();

// ── AdMob 초기화 ──────────────────────────────────────────────
// 개발 환경에서는 에뮬레이터를 테스트 기기로 등록한다.
mobileAds()
  .setRequestConfiguration({ testDeviceIdentifiers: __DEV__ ? ["EMULATOR"] : [] })
  .then(() => mobileAds().initialize());

// ── 포그라운드 알림 핸들러 ────────────────────────────────────
// 앱 실행 중에 알림을 받아도 배너/소리로 표시한다. (앱 아이콘 배지는 사용하지 않음)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// ── 강제 업데이트 ─────────────────────────────────────────────
// 스토어에 새 버전이 있으면 바로 업데이트를 진행한다. (Android: 즉시 업데이트)
const checkForcedUpdate = () => {
  try {
    const inAppUpdates = new SpInAppUpdates(false);
    inAppUpdates
      .checkNeedsUpdate()
      .then((result) => {
        if (!result.shouldUpdate) return;
        const options: StartUpdateOptions =
          Platform.OS === "android" ? { updateType: IAUUpdateKind.IMMEDIATE } : {};
        inAppUpdates.startUpdate(options);
      })
      .catch((err) => console.log("Update check failed:", err));
  } catch (e) {
    console.log("InAppUpdates Initialization failed:", e);
  }
};

// 화면을 그리다 에러가 나면 흰 화면 대신 안내 화면을 보여 준다. (Expo Router가 이 export를 찾아 쓴다)
export { ErrorFallback as ErrorBoundary };

// 이 시간 이상 백그라운드에 있다가 돌아오면 메인 화면으로 이동한다.
const RETURN_TO_MAIN_AFTER_MS = 30 * 1000;
// 작성 중인 내용이 사라지지 않도록 복귀 시에도 유지하는 화면
const KEEP_SCREEN_PATHS = ["/AddQuoteScreen"];

export default function RootLayout() {
  const currentTheme = useThemeStore((s) => s.currentTheme);
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;
  const backgroundedAt = useRef<number | null>(null);
  // 앱을 열게 한(또는 실행 중에 누른) 알림. 처음 실행할 때 누른 알림도 함께 받는다.
  const notificationResponse = Notifications.useLastNotificationResponse();

  // 저장된 폰트 설정을 읽고, 따옴표 폰트와 고른 명언 폰트만 불러온다. 그전에는 스플래시를 유지한다.
  // (나머지 명언 폰트는 고를 때 불러온다. utils/fonts.ts 참고)
  const [fontsLoaded, setFontsLoaded] = useState(false);
  useEffect(() => {
    fontSettingsLoaded
      .then(() => loadStartupFonts(useFontStore.getState().currentFontId))
      .finally(() => {
        setFontsLoaded(true);
        SplashScreen.hideAsync().catch(() => {});
      });
  }, []);

  // 화면 전환마다 screen_view를 기록한다.
  useEffect(() => {
    trackScreen(pathname === "/" ? "Home" : pathname.replace(/^\//, ""));
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

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider theme={currentTheme}>
        <StatusBar />

        <Stack initialRouteName="(navi)" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(navi)" />
          <Stack.Screen name="SettingScreen" />
          <Stack.Screen name="PrivacyScreen" />
          <Stack.Screen name="TermsScreen" />
          <Stack.Screen name="MyQuotesScreen" />
          {/* 명언 추가/수정은 아래에서 올라오는 모달로 띄운다. */}
          <Stack.Screen name="AddQuoteScreen" options={{ presentation: "modal" }} />
        </Stack>

        <Toast position="bottom" bottomOffset={76} config={toastConfig} />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
