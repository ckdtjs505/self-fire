import { Box, Text } from "@/atom";
import { ThemeMeta } from "@/themes";
import { useThemeStore } from "@/store/theme";
import { Pressable } from "react-native";

type Props = {
  item: ThemeMeta;
};

// 테마 미리보기 타일: 해당 테마의 배경/글자색으로 표시하고, 누르면 테마를 적용한다.
const ThemeItem: React.FC<Props> = ({ item }) => {
  const { updateThemeId } = useThemeStore();
  const { colors } = item.theme;

  return (
    <Box
      borderColor="black"
      borderWidth={0.5}
      flex={1}
      borderRadius="md"
      style={{ backgroundColor: colors.$background }}
    >
      <Pressable onPress={() => updateThemeId(item.id)}>
        <Text fontSize={20} textAlign="center" padding="xxl" style={{ color: colors.$foreground }}>
          {item.name}
        </Text>
      </Pressable>
    </Box>
  );
};

export default ThemeItem;
