// ─────────────────────────────────────────────────────────────
// category-picker.tsx
// 명언 카테고리를 고르는 바텀시트. 고르면 바로 닫힌다. 높이는 내용에 맞춘다.
// 카테고리 외에 '내 명언'(직접 작성한 명언)도 함께 고를 수 있다.
// ─────────────────────────────────────────────────────────────

import { Box, Text } from "@/atom";
import { CATEGORIES, CategoryId } from "@/data/quote-categories";
import { useThemeStore } from "@/store/theme";
import { BottomSheetView } from "@gorhom/bottom-sheet";
import { forwardRef, useImperativeHandle, useRef } from "react";
import { Pressable } from "react-native";
import PickerSheet, { PickerSheetHandle } from "./picker-sheet";

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
      backgroundStyle={{ backgroundColor: currentTheme.colors.$sidebarBackground }}
      handleIndicatorStyle={{ backgroundColor: currentTheme.colors.$foreground, opacity: 0.2 }}
    >
      <BottomSheetView style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 40 }}>
        <Text fontSize={18} fontWeight="bold">카테고리</Text>
        <Text fontSize={13} mt="xs" style={{ opacity: 0.5 }}>
          보고 싶은 명언의 주제를 골라 보세요
        </Text>

        {/* 내용 길이에 맞춰 줄바꿈되는 칩 목록 */}
        <Box flexDirection="row" flexWrap="wrap" mt="lg" style={{ gap: 8 }}>
          {ITEMS.map((item) => {
            const isActive = selectedId === item.id;
            return (
              <Pressable
                key={item.id ?? "all"}
                onPress={() => {
                  onSelect(item.id);
                  sheetRef.current?.close();
                }}
              >
                <Box
                  flexDirection="row"
                  alignItems="center"
                  borderRadius="hg"
                  backgroundColor={isActive ? "$primary" : "$background"}
                  style={{
                    gap: 6,
                    height: 40,
                    paddingHorizontal: 14,
                    borderWidth: 1,
                    borderColor: isActive ? currentTheme.colors.$primary : currentTheme.colors.$foreground + "14",
                  }}
                >
                  <Text fontSize={15}>{item.emoji}</Text>
                  <Text
                    fontSize={14}
                    style={{
                      color: isActive ? "white" : currentTheme.colors.$foreground,
                      fontWeight: isActive ? "bold" : "500",
                    }}
                  >
                    {item.label}
                  </Text>
                </Box>
              </Pressable>
            );
          })}
        </Box>
      </BottomSheetView>
    </PickerSheet>
  );
});

export default CategoryPicker;
