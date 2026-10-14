import { Box, Text } from "@/atom";
import { CardBackground } from "@/data/card-backgrounds";
import { useCardBackgroundStore } from "@/store/card-background";
import { useThemeStore } from "@/store/theme";
import { Image, Pressable, StyleSheet } from "react-native";
import FeatherIcon from "./icon";

type Props = {
  item: CardBackground;
  width: number;
  isActive: boolean;
};

// 카드 배경 미리보기 타일: 세로로 긴 카드 모양에 이미지를 보여주고, 누르면 배경을 적용한다.
const CardBackgroundItem: React.FC<Props> = ({ item, width, isActive }) => {
  const { updateBackgroundId } = useCardBackgroundStore();
  const { colors } = useThemeStore().currentTheme;

  return (
    <Pressable
      onPress={() => updateBackgroundId(item.id)}
      style={{ width }}
      accessibilityRole="button"
      accessibilityLabel={`${item.label} 카드 배경`}
      accessibilityState={{ selected: isActive }}
    >
      {/* 선택되면 바깥 테두리를 강조색으로 두른다 */}
      <Box
        style={{
          padding: 2,
          borderRadius: 14,
          borderWidth: 2,
          borderColor: isActive ? colors.$primary : "transparent",
        }}
      >
        <Box
          justifyContent="center"
          alignItems="center"
          style={{
            aspectRatio: 3 / 4,
            borderRadius: 10,
            overflow: "hidden",
            backgroundColor: colors.$background,
            borderWidth: 1,
            borderColor: colors.$border,
          }}
        >
          {item.source ? (
            <Image source={item.source} resizeMode="cover" style={StyleSheet.absoluteFill} />
          ) : (
            <FeatherIcon name="slash" size={16} color="$muted" />
          )}

          {isActive && (
            <Box
              position="absolute"
              top={4}
              right={4}
              width={18}
              height={18}
              borderRadius="pill"
              justifyContent="center"
              alignItems="center"
              style={{ backgroundColor: colors.$primary }}
            >
              <FeatherIcon name="check" size={11} color="$onPrimary" />
            </Box>
          )}
        </Box>
      </Box>

      <Text
        fontSize={12}
        textAlign="center"
        mt="xs"
        fontWeight={isActive ? "700" : "500"}
        color={isActive ? "$foreground" : "$muted"}
      >
        {item.label}
      </Text>
    </Pressable>
  );
};

export default CardBackgroundItem;
