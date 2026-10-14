import { Box, Text } from "@/atom";
import { forwardRef, useImperativeHandle, useRef } from "react";
import { Pressable, useWindowDimensions } from "react-native";
import { useFontStore, FontId, toFontFamily } from "@/store/font-store";
import FeatherIcon from "./icon";
import PickerSheet, { PickerSheetHandle, SHEET_SIDE_PADDING } from "./picker-sheet";

const FONT_SIZE_MIN = 16;
const FONT_SIZE_MAX = 48;
const FONT_SIZE_STEP = 2;

const GAP = 10;

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
      width={38}
      height={38}
      borderRadius="pill"
      bg="$surface"
      borderWidth={1}
      borderColor="$border"
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
  const { width } = useWindowDimensions();
  const itemWidth = (width - SHEET_SIDE_PADDING * 2 - GAP) / 2;

  useImperativeHandle(ref, () => ({
    open: () => sheetRef.current?.open(),
    close: () => sheetRef.current?.close(),
  }));

  const changeFontSize = (delta: number) => {
    const next = Math.min(FONT_SIZE_MAX, Math.max(FONT_SIZE_MIN, currentFontSize + delta));
    updateFontSize(next);
  };

  return (
    <PickerSheet ref={sheetRef} title="글꼴" description="명언을 보여줄 글꼴과 크기를 정해 보세요">
      {/* ── 글자 크기 조절 ── */}
      <Box
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        bg="$surfaceMuted"
        borderRadius="md"
        style={{ paddingVertical: 10, paddingLeft: 16, paddingRight: 10 }}
      >
        <Text variant="body">글자 크기</Text>
        <Box flexDirection="row" alignItems="center" style={{ gap: 12 }}>
          <FontSizeButton
            icon="minus"
            disabled={currentFontSize <= FONT_SIZE_MIN}
            onPress={() => changeFontSize(-FONT_SIZE_STEP)}
          />
          <Text fontSize={16} fontWeight="800" style={{ minWidth: 28, textAlign: "center" }}>
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
      <Box flexDirection="row" flexWrap="wrap" mt="md" style={{ gap: GAP }}>
        {FONT_LIST.map((item) => {
          const isActive = currentFontId === item.id;
          const fontFamily = toFontFamily(item.id);
          return (
            <Pressable
              key={item.id}
              style={{ width: itemWidth }}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              onPress={() => {
                updateFontId(item.id);
                sheetRef.current?.close();
              }}
            >
              <Box
                justifyContent="center"
                alignItems="center"
                height={80}
                borderRadius="md"
                bg={isActive ? "$primarySoft" : "$surfaceMuted"}
                borderWidth={2}
                borderColor={isActive ? "$primary" : "transparent"}
                style={{ gap: 4 }}
              >
                {/* 폰트마다 위아래 여백이 달라(특히 노토 산스) 줄 높이를 고정해 위치를 맞춘다. */}
                <Text
                  fontSize={20}
                  style={{ fontFamily, lineHeight: 28, includeFontPadding: false, textAlignVertical: "center" }}
                >
                  가나다 Aa
                </Text>
                <Text
                  fontSize={12}
                  fontWeight={isActive ? "700" : "500"}
                  color={isActive ? "$primary" : "$muted"}
                >
                  {item.name}
                </Text>

                {isActive && (
                  <Box
                    position="absolute"
                    top={6}
                    right={6}
                    width={18}
                    height={18}
                    borderRadius="pill"
                    justifyContent="center"
                    alignItems="center"
                    bg="$primary"
                  >
                    <FeatherIcon name="check" size={11} color="$onPrimary" />
                  </Box>
                )}
              </Box>
            </Pressable>
          );
        })}
      </Box>
    </PickerSheet>
  );
});

export default FontPicker;
