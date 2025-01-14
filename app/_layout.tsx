import theme from "@/themes/light";
import { ThemeProvider } from "@shopify/restyle";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <ThemeProvider theme={theme}>
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
