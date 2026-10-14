import { Box, Text } from "@/atom";
import { BottomSheetFlatList, BottomSheetView } from "@gorhom/bottom-sheet";
import { forwardRef, useImperativeHandle, useRef } from "react";
import { Pressable } from "react-native";
import { useFontStore, FontId, toFontFamily } from "@/store/font-store";
import { useThemeStore } from "@/store/theme";
import PickerSheet, { PickerSheetHandle } from "./picker-sheet";

const FONT_SIZE_MIN = 16;
const FONT_SIZE_MAX = 48;
const FONT_SIZE_STEP = 2;

const SNAP_POINTS = ["50%"];

const FONT_LIST: { id: FontId; name: string }[] = [
  { id: "system", name: "시스템 기본\n(System)" },
  { id: "NotoSansKR_400Regular", name: "노토 산스\n(Noto Sans)" },
  { id: "NanumMyeongjo_400Regular", name: "나눔 명조\n(Myeongjo)" },
  { id: "GowunDodum_400Regular", name: "고운 돋움\n(Gowun)" },
  { id: "Jua_400Regular", name: "주아\n(Jua)" },
  { id: "NanumPenScript_400Regular", name: "나눔 펜\n(Nanum Pen)" },
];

// 글자 크기 -/+ 버튼
const FontSizeButton: React.FC<{ label: string; onPress: () => void }> = ({ label, onPress }) => (
  <Pressable onPress={onPress}>
    <Box
      bg="$background"
      p="xs"
      px="md"
      borderRadius="md"
      style={{ elevation: 1, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 2, shadowOffset: { width: 0, height: 1 } }}
    >
      <Text fontSize={20} fontWeight="bold">{label}</Text>
    </Box>
  </Pressable>
);

const FontPicker = forwardRef<PickerSheetHandle>((_props, ref) => {
  const sheetRef = useRef<PickerSheetHandle>(null);
  const { currentFontId, updateFontId, currentFontSize, updateFontSize } = useFontStore();
  const { currentTheme } = useThemeStore();

  useImperativeHandle(ref, () => ({
    open: () => sheetRef.current?.open(),
    close: () => sheetRef.current?.close(),
  }));

  const changeFontSize = (delta: number) => {
    const next = Math.min(FONT_SIZE_MAX, Math.max(FONT_SIZE_MIN, currentFontSize + delta));
    updateFontSize(next);
  };

  return (
    <PickerSheet
      ref={sheetRef}
      snapPoints={SNAP_POINTS}
      backgroundStyle={{ backgroundColor: currentTheme.colors.$sidebarBackground }}
      handleIndicatorStyle={{ backgroundColor: currentTheme.colors.$foreground }}
    >
      <BottomSheetView style={{ paddingBottom: 24 }}>
        {/* ── 글자 크기 조절 ── */}
        <Box flexDirection="row" alignItems="center" justifyContent="space-between" px="xl" py="md" mt="md" mb="s">
          <Text fontSize={16} fontWeight="bold">글자 크기</Text>
          <Box flexDirection="row" alignItems="center" style={{ gap: 16 }}>
            <FontSizeButton label="-" onPress={() => changeFontSize(-FONT_SIZE_STEP)} />
            <Text fontSize={16} fontWeight="bold" style={{ minWidth: 24, textAlign: "center" }}>
              {currentFontSize}
            </Text>
            <FontSizeButton label="+" onPress={() => changeFontSize(FONT_SIZE_STEP)} />
          </Box>
        </Box>

        {/* ── 폰트 목록 (2열 그리드) ── */}
        <BottomSheetFlatList
          data={FONT_LIST}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={{ paddingTop: 12, paddingHorizontal: 16, paddingBottom: 24 }}
          columnWrapperStyle={{ marginBottom: 16, justifyContent: "space-between", gap: 16 }}
          renderItem={({ item }) => {
            const isActive = currentFontId === item.id;
            return (
              <Pressable
                style={{ flex: 1 }}
                onPress={() => {
                  updateFontId(item.id);
                  sheetRef.current?.close();
                }}
              >
                <Box
                  p="lg"
                  borderRadius="lg"
                  backgroundColor={isActive ? "$primary" : "$background"}
                  style={{
                    height: 80,
                    justifyContent: "center",
                    alignItems: "center",
                    shadowColor: isActive ? currentTheme.colors.$primary : "#000",
                    shadowOpacity: 0.15,
                    shadowRadius: 8,
                    shadowOffset: { width: 0, height: 4 },
                    elevation: 2,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: toFontFamily(item.id),
                      color: isActive ? "white" : currentTheme.colors.$foreground,
                      textAlign: "center",
                      fontSize: 15,
                      fontWeight: isActive ? "bold" : "normal",
                    }}
                  >
                    {item.name}
                  </Text>
                </Box>
              </Pressable>
            );
          }}
        />
      </BottomSheetView>
    </PickerSheet>
  );
});

export default FontPicker;
