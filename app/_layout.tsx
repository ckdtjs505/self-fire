// ─────────────────────────────────────────────────────────────
// _layout.tsx
// 앱 전체의 루트 레이아웃.
// - AdMob 초기화 / 포그라운드 알림 핸들러 설정
// - 구글 폰트 로드
// - 강제 업데이트 체크
// - 백그라운드 → 포그라운드 복귀 시 메인 화면으로 이동
// - SafeAreaProvider / ThemeProvider / Toast 등 전역 래퍼 제공
// ─────────────────────────────────────────────────────────────

import StatusBar from "@/components/status-bar";
import { toastConfig } from "@/components/simple-toast";
import { useThemeStore } from "@/store/theme";
import { GowunDodum_400Regular } from "@expo-google-fonts/gowun-dodum";
import { Jua_400Regular } from "@expo-google-fonts/jua";
import { NanumMyeongjo_400Regular, NanumMyeongjo_700Bold, NanumMyeongjo_800ExtraBold } from "@expo-google-fonts/nanum-myeongjo";
import { NanumPenScript_400Regular } from "@expo-google-fonts/nanum-pen-script";
import { NotoSansKR_400Regular, NotoSansKR_700Bold, NotoSansKR_900Black, useFonts } from "@expo-google-fonts/noto-sans-kr";
import { ThemeProvider } from "@shopify/restyle";
import * as Notifications from "expo-notifications";
import { router, Stack } from "expo-router";
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

export default function RootLayout() {
  const { currentTheme } = useThemeStore();
  const appState = useRef(AppState.currentState);

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

    // 다른 앱에서 돌아오면 항상 명언(메인) 화면을 보여준다.
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      const wasInBackground = /inactive|background/.test(appState.current);
      if (wasInBackground && nextAppState === "active") {
        router.replace("/(navi)");
      }
      appState.current = nextAppState;
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
