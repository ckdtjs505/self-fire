import { Box, Text } from "@/atom";
import { getCategory } from "@/data/quote-categories";
import { Pressable } from "react-native";
import { CategorySelection, MINE_ITEM } from "./category-picker";
import FeatherIcon from "./icon";

type Props = {
  categoryId: CategorySelection;
  onPress: () => void;
};

/**
 * 헤더 아래 가운데에 지금 보고 있는 카테고리를 보여주는 알약 버튼. 누르면 카테고리 시트를 연다.
 */
const CategoryChip: React.FC<Props> = ({ categoryId, onPress }) => {
  const category = categoryId === "mine" ? MINE_ITEM : categoryId ? getCategory(categoryId) : undefined;

  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel="카테고리 선택"
      style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
    >
      <Box
        flexDirection="row"
        alignItems="center"
        height={34}
        borderRadius="pill"
        bg="$surfaceMuted"
        style={{ gap: 6, paddingLeft: 14, paddingRight: 10 }}
      >
        <Text fontSize={14}>{category ? category.emoji : "✨"}</Text>
        <Text fontSize={14} fontWeight="700">
          {category ? category.label : "전체"}
        </Text>
        <FeatherIcon name="chevron-down" size={15} color="$muted" />
      </Box>
    </Pressable>
  );
};

export default CategoryChip;
