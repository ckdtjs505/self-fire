import { Box, Text } from "@/atom";
import { ThemeMeta } from "@/themes";
import { useThemeStore } from "@/store/theme";
import { Pressable } from "react-native";
import FeatherIcon from "./icon";

type Props = {
  item: ThemeMeta;
  width: number;
  isActive: boolean;
  // 선택 테두리 색 (지금 적용된 테마의 강조색)
  activeColor: string;
};

// 테마 미리보기 타일: 그 테마의 배경 위에 작은 명언 카드를 그려 보여주고, 누르면 테마를 적용한다.
const ThemeItem: React.FC<Props> = ({ item, width, isActive, activeColor }) => {
  const { updateThemeId } = useThemeStore();
  const { colors } = item.theme;

  return (
    <Pressable onPress={() => updateThemeId(item.id)} style={{ width }}>
      <Box
        height={88}
        justifyContent="center"
        alignItems="center"
        style={{
          backgroundColor: colors.$background,
          borderRadius: 16,
          borderWidth: 2,
          borderColor: isActive ? activeColor : colors.$foreground + "14",
        }}
      >
        {/* 미니 명언 카드 */}
        <Box
          alignItems="center"
          justifyContent="center"
          style={{
            width: "62%",
            paddingVertical: 10,
            borderRadius: 10,
            backgroundColor: colors.$sidebarBackground,
            gap: 6,
          }}
        >
          <Text fontSize={15} fontWeight="bold" style={{ color: colors.$foreground }}>
            가
          </Text>
          <Box style={{ width: 18, height: 3, borderRadius: 2, backgroundColor: colors.$primary }} />
        </Box>

        {isActive && (
          <Box
            position="absolute"
            top={6}
            right={6}
            width={18}
            height={18}
            borderRadius="hg"
            justifyContent="center"
            alignItems="center"
            style={{ backgroundColor: activeColor }}
          >
            <FeatherIcon name="check" size={12} color="white" />
          </Box>
        )}
      </Box>

      <Text
        fontSize={13}
        textAlign="center"
        mt="s"
        style={{ fontWeight: isActive ? "bold" : "500", opacity: isActive ? 1 : 0.7 }}
      >
        {item.name}
      </Text>
    </Pressable>
  );
};

export default ThemeItem;
