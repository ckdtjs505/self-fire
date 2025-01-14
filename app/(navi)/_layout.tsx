import Sidebar from "@/components/sidebar";
import { Drawer } from "expo-router/drawer";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function Navigator() {
  return (
    <GestureHandlerRootView>
      <Drawer drawerContent={Sidebar}>
        <Drawer.Screen
          name="index"
          options={{
            headerShown: false,
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}
