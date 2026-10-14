import { Box, Text } from "@/atom";
import { CARD_BACKGROUNDS } from "@/data/card-backgrounds";
import { useCardBackgroundStore } from "@/store/card-background";
import { useThemeStore } from "@/store/theme";
import { themeList } from "@/themes";
import { forwardRef } from "react";
import { useWindowDimensions } from "react-native";
import CardBackgroundItem from "./card-background-item";
import PickerSheet, { PickerSheetHandle, SHEET_SIDE_PADDING } from "./picker-sheet";
import ThemeItem from "./theme-item";

const COLUMNS = 3;
const BACKGROUND_COLUMNS = 5;
const GAP = 10;

// 테마 선택 바텀시트: 위쪽은 앱 색 테마, 아래쪽은 명언 카드 배경 이미지
const ThemePicker = forwardRef<PickerSheetHandle>(function ThemePicker(_props, ref) {
  const { currentThemeId } = useThemeStore();
  const { currentBackgroundId } = useCardBackgroundStore();
  const { width } = useWindowDimensions();
  const contentWidth = width - SHEET_SIDE_PADDING * 2;
  const itemWidth = (contentWidth - GAP * (COLUMNS - 1)) / COLUMNS;
  const backgroundItemWidth = (contentWidth - GAP * (BACKGROUND_COLUMNS - 1)) / BACKGROUND_COLUMNS;

  return (
    <PickerSheet ref={ref} title="테마" description="오늘의 분위기에 맞는 색과 카드 배경을 골라 보세요">
      <Box flexDirection="row" flexWrap="wrap" style={{ gap: GAP, rowGap: 16 }}>
        {themeList.map((item) => (
          <ThemeItem key={item.id} item={item} width={itemWidth} isActive={item.id === currentThemeId} />
        ))}
      </Box>

      <Text fontSize={15} fontWeight="700" style={{ marginTop: 28, marginBottom: 12 }}>
        카드 배경
      </Text>
      <Box flexDirection="row" flexWrap="wrap" style={{ gap: GAP, rowGap: 12 }}>
        {CARD_BACKGROUNDS.map((item) => (
          <CardBackgroundItem
            key={item.id}
            item={item}
            width={backgroundItemWidth}
            isActive={item.id === currentBackgroundId}
          />
        ))}
      </Box>
    </PickerSheet>
  );
});

export default ThemePicker;
