// 설정 > 홈 화면 위젯: 놓을 위젯을 고르면 런처의 위젯 추가 창을 띄운다.
import { forwardRef, useImperativeHandle, useRef } from "react";
import PickerSheet, { PickerSheetHandle } from "./picker-sheet";
import WidgetOptions from "./widget-options";

const WidgetSheet = forwardRef<PickerSheetHandle>(function WidgetSheet(_props, ref) {
  const sheetRef = useRef<PickerSheetHandle>(null);

  useImperativeHandle(ref, () => ({
    open: () => sheetRef.current?.open(),
    close: () => sheetRef.current?.close(),
  }));

  return (
    <PickerSheet
      ref={sheetRef}
      title="홈 화면 위젯"
      description="앱을 열지 않아도 오늘의 명언과 불씨를 바로 볼 수 있어요"
    >
      <WidgetOptions source="settings" onPicked={() => sheetRef.current?.close()} />
    </PickerSheet>
  );
});

export default WidgetSheet;
