import StatusBar from "@/components/status-bar";
import { useThemeStore } from "@/store/theme";
import { ThemeProvider } from "@shopify/restyle";
import { Stack } from "expo-router";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import mobileAds from "react-native-google-mobile-ads";

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

export default function RootLayout() {
  const { currentTheme } = useThemeStore();
  return (
    <SafeAreaProvider>

      <ThemeProvider theme={currentTheme}>
        <StatusBar></StatusBar>
        <Stack>
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
        </Stack>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
