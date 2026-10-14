import { Box } from "@/atom";
import { Theme } from "@/themes";
import { Pressable } from "react-native";

type Props = {
  onPress: () => void;
  children: React.ReactNode;
  // 활성 상태이면 activeColor 배경으로 채운다.
  active?: boolean;
  activeColor?: keyof Theme["colors"];
  // 테두리·배경 없이 아이콘만 보여준다. (묶음 버튼 안에서 사용)
  bare?: boolean;
  accessibilityLabel?: string;
};

/**
 * 화면 상단 등에서 쓰는 42x42 원형 아이콘 버튼. (bare면 묶음 테두리 안에 들어가도록 40x40)
 */
const HeaderIconButton: React.FC<Props> = ({
  onPress,
  children,
  active = false,
  activeColor = "$primary",
  bare = false,
  accessibilityLabel,
}) => (
  <Pressable
    onPress={onPress}
    hitSlop={4}
    accessibilityRole="button"
    accessibilityLabel={accessibilityLabel}
    accessibilityState={{ selected: active }}
    style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
  >
    <Box
      borderRadius="pill"
      width={bare ? 40 : 42}
      height={bare ? 40 : 42}
      justifyContent="center"
      alignItems="center"
      backgroundColor={active ? activeColor : bare ? "transparent" : "$surface"}
      borderWidth={bare || active ? 0 : 1}
      borderColor="$border"
    >
      {children}
    </Box>
  </Pressable>
);

export default HeaderIconButton;
