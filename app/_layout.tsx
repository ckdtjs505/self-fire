// ─────────────────────────────────────────────────────────────
// _layout.tsx
// 앱 전체의 루트 레이아웃.
// - AdMob 초기화 / 포그라운드 알림 핸들러 설정 / 오늘의 명언 알림 예약 갱신
// - 구글 폰트 로드
// - 강제 업데이트 체크
// - 백그라운드에 한동안 있다가 복귀 시 메인 화면으로 이동
// - SafeAreaProvider / ThemeProvider / Toast 등 전역 래퍼 제공
// ─────────────────────────────────────────────────────────────

import StatusBar from "@/components/status-bar";
import { toastConfig } from "@/components/simple-toast";
import { refreshDailyNotifications } from "@/store/notification";
import { useThemeStore } from "@/store/theme";
import { GowunDodum_400Regular } from "@expo-google-fonts/gowun-dodum";
import { Jua_400Regular } from "@expo-google-fonts/jua";
import { NanumMyeongjo_400Regular, NanumMyeongjo_700Bold, NanumMyeongjo_800ExtraBold } from "@expo-google-fonts/nanum-myeongjo";
import { NanumPenScript_400Regular } from "@expo-google-fonts/nanum-pen-script";
import { NotoSansKR_400Regular, NotoSansKR_700Bold, NotoSansKR_900Black, useFonts } from "@expo-google-fonts/noto-sans-kr";
import { ThemeProvider } from "@shopify/restyle";
import * as Notifications from "expo-notifications";
import { router, Stack, usePathname } from "expo-router";
import { useEffect, useRef } from "react";
import { AppState, Platform } from "react-native";
import mobileAds from "react-native-google-mobile-ads";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import SpInAppUpdates, { IAUUpdateKind, StartUpdateOptions } from "sp-react-native-in-app-updates";

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

// 이 시간 이상 백그라운드에 있다가 돌아오면 메인 화면으로 이동한다.
const RETURN_TO_MAIN_AFTER_MS = 30 * 1000;
// 작성 중인 내용이 사라지지 않도록 복귀 시에도 유지하는 화면
const KEEP_SCREEN_PATHS = ["/AddQuoteScreen"];

export default function RootLayout() {
  const { currentTheme } = useThemeStore();
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;
  const backgroundedAt = useRef<number | null>(null);

  // 폰트 로드가 끝나기 전에는 아무것도 렌더링하지 않는다.
  const [fontsLoaded] = useFonts({
    NotoSansKR_400Regular,
    NotoSansKR_700Bold,
    NotoSansKR_900Black,
    NanumMyeongjo_400Regular,
    NanumMyeongjo_700Bold,
    NanumMyeongjo_800ExtraBold,
    GowunDodum_400Regular,
    Jua_400Regular,
    NanumPenScript_400Regular,
  });

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

        <Toast position="bottom" bottomOffset={60} config={toastConfig} />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
