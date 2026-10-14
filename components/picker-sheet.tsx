// ─────────────────────────────────────────────────────────────
// picker-sheet.tsx
// 테마/폰트 선택 등에 쓰는 공용 바텀시트.
// ref.current.open() / close()로 열고 닫는다.
// ─────────────────────────────────────────────────────────────

import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetModalProps,
} from "@gorhom/bottom-sheet";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";

export type PickerSheetHandle = {
  open: () => void;
  close: () => void;
};

type Props = Pick<BottomSheetModalProps, "snapPoints" | "backgroundStyle" | "handleIndicatorStyle"> & {
  children: React.ReactNode;
};

const PickerSheet = forwardRef<PickerSheetHandle, Props>(({ children, ...sheetProps }, ref) => {
  const modalRef = useRef<BottomSheetModal>(null);

  useImperativeHandle(ref, () => ({
    open: () => modalRef.current?.present(),
    close: () => modalRef.current?.dismiss(),
  }));

  // 바깥(반투명 배경)을 누르면 닫힌다.
  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} pressBehavior="close" appearsOnIndex={0} disappearsOnIndex={-1} />
    ),
    []
  );

  return (
    <BottomSheetModal ref={modalRef} index={0} backdropComponent={renderBackdrop} {...sheetProps}>
      {children}
    </BottomSheetModal>
  );
});

export default PickerSheet;
