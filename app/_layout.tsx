import StatusBar from "@/components/status-bar";
import { useThemeStore } from "@/store/theme";
import { ThemeProvider } from "@shopify/restyle";
import { router, Stack } from "expo-router";
import { useEffect, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import mobileAds from "react-native-google-mobile-ads";
import * as Notifications from "expo-notifications";

mobileAds()
  .setRequestConfiguration({
    testDeviceIdentifiers: __DEV__ ? ['EMULATOR'] : [],
  })
  .then(() => {
    return mobileAds().initialize();
  })
  .then((adapterStatuses) => {
    console.log('AdMob initialization complete!');
  });

// 포그라운드에서 알림을 받을 때 배너로 표시
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function RootLayout() {
  const { currentTheme } = useThemeStore();
  const appState = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      // 백그라운드 → 포그라운드로 전환될 때 메인으로 이동
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        router.replace("/(navi)");
      }
      appState.current = nextAppState;
    });

    return () => subscription.remove();
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider theme={currentTheme}>
        <StatusBar></StatusBar>
        <Stack initialRouteName="(navi)">
          <Stack.Screen
            name="(navi)"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="SettingScreen"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="PrivacyScreen"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="TermsScreen"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="MyQuotesScreen"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="AddQuoteScreen"
            options={{
              headerShown: false,
              presentation: "modal",
            }}
          />
        </Stack>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
