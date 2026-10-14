// ─────────────────────────────────────────────────────────────
// picker-sheet.tsx
// 테마/폰트/카테고리 선택 등에 쓰는 공용 바텀시트.
// 현재 테마의 면 색을 쓰고, 제목·설명을 받아 같은 모양의 머리말을 그린다.
// ref.current.open() / close()로 열고 닫는다. 높이는 내용에 맞춘다.
// ─────────────────────────────────────────────────────────────

import { Box, Text } from "@/atom";
import { useThemeStore } from "@/store/theme";
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";

export type PickerSheetHandle = {
  open: () => void;
  close: () => void;
};

// 시트 좌우 여백 (그리드 칸 너비 계산에 사용)
export const SHEET_SIDE_PADDING = 20;

type Props = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

const PickerSheet = forwardRef<PickerSheetHandle, Props>(function PickerSheet({ title, description, children }, ref) {
  const modalRef = useRef<BottomSheetModal>(null);
  const { colors } = useThemeStore().currentTheme;

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
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: colors.$surface, borderRadius: 28 }}
      handleIndicatorStyle={{ backgroundColor: colors.$muted, opacity: 0.4, width: 36 }}
    >
      <BottomSheetView style={{ paddingHorizontal: SHEET_SIDE_PADDING, paddingTop: 8, paddingBottom: 40 }}>
        <Box marginBottom="lg">
          <Text variant="heading">{title}</Text>
          {!!description && (
            <Text variant="caption" marginTop="xs">
              {description}
            </Text>
          )}
        </Box>
        {children}
      </BottomSheetView>
    </BottomSheetModal>
  );
});

export default PickerSheet;
