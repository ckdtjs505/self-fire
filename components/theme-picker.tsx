import { Box, Text } from "@/atom";
import { themelist } from "@/themes";
import {
  BottomSheetBackdrop,
  BottomSheetFlatList,
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
import ThemeItem from "./theme-item";

const DATA = themelist;

const ThemePicker = forwardRef((props, ref) => {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["25%"], []);

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
        <BottomSheetFlatList
          data={DATA}
          keyExtractor={(item, index) => index.toString()}
          numColumns={2}
          contentContainerStyle={{
            paddingTop: 12,
            paddingHorizontal: 16,
          }}
          columnWrapperStyle={{
            marginBottom: 16,
            justifyContent: "space-between",
            gap: 8,
          }}
          renderItem={({ item }) => {
            return <ThemeItem item={item} />;
          }}
        ></BottomSheetFlatList>
      </BottomSheetView>
    </BottomSheetModal>
  );
});

export default ThemePicker;
