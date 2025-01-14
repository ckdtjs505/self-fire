import { getCurrentTheme } from "@/themes";
import { ThemeProvider } from "@shopify/restyle";
import { Stack } from "expo-router";

const currentTheme = getCurrentTheme();

export default function RootLayout() {
  return (
    <ThemeProvider theme={currentTheme}>
      <Stack>
        <Stack.Screen
          name="(navi)"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </ThemeProvider>
  );
}
