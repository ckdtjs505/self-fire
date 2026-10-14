// ─────────────────────────────────────────────────────────────
// category-picker.tsx
// 명언 카테고리를 고르는 바텀시트. 고르면 바로 닫힌다.
// 카테고리 외에 '내 명언'(직접 작성한 명언)도 함께 고를 수 있다.
// ─────────────────────────────────────────────────────────────

import { Box, Text } from "@/atom";
import { CATEGORIES, CategoryId } from "@/data/quote-categories";
import { useThemeStore } from "@/store/theme";
import { BottomSheetFlatList, BottomSheetView } from "@gorhom/bottom-sheet";
import { forwardRef, useImperativeHandle, useRef } from "react";
import { Pressable } from "react-native";
import PickerSheet, { PickerSheetHandle } from "./picker-sheet";

const SNAP_POINTS = ["60%"];

// null: 전체, "mine": 내가 직접 작성한 명언
export type CategorySelection = CategoryId | "mine" | null;

type Item = { id: CategorySelection; label: string; emoji: string };

export const MINE_ITEM: Item = { id: "mine", label: "내 명언", emoji: "✍️" };

const ITEMS: Item[] = [{ id: null, label: "전체", emoji: "✨" }, MINE_ITEM, ...CATEGORIES];

type Props = {
  // undefined면 아무것도 선택하지 않은 상태 (예: 불씨 보관함 모드)
  selectedId: CategorySelection | undefined;
  onSelect: (id: CategorySelection) => void;
};

const CategoryPicker = forwardRef<PickerSheetHandle, Props>(function CategoryPicker({ selectedId, onSelect }, ref) {
  const sheetRef = useRef<PickerSheetHandle>(null);
  const { currentTheme } = useThemeStore();

  useImperativeHandle(ref, () => ({
    open: () => sheetRef.current?.open(),
    close: () => sheetRef.current?.close(),
  }));

  return (
    <PickerSheet
      ref={sheetRef}
      snapPoints={SNAP_POINTS}
      backgroundStyle={{ backgroundColor: currentTheme.colors.$sidebarBackground }}
      handleIndicatorStyle={{ backgroundColor: currentTheme.colors.$foreground }}
    >
      <BottomSheetView style={{ paddingBottom: 24 }}>
        <Box px="xl" pt="md">
          <Text fontSize={16} fontWeight="bold">카테고리</Text>
        </Box>

        <BottomSheetFlatList
          data={ITEMS}
          keyExtractor={(item) => item.id ?? "all"}
          numColumns={3}
          contentContainerStyle={{ paddingTop: 16, paddingHorizontal: 16, paddingBottom: 24 }}
          columnWrapperStyle={{ marginBottom: 12, gap: 12 }}
          renderItem={({ item }) => {
            const isActive = selectedId === item.id;
            return (
              <Pressable
                style={{ flex: 1 / 3 }}
                onPress={() => {
                  onSelect(item.id);
                  sheetRef.current?.close();
                }}
              >
                <Box
                  borderRadius="lg"
                  backgroundColor={isActive ? "$primary" : "$background"}
                  style={{
                    height: 72,
                    justifyContent: "center",
                    alignItems: "center",
                    shadowColor: isActive ? currentTheme.colors.$primary : "#000",
                    shadowOpacity: 0.15,
                    shadowRadius: 8,
                    shadowOffset: { width: 0, height: 4 },
                    elevation: 2,
                  }}
                >
                  <Text fontSize={20}>{item.emoji}</Text>
                  <Text
                    mt="xs"
                    fontSize={14}
                    style={{
                      color: isActive ? "white" : currentTheme.colors.$foreground,
                      fontWeight: isActive ? "bold" : "normal",
                    }}
                  >
                    {item.label}
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

export default CategoryPicker;
