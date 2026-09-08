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

import { useFonts, NotoSansKR_400Regular, NotoSansKR_700Bold, NotoSansKR_900Black } from "@expo-google-fonts/noto-sans-kr";
import { NanumMyeongjo_400Regular, NanumMyeongjo_700Bold, NanumMyeongjo_800ExtraBold } from "@expo-google-fonts/nanum-myeongjo";
import { GowunDodum_400Regular } from "@expo-google-fonts/gowun-dodum";
import { Jua_400Regular } from "@expo-google-fonts/jua";
import { NanumPenScript_400Regular } from "@expo-google-fonts/nanum-pen-script";

import Toast from 'react-native-toast-message';
import { View, Text } from 'react-native';

const SimpleToast = ({ text1, text2 }: any) => {
  const message = text2 || text1;
  if (!message) return null;
  return (
    <View style={{
      backgroundColor: '#333333',
      borderRadius: 100,
      paddingHorizontal: 24,
      paddingVertical: 12,
      marginHorizontal: 16,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 4,
    }}>
      <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '600', textAlign: 'center' }}>
        {message}
      </Text>
    </View>
  );
};

const toastConfig = {
  success: SimpleToast,
  error: SimpleToast,
  info: SimpleToast,
};

export default function RootLayout() {
  const { currentTheme } = useThemeStore();
  const appState = useRef<AppStateStatus>(AppState.currentState);

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

  if (!fontsLoaded) {
    return null;
  }

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
        <Toast position="bottom" bottomOffset={60} config={toastConfig} />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
