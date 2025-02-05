import Sidebar from "@/components/sidebar";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { Drawer } from "expo-router/drawer";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function Navigator() {
  return (
    <GestureHandlerRootView>
      <BottomSheetModalProvider>
        <Drawer drawerContent={Sidebar}>
          <Drawer.Screen
            name="index"
            options={{
              headerShown: false,
            }}
          />
        </Drawer>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
