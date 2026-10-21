// ─────────────────────────────────────────────────────────────
// error-fallback.tsx
// 화면을 그리다 에러가 나면 흰 화면 대신 보여 주는 안내 화면.
// app/_layout.tsx에서 Expo Router의 ErrorBoundary로 내보낸다.
//   - 루트 레이아웃 대신 그려지므로 ThemeProvider·구글 폰트가 없을 수 있다.
//     그래서 restyle 대신 테마 스토어의 색과 시스템 폰트를 직접 쓴다.
//   - 잡힌 에러는 Crashlytics에 non-fatal로 기록하고, 스플래시가 떠 있으면 내린다.
// ─────────────────────────────────────────────────────────────

import { useThemeStore } from "@/store/theme";
import { reportError } from "@/utils/analytics";
import { ErrorBoundaryProps } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { Pressable, Text, View } from "react-native";

export default function ErrorFallback({ error, retry }: ErrorBoundaryProps) {
  const colors = useThemeStore((s) => s.currentTheme.colors);

  useEffect(() => {
    reportError(error, "ErrorBoundary");
    // 시작 중에 에러가 나도 스플래시에 가려지지 않게 한다.
    SplashScreen.hideAsync().catch(() => {});
  }, [error]);

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 32,
        gap: 12,
        backgroundColor: colors.$background,
      }}
    >
      <Text style={{ fontSize: 40 }}>🔥</Text>
      <Text style={{ fontSize: 18, fontWeight: "700", color: colors.$foreground, textAlign: "center" }}>
        잠시 불씨가 흔들렸어요
      </Text>
      <Text style={{ fontSize: 14, color: colors.$muted, textAlign: "center" }}>
        화면을 불러오는 중에 문제가 생겼어요. 다시 시도해 주세요.
      </Text>
      <Pressable
        onPress={retry}
        accessibilityRole="button"
        accessibilityLabel="다시 시도"
        style={{
          marginTop: 12,
          paddingHorizontal: 24,
          paddingVertical: 12,
          borderRadius: 100,
          backgroundColor: colors.$primary,
        }}
      >
        <Text style={{ fontSize: 15, fontWeight: "700", color: colors.$onPrimary }}>다시 시도</Text>
      </Pressable>
    </View>
  );
}
