import { Text } from "@/atom";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";

const ThemePicker = forwardRef((props, ref) => {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["55%", "75%"], []);

  useImperativeHandle(ref, () => ({
    open: () => bottomSheetModalRef.current?.present(),
    close: () => bottomSheetModalRef.current?.dismiss(),
  }));

  const renderBackdrop = useCallback(
    (props: any) => <BottomSheetBackdrop {...props} pressBehavior={"close"} />,
    [],
  );

  return (
    <BottomSheetModal
      index={1}
      ref={bottomSheetModalRef}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
    >
      <BottomSheetView>
        <Text> Awesome </Text>
      </BottomSheetView>
    </BottomSheetModal>
  );
});

export default ThemePicker;
