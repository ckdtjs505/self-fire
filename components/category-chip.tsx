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
    <Pressable onPress={onPress} hitSlop={8}>
      <Box
        flexDirection="row"
        alignItems="center"
        px="md"
        py="xs"
        borderRadius="md"
        backgroundColor="$sidebarBackground"
        style={{
          gap: 4,
          shadowColor: "#000",
          shadowOpacity: 0.05,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 4 },
        }}
      >
        <Text fontSize={14}>{category ? `${category.emoji} ${category.label}` : "✨ 전체"}</Text>
        <FeatherIcon name="chevron-down" size={14} />
      </Box>
    </Pressable>
  );
};

export default CategoryChip;
