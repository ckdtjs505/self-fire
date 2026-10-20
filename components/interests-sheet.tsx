import { Box, Text } from "@/atom";
import { CategoryId } from "@/data/quote-categories";
import { useCategoryStore } from "@/store/category";
import { trackEvent } from "@/utils/analytics";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { Pressable } from "react-native";
import Toast from "react-native-toast-message";
import PickerSheet, { PickerSheetHandle } from "./picker-sheet";
import TopicChips, { toggleTopic } from "./topic-chips";

// 설정 > 관심 주제: 첫 실행에 고른 주제를 바꾼다. 하나도 고르지 않으면 모든 명언을 보여 준다.
const InterestsSheet = forwardRef<PickerSheetHandle>(function InterestsSheet(_props, ref) {
  const sheetRef = useRef<PickerSheetHandle>(null);
  const [selected, setSelected] = useState<CategoryId[]>([]);

  useImperativeHandle(ref, () => ({
    open: () => {
      setSelected(useCategoryStore.getState().interestIds);
      sheetRef.current?.open();
    },
    close: () => sheetRef.current?.close(),
  }));

  const save = () => {
    useCategoryStore.getState().setInterests(selected);
    trackEvent("interests_set", { source: "settings", count: selected.length, topics: selected.join(",") });
    sheetRef.current?.close();
    Toast.show({
      type: "success",
      text2: selected.length > 0 ? "고른 주제의 명언을 보여 드릴게요" : "모든 주제의 명언을 보여 드릴게요",
    });
  };

  return (
    <PickerSheet
      ref={sheetRef}
      title="관심 주제"
      description="고른 주제의 명언이 '내 주제'와 오늘의 명언에 나와요. 고르지 않으면 모든 명언을 보여 드려요"
    >
      <TopicChips selected={selected} onToggle={(id) => setSelected((prev) => toggleTopic(prev, id))} />

      <Pressable onPress={save} accessibilityRole="button" style={({ pressed }) => ({ marginTop: 24, opacity: pressed ? 0.8 : 1 })}>
        <Box height={52} borderRadius="pill" bg="$primary" justifyContent="center" alignItems="center">
          <Text color="$onPrimary" fontSize={16} fontWeight="800">
            {selected.length > 0 ? `${selected.length}개 주제 저장` : "모든 주제 보기"}
          </Text>
        </Box>
      </Pressable>
    </PickerSheet>
  );
});

export default InterestsSheet;
