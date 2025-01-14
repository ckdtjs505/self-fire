import { Stack } from "expo-router";
export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="(navi)"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
