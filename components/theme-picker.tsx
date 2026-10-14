import { useThemeStore } from "@/store/theme";
import { themeList } from "@/themes";
import { BottomSheetFlatList, BottomSheetView } from "@gorhom/bottom-sheet";
import { forwardRef } from "react";
import PickerSheet, { PickerSheetHandle } from "./picker-sheet";
import ThemeItem from "./theme-item";

const SNAP_POINTS = ["25%"];

const ThemePicker = forwardRef<PickerSheetHandle>(function ThemePicker(_props, ref) {
  const { currentTheme } = useThemeStore();

  return (
    <PickerSheet
      ref={ref}
      snapPoints={SNAP_POINTS}
      backgroundStyle={{ backgroundColor: currentTheme.colors.$sidebarBackground }}
      handleIndicatorStyle={{ backgroundColor: currentTheme.colors.$foreground }}
    >
      <BottomSheetView>
        <BottomSheetFlatList
          data={themeList}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={{ paddingTop: 12, paddingHorizontal: 16 }}
          columnWrapperStyle={{ marginBottom: 16, justifyContent: "space-between", gap: 8 }}
          renderItem={({ item }) => <ThemeItem item={item} />}
        />
      </BottomSheetView>
    </PickerSheet>
  );
});

export default ThemePicker;
