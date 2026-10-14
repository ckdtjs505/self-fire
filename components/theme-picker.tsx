import { Box } from "@/atom";
import { useThemeStore } from "@/store/theme";
import { themeList } from "@/themes";
import { forwardRef } from "react";
import { useWindowDimensions } from "react-native";
import PickerSheet, { PickerSheetHandle, SHEET_SIDE_PADDING } from "./picker-sheet";
import ThemeItem from "./theme-item";

const COLUMNS = 3;
const GAP = 10;

// 테마 선택 바텀시트
const ThemePicker = forwardRef<PickerSheetHandle>(function ThemePicker(_props, ref) {
  const { currentThemeId } = useThemeStore();
  const { width } = useWindowDimensions();
  const itemWidth = (width - SHEET_SIDE_PADDING * 2 - GAP * (COLUMNS - 1)) / COLUMNS;

  return (
    <PickerSheet ref={ref} title="테마" description="오늘의 분위기에 맞는 색을 골라 보세요">
      <Box flexDirection="row" flexWrap="wrap" style={{ gap: GAP, rowGap: 16 }}>
        {themeList.map((item) => (
          <ThemeItem key={item.id} item={item} width={itemWidth} isActive={item.id === currentThemeId} />
        ))}
      </Box>
    </PickerSheet>
  );
});

export default ThemePicker;
