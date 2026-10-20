// ─────────────────────────────────────────────────────────────
// picker-sheet.tsx
// 테마/폰트/카테고리 선택 등에 쓰는 공용 바텀시트.
// 현재 테마의 면 색을 쓰고, 제목·설명을 받아 같은 모양의 머리말을 그린다.
// ref.current.open() / close()로 열고 닫는다. 높이는 내용에 맞추되,
// 화면보다 길면 상단 안전 영역 아래까지만 올라오고 안쪽을 스크롤한다.
// ─────────────────────────────────────────────────────────────

import { Box, Text } from "@/atom";
import { useThemeStore } from "@/store/theme";
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";
import { useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type PickerSheetHandle = {
  open: () => void;
  close: () => void;
};

// 시트 좌우 여백 (그리드 칸 너비 계산에 사용)
export const SHEET_SIDE_PADDING = 20;

// 시트가 가장 높이 올라와도 상단 안전 영역 아래로 남겨 둘 간격
const SHEET_TOP_GAP = 12;

type Props = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

const PickerSheet = forwardRef<PickerSheetHandle, Props>(function PickerSheet({ title, description, children }, ref) {
  const modalRef = useRef<BottomSheetModal>(null);
  const { colors } = useThemeStore().currentTheme;
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  useImperativeHandle(ref, () => ({
    open: () => modalRef.current?.present(),
    close: () => modalRef.current?.dismiss(),
  }));

  // 바깥(반투명 배경)을 누르면 닫힌다.
  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} pressBehavior="close" appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.5} />
    ),
    []
  );

  return (
    <BottomSheetModal
      ref={modalRef}
      index={0}
      maxDynamicContentSize={height - insets.top - SHEET_TOP_GAP}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: colors.$surface, borderRadius: 28 }}
      handleIndicatorStyle={{ backgroundColor: colors.$muted, opacity: 0.4, width: 36 }}
    >
      <BottomSheetScrollView
        contentContainerStyle={{
          paddingHorizontal: SHEET_SIDE_PADDING,
          paddingTop: 8,
          paddingBottom: 40 + insets.bottom,
        }}
      >
        <Box marginBottom="lg">
          <Text variant="heading">{title}</Text>
          {!!description && (
            <Text variant="caption" marginTop="xs">
              {description}
            </Text>
          )}
        </Box>
        {children}
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
});

export default PickerSheet;
