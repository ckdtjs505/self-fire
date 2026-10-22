// ─────────────────────────────────────────────────────────────
// app/customize.tsx
// 꾸미기: 앱과 명언 카드, 홈 화면 위젯의 모습을 바꾸는 곳을 한데 모은 화면. (/customize)
//   - 테마·카드 배경 (components/theme-picker.tsx)
//   - 글꼴 (components/font-picker.tsx)
//   - 위젯 꾸미기 (Android, components/widget-style-sheet.tsx)
// 가끔 바꾸는 기능이라 홈 헤더 대신 사이드바 메뉴에서 연다. 홈은 오늘 따르는 문장과 할 일에 집중한다.
// ─────────────────────────────────────────────────────────────

import { Box, SafeAreaView, Text } from "@/atom";
import FontPicker, { FONT_LIST } from "@/components/font-picker";
import { PickerSheetHandle } from "@/components/picker-sheet";
import ScreenHeader from "@/components/screen-header";
import SettingItem, { SettingDivider, SettingSection } from "@/components/setting-item";
import ThemePicker from "@/components/theme-picker";
import WidgetStyleSheet from "@/components/widget-style-sheet";
import { getCardBackground } from "@/data/card-backgrounds";
import { useCardBackgroundStore } from "@/store/card-background";
import { useFontStore } from "@/store/font-store";
import { useThemeStore } from "@/store/theme";
import { themeList } from "@/themes";
import { isWidgetSupported } from "@/widgets/widget-pin";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { useRef } from "react";
import { ScrollView } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

// 지금 고른 값을 줄 오른쪽에 보여 준다.
const CurrentValue: React.FC<{ children: string }> = ({ children }) => (
  <Text variant="caption" fontSize={13} numberOfLines={1} style={{ maxWidth: 160 }}>
    {children}
  </Text>
);

function CustomizeContent() {
  const currentThemeId = useThemeStore((s) => s.currentThemeId);
  const currentBackgroundId = useCardBackgroundStore((s) => s.currentBackgroundId);
  const currentFontId = useFontStore((s) => s.currentFontId);
  const themeName = themeList.find((t) => t.id === currentThemeId)?.name ?? "";
  const background = getCardBackground(currentBackgroundId);
  const fontName = FONT_LIST.find((f) => f.id === currentFontId)?.name ?? "";

  const themePickerRef = useRef<PickerSheetHandle>(null);
  const fontPickerRef = useRef<PickerSheetHandle>(null);
  const widgetStyleSheetRef = useRef<PickerSheetHandle>(null);

  return (
    <SafeAreaView flex={1} bg="$background">
      <Box flex={1}>
        <ScreenHeader title="꾸미기" />
        <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 40 }}>
          <SettingSection title="앱과 명언 카드">
            <SettingItem
              icon="image"
              title="테마 · 카드 배경"
              onPress={() => themePickerRef.current?.open()}
              rightElement={
                <CurrentValue>{background.id === "none" ? themeName : `${themeName} · ${background.label}`}</CurrentValue>
              }
            />
            <SettingDivider />
            <SettingItem
              icon="type"
              title="글꼴"
              onPress={() => fontPickerRef.current?.open()}
              rightElement={<CurrentValue>{fontName}</CurrentValue>}
            />
          </SettingSection>

          {isWidgetSupported && (
            <SettingSection title="홈 화면 위젯">
              <SettingItem icon="droplet" title="위젯 꾸미기" onPress={() => widgetStyleSheetRef.current?.open()} />
            </SettingSection>
          )}
        </ScrollView>
      </Box>
      <ThemePicker ref={themePickerRef} />
      <FontPicker ref={fontPickerRef} />
      <WidgetStyleSheet ref={widgetStyleSheetRef} />
    </SafeAreaView>
  );
}

// 바텀시트를 띄우기 위해 이 화면에도 제스처 루트와 시트 프로바이더를 둔다. (app/settings.tsx와 같다)
export default function CustomizeScreen() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <CustomizeContent />
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
