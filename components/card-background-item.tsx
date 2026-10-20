import { Box, Text } from "@/atom";
import { CardBackground } from "@/data/card-backgrounds";
import { lockedRewardMessage } from "@/data/streak-rewards";
import { useCardBackgroundStore } from "@/store/card-background";
import { useThemeStore } from "@/store/theme";
import { Image, Pressable, StyleSheet } from "react-native";
import Toast from "react-native-toast-message";
import FeatherIcon from "./icon";
import LockedOverlay from "./locked-overlay";

type Props = {
  item: CardBackground;
  width: number;
  isActive: boolean;
  isLocked: boolean;
};

// 카드 배경 미리보기 타일: 세로로 긴 카드 모양에 이미지를 보여주고, 누르면 배경을 적용한다.
// 아직 해금되지 않은 보상 배경은 자물쇠를 덮고, 누르면 해금 조건을 알려 준다.
const CardBackgroundItem: React.FC<Props> = ({ item, width, isActive, isLocked }) => {
  const { updateBackgroundId } = useCardBackgroundStore();
  const { colors } = useThemeStore().currentTheme;

  const onPress = () => {
    if (isLocked && item.unlockAt) {
      Toast.show({ type: "info", text2: lockedRewardMessage(item.unlockAt) });
      return;
    }
    updateBackgroundId(item.id);
  };

  return (
    <Pressable
      onPress={onPress}
      style={{ width }}
      accessibilityRole="button"
      accessibilityLabel={isLocked ? `${item.label} 카드 배경, ${item.unlockAt}일 연속 점화 시 해금` : `${item.label} 카드 배경`}
      accessibilityState={{ selected: isActive, disabled: isLocked }}
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

          {isLocked && item.unlockAt && <LockedOverlay unlockAt={item.unlockAt} borderRadius={10} compact />}
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
