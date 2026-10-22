// ─────────────────────────────────────────────────────────────
// category-tabs.tsx
// 헤더 아래에서 무엇을 볼지 고르는 칩.
//   - 평소에는 지금 보고 있는 항목만 작은 알약으로 보여준다.
//   - 누르면 그 자리에서 가로 스크롤 탭 한 줄로 펼쳐지고, 고르면 다시 접힌다.
//   - 보기: 전체 / 저장한 문장 / 내 명언, 주제: 명언 카테고리
// 펼칠 때 선택된 탭이 화면 안으로 스크롤된다.
// ─────────────────────────────────────────────────────────────

import { Box, Text } from "@/atom";
import { CATEGORIES, CategoryId } from "@/data/quote-categories";
import { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView } from "react-native";
import FeatherIcon from "./icon";

// null: 전체, "favorites": 저장한 문장, "mine": 내가 직접 작성한 명언
export type CategorySelection = CategoryId | "favorites" | "mine" | null;

type Item = { id: CategorySelection; label: string; emoji: string };

const MODE_ITEMS: Item[] = [
  { id: null, label: "전체", emoji: "✨" },
  { id: "favorites", label: "저장한 문장", emoji: "🔖" },
  { id: "mine", label: "내 명언", emoji: "✍️" },
];

const SIDE_PADDING = 20;

type Props = {
  selectedId: CategorySelection;
  onSelect: (id: CategorySelection) => void;
  // 저장한 문장 탭 옆에 보여줄 개수
  favoritesCount: number;
  // 이 값이 바뀌면 펼친 탭을 접는다 (예: 명언을 넘겼을 때)
  collapseKey?: unknown;
  // 관심 주제를 골랐으면 '전체' 대신 '내 주제'로 보여 준다
  hasInterests?: boolean;
};

const ALL_ITEMS: Item[] = [...MODE_ITEMS, ...CATEGORIES];

const CategoryTabs: React.FC<Props> = ({ selectedId, onSelect, favoritesCount, collapseKey, hasInterests }) => {
  const labelOf = (item: Item) => (item.id === null && hasInterests ? "내 주제" : item.label);

  const [expanded, setExpanded] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  // 탭별 x 위치·너비 (선택된 탭을 가운데로 스크롤할 때 사용)
  const layouts = useRef(new Map<string, { x: number; width: number }>());
  const viewportWidth = useRef(0);

  const keyOf = (id: CategorySelection) => id ?? "all";

  const scrollToSelected = (animated: boolean) => {
    const layout = layouts.current.get(keyOf(selectedId));
    if (!layout || viewportWidth.current === 0) return;
    const x = Math.max(0, layout.x + layout.width / 2 - viewportWidth.current / 2);
    scrollRef.current?.scrollTo({ x, animated });
  };

  useEffect(() => setExpanded(false), [collapseKey]);

  const renderTab = (item: Item) => {
    const isActive = selectedId === item.id;
    const key = keyOf(item.id);
    return (
      <Pressable
        key={key}
        accessibilityRole="tab"
        accessibilityState={{ selected: isActive }}
        onPress={() => {
          setExpanded(false);
          onSelect(item.id);
        }}
        onLayout={(e) => {
          const { x, width } = e.nativeEvent.layout;
          layouts.current.set(key, { x, width });
          // 선택된 탭이 오른쪽 끝에 있어도 펼치자마자 보이게 한다.
          if (isActive) scrollToSelected(false);
        }}
        style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
      >
        <Box
          flexDirection="row"
          alignItems="center"
          height={34}
          borderRadius="pill"
          bg={isActive ? "$primary" : "$surfaceMuted"}
          style={{ gap: 5, paddingHorizontal: 13 }}
        >
          <Text fontSize={13}>{item.emoji}</Text>
          <Text fontSize={13} fontWeight={isActive ? "700" : "500"} color={isActive ? "$onPrimary" : "$foreground"}>
            {labelOf(item)}
          </Text>
          {item.id === "favorites" && favoritesCount > 0 && (
            <Text fontSize={12} fontWeight="700" color={isActive ? "$onPrimary" : "$muted"}>
              {favoritesCount}
            </Text>
          )}
        </Box>
      </Pressable>
    );
  };

  if (!expanded) {
    const current = ALL_ITEMS.find((item) => item.id === selectedId) ?? MODE_ITEMS[0];
    return (
      <Box alignItems="center">
        <Pressable
          onPress={() => setExpanded(true)}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="보기 선택"
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
        >
          <Box
            flexDirection="row"
            alignItems="center"
            height={34}
            borderRadius="pill"
            bg="$surfaceMuted"
            style={{ gap: 5, paddingLeft: 14, paddingRight: 10 }}
          >
            <Text fontSize={13}>{current.emoji}</Text>
            <Text fontSize={13} fontWeight="700">
              {labelOf(current)}
            </Text>
            <FeatherIcon name="chevron-down" size={14} color="$muted" />
          </Box>
        </Pressable>
      </Box>
    );
  }

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      onLayout={(e) => {
        viewportWidth.current = e.nativeEvent.layout.width;
      }}
      contentContainerStyle={{ alignItems: "center", gap: 6, paddingHorizontal: SIDE_PADDING }}
    >
      {MODE_ITEMS.map(renderTab)}
      {/* 보기 / 주제 구분선 */}
      <Box width={1} height={18} bg="$border" style={{ marginHorizontal: 4 }} />
      {CATEGORIES.map(renderTab)}
    </ScrollView>
  );
};

export default CategoryTabs;
