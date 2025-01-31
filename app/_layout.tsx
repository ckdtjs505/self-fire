import { useThemeStore } from "@/store/theme";
import { ThemeProvider } from "@shopify/restyle";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  const { currentTheme } = useThemeStore();
  return (
    <SafeAreaProvider>
      <ThemeProvider theme={currentTheme}>
        <Stack>
          <Stack.Screen
            name="(navi)"
            options={{
              headerShown: false,
            }}
          />

          <Stack.Screen 
            name="ThemesScreen"
          />

        </Stack>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
