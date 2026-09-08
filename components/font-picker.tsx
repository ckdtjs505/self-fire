import { Box, Text } from "@/atom";
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
import { Pressable } from "react-native";
import { useFontStore, FontId } from "@/store/font-store";
import { useThemeStore } from "@/store/theme";

const fontList: { id: FontId; name: string }[] = [
  { id: "system", name: "시스템 기본\n(System)" },
  { id: "NotoSansKR_400Regular", name: "노토 산스\n(Noto Sans)" },
  { id: "NanumMyeongjo_400Regular", name: "나눔 명조\n(Myeongjo)" },
  { id: "GowunDodum_400Regular", name: "고운 돋움\n(Gowun)" },
  { id: "Jua_400Regular", name: "주아\n(Jua)" },
  { id: "NanumPenScript_400Regular", name: "나눔 펜\n(Nanum Pen)" },
];

const FontPicker = forwardRef((props, ref) => {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["50%"], []);
  const { currentFontId, updateFontId, currentFontSize, updateFontSize } = useFontStore();
  const { currentTheme } = useThemeStore();

  useImperativeHandle(ref, () => ({
    open: () => bottomSheetModalRef.current?.present(),
    close: () => bottomSheetModalRef.current?.dismiss(),
  }));

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop 
        {...props} 
        pressBehavior={"close"} 
        appearsOnIndex={0} 
        disappearsOnIndex={-1} 
      />
    ),
    []
  );

  return (
    <BottomSheetModal
      index={0}
      ref={bottomSheetModalRef}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: currentTheme.colors.$sidebarBackground }}
      handleIndicatorStyle={{ backgroundColor: currentTheme.colors.$foreground }}
    >
      <BottomSheetView style={{ paddingBottom: 24 }}>
        <Box flexDirection="row" alignItems="center" justifyContent="space-between" px="xl" py="md" mt="md" mb="s">
          <Text fontSize={16} fontWeight="bold">글자 크기</Text>
          <Box flexDirection="row" alignItems="center" style={{ gap: 16 }}>
            <Pressable onPress={() => updateFontSize(Math.max(16, currentFontSize - 2))}>
              <Box bg="$background" p="xs" px="md" borderRadius="md" style={{ elevation: 1, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 2, shadowOffset: { width: 0, height: 1 } }}>
                <Text fontSize={20} fontWeight="bold">-</Text>
              </Box>
            </Pressable>
            <Text fontSize={16} fontWeight="bold" style={{ minWidth: 24, textAlign: 'center' }}>{currentFontSize}</Text>
            <Pressable onPress={() => updateFontSize(Math.min(48, currentFontSize + 2))}>
              <Box bg="$background" p="xs" px="md" borderRadius="md" style={{ elevation: 1, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 2, shadowOffset: { width: 0, height: 1 } }}>
                <Text fontSize={20} fontWeight="bold">+</Text>
              </Box>
            </Pressable>
          </Box>
        </Box>

        <BottomSheetFlatList
          data={fontList}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={{
            paddingTop: 12,
            paddingHorizontal: 16,
            paddingBottom: 24,
          }}
          columnWrapperStyle={{
            marginBottom: 16,
            justifyContent: "space-between",
            gap: 16,
          }}
          renderItem={({ item }) => {
            const isActive = currentFontId === item.id;
            return (
              <Pressable 
                onPress={() => {
                  updateFontId(item.id);
                  bottomSheetModalRef.current?.dismiss();
                }} 
                style={{ flex: 1 }}
              >
                <Box
                  p="lg"
                  borderRadius="lg"
                  backgroundColor={isActive ? "$primary" : "$background"}
                  style={{
                    shadowColor: isActive ? currentTheme.colors.$primary : "#000",
                    shadowOpacity: 0.15,
                    shadowRadius: 8,
                    shadowOffset: { width: 0, height: 4 },
                    elevation: 2,
                    height: 80,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{ 
                      fontFamily: item.id !== "system" ? item.id : undefined,
                      color: isActive ? "white" : currentTheme.colors.$foreground,
                      textAlign: "center",
                      fontSize: 15,
                      fontWeight: isActive ? 'bold' : 'normal',
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
    </BottomSheetModal>
  );
});

export default FontPicker;
