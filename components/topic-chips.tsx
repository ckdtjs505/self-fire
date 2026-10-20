import { Box, Text } from "@/atom";
import { CATEGORIES, CategoryId } from "@/data/quote-categories";
import { Pressable } from "react-native";
import FeatherIcon from "./icon";

const GAP = 10;

type Props = {
  selected: CategoryId[];
  onToggle: (id: CategoryId) => void;
};

// 관심 주제 고르기: 명언 카테고리를 2열 카드로 보여 주고 여러 개 고를 수 있다.
// (첫 실행 onboarding-topics.tsx, 설정 interests-sheet.tsx)
const TopicChips: React.FC<Props> = ({ selected, onToggle }) => (
  // 가로 간격은 gap 대신 space-between으로 둔다. (gap + 퍼센트 너비는 한 줄에 두 개가 안 들어가고 줄바꿈된다)
  <Box flexDirection="row" flexWrap="wrap" justifyContent="space-between" style={{ rowGap: GAP }}>
    {CATEGORIES.map((category) => {
      const isSelected = selected.includes(category.id);
      return (
        <Pressable
          key={category.id}
          onPress={() => onToggle(category.id)}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: isSelected }}
          accessibilityLabel={category.label}
          style={({ pressed }) => ({ width: "48.5%", opacity: pressed ? 0.7 : 1 })}
        >
          <Box
            height={60}
            flexDirection="row"
            alignItems="center"
            borderRadius="md"
            borderWidth={1.5}
            borderColor={isSelected ? "$primary" : "$border"}
            bg={isSelected ? "$primarySoft" : "$surface"}
            style={{ gap: 10, paddingHorizontal: 14 }}
          >
            <Text fontSize={22}>{category.emoji}</Text>
            <Text fontSize={15} fontWeight={isSelected ? "800" : "600"} numberOfLines={1} style={{ flex: 1 }}>
              {category.label}
            </Text>
            {isSelected && <FeatherIcon name="check" size={16} color="$primary" />}
          </Box>
        </Pressable>
      );
    })}
  </Box>
);

export const toggleTopic = (ids: CategoryId[], id: CategoryId) =>
  ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id];

export default TopicChips;
