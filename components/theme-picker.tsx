import { Box, Text } from "@/atom";
import { useThemeStore } from "@/store/theme";
import { themeList } from "@/themes";
import { BottomSheetView } from "@gorhom/bottom-sheet";
import { forwardRef } from "react";
import { useWindowDimensions } from "react-native";
import PickerSheet, { PickerSheetHandle } from "./picker-sheet";
import ThemeItem from "./theme-item";

const COLUMNS = 3;
const SIDE_PADDING = 20;
const GAP = 12;

// 테마 선택 바텀시트. 높이는 내용에 맞춘다.
const ThemePicker = forwardRef<PickerSheetHandle>(function ThemePicker(_props, ref) {
  const { currentTheme, currentThemeId } = useThemeStore();
  const { width } = useWindowDimensions();
  const itemWidth = (width - SIDE_PADDING * 2 - GAP * (COLUMNS - 1)) / COLUMNS;

  return (
    <PickerSheet
      ref={ref}
      backgroundStyle={{ backgroundColor: currentTheme.colors.$sidebarBackground }}
      handleIndicatorStyle={{ backgroundColor: currentTheme.colors.$foreground, opacity: 0.2 }}
    >
      <BottomSheetView style={{ paddingHorizontal: SIDE_PADDING, paddingTop: 8, paddingBottom: 40 }}>
        <Text fontSize={18} fontWeight="bold">테마</Text>

        <Box flexDirection="row" flexWrap="wrap" mt="lg" style={{ gap: GAP }}>
          {themeList.map((item) => (
            <ThemeItem
              key={item.id}
              item={item}
              width={itemWidth}
              isActive={item.id === currentThemeId}
              activeColor={currentTheme.colors.$primary}
            />
          ))}
        </Box>
      </BottomSheetView>
    </PickerSheet>
  );
});

export default ThemePicker;
