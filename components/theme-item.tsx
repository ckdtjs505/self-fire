import { Box, Text } from "@/atom";
import { lockedRewardMessage } from "@/data/streak-rewards";
import { ThemeMeta } from "@/themes";
import { useThemeStore } from "@/store/theme";
import { Pressable } from "react-native";
import Toast from "react-native-toast-message";
import FeatherIcon from "./icon";
import LockedOverlay from "./locked-overlay";

type Props = {
  item: ThemeMeta;
  width: number;
  isActive: boolean;
  isLocked: boolean;
};

// 테마 미리보기 타일: 그 테마의 바탕 위에 작은 명언 카드를 그려 보여주고, 누르면 테마를 적용한다.
// 아직 해금되지 않은 보상 테마는 자물쇠를 덮고, 누르면 해금 조건을 알려 준다.
const ThemeItem: React.FC<Props> = ({ item, width, isActive, isLocked }) => {
  const { updateThemeId, currentTheme } = useThemeStore();
  const { colors } = item.theme;
  const activeColor = currentTheme.colors.$primary;

  const onPress = () => {
    if (isLocked && item.unlockAt) {
      Toast.show({ type: "info", text2: lockedRewardMessage(item.unlockAt) });
      return;
    }
    updateThemeId(item.id);
  };

  return (
    <Pressable
      onPress={onPress}
      style={{ width }}
      accessibilityRole="button"
      accessibilityLabel={isLocked ? `${item.name} 테마, ${item.unlockAt}일 연속 점화 시 해금` : `${item.name} 테마`}
      accessibilityState={{ selected: isActive, disabled: isLocked }}
    >
      {/* 선택되면 바깥 테두리를 강조색으로 두른다 */}
      <Box
        style={{
          padding: 3,
          borderRadius: 20,
          borderWidth: 2,
          borderColor: isActive ? activeColor : "transparent",
        }}
      >
        <Box
          height={92}
          justifyContent="center"
          alignItems="center"
          style={{
            backgroundColor: colors.$background,
            borderRadius: 15,
            borderWidth: 1,
            borderColor: currentTheme.colors.$border,
          }}
        >
          {/* 미니 명언 카드 */}
          <Box
            alignItems="center"
            justifyContent="center"
            style={{
              width: "64%",
              paddingVertical: 10,
              borderRadius: 10,
              backgroundColor: colors.$surface,
              borderWidth: 1,
              borderColor: colors.$border,
              gap: 4,
            }}
          >
            <Text fontSize={11} fontWeight="900" style={{ color: colors.$primary, lineHeight: 12 }}>
              {"“"}
            </Text>
            <Box style={{ width: "62%", height: 4, borderRadius: 2, backgroundColor: colors.$foreground, opacity: 0.85 }} />
            <Box style={{ width: "40%", height: 4, borderRadius: 2, backgroundColor: colors.$foreground, opacity: 0.85 }} />
            <Box style={{ width: 10, height: 2, marginTop: 2, borderRadius: 1, backgroundColor: colors.$primary }} />
          </Box>

          {isActive && (
            <Box
              position="absolute"
              top={6}
              right={6}
              width={20}
              height={20}
              borderRadius="pill"
              justifyContent="center"
              alignItems="center"
              style={{ backgroundColor: activeColor }}
            >
              <FeatherIcon name="check" size={12} color="$onPrimary" />
            </Box>
          )}

          {isLocked && item.unlockAt && <LockedOverlay unlockAt={item.unlockAt} borderRadius={15} />}
        </Box>
      </Box>

      <Text
        fontSize={13}
        textAlign="center"
        mt="s"
        fontWeight={isActive ? "700" : "500"}
        color={isActive ? "$foreground" : "$muted"}
      >
        {item.name}
      </Text>
    </Pressable>
  );
};

export default ThemeItem;
