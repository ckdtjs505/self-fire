// ─────────────────────────────────────────────────────────────
// home-tab-bar.tsx — 홈 하단 탭 (오늘 · 명언)
//   - 오늘: 오늘 따르는 문장 하나와 할 일 · 완료 · 불씨. 넘기지 않고 그날의 약속에 머문다.
//   - 명언: 언제든 명언을 넘겨 보는 곳. 아직 문장을 고르지 않았으면 여기서 오늘 따를 문장을 고른다.
// 할 일을 완료한 뒤에도 명언 탭은 늘 열 수 있다.
// ─────────────────────────────────────────────────────────────

import { Box, Text } from "@/atom";
import { tapHaptic } from "@/utils/haptics";
import { Pressable } from "react-native";
import { Ionicon, IoniconNames } from "./icon";

export type HomeTab = "today" | "quotes";

const TABS: { id: HomeTab; label: string; icon: IoniconNames; activeIcon: IoniconNames }[] = [
  { id: "today", label: "오늘", icon: "flame-outline", activeIcon: "flame" },
  { id: "quotes", label: "명언", icon: "book-outline", activeIcon: "book" },
];

type Props = {
  selected: HomeTab;
  onSelect: (tab: HomeTab) => void;
};

const HomeTabBar: React.FC<Props> = ({ selected, onSelect }) => (
  <Box flexDirection="row" borderTopWidth={1} borderColor="$border" bg="$background" accessibilityRole="tablist">
    {TABS.map((tab) => {
      const isSelected = tab.id === selected;
      return (
        <Pressable
          key={tab.id}
          onPress={() => {
            if (isSelected) return;
            tapHaptic();
            onSelect(tab.id);
          }}
          accessibilityRole="tab"
          accessibilityLabel={tab.label}
          accessibilityState={{ selected: isSelected }}
          style={({ pressed }) => ({ flex: 1, opacity: pressed ? 0.7 : 1 })}
        >
          <Box height={56} alignItems="center" justifyContent="center" style={{ gap: 2 }}>
            <Ionicon name={isSelected ? tab.activeIcon : tab.icon} size={22} color={isSelected ? "$flame" : "$muted"} />
            <Text fontSize={12} fontWeight={isSelected ? "800" : "600"} color={isSelected ? "$flame" : "$muted"}>
              {tab.label}
            </Text>
          </Box>
        </Pressable>
      );
    })}
  </Box>
);

export default HomeTabBar;
