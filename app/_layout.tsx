// ─────────────────────────────────────────────────────────────
// _layout.tsx
// 앱 전체의 루트 레이아웃.
// - 앱 시작 초기화(Analytics·AdMob·알림 핸들러·스플래시)는 services/bootstrap.ts
// - 화면 조회 기록·알림 열기·복귀 시 홈 이동·강제 업데이트는 hooks/useAppLifecycle.ts
// - 필요한 구글 폰트만 로드 (그동안 스플래시를 유지)
// - 화면을 그리다 에러가 나면 ErrorBoundary로 안내 화면을 보여 주고 Crashlytics에 기록
// - SafeAreaProvider / ThemeProvider / Toast 등 전역 래퍼 제공
// ─────────────────────────────────────────────────────────────

import ErrorFallback from "@/components/error-fallback";
import StatusBar from "@/components/status-bar";
import { toastConfig } from "@/components/simple-toast";
import { useAppLifecycle } from "@/hooks/useAppLifecycle";
import { bootstrapApp } from "@/services/bootstrap";
import { fontSettingsLoaded, useFontStore } from "@/store/font-store";
import { useThemeStore } from "@/store/theme";
import { loadStartupFonts } from "@/utils/fonts";
import { ThemeProvider } from "@shopify/restyle";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

// 스플래시 유지, Analytics·AdMob·알림 핸들러 초기화 (services/bootstrap.ts)
bootstrapApp();

// 화면을 그리다 에러가 나면 흰 화면 대신 안내 화면을 보여 준다. (Expo Router가 이 export를 찾아 쓴다)
export { ErrorFallback as ErrorBoundary };

export default function RootLayout() {
  const currentTheme = useThemeStore((s) => s.currentTheme);
  useAppLifecycle();

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

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider theme={currentTheme}>
        <StatusBar />

        <Stack initialRouteName="(navi)" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(navi)" />
          <Stack.Screen name="settings" />
          <Stack.Screen name="privacy" />
          <Stack.Screen name="terms" />
          <Stack.Screen name="my-quotes" />
          {/* 명언 추가/수정은 아래에서 올라오는 모달로 띄운다. */}
          <Stack.Screen name="add-quote" options={{ presentation: "modal" }} />
        </Stack>

        <Toast position="bottom" bottomOffset={76} config={toastConfig} />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
