import { Drawer } from "expo-router/drawer";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function Navigator() {
  return (
    <GestureHandlerRootView>
      <Drawer>
        <Drawer.Screen name="index" />
      </Drawer>
    </GestureHandlerRootView>
  );
}
