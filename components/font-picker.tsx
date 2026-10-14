import { Box, Text } from "@/atom";
import { BottomSheetView } from "@gorhom/bottom-sheet";
import { forwardRef, useImperativeHandle, useRef } from "react";
import { Pressable, useWindowDimensions } from "react-native";
import { useFontStore, FontId, toFontFamily } from "@/store/font-store";
import { useThemeStore } from "@/store/theme";
import FeatherIcon from "./icon";
import PickerSheet, { PickerSheetHandle } from "./picker-sheet";

const FONT_SIZE_MIN = 16;
const FONT_SIZE_MAX = 48;
const FONT_SIZE_STEP = 2;

const SIDE_PADDING = 20;
const GAP = 12;

const FONT_LIST: { id: FontId; name: string }[] = [
  { id: "system", name: "시스템 기본" },
  { id: "NotoSansKR_400Regular", name: "노토 산스" },
  { id: "NanumMyeongjo_400Regular", name: "나눔 명조" },
  { id: "GowunDodum_400Regular", name: "고운 돋움" },
  { id: "Jua_400Regular", name: "주아" },
  { id: "NanumPenScript_400Regular", name: "나눔 펜" },
];

// 글자 크기 -/+ 버튼 (끝에 닿으면 흐리게)
const FontSizeButton: React.FC<{ icon: "minus" | "plus"; disabled: boolean; onPress: () => void }> = ({
  icon,
  disabled,
  onPress,
}) => (
  <Pressable onPress={onPress} disabled={disabled} hitSlop={6}>
    <Box
      width={36}
      height={36}
      borderRadius="hg"
      bg="$sidebarBackground"
      justifyContent="center"
      alignItems="center"
      style={{ opacity: disabled ? 0.3 : 1 }}
    >
      <FeatherIcon name={icon} size={16} />
    </Box>
  </Pressable>
);

// 폰트 선택 바텀시트: 위쪽은 글자 크기 조절, 아래쪽은 폰트 미리보기 목록. 높이는 내용에 맞춘다.
const FontPicker = forwardRef<PickerSheetHandle>(function FontPicker(_props, ref) {
  const sheetRef = useRef<PickerSheetHandle>(null);
  const { currentFontId, updateFontId, currentFontSize, updateFontSize } = useFontStore();
  const { currentTheme } = useThemeStore();
  const { colors } = currentTheme;
  const { width } = useWindowDimensions();
  const itemWidth = (width - SIDE_PADDING * 2 - GAP) / 2;

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
      backgroundStyle={{ backgroundColor: colors.$sidebarBackground }}
      handleIndicatorStyle={{ backgroundColor: colors.$foreground, opacity: 0.2 }}
    >
      <BottomSheetView style={{ paddingHorizontal: SIDE_PADDING, paddingTop: 8, paddingBottom: 40 }}>
        <Text fontSize={18} fontWeight="bold">글꼴</Text>

        {/* ── 글자 크기 조절 ── */}
        <Box
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
          mt="lg"
          bg="$background"
          style={{
            borderRadius: 16,
            paddingVertical: 10,
            paddingLeft: 16,
            paddingRight: 10,
            borderWidth: 1,
            borderColor: colors.$foreground + "14",
          }}
        >
          <Text fontSize={14} style={{ fontWeight: "500" }}>글자 크기</Text>
          <Box flexDirection="row" alignItems="center" style={{ gap: 12 }}>
            <FontSizeButton
              icon="minus"
              disabled={currentFontSize <= FONT_SIZE_MIN}
              onPress={() => changeFontSize(-FONT_SIZE_STEP)}
            />
            <Text fontSize={16} fontWeight="bold" style={{ minWidth: 28, textAlign: "center" }}>
              {currentFontSize}
            </Text>
            <FontSizeButton
              icon="plus"
              disabled={currentFontSize >= FONT_SIZE_MAX}
              onPress={() => changeFontSize(FONT_SIZE_STEP)}
            />
          </Box>
        </Box>

        {/* ── 폰트 목록 (2열, 각 폰트로 쓴 미리보기) ── */}
        <Box flexDirection="row" flexWrap="wrap" mt="lg" style={{ gap: GAP }}>
          {FONT_LIST.map((item) => {
            const isActive = currentFontId === item.id;
            const fontFamily = toFontFamily(item.id);
            return (
              <Pressable
                key={item.id}
                style={{ width: itemWidth }}
                onPress={() => {
                  updateFontId(item.id);
                  sheetRef.current?.close();
                }}
              >
                <Box
                  justifyContent="center"
                  alignItems="center"
                  bg="$background"
                  style={{
                    height: 76,
                    borderRadius: 16,
                    borderWidth: 2,
                    borderColor: isActive ? colors.$primary : colors.$foreground + "14",
                    gap: 4,
                  }}
                >
                  {/* 폰트마다 위아래 여백이 달라(특히 노토 산스) 줄 높이를 고정해 위치를 맞춘다. */}
                  <Text
                    fontSize={20}
                    style={{ fontFamily, lineHeight: 28, includeFontPadding: false, textAlignVertical: "center" }}
                  >
                    가나다 Aa
                  </Text>
                  <Text fontSize={12} style={{ opacity: isActive ? 1 : 0.6, fontWeight: isActive ? "bold" : "500" }}>
                    {item.name}
                  </Text>

                  {isActive && (
                    <Box
                      position="absolute"
                      top={6}
                      right={6}
                      width={18}
                      height={18}
                      borderRadius="hg"
                      justifyContent="center"
                      alignItems="center"
                      bg="$primary"
                    >
                      <FeatherIcon name="check" size={12} color="white" />
                    </Box>
                  )}
                </Box>
              </Pressable>
            );
          })}
        </Box>
      </BottomSheetView>
    </PickerSheet>
  );
});

export default FontPicker;
