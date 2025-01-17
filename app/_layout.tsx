import StatusBar from "@/components/status-bar";
import { getCurrentTheme } from "@/themes";
import { ThemeProvider } from "@shopify/restyle";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";

const currentTheme = getCurrentTheme();

export default function RootLayout() {
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
        </Stack>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
